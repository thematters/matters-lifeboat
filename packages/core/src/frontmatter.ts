import type { MattersArticle } from "./types.js";

export interface PostFile {
  slug: string;
  filename: string;
  content: string;
}

/**
 * Turn a Matters article into a Markdown file with YAML frontmatter.
 * Filename: <YYYY-MM-DD>-<slug>.md
 */
export function articleToPostFile(a: MattersArticle, userName: string): PostFile {
  const date = a.createdAt.slice(0, 10);
  const slug = safeSlug(a.slug);
  const filename = `posts/${date}-${slug}.md`;
  const sourceUrl = `https://matters.town/@${userName}/${a.shortHash}-${slug}`;

  const frontmatter = toYaml({
    title: a.title,
    slug: a.slug,
    shortHash: a.shortHash,
    author: userName,
    state: a.state,
    createdAt: a.createdAt,
    revisedAt: a.revisedAt ?? undefined,
    tags: a.tags,
    iscnId: a.iscnId ?? undefined,
    ipfs: {
      dataHash: a.dataHash,
      mediaHash: a.mediaHash,
      gateways: buildGateways(a.dataHash),
    },
    source: sourceUrl,
    summary: a.summary,
    cover: a.cover ?? undefined,
  });

  const body = a.markdown.trim();
  const content = `---\n${frontmatter}---\n\n# ${a.title}\n\n${body}\n`;
  return { slug, filename, content };
}

export function buildGateways(cid: string): string[] {
  if (!cid) return [];
  return [
    `https://${cid}.ipfs.dweb.link/`,
    `https://cloudflare-ipfs.com/ipfs/${cid}/`,
    `https://ipfs.io/ipfs/${cid}/`,
    `https://${cid}.ipfs.cf-ipfs.com/`,
  ];
}

function safeSlug(s: string): string {
  return s
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

function toYaml(obj: Record<string, unknown>): string {
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    out.push(renderYamlPair(k, v, 0));
  }
  return out.join("\n") + "\n";
}

function renderYamlPair(key: string, value: unknown, indent: number): string {
  const pad = " ".repeat(indent);
  if (Array.isArray(value)) {
    if (value.length === 0) return `${pad}${key}: []`;
    const lines = [`${pad}${key}:`];
    for (const item of value) {
      if (typeof item === "object" && item !== null) {
        lines.push(`${pad}  -`);
        for (const [ik, iv] of Object.entries(item)) {
          lines.push(renderYamlPair(ik, iv, indent + 4));
        }
      } else {
        lines.push(`${pad}  - ${yamlScalar(item)}`);
      }
    }
    return lines.join("\n");
  }
  if (typeof value === "object" && value !== null) {
    const lines = [`${pad}${key}:`];
    for (const [ik, iv] of Object.entries(value as Record<string, unknown>)) {
      if (iv === undefined || iv === null) continue;
      lines.push(renderYamlPair(ik, iv, indent + 2));
    }
    return lines.join("\n");
  }
  return `${pad}${key}: ${yamlScalar(value)}`;
}

function yamlScalar(v: unknown): string {
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  const s = String(v);
  if (/[:#\-?&*!|>'"%@`]|^\s|\s$|\n/.test(s) || s === "") {
    return JSON.stringify(s);
  }
  return s;
}
