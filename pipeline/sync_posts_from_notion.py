import hashlib
import os
import re
import shutil
from pathlib import Path
from urllib.parse import unquote, urlparse

import requests
import yaml
from notion_client import Client

posts_mdx_dir = Path("../posts")

notion = Client(auth=os.getenv("NOTION_API_KEY", None))
posts_db_id = os.getenv("NOTION_POSTS_DB_ID", None)
front_path = {"images": "/images/posts/", "files": "/files/posts/"}
content_paths = {
    "page_id": ["id"],
    "slug": ["properties", "slug", "rich_text", 0, "plain_text"],
    "title": ["properties", "title", "title", 0, "plain_text"],
    "featured": ["properties", "featured", "checkbox"],
    "description": ["properties", "description", "rich_text", 0, "plain_text"],
    "tags": ["properties", "tags", "multi_select", ["name"]],
    "category": ["properties", "category", "select", "name"],
    "date": ["properties", "date", "date", "start"],
}


def calc_hash(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def read_existing_mdx_files():
    mdx_map = {}
    if not posts_mdx_dir.exists():
        return mdx_map
    for path in posts_mdx_dir.glob("*.mdx"):
        text = path.read_text(encoding="utf-8")
        if not text.startswith("---"):
            continue
        try:
            _, fm, _ = text.split("---", 2)
            meta = yaml.safe_load(fm)
        except Exception:
            continue
        notion_id = meta.get("page_id")
        if notion_id:
            mdx_map[notion_id] = {"path": path, "meta": meta, "raw": text}
    return mdx_map


def make_mdx(record):
    frontmatter = {
        "page_id": record["page_id"],
        "title": record["title"],
        "slug": record["slug"],
        "featured": record["featured"],
        "description": record["description"],
        "category": record["category"],
        "tags": record["tags"],
        "date": record["date"],
    }
    body = record["contents"].strip()
    content_hash = calc_hash(body)
    frontmatter["content_hash"] = content_hash
    fm = yaml.dump(frontmatter, allow_unicode=True, sort_keys=False)
    return f"---\n{fm}---\n\n{body}\n"


def sync_records_to_mdx(records):
    posts_mdx_dir.mkdir(parents=True, exist_ok=True)
    existing = read_existing_mdx_files()
    for record in records:
        page_id = record["page_id"]
        slug = record["slug"]

        new_mdx = make_mdx(record)
        new_hash = calc_hash(record["contents"].strip())

        old = existing.get(page_id)

        if old is None:
            path = posts_mdx_dir / f"{slug}.mdx"
            path.write_text(new_mdx, encoding="utf-8")
            print(f"[CREATE] {path}")
            continue
        changed = any(
            old["meta"].get(key) != record[key] for key in content_paths.keys()
        )
        old_hash = old["meta"].get("content_hash")

        if old_hash == new_hash and not changed:
            print(f"[SKIP] {slug}")
            del existing[page_id]
            continue
        old_slug = old["meta"].get("slug")
        if old_slug != slug:
            old_path = old["path"]
            new_path = posts_mdx_dir / f"{slug}.mdx"
            if old_path != new_path:
                if new_path.exists():
                    raise FileExistsError(f"slug collision: {new_path.name}")
                old_path.rename(new_path)
                print(f"[RENAME] {old_path.name} -> {new_path.name}")
            old["path"] = new_path
        old["path"].write_text(new_mdx, encoding="utf-8")
        image_dir = Path(f"../public/images/posts/{slug}")
        file_dir = Path(f"../public/files/posts/{slug}")
        deleted_images = [
            f
            for f in image_dir.iterdir()
            if f.is_file() and f.name not in record["image_files"]
        ]
        deleted_files = [
            f
            for f in file_dir.iterdir()
            if f.is_file() and f.name not in record["common_files"]
        ]
        for f in deleted_images:
            f.unlink()
        for f in deleted_files:
            f.unlink()
        print(f"[UPDATE] {old['path']}")
        del existing[page_id]
    for page_id, info in existing.items():
        path = info["path"]
        slug = info["meta"]["slug"]

        if path.exists():
            path.unlink()
            print(f"[DELETE] {path}")

        image_dir = Path(f"../public/images/posts/{slug}")
        file_dir = Path(f"../public/files/posts/{slug}")

        shutil.rmtree(image_dir, ignore_errors=True)
        shutil.rmtree(file_dir, ignore_errors=True)


def extract_values(src, paths):
    tmp = src
    result = None
    for key in paths:
        if isinstance(tmp, list) and len(tmp) == 0:
            return None
        if isinstance(key, list):
            result = []
            for values in tmp:
                result.append(extract_values(values, key))
            break
        tmp = tmp[key]
    if result is None:
        result = tmp
    return result


def extract_image_urls_from_blocks(blocks):
    files = []
    for block in blocks:
        if block["type"] != "image":
            continue
        if block["image"]["type"] == "file":
            files.append(block["image"]["file"]["url"])
        if block["image"]["type"] == "external":
            files.append(block["image"]["external"]["url"])
    return files


def extract_file_urls_from_blocks(blocks):
    files = []
    for block in blocks:
        if block["type"] != "file":
            continue
        files.append(block["file"]["file"]["url"])
    return files


def bytes_hash(data: bytes):
    return hashlib.sha256(data).hexdigest()


def file_hash(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def file_download_from_urls(urls, _type, slug):
    save_dir = f"../public/{_type}/posts/{slug}"
    os.makedirs(save_dir, exist_ok=True)
    saved_path = []
    for url in urls:
        filename = unquote(os.path.basename(urlparse(url).path))
        save_path = os.path.join(save_dir, filename)
        res = requests.get(url, timeout=30)
        res.raise_for_status()
        remote_data = res.content
        remote_hash = bytes_hash(remote_data)
        if os.path.exists(save_path):
            local_hash = file_hash(save_path)
            if local_hash == remote_hash:
                print(f"[SKIP FILE] {save_path}")
            else:
                with open(save_path, "wb") as f:
                    f.write(remote_data)
                print(f"[UPDATE FILE] {save_path}")
        else:
            with open(save_path, "wb") as f:
                f.write(remote_data)
            print(f"[CREATE FILE] {save_path}")
        tmp = {}
        tmp["origin"] = url
        tmp["local"] = os.path.join(front_path[_type], slug, filename)
        saved_path.append(tmp)
    return saved_path


def replace_image_urls(mkdn, urls):
    result = mkdn
    for url in urls:
        filename = unquote(os.path.basename(urlparse(url["origin"]).path))
        pattern = rf"(!\[[^\]]*\]\()https?://[^)]*{re.escape(filename)}[^)]*(\))"
        result = re.sub(pattern, rf"\1{url['local']}\2", result)
    return result


standard_mkdn_elements = {"<br>": "<br />"}


def standardization_markdown(mkdn):
    for key, val in standard_mkdn_elements.items():
        mkdn.replace(key, val)
    return mkdn


def replace_file_urls(mkdn, urls):
    result = mkdn
    file_tag_pattern = r'(<file\s+src=")([^"]+)("></file>)'
    for url in urls:
        filename = unquote(os.path.basename(urlparse(url["origin"]).path))
        filename_pattern = re.escape(filename)

        def replacer(match):
            prefix = match.group(1)
            src = match.group(2)
            suffix = match.group(3)
            decoded_src = unquote(src)
            if re.search(filename_pattern, decoded_src):
                return f"{prefix}{url['local']}{suffix}"
            return match.group(0)

        result = re.sub(file_tag_pattern, replacer, result)
    return result


def load_db_values(db_id):
    db = notion.databases.retrieve(database_id=db_id)
    data_src_id = db["data_sources"][0]["id"]
    results = (notion.data_sources.query(data_source_id=data_src_id))["results"]
    return results


results = load_db_values(posts_db_id)
records = []
slugs = []

for record in results:
    tmp = {}
    for key, path in content_paths.items():
        value = extract_values(record, path)
        if value is None:
            tmp = None
            break
        tmp[key] = value
    if tmp is None:
        continue
    if tmp["slug"] in slugs:
        raise ValueError(f"slug collision: {tmp['slug']}")
    slugs.append(tmp["slug"])
    mkdn = notion.pages.retrieve_markdown(page_id=tmp["page_id"])
    blocks = (notion.blocks.children.list(block_id=tmp["page_id"]))["results"]
    mkdn_contents = mkdn["markdown"]
    tmp["contents"] = mkdn_contents
    tmp["images"] = extract_image_urls_from_blocks(blocks)
    tmp["files"] = extract_file_urls_from_blocks(blocks)

    replace_images_url = file_download_from_urls(tmp["images"], "images", tmp["slug"])
    replace_files_url = file_download_from_urls(tmp["files"], "files", tmp["slug"])
    tmp["image_files"] = [f["local"].split("/")[-1] for f in replace_images_url]
    tmp["common_files"] = [f["local"].split("/")[-1] for f in replace_files_url]
    tmp["contents"] = replace_image_urls(tmp["contents"], replace_images_url)
    tmp["contents"] = replace_file_urls(tmp["contents"], replace_files_url)
    tmp["contents"] = standardization_markdown(tmp["contents"])
    records.append(tmp)
sync_records_to_mdx(records)
