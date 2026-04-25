import { useEffect, useState } from "react";
import { FlowA } from "./flows/FlowA";
import { FlowB } from "./flows/FlowB";
import { FlowC } from "./flows/FlowC";
import type { ZipResult } from "@matters/lifeboat-core";
import type { MattersUser } from "@matters/lifeboat-core";

export type Flow = "pick" | "a" | "b" | "c";

export interface SharedSession {
  user?: MattersUser;
  zip?: ZipResult;
}

export function App() {
  const [flow, setFlow] = useState<Flow>(() => pickFromUrl());
  const [session, setSession] = useState<SharedSession>({});

  useEffect(() => {
    const u = new URL(window.location.href);
    if (flow === "pick") u.searchParams.delete("flow");
    else u.searchParams.set("flow", flow);
    window.history.replaceState({}, "", u.toString());
  }, [flow]);

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <div className="app-title">
            <img
              src="/app/matters-logo.png"
              alt="Matters"
              className="brand-logo"
              width="32"
              height="32"
            />
            <span className="lifeboat-mark" aria-hidden="true">🛟</span>
            Matters 救生艇
          </div>
          <div className="app-subtitle">
            你的文字，你自己收著 · Your writing, in your own hands
          </div>
        </div>
        <a
          href="https://github.com/mashbean/matters-lifeboat"
          target="_blank"
          rel="noreferrer"
          className="btn btn-ghost"
        >
          Source ↗
        </a>
      </header>

      {flow === "pick" && <Picker onPick={setFlow} />}
      {flow === "a" && (
        <FlowA
          session={session}
          setSession={setSession}
          onDone={() => setFlow("pick")}
          onGotoB={() => setFlow("b")}
          onGotoC={() => setFlow("c")}
          onBack={() => setFlow("pick")}
        />
      )}
      {flow === "b" && (
        <FlowB
          session={session}
          setSession={setSession}
          onBack={() => setFlow("pick")}
        />
      )}
      {flow === "c" && (
        <FlowC
          session={session}
          setSession={setSession}
          onBack={() => setFlow("pick")}
        />
      )}

      <footer className="app-footer">
        Matters 救生艇 · MIT ·
        <a href="https://github.com/mashbean/matters-lifeboat" target="_blank" rel="noreferrer">
          &nbsp;source
        </a>
        &nbsp;·&nbsp;Made by the Matters community
      </footer>
    </div>
  );
}

function pickFromUrl(): Flow {
  const p = new URL(window.location.href).searchParams.get("flow");
  if (p === "a" || p === "b" || p === "c") return p;
  return "pick";
}

function Picker({ onPick }: { onPick: (f: Flow) => void }) {
  return (
    <>
      <div className="card">
        <h2>選一條路線，從最簡單的開始</h2>
        <p>
          三條路，由你選。備份是好習慣 —— 就像刷牙、鎖門、定期把檔案同步到硬碟。
          每一條路徑之間都可以切換，<strong>你的選擇永遠只增不減</strong>。
        </p>
        <div className="trust">
          <strong>為什麼你可以放心：</strong>
          全部在你的瀏覽器跑，沒有後端儲存你的資料。API token（若用）只存在這個分頁的記憶體裡，關 tab 就消失。
          <a
            href="https://github.com/mashbean/matters-lifeboat"
            target="_blank"
            rel="noreferrer"
          >
            自己看原始碼
          </a>
          。
        </div>
      </div>

      <div className="flow-picker">
        <button className="flow-card" onClick={() => onPick("a")}>
          <div className="icon">🛟</div>
          <div className="label">A · 備份</div>
          <div className="desc">
            輸入用戶名，把文章 + 圖片 + IPFS 指紋全部打包成 ZIP，下載到你電腦。約 1–3 分鐘。
          </div>
          <span className="skill">🟢 零門檻</span>
        </button>

        <button className="flow-card" onClick={() => onPick("b")}>
          <div className="icon">⚓</div>
          <div className="label">B · 永存</div>
          <div className="desc">
            在備份之後，把每篇文章的 IPFS CID 再 pin 一份到你自己的 Pinata 帳號。從此，你才是保管人。
          </div>
          <span className="skill">🟡 需要 Pinata 免費帳號</span>
        </button>

        <button className="flow-card" onClick={() => onPick("c")}>
          <div className="icon">🏝️</div>
          <div className="label">C · 立站</div>
          <div className="desc">
            備份之後，產出一個可直接部署到 Cloudflare Pages 的 Astro 站台壓縮檔 —— 拖上去就是你的個人站。
          </div>
          <span className="skill">🟠 要 Cloudflare 免費帳號（拖拉即用）</span>
        </button>
      </div>

      <div className="card">
        <h2>這是 AI Agent 嗎？</h2>
        <p>
          你可以告訴 Claude / ChatGPT：「請幫我用
          <code>https://github.com/mashbean/matters-lifeboat</code> 備份 matters 用戶名 XXX」。
          本工具對 agent friendly：有機器可讀的 endpoint（
          <a href="?flow=a&autostart=1">?autostart=1</a>
          ）與 CLI 備案（
          <code>tsx packages/core/src/test-headless.ts USERNAME</code>）。
        </p>
      </div>
    </>
  );
}
