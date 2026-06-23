declare module 'gray-matter' {
  type GrayMatterInput = string | Buffer;

  type GrayMatterFile = {
    data: Record<string, unknown>;
    content: string;
    excerpt?: string;
    orig: Buffer | string;
    language: string;
    matter: string;
    stringify(lang?: string): string;
  };

  export default function matter(input: GrayMatterInput): GrayMatterFile;
}
