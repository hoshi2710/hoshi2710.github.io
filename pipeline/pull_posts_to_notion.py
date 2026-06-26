"""기존 posts/*.mdx 게시물을 Notion DB로 가져오기 위한 일회용 스크립트.

동작 방식
- posts 디렉터리의 *.mdx 파일을 읽는다.
- 파일명은 slug 속성으로 사용한다.
- MDX 상단 YAML frontmatter의 키와 Notion DB 속성명이 같은 경우에만 매핑한다.
- readingTime, images 속성은 가져오지 않는다.
- slug가 같은 페이지가 이미 있으면 속성만 업데이트하고, 없으면 새로 생성하면서 본문을 추가한다.
- 기존 페이지의 본문까지 교체하려면 NOTION_REPLACE_EXISTING_CONTENT=1 로 실행한다.

필수 환경변수
- NOTION_TOKEN: Notion integration token
- NOTION_POSTS_DATABASE_ID: 게시글을 넣을 Notion DB ID

선택 환경변수
- NOTION_REPLACE_EXISTING_CONTENT=1: 기존 slug 페이지의 하위 블록을 지우고 MDX 본문으로 교체
- NOTION_PUBLIC_ASSET_BASE_URL: /images/... 같은 로컬 에셋 경로 앞에 붙일 공개 도메인

예시
  NOTION_TOKEN=ntn_xxx NOTION_POSTS_DATABASE_ID=xxxxxxxx python3 pipeline/pull_posts_to_notion.py
"""

from __future__ import annotations

import os
import re
import sys
from datetime import date, datetime
from pathlib import Path
from typing import Any

import yaml
from notion_client import Client

ROOT_DIR = Path(__file__).resolve().parents[1]
POSTS_DIR = ROOT_DIR / "posts"
EXCLUDED_FRONTMATTER_KEYS = {"readingTime", "images"}

NOTION_TOKEN = os.getenv("NOTION_API_KEY", None)
NOTION_POSTS_DATABASE_ID = os.getenv("NOTION_POSTS_DB_ID", None)
PUBLIC_ASSET_BASE_URL = os.environ.get(
    "NOTION_PUBLIC_ASSET_BASE_URL", "https://hoshi2710.github.io"
).rstrip("/")
REPLACE_EXISTING_CONTENT = os.environ.get("NOTION_REPLACE_EXISTING_CONTENT") in {
    "1",
    "true",
    "TRUE",
    "yes",
    "YES",
}


class ConfigError(RuntimeError):
    pass


def require_env() -> None:
    missing = []
    if not NOTION_TOKEN:
        missing.append("NOTION_TOKEN")
    if not NOTION_POSTS_DATABASE_ID:
        missing.append("NOTION_POSTS_DATABASE_ID")
    if missing:
        raise ConfigError(f"필수 환경변수가 없습니다: {', '.join(missing)}")


def read_mdx(path: Path) -> tuple[dict[str, Any], str]:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return {}, text

    try:
        _, raw_frontmatter, content = text.split("---", 2)
    except ValueError:
        return {}, text

    frontmatter = yaml.safe_load(raw_frontmatter) or {}
    if not isinstance(frontmatter, dict):
        frontmatter = {}
    return frontmatter, content.lstrip("\n")


def load_posts() -> list[dict[str, Any]]:
    if not POSTS_DIR.exists():
        raise FileNotFoundError(f"posts 디렉터리를 찾을 수 없습니다: {POSTS_DIR}")

    records = []
    for path in sorted(POSTS_DIR.glob("*.mdx")):
        frontmatter, content = read_mdx(path)
        slug = path.stem
        properties = {
            key: value
            for key, value in frontmatter.items()
            if key not in EXCLUDED_FRONTMATTER_KEYS
        }
        if "date" in frontmatter:
            properties["date"] = normalize_mdx_date(frontmatter["date"])
        properties["slug"] = slug
        records.append(
            {
                "slug": slug,
                "properties": properties,
                "content": content.strip(),
            }
        )
    return records


def normalize_mdx_date(value: Any) -> str:
    if isinstance(value, datetime):
        return value.date().isoformat()
    if isinstance(value, date):
        return value.isoformat()
    return str(value)


def plain_text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (datetime, date)):
        return normalize_mdx_date(value)
    if isinstance(value, (list, tuple)):
        return ", ".join(plain_text(item) for item in value)
    return str(value)


def rich_text(value: Any) -> list[dict[str, Any]]:
    text = plain_text(value)
    if not text:
        return []
    return [{"type": "text", "text": {"content": text[:2000]}}]


def title_text(value: Any) -> list[dict[str, Any]]:
    text = plain_text(value) or "Untitled"
    return [{"type": "text", "text": {"content": text[:2000]}}]


def to_notion_date(value: Any) -> dict[str, Any] | None:
    text = normalize_mdx_date(value).strip()
    if not text:
        return None
    return {"start": text}


def to_multi_select(value: Any) -> list[dict[str, str]]:
    if value is None:
        return []
    if isinstance(value, (list, tuple)):
        values = value
    else:
        values = [item.strip() for item in str(value).split(",")]
    return [{"name": str(item)} for item in values if str(item).strip()]


def to_select(value: Any) -> dict[str, str] | None:
    text = plain_text(value).strip()
    if not text:
        return None
    return {"name": text}


def to_checkbox(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() in {"true", "1", "yes", "y"}
    return bool(value)


def to_number(value: Any) -> int | float | None:
    if value is None or value == "":
        return None
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return value
    text = str(value).strip()
    try:
        if "." in text:
            return float(text)
        return int(text)
    except ValueError:
        return None


def map_property(value: Any, notion_property: dict[str, Any]) -> dict[str, Any] | None:
    property_type = notion_property["type"]

    if property_type == "title":
        return {"title": title_text(value)}
    if property_type == "rich_text":
        return {"rich_text": rich_text(value)}
    if property_type == "date":
        date = to_notion_date(value)
        return {"date": date} if date else None
    if property_type == "multi_select":
        return {"multi_select": to_multi_select(value)}
    if property_type == "select":
        select = to_select(value)
        return {"select": select} if select else None
    if property_type == "checkbox":
        return {"checkbox": to_checkbox(value)}
    if property_type == "number":
        number = to_number(value)
        return {"number": number} if number is not None else None
    if property_type == "url":
        text = plain_text(value).strip()
        return {"url": text} if text else None
    if property_type == "email":
        text = plain_text(value).strip()
        return {"email": text} if text else None
    if property_type == "phone_number":
        text = plain_text(value).strip()
        return {"phone_number": text} if text else None

    # formula, rollup, created_time 등 쓰기 불가능하거나 현재 필요 없는 타입은 스킵한다.
    return None


def build_notion_properties(
    source_properties: dict[str, Any], database_properties: dict[str, Any]
) -> dict[str, Any]:
    notion_properties = {}
    for key, value in source_properties.items():
        notion_property = database_properties.get(key)
        if notion_property is None:
            continue
        mapped = map_property(value, notion_property)
        if mapped is not None:
            notion_properties[key] = mapped
    return notion_properties


def find_slug_property_name(database_properties: dict[str, Any]) -> str:
    if "slug" in database_properties:
        return "slug"
    for name in database_properties:
        if name.lower() == "slug":
            return name
    raise ConfigError("Notion DB에 slug 속성이 필요합니다.")


def extract_plain_text(items: list[dict[str, Any]]) -> str:
    return "".join(item.get("plain_text", "") for item in items)


def get_page_slug(page: dict[str, Any], slug_property_name: str) -> str | None:
    prop = page.get("properties", {}).get(slug_property_name)
    if not prop:
        return None

    prop_type = prop.get("type")
    if prop_type == "rich_text":
        return extract_plain_text(prop.get("rich_text", []))
    if prop_type == "title":
        return extract_plain_text(prop.get("title", []))
    if prop_type == "url":
        return prop.get("url")
    return None


def get_database_target(notion: Client, database_id: str) -> dict[str, Any]:
    database = notion.databases.retrieve(database_id=database_id)

    if "properties" in database:
        return {
            "properties": database["properties"],
            "query_type": "database",
            "query_id": database_id,
            "parent": {"database_id": database_id},
        }

    data_sources = database.get("data_sources", [])
    if not data_sources:
        raise ConfigError(
            "Notion DB에서 properties 또는 data_sources를 찾을 수 없습니다."
        )

    data_source_id = data_sources[0]["id"]
    data_source = notion.data_sources.retrieve(data_source_id=data_source_id)

    if "properties" not in data_source:
        raise ConfigError("Notion data source에서 properties를 찾을 수 없습니다.")

    return {
        "properties": data_source["properties"],
        "query_type": "data_source",
        "query_id": data_source_id,
        "parent": {"data_source_id": data_source_id},
    }


def query_target(
    notion: Client, target: dict[str, Any], cursor: str | None
) -> dict[str, Any]:
    if target["query_type"] == "data_source":
        kwargs: dict[str, Any] = {"data_source_id": target["query_id"]}
        if cursor:
            kwargs["start_cursor"] = cursor
        return notion.data_sources.query(**kwargs)

    kwargs = {"database_id": target["query_id"]}
    if cursor:
        kwargs["start_cursor"] = cursor
    return notion.databases.query(**kwargs)


def query_existing_pages_by_slug(
    notion: Client, target: dict[str, Any], slug_property_name: str
) -> dict[str, str]:
    existing: dict[str, str] = {}
    cursor = None

    while True:
        response = query_target(notion, target, cursor)
        for page in response["results"]:
            slug = get_page_slug(page, slug_property_name)
            if slug:
                existing[slug] = page["id"]
        if not response.get("has_more"):
            break
        cursor = response.get("next_cursor")

    return existing


def paragraph_block(text: str) -> dict[str, Any]:
    return {
        "object": "block",
        "type": "paragraph",
        "paragraph": {"rich_text": markdown_rich_text(text)},
    }


def heading_block(level: int, text: str) -> dict[str, Any]:
    block_type = {
        1: "heading_1",
        2: "heading_2",
        3: "heading_3",
    }.get(level, "heading_3")
    return {
        "object": "block",
        "type": block_type,
        block_type: {"rich_text": markdown_rich_text(text)},
    }


def bulleted_list_item_block(text: str) -> dict[str, Any]:
    return {
        "object": "block",
        "type": "bulleted_list_item",
        "bulleted_list_item": {"rich_text": markdown_rich_text(text)},
    }


def numbered_list_item_block(text: str) -> dict[str, Any]:
    return {
        "object": "block",
        "type": "numbered_list_item",
        "numbered_list_item": {"rich_text": markdown_rich_text(text)},
    }


def quote_block(text: str) -> dict[str, Any]:
    return {
        "object": "block",
        "type": "quote",
        "quote": {"rich_text": markdown_rich_text(text)},
    }


def code_block(code: str, language: str = "plain text") -> dict[str, Any]:
    return {
        "object": "block",
        "type": "code",
        "code": {
            "rich_text": [{"type": "text", "text": {"content": code[:2000]}}],
            "language": normalize_code_language(language),
        },
    }


def divider_block() -> dict[str, Any]:
    return {"object": "block", "type": "divider", "divider": {}}


def resolve_asset_url(url: str) -> str:
    if url.startswith("http://") or url.startswith("https://"):
        return url
    if url.startswith("/"):
        return f"{PUBLIC_ASSET_BASE_URL}{url}"
    return url


def image_or_fallback_block(alt: str, url: str) -> dict[str, Any]:
    # Notion image block external URL은 public HTTP URL만 안정적으로 지원한다.
    # /images/... 같은 로컬 경로는 공개 도메인을 붙여 external 이미지로 등록한다.
    resolved_url = resolve_asset_url(url)
    if resolved_url.startswith("http://") or resolved_url.startswith("https://"):
        return {
            "object": "block",
            "type": "image",
            "image": {
                "type": "external",
                "external": {"url": resolved_url},
                "caption": markdown_rich_text(alt) if alt else [],
            },
        }
    return paragraph_block(f"![{alt}]({url})")


def normalize_code_language(language: str) -> str:
    language = language.strip().lower()
    aliases = {
        "": "plain text",
        "text": "plain text",
        "txt": "plain text",
        "js": "javascript",
        "ts": "typescript",
        "py": "python",
        "sh": "shell",
        "bash": "shell",
        "c++": "c++",
        "cpp": "c++",
    }
    return aliases.get(language, language or "plain text")


def markdown_rich_text(text: str) -> list[dict[str, Any]]:
    # Notion rich_text 1개 content 제한은 2000자라 chunk 처리한다.
    # 링크 문법 [label](url) 정도만 보존하고, 나머지 Markdown 강조 문법은 plain text로 둔다.
    result: list[dict[str, Any]] = []
    pattern = re.compile(r"\[([^\]]+)\]\((https?://[^\s)]+)\)")
    pos = 0
    for match in pattern.finditer(text):
        if match.start() > pos:
            result.extend(plain_rich_text_chunks(text[pos : match.start()]))
        label = match.group(1)
        url = match.group(2)
        for chunk in chunk_text(label, 1900):
            result.append(
                {"type": "text", "text": {"content": chunk, "link": {"url": url}}}
            )
        pos = match.end()
    if pos < len(text):
        result.extend(plain_rich_text_chunks(text[pos:]))
    return result


def plain_rich_text_chunks(text: str) -> list[dict[str, Any]]:
    return [
        {"type": "text", "text": {"content": chunk}}
        for chunk in chunk_text(text, 1900)
        if chunk
    ]


def markdown_to_notion_blocks(text: str) -> list[dict[str, Any]]:
    if not text:
        return []

    blocks: list[dict[str, Any]] = []
    paragraph_lines: list[str] = []
    code_lines: list[str] = []
    in_code = False
    code_language = "plain text"

    def flush_paragraph() -> None:
        if not paragraph_lines:
            return
        paragraph = "\n".join(line.strip() for line in paragraph_lines).strip()
        paragraph_lines.clear()
        if paragraph:
            for chunk in chunk_text(paragraph, 1900):
                blocks.append(paragraph_block(chunk))

    def flush_code() -> None:
        code = "\n".join(code_lines)
        code_lines.clear()
        if not code:
            return
        for chunk in chunk_text(code, 1900):
            blocks.append(code_block(chunk, code_language))

    for raw_line in text.splitlines():
        line = raw_line.rstrip()

        fence_match = re.match(r"^```\s*([\w#+.-]*)\s*$", line)
        if fence_match:
            if in_code:
                flush_code()
                in_code = False
                code_language = "plain text"
            else:
                flush_paragraph()
                in_code = True
                code_language = fence_match.group(1) or "plain text"
            continue

        if in_code:
            code_lines.append(raw_line)
            continue

        if not line.strip():
            flush_paragraph()
            continue

        image_match = re.match(r"^!\[([^\]]*)\]\(([^)]+)\)\s*$", line)
        if image_match:
            flush_paragraph()
            blocks.append(
                image_or_fallback_block(image_match.group(1), image_match.group(2))
            )
            continue

        heading_match = re.match(r"^(#{1,6})\s+(.+)$", line)
        if heading_match:
            flush_paragraph()
            blocks.append(
                heading_block(
                    len(heading_match.group(1)), heading_match.group(2).strip()
                )
            )
            continue

        if re.match(r"^\s*([-*_]){3,}\s*$", line):
            flush_paragraph()
            blocks.append(divider_block())
            continue

        unordered_match = re.match(r"^\s*[-*+]\s+(.+)$", line)
        if unordered_match:
            flush_paragraph()
            blocks.append(bulleted_list_item_block(unordered_match.group(1).strip()))
            continue

        ordered_match = re.match(r"^\s*\d+[.)]\s+(.+)$", line)
        if ordered_match:
            flush_paragraph()
            blocks.append(numbered_list_item_block(ordered_match.group(1).strip()))
            continue

        quote_match = re.match(r"^>\s?(.+)$", line)
        if quote_match:
            flush_paragraph()
            blocks.append(quote_block(quote_match.group(1).strip()))
            continue

        paragraph_lines.append(line)

    if in_code:
        flush_code()
    flush_paragraph()
    return blocks


def chunk_text(text: str, size: int) -> list[str]:
    return [text[index : index + size] for index in range(0, len(text), size)]


def list_child_block_ids(notion: Client, page_id: str) -> list[str]:
    block_ids = []
    cursor = None

    while True:
        kwargs: dict[str, Any] = {"block_id": page_id}
        if cursor:
            kwargs["start_cursor"] = cursor
        response = notion.blocks.children.list(**kwargs)
        block_ids.extend(block["id"] for block in response["results"])
        if not response.get("has_more"):
            break
        cursor = response.get("next_cursor")

    return block_ids


def clear_content(notion: Client, page_id: str) -> None:
    for block_id in list_child_block_ids(notion, page_id):
        notion.blocks.delete(block_id=block_id)


def append_content(notion: Client, page_id: str, content: str) -> None:
    blocks = markdown_to_notion_blocks(content)
    for index in range(0, len(blocks), 100):
        notion.blocks.children.append(
            block_id=page_id,
            children=blocks[index : index + 100],
        )


def sync_posts_to_notion() -> None:
    require_env()

    notion = Client(auth=NOTION_TOKEN)
    target = get_database_target(notion, NOTION_POSTS_DATABASE_ID)
    database_properties = target["properties"]
    slug_property_name = find_slug_property_name(database_properties)
    existing_pages = query_existing_pages_by_slug(notion, target, slug_property_name)

    posts = load_posts()
    print(f"[LOAD] {len(posts)} posts")

    for post in posts:
        slug = post["slug"]
        notion_properties = build_notion_properties(
            post["properties"], database_properties
        )

        if slug in existing_pages:
            page_id = existing_pages[slug]
            notion.pages.update(page_id=page_id, properties=notion_properties)
            if REPLACE_EXISTING_CONTENT:
                clear_content(notion, page_id)
                append_content(notion, page_id, post["content"])
                print(f"[UPDATE] {slug} properties + content")
            else:
                print(f"[UPDATE] {slug} properties")
            continue

        page = notion.pages.create(
            parent=target["parent"],
            properties=notion_properties,
        )
        append_content(notion, page["id"], post["content"])
        print(f"[CREATE] {slug}")


if __name__ == "__main__":
    try:
        sync_posts_to_notion()
    except Exception as exc:
        print(f"[ERROR] {exc}", file=sys.stderr)
        sys.exit(1)
