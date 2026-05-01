import { useEffect, useRef, useState } from "react";
import { exportUser, type ExportProgress, type ZipResult } from "@matters/lifeboat-core";
import { getEndpoint } from "../api";
import { LicenseNotice } from "./LicenseNotice";
import { Button } from "./Button";
import { TextField } from "./TextField";

interface Props {
  /** Heading shown above the username form. */
  title: string;
  /** Reason text shown when explaining why this flow needs a backup first. */
  reason: string;
  /** What to do once the backup is ready (typically setSession + advance UI). */
  onComplete: (zip: ZipResult) => void;
  /** Initial username (e.g. from URL param). */
  initialUsername?: string;
  /** Footer label after success, for example "繼續上傳到 Pinata →". */
  ctaLabel?: string;
}

export function BackupGate({ title, reason, onComplete, initialUsername = "", ctaLabel }: Props) {
  const [username, setUsername] = useState(initialUsername);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  const addLog = (line: string, err = false) =>
    setLogs((l) => [...l, `${new Date().toLocaleTimeString()} ${err ? "❌ " : ""}${line}`]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

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
    const endpoint = getEndpoint();
    addLog(`連線到 ${new URL(endpoint, location.href).host}`);
    try {
      const r = await exportUser({
        userName: clean,
        endpoint,
        includeImages: true,
        onProgress: (p) => {
          setProgress(p);
          if (p.current === 0 || p.current === p.total || p.current % 10 === 0) {
            addLog(`[${p.phase}] ${p.message}`);
          }
        },
      });
      addLog(
        `備份完成：${r.manifest.stats.totalArticles} 篇 / ${r.manifest.stats.totalImages} 張圖`,
      );
      setDone(true);
      onComplete(r);
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      addLog(msg, true);
    } finally {
      setRunning(false);
    }
  }

  const pct = progress && progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <>
      <div className="card">
        <h2>{title}</h2>
        <p>{reason}</p>

        <div style={{ marginBottom: 12 }}>
          <TextField
            placeholder="@mashbean"
            value={username}
            disabled={running || done}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !running && !done && void run()}
            helperText={
              <>
                支援 <code>@mashbean</code>、<code>mashbean</code>、或整條 matters.town 網址
              </>
            }
          />
        </div>

        <LicenseNotice />

        {!done && (
          <Button
            variant="primary"
            onClick={() => void run()}
            disabled={running || !username.trim()}
            loading={running}
          >
            {running ? "備份中⋯" : "開始備份 →"}
          </Button>
        )}

        {error && <div className="callout error">{error}</div>}
      </div>

      {(running || progress) && (
        <div className="card">
          <h2>{running ? "備份中⋯" : done ? "✅ 備份完成" : "已完成"}</h2>
          {progress && (
            <>
              <div style={{ fontSize: 14, marginBottom: 4 }}>{progress.message}</div>
              <div className="progress-outer">
                <div className="progress-inner" style={{ width: `${pct}%` }} />
              </div>
              <div className="helper">
                階段：<code>{progress.phase}</code>
                {ctaLabel && done ? ` · ${ctaLabel}` : " · 全部在你的瀏覽器跑，沒有任何資料送到伺服器"}
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
