import type { MattersArticle, MattersUser } from "./types.js";

export const DEFAULT_ENDPOINT = "https://server.matters.town/graphql";

const USER_ARTICLES_QUERY = `
  query UserArticles($userName: String!, $input: UserArticlesInput!) {
    user(input: { userName: $userName }) {
      userName
      displayName
      articles(input: $input) {
        totalCount
        pageInfo { hasNextPage endCursor }
        edges {
          cursor
          node {
            id
            title
            slug
            shortHash
            dataHash
            mediaHash
            iscnId
            state
            license
            createdAt
            revisedAt
            summary
            cover
            tags { content }
            contents { html markdown }
          }
        }
      }
    }
  }
`;

interface RawArticle {
  id: string;
  title: string;
  slug: string;
  shortHash: string;
  dataHash: string;
  mediaHash: string;
  iscnId: string | null;
  state: string;
  license: string | null;
  createdAt: string;
  revisedAt: string | null;
  summary: string;
  cover: string | null;
  tags: Array<{ content: string }> | null;
  contents: { html: string; markdown: string };
}

export class MattersGraphQLError extends Error {
  constructor(message: string, public readonly detail?: unknown) {
    super(message);
    this.name = "MattersGraphQLError";
  }
}

export interface GraphQLClientOptions {
  endpoint?: string;
  fetchImpl?: typeof fetch;
}

export class MattersClient {
  private endpoint: string;
  private fetchImpl: typeof fetch;

  constructor(opts: GraphQLClientOptions = {}) {
    this.endpoint = opts.endpoint ?? DEFAULT_ENDPOINT;
    const f = opts.fetchImpl ?? fetch;
    this.fetchImpl = ((...args: Parameters<typeof fetch>) => f(...args)) as typeof fetch;
  }

  async query<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    const opName = extractOperationName(query) ?? "Anon";
    const res = await this.fetchImpl(this.endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "apollo-require-preflight": "true",
        "x-apollo-operation-name": opName,
      },
      body: JSON.stringify({ query, variables, operationName: opName }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new MattersGraphQLError(
        `HTTP ${res.status} from ${this.endpoint} — ${body.slice(0, 300)}`,
      );
    }
    const data = (await res.json()) as { data?: T; errors?: unknown[] };
    if (data.errors && data.errors.length > 0) {
      throw new MattersGraphQLError("GraphQL errors", data.errors);
    }
    if (!data.data) {
      throw new MattersGraphQLError("Empty response");
    }
    return data.data;
  }

  async fetchAllArticles(
    userName: string,
    opts: { pageSize?: number; onPage?: (count: number, total: number) => void } = {},
  ): Promise<MattersUser> {
    const pageSize = opts.pageSize ?? 50;
    let cursor: string | null = null;
    let user: { userName: string; displayName: string } | null = null;
    let total = 0;
    const articles: MattersArticle[] = [];

    while (true) {
      type Resp = {
        user: {
          userName: string;
          displayName: string;
          articles: {
            totalCount: number;
            pageInfo: { hasNextPage: boolean; endCursor: string | null };
            edges: Array<{ cursor: string; node: RawArticle }>;
          };
        } | null;
      };
      const data: Resp = await this.query<Resp>(USER_ARTICLES_QUERY, {
        userName,
        input: { first: pageSize, after: cursor },
      });
      if (!data.user) {
        throw new MattersGraphQLError(`User not found: @${userName}`);
      }
      if (!user) user = { userName: data.user.userName, displayName: data.user.displayName };
      total = data.user.articles.totalCount;
      for (const edge of data.user.articles.edges) {
        articles.push(normalizeArticle(edge.node));
      }
      opts.onPage?.(articles.length, total);
      if (!data.user.articles.pageInfo.hasNextPage) break;
      cursor = data.user.articles.pageInfo.endCursor;
      if (!cursor) break;
    }

    return {
      userName: user!.userName,
      displayName: user!.displayName,
      totalCount: total,
      articles,
    };
  }
}

function extractOperationName(query: string): string | null {
  const m = query.match(/\b(?:query|mutation)\s+(\w+)/);
  return m ? m[1]! : null;
}

function normalizeArticle(raw: RawArticle): MattersArticle {
  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    shortHash: raw.shortHash,
    dataHash: raw.dataHash,
    mediaHash: raw.mediaHash,
    iscnId: raw.iscnId && raw.iscnId.length > 0 ? raw.iscnId : null,
    state: raw.state,
    license: raw.license ?? null,
    createdAt: raw.createdAt,
    revisedAt: raw.revisedAt,
    summary: raw.summary ?? "",
    tags: (raw.tags ?? []).map((t) => t.content).filter(Boolean),
    markdown: raw.contents?.markdown ?? "",
    html: raw.contents?.html ?? "",
    cover: raw.cover,
  };
}
