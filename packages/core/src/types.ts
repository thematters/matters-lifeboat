export interface MattersArticle {
  id: string;
  title: string;
  slug: string;
  shortHash: string;
  dataHash: string;
  mediaHash: string;
  iscnId: string | null;
  state: "active" | "archived" | "banned" | string;
  createdAt: string;
  revisedAt: string | null;
  summary: string;
  tags: string[];
  markdown: string;
  html: string;
  cover: string | null;
}

export interface MattersUser {
  userName: string;
  displayName: string;
  totalCount: number;
  articles: MattersArticle[];
}

export interface ExportOptions {
  userName: string;
  endpoint?: string;
  pageSize?: number;
  includeImages?: boolean;
  onProgress?: (progress: ExportProgress) => void;
}

export interface ExportProgress {
  phase: "init" | "fetching-metadata" | "fetching-articles" | "downloading-images" | "packaging" | "done";
  current: number;
  total: number;
  message: string;
}

export interface Manifest {
  schema: "matters-lifeboat/v1";
  exportedAt: string;
  source: {
    platform: "matters.town";
    endpoint: string;
    userName: string;
    displayName: string;
  };
  stats: {
    totalArticles: number;
    activeArticles: number;
    totalImages: number;
    totalBytes: number;
  };
  articles: Array<{
    slug: string;
    title: string;
    shortHash: string;
    dataHash: string;
    mediaHash: string;
    iscnId: string | null;
    state: string;
    createdAt: string;
    tags: string[];
    file: string;
    sourceUrl: string;
    ipfsGateways: string[];
  }>;
}
