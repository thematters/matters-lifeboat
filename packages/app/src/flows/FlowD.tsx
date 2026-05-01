import { useRef, useState } from "react";
import {
  exportFingerprints,
  type FingerprintArchiveResult,
  type FingerprintProgress,
} from "@matters/lifeboat-core";
import { getEndpoint } from "../api";
import { Button } from "../components/Button";
import { TextField } from "../components/TextField";

interface Props {
  onBack: () => void;
}

export function FlowD({ onBack }: Props) {
  const [username, setUsername] = useState(
    () => new URL(location.href).searchParams.get("user") ?? "",
  );
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<FingerprintProgress | null>(null);
  const [result, setResult] = useState<FingerprintArchiveResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  const addLog = (line: string, err = false) => {
    setLogs((items) => [...items, `${new Date().toLocaleTimeString()} ${err ? "❌ " : ""}${line}`]);
    setTimeout(() => {
      if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, 0);
  };

  async function run() {
    const clean = normalizeUsername(username);
    if (!clean) {
      setError("請輸入有效的 matters.town 用戶名");
      return;
    }
    setUsername(clean);
    setRunning(true);
    setResult(null);
    setError(null);
    setLogs([]);
    addLog("開始整理文章地址");
    try {
      const r = await exportFingerprints({
        userName: clean,
        endpoint: getEndpoint(),
        onProgress: (p) => {
          setProgress(p);
          if (p.current === 0 || p.current === p.total || p.current % 10 === 0) {
            addLog(p.message);
          }
        },
      });
      setResult(r);
      addLog(`完成：${r.manifest.stats.totalFingerprints} 個 IPFS 連結`);
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      addLog(msg, true);
    } finally {
      setRunning(false);
    }
  }

  function download() {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.manifest.source.userName}-article-address-book.zip`;
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
        <h2>🔖 保存文章地址簿</h2>
        <p>
          如果你現在不想下載完整文章與圖片，可以先保存一份很小的「文章地址簿」。
          它會列出每篇文章的 Matters 原文連結，以及可點開的 IPFS 連結。
        </p>
        <div className="trust">
          <strong>這不是完整備份：</strong>
          它不包含文章全文和圖片，只是把 Matters 已經存在的文章地址整理下來。
          之後要查驗、分享、補做完整備份或架站，都可以從這份地址簿開始。
        </div>

        <TextField
          placeholder="@mashbean"
          value={username}
          disabled={running}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !running && void run()}
          helperText={
            <>
              這一步不下載圖片，也不備份全文；只整理既有連結。
            </>
          }
        />

        <div style={{ marginTop: 16 }}>
          <Button
            variant="primary"
            disabled={running || !username.trim()}
            loading={running}
            onClick={() => void run()}
          >
            {running ? "整理中⋯" : result ? "重新整理地址簿" : "產生文章地址簿 →"}
          </Button>
        </div>

        {error && <div className="callout error">{error}</div>}
      </div>

      <div className="card">
        <h2>IPFS 是什麼？</h2>
        <p>
          一般網站多半是「用網址找頁面」。IPFS 比較像「用內容找檔案」：
          文章會得到一串地址，內容一樣，地址就一樣。
        </p>
        <p>
          Matters 從很早期就把文章接到 IPFS，是因為我們相信出版不該只靠單一平台記得。
          這份地址簿做的事很單純：把 Matters 已經存在的文章地址整理成一個你可以保存、分享、交給 agent 讀的小檔案。
        </p>
      </div>

      {(running || progress) && !result && (
        <div className="card">
          <h2>{running ? "整理中⋯" : "已完成"}</h2>
          {progress && (
            <>
              <div style={{ fontSize: 14, marginBottom: 4 }}>{progress.message}</div>
              <div className="progress-outer">
                <div className="progress-inner" style={{ width: `${pct}%` }} />
              </div>
            </>
          )}
          <div className="log" ref={logRef} style={{ marginTop: 12 }}>
            {logs.map((line, index) => (
              <div className="line" key={index}>{line}</div>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div className="card">
          <h2>✅ 文章地址簿完成</h2>
          <div className="stats">
            <div className="stat">
              <div className="v">{result.manifest.stats.totalArticles}</div>
              <div className="k">文章</div>
            </div>
            <div className="stat">
              <div className="v">{result.manifest.stats.totalFingerprints}</div>
              <div className="k">IPFS 連結</div>
            </div>
            <div className="stat">
              <div className="v">{(result.bytes.length / 1024).toFixed(1)} KB</div>
              <div className="k">小檔案</div>
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <Button variant="primary" onClick={download}>
              ⬇️ 下載文章地址簿
            </Button>
          </div>
          <div className="callout success" style={{ marginTop: 20 }}>
            下載後會得到 <code>index.html</code>、<code>address-book.json</code>、
            <code>address-book.csv</code>。人看得懂，agent 和試算表也讀得懂。
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
