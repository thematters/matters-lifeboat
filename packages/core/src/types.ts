export interface MattersArticle {
  id: string;
  title: string;
  slug: string;
  shortHash: string;
  dataHash: string;
  mediaHash: string;
  iscnId: string | null;
  state: "active" | "archived" | "banned" | string;
  /**
   * Matters license enum:
   * - cc_0          → CC0 (公眾領域 / public domain)
   * - cc_by_nc_nd_2 → CC BY-NC-ND 2.0 (姓名標示-非商業-禁衍生)
   * - cc_by_nc_nd_4 → CC BY-NC-ND 4.0 (姓名標示-非商業-禁衍生) ← Matters 預設
   * - arr          → All Rights Reserved (作者保留所有權利)
   */
  license: string | null;
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

export interface FingerprintOptions {
  userName: string;
  endpoint?: string;
  pageSize?: number;
  onProgress?: (progress: FingerprintProgress) => void;
}

export interface FingerprintProgress {
  phase: "init" | "fetching-articles" | "packaging" | "done";
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
    license: string | null;
    createdAt: string;
    tags: string[];
    file: string;
    sourceUrl: string;
    ipfsGateways: string[];
  }>;
  /**
   * 著作權與授權說明：
   * - Matters 平台預設授權為 CC BY-NC-ND 4.0（姓名標示-非商業-禁衍生）。
   * - 個別作者可能採用 CC0 或 All Rights Reserved（arr），詳見每篇 license 欄位。
   * - 本備份僅供使用者個人 archival 用途；轉載、衍生、商用前請先確認該篇授權。
   */
  licenseNotice: {
    platformDefault: "cc_by_nc_nd_4";
    summary: string;
    perArticleAt: "articles[].license";
  };
}

export interface FingerprintManifest {
  schema: "matters-lifeboat-fingerprints/v1";
  exportedAt: string;
  source: Manifest["source"];
  stats: {
    totalArticles: number;
    activeArticles: number;
    totalFingerprints: number;
  };
  articles: Array<{
    slug: string;
    title: string;
    shortHash: string;
    dataHash: string;
    mediaHash: string;
    iscnId: string | null;
    state: string;
    license: string | null;
    createdAt: string;
    tags: string[];
    sourceUrl: string;
    ipfsGateways: string[];
  }>;
  note: string;
}
