/**
 * IPFS pinning clients. Only Pinata is wired up for MVP (simplest free-tier API).
 * Storacha (w3up) requires proof delegation which we defer to v2.
 */

export interface PinResult {
  cid: string;
  status: "success" | "already-pinned" | "failed";
  error?: string;
}

export interface PinProgress {
  done: number;
  total: number;
  current: string;
  result: PinResult;
}

export interface PinataClientOptions {
  jwt: string;
  fetchImpl?: typeof fetch;
  baseUrl?: string;
}

export class PinataClient {
  private jwt: string;
  private fetchImpl: typeof fetch;
  private baseUrl: string;

  constructor(opts: PinataClientOptions) {
    this.jwt = opts.jwt;
    const f = opts.fetchImpl ?? fetch;
    this.fetchImpl = ((...args: Parameters<typeof fetch>) => f(...args)) as typeof fetch;
    this.baseUrl = opts.baseUrl ?? "https://api.pinata.cloud";
  }

  /** Verify the JWT by calling the authentication endpoint. */
  async verifyAuth(): Promise<boolean> {
    const res = await this.fetchImpl(`${this.baseUrl}/data/testAuthentication`, {
      headers: { authorization: `Bearer ${this.jwt}` },
    });
    return res.ok;
  }

  async pinByHash(cid: string, name?: string): Promise<PinResult> {
    const res = await this.fetchImpl(`${this.baseUrl}/pinning/pinByHash`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.jwt}`,
      },
      body: JSON.stringify({
        hashToPin: cid,
        pinataMetadata: name ? { name } : undefined,
      }),
    });
    if (res.ok) return { cid, status: "success" };
    let err = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as { error?: { reason?: string; details?: string } };
      if (body.error?.reason === "HASH_ALREADY_PINNED") {
        return { cid, status: "already-pinned" };
      }
      if (body.error?.reason) err = `${body.error.reason}: ${body.error.details ?? ""}`;
    } catch {
      /* ignore */
    }
    return { cid, status: "failed", error: err };
  }

  async pinMany(
    cids: string[],
    opts: {
      names?: Map<string, string>;
      concurrency?: number;
      onProgress?: (p: PinProgress) => void;
    } = {},
  ): Promise<PinResult[]> {
    const concurrency = opts.concurrency ?? 3;
    const out: PinResult[] = [];
    let index = 0;
    let done = 0;
    const worker = async () => {
      while (true) {
        const i = index++;
        if (i >= cids.length) return;
        const cid = cids[i]!;
        const name = opts.names?.get(cid);
        const result = await this.pinByHash(cid, name);
        out.push(result);
        done++;
        opts.onProgress?.({ done, total: cids.length, current: cid, result });
      }
    };
    await Promise.all(
      Array.from({ length: Math.min(concurrency, cids.length) }, () => worker()),
    );
    return out;
  }
}
