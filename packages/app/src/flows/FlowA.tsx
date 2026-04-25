import { useEffect, useRef, useState } from "react";
import { exportUser, type ExportProgress, type ZipResult } from "@matters/lifeboat-core";
import { getEndpoint } from "../api";
import { LicenseNotice } from "../components/LicenseNotice";
import type { SharedSession } from "../App";

interface Props {
  session: SharedSession;
  setSession: (s: SharedSession) => void;
  onDone: () => void;
  onGotoB: () => void;
  onGotoC: () => void;
  onBack: () => void;
}

export function FlowA({ session, setSession, onGotoB, onGotoC, onBack }: Props) {
  const [username, setUsername] = useState(
    () => new URL(location.href).searchParams.get("user") ?? "",
  );
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [result, setResult] = useState<ZipResult | null>(session.zip ?? null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  const addLog = (line: string, err = false) =>
    setLogs((l) => [...l, `${new Date().toLocaleTimeString()} ${err ? "❌ " : ""}${line}`]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  // autostart for AI agents
  useEffect(() => {
    const p = new URL(location.href).searchParams;
    if (p.get("autostart") === "1" && username && !running && !result) {
      const t = setTimeout(() => void run(), 5000);
      return () => clearTimeout(t);
    }
  }, [username]);

  async function run() {
    const clean = normalizeUsername(username);
    if (!clean) {
      setError("請輸入有效的 matters.town 用戶名");
      return;
    }
    setUsername(clean);
    setError(null);
    setRunning(true);
    setLogs([]);
    addLog(`連線到 ${new URL(getEndpoint(), location.href).host}`);
    try {
      const r = await exportUser({
        userName: clean,
        includeImages: true,
        onProgress: (p) => {
          setProgress(p);
          if (p.current === 0 || p.current === p.total || p.current % 10 === 0) {
            addLog(`[${p.phase}] ${p.message}`);
          }
        },
      });
      setResult(r);
      setSession({ ...session, zip: r, user: { userName: clean } as any });
      addLog(
        `完成：${r.manifest.stats.totalArticles} 篇 / ${r.manifest.stats.totalImages} 張圖 / ${fmtMB(r.bytes.length)}`,
      );
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      addLog(msg, true);
    } finally {
      setRunning(false);
    }
  }

  function downloadZip() {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.manifest.source.userName}-matters-lifeboat.zip`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const pct = progress && progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <>
      <button className="back" onClick={onBack}>
        ← 回到選擇
      </button>

      <div className="card">
        <h2>🛟 備份流程</h2>
        <p>輸入你或任何 matters.town 用戶的公開 username，會抓下所有公開文章、圖片，打包成 ZIP。</p>

        <div style={{ marginBottom: 12 }}>
          <input
            className="input"
            placeholder="@mashbean"
            value={username}
            disabled={running}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !running && void run()}
          />
          <div className="helper" style={{ marginTop: 6, fontSize: 12 }}>
            支援 <code>@mashbean</code>、<code>mashbean</code>、或整條 matters.town 網址
          </div>
        </div>

        <LicenseNotice />

        <button
          className="btn btn-primary"
          onClick={() => void run()}
          disabled={running || !username.trim()}
        >
          {running ? "備份中⋯" : result ? "再備份一次" : "開始備份 →"}
        </button>

        {error && <div className="callout error">{error}</div>}
      </div>

      {(running || progress) && !result && (
        <div className="card">
          <h2>{running ? "備份中⋯" : "已完成"}</h2>
          {progress && (
            <>
              <div style={{ fontSize: 14, marginBottom: 4 }}>{progress.message}</div>
              <div className="progress-outer">
                <div className="progress-inner" style={{ width: `${pct}%` }} />
              </div>
              <div className="helper">
                階段：<code>{progress.phase}</code> · 全部在你的瀏覽器跑，沒有任何資料送到伺服器
              </div>
            </>
          )}
          <div className="log" ref={logRef} style={{ marginTop: 12 }}>
            {logs.map((l, i) => (
              <div className="line" key={i}>
                {l}
              </div>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div className="card">
          <h2>✅ 備份完成</h2>
          <div className="stats">
            <div className="stat">
              <div className="v">{result.manifest.stats.totalArticles}</div>
              <div className="k">文章</div>
            </div>
            <div className="stat">
              <div className="v">{result.manifest.stats.totalImages}</div>
              <div className="k">圖片</div>
            </div>
            <div className="stat">
              <div className="v">{fmtMB(result.bytes.length)}</div>
              <div className="k">壓縮檔</div>
            </div>
            <div className="stat">
              <div className="v">{result.imageFailures.length}</div>
              <div className="k">圖片 404</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
            <button className="btn btn-primary" onClick={downloadZip}>
              ⬇️ 下載 ZIP
            </button>
            <button className="btn btn-secondary" onClick={onGotoB}>
              接著：pin 到我的 IPFS →
            </button>
            <button className="btn btn-secondary" onClick={onGotoC}>
              接著：產出可部署站台 →
            </button>
          </div>

          <div className="callout success" style={{ marginTop: 20 }}>
            <strong>🌿 備份是好習慣。</strong>
            你可以之後隨時再回來跑一次，每次都會是一份全新、當下狀態的快照。
          </div>
        </div>
      )}
    </>
  );
}

function normalizeUsername(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  if (s.startsWith("http")) {
    try {
      const u = new URL(s);
      const seg = u.pathname.split("/").filter(Boolean);
      const at = seg.find((x) => x.startsWith("@"));
      if (at) return at.slice(1);
    } catch {
      /* ignore */
    }
  }
  if (s.startsWith("@")) return s.slice(1);
  return s.replace(/[^\w.-]/g, "");
}

function fmtMB(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
