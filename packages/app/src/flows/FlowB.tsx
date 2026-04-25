import { useEffect, useState } from "react";
import { PinataClient, type PinResult } from "@matters/lifeboat-core";
import type { SharedSession } from "../App";
import { BackupGate } from "../components/BackupGate";

interface Props {
  session: SharedSession;
  setSession: (s: SharedSession) => void;
  onBack: () => void;
}

type Stage = "intro" | "token" | "dry-run" | "pinning" | "done";

export function FlowB({ session, setSession, onBack }: Props) {
  const [stage, setStage] = useState<Stage>("intro");
  const [token, setToken] = useState("");
  const [tokenStatus, setTokenStatus] = useState<"idle" | "checking" | "ok" | "bad">("idle");
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [results, setResults] = useState<PinResult[]>([]);
  const [current, setCurrent] = useState<string>("");
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  useEffect(() => {
    const saved = sessionStorage.getItem("matters-lifeboat:pinata-jwt");
    if (saved) setToken(saved);
    return () => {
      sessionStorage.removeItem("matters-lifeboat:pinata-jwt");
    };
  }, []);

  if (!session.zip) {
    return (
      <>
        <button className="back" onClick={onBack}>
          ← 回到選擇
        </button>
        <BackupGate
          title="⚓ 永存：先備份再 pin"
          reason="把備份裡的每個 IPFS CID pin 一份到你自己的 Pinata 帳號。第一步是抓下備份——輸入 username 開始，跑完自動進入下一階段。"
          onComplete={(zip) => setSession({ ...session, zip, user: { userName: zip.manifest.source.userName } as any })}
          ctaLabel="繼續設定 Pinata token →"
        />
      </>
    );
  }

  const zip = session.zip;
  const cids = [...new Set(zip.manifest.articles.map((a) => a.dataHash).filter(Boolean))];
  const cidNames = new Map(zip.manifest.articles.map((a) => [a.dataHash, a.title]));

  async function verifyToken() {
    setTokenStatus("checking");
    setTokenError(null);
    sessionStorage.setItem("matters-lifeboat:pinata-jwt", token);
    try {
      const c = new PinataClient({ jwt: token });
      const ok = await c.verifyAuth();
      if (ok) {
        setTokenStatus("ok");
        setStage("dry-run");
      } else {
        setTokenStatus("bad");
        setTokenError("Pinata 說這個 token 不對。請確認你是從 Pinata → API Keys 複製的 JWT。");
      }
    } catch (e) {
      setTokenStatus("bad");
      setTokenError((e as Error).message);
    }
  }

  async function runPin(onlyFirst: boolean) {
    setStage("pinning");
    const targetCids = onlyFirst ? cids.slice(0, 1) : cids;
    setProgress({ done: 0, total: targetCids.length });
    const client = new PinataClient({ jwt: token });
    const out = await client.pinMany(targetCids, {
      names: cidNames,
      onProgress: (p) => {
        setProgress({ done: p.done, total: p.total });
        setCurrent(p.current);
        setResults((r) => [...r, p.result]);
      },
    });
    setResults(out);
    setStage("done");
  }

  return (
    <>
      <button className="back" onClick={onBack}>
        ← 回到選擇
      </button>

      {stage === "intro" && (
        <div className="card">
          <h2>⚓ 永存流程 · 把文章 pin 到你自己的 IPFS</h2>
          <p>
            你的備份裡有 <strong>{cids.length}</strong> 個不同的 IPFS CID。
            接下來我們會用你的 Pinata 帳號，把這些 CID 都 pin 一份到你的名下。
          </p>
          <p>
            從此，即使 matters.town 某天不再 pin 你的某篇文章，
            只要你的 Pinata 帳號還在，這份內容就從 IPFS 網路上取得回。
          </p>
          <div className="trust">
            <strong>流程會分三步：</strong>
            <br />
            ① 貼上你的 Pinata JWT → 我們幫你確認能用
            <br />
            ② 預覽要 pin 哪些 CID（dry-run，還不會寫入）
            <br />
            ③ 你按「開始 pin」才真正執行
          </div>
          <button className="btn btn-primary" onClick={() => setStage("token")}>
            我有 Pinata 帳號，開始 →
          </button>
          <button
            className="btn btn-secondary"
            style={{ marginLeft: 12 }}
            onClick={() =>
              window.open("https://app.pinata.cloud/developers/api-keys", "_blank")
            }
          >
            我還沒有，去 Pinata 申請（3 分鐘）↗
          </button>
        </div>
      )}

      {stage === "token" && (
        <div className="card">
          <h2>貼上你的 Pinata JWT</h2>
          <p>
            到 Pinata → Developers → API Keys，建立一組至少含有
            <code>pinByHash</code> 權限的 key，複製它回傳的 JWT（長字串，以 <code>eyJ</code> 開頭）。
          </p>
          <div className="trust">
            <strong>關於這個 token：</strong>
            我們只在你這個分頁的 sessionStorage 保存，關 tab 就立即清除、永遠不送到我們任何伺服器。你可以打開開發者工具親眼看它躺在哪裡。
          </div>
          <textarea
            className="input mono"
            style={{ minHeight: 80 }}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          {tokenError && <div className="callout error">{tokenError}</div>}
          <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
            <button
              className="btn btn-primary"
              disabled={!token || tokenStatus === "checking"}
              onClick={() => void verifyToken()}
            >
              {tokenStatus === "checking" ? "跟 Pinata 打招呼⋯" : "測試這個 token →"}
            </button>
            <button className="btn btn-secondary" onClick={() => setStage("intro")}>
              上一步
            </button>
          </div>
        </div>
      )}

      {stage === "dry-run" && (
        <div className="card">
          <h2>預覽：將會 pin 這 {cids.length} 個 CID</h2>
          <p>
            以下是會被送到你 Pinata 帳號的 IPFS CID 清單。
            <strong>此時還沒有任何動作寫入你的帳號</strong>，你可以放心預覽。
          </p>
          <div
            style={{
              maxHeight: 260,
              overflow: "auto",
              fontSize: 13,
              border: "1px solid var(--color-ink-300)",
              borderRadius: "var(--radius-md)",
              padding: 12,
            }}
          >
            {cids.slice(0, 50).map((cid) => (
              <div
                key={cid}
                style={{ padding: "4px 0", borderBottom: "1px solid var(--color-bg-100)" }}
              >
                <div style={{ fontWeight: 500 }}>{cidNames.get(cid) ?? "(untitled)"}</div>
                <code style={{ fontSize: 11, color: "var(--color-ink-500)" }}>{cid}</code>
              </div>
            ))}
            {cids.length > 50 && (
              <div style={{ padding: 8, color: "var(--color-ink-500)" }}>
                ⋯還有 {cids.length - 50} 個，省略不顯示
              </div>
            )}
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={() => void runPin(false)}>
              確認，開始 pin 全部 {cids.length} 個
            </button>
            <button className="btn btn-secondary" onClick={() => void runPin(true)}>
              只 pin 第一個試試（baby step）
            </button>
            <button className="btn btn-ghost" onClick={() => setStage("token")}>
              回上一步
            </button>
          </div>
        </div>
      )}

      {stage === "pinning" && (
        <div className="card">
          <h2>🚀 正在 pin 到你的 Pinata⋯</h2>
          <div className="progress-outer">
            <div
              className="progress-inner"
              style={{
                width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%`,
              }}
            />
          </div>
          <div style={{ fontSize: 14 }}>
            {progress.done} / {progress.total} 個 CID · 當前：<code>{current}</code>
          </div>
          <div className="callout info">
            🍵 可以先去泡杯茶。關 tab 也沒關係，之前 pin 成功的不會掉。
            但若你關掉，剩下的要重新從這一步接著做。
          </div>
        </div>
      )}

      {stage === "done" && (
        <div className="card">
          <h2>⚓ 完成</h2>
          {(() => {
            const success = results.filter((r) => r.status === "success").length;
            const already = results.filter((r) => r.status === "already-pinned").length;
            const failed = results.filter((r) => r.status === "failed").length;
            return (
              <div className="stats">
                <div className="stat">
                  <div className="v">{success}</div>
                  <div className="k">新 pin 成功</div>
                </div>
                <div className="stat">
                  <div className="v">{already}</div>
                  <div className="k">早已在你那</div>
                </div>
                <div className="stat">
                  <div className="v">{failed}</div>
                  <div className="k">失敗</div>
                </div>
              </div>
            );
          })()}
          <div className="callout success" style={{ marginTop: 16 }}>
            <strong>你現在是保管人了。</strong> 去
            <a href="https://app.pinata.cloud/pinmanager" target="_blank" rel="noreferrer">
              &nbsp;Pinata Pin Manager
            </a>
            確認一下，會看到剛剛 pin 的項目。
          </div>
          {results.some((r) => r.status === "failed") && (
            <details style={{ marginTop: 12 }}>
              <summary>看失敗清單（{results.filter((r) => r.status === "failed").length} 個）</summary>
              <div className="log" style={{ marginTop: 8 }}>
                {results
                  .filter((r) => r.status === "failed")
                  .map((r, i) => (
                    <div className="line err" key={i}>
                      {r.cid} — {r.error}
                    </div>
                  ))}
              </div>
            </details>
          )}
        </div>
      )}
    </>
  );
}
