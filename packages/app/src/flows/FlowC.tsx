import { useState } from "react";
import { buildStaticSiteZip } from "@matters/lifeboat-core";
import type { SharedSession } from "../App";
import { BackupGate } from "../components/BackupGate";
import { Button, getButtonClassName } from "../components/Button";
import { TextField } from "../components/TextField";

interface Props {
  session: SharedSession;
  setSession: (s: SharedSession) => void;
  onBack: () => void;
}

/**
 * Flow C (semi-auto per UX agent recommendation):
 * 1. Take the already-exported zip.
 * 2. Re-pack it into a direct-upload static site.
 * 3. Offer user a download + Cloudflare upload entry.
 *
 * This intentionally avoids account-linking flows in MVP because the direct
 * Cloudflare upload path tested better for non-technical users.
 */
const CLOUDFLARE_UPLOAD_URL = "https://dash.cloudflare.com/?to=/:account/workers-and-pages/create";

export function FlowC({ session, setSession, onBack }: Props) {
  const [building, setBuilding] = useState(false);
  const [siteZip, setSiteZip] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [repoName, setRepoName] = useState(() =>
    session.zip ? `${session.zip.manifest.source.userName}-archive` : "matters-archive",
  );

  if (!session.zip) {
    return (
      <>
        <button className="back" onClick={onBack}>
          ← 回到選擇
        </button>
        <BackupGate
          title="🏝️ 做成自己的網站：先備份再產出網站包"
          reason="把備份整理成一個可直接拖到 Cloudflare 的網站資料夾。第一步是抓下備份，輸入 Matters 帳號開始。"
          onComplete={(zip) => setSession({ ...session, zip, user: { userName: zip.manifest.source.userName } as any })}
          ctaLabel="繼續打包成網站 →"
        />
      </>
    );
  }

  const zip = session.zip;

  async function buildSiteZip() {
    setBuilding(true);
    setError(null);
    try {
      const result = await buildStaticSiteZip(zip.bytes, zip.manifest, { siteName: repoName });
      setSiteZip(result.blob);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBuilding(false);
    }
  }

  function download() {
    if (!siteZip) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(siteZip);
    a.download = `${repoName}.zip`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  return (
    <>
      <button className="back" onClick={onBack}>
        ← 回到選擇
      </button>

      <div className="card">
        <h2>🏝️ 架站流程 · 產一個你自己的靜態網站</h2>
        <p>
          我們會用你 <strong>{zip.manifest.stats.totalArticles}</strong> 篇備份，
          產出一個<strong>已經可以用</strong>的網站壓縮檔。Cloudflare 只要照著點：
        </p>
        <ol className="simple-steps">
          <li>先下載下面的 <code>{repoName}.zip</code>，在電腦上解壓縮。</li>
          <li>打開 <a href={CLOUDFLARE_UPLOAD_URL} target="_blank" rel="noreferrer">Cloudflare Workers & Pages</a>。</li>
          <li>按 <strong>Create application</strong>。</li>
          <li>選 <strong>Upload your static files</strong>（上傳靜態檔案），不要選 GitHub。</li>
          <li>Project name 填 <code>{repoName}</code>，然後按 <strong>Create project</strong>。</li>
          <li>把解壓後的整個資料夾拖進上傳框。</li>
          <li>看到檔案清單後，按 <strong>Deploy</strong>。</li>
          <li>Cloudflare 顯示成功後，按 <strong>Visit site</strong> 打開你的新網站。</li>
        </ol>
        <div className="trust">
          <strong>這包已經是純靜態網站：</strong>
          不需要 GitHub、不需要安裝工具、不需要填 build command。你只要記得最後一定要按 <strong>Deploy</strong>。
        </div>

        <div style={{ marginTop: 20 }}>
          <TextField
            label="專案名稱"
            value={repoName}
            onChange={(e) => {
              setRepoName(e.target.value.replace(/\s+/g, "-"));
              setSiteZip(null);
            }}
          />
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Button
            variant="primary"
            onClick={() => void buildSiteZip()}
            disabled={building}
            loading={building}
          >
            {building ? "打包中⋯" : siteZip ? "重新打包" : "生成網站包 →"}
          </Button>
          {siteZip && (
            <Button variant="primary" onClick={download}>
              ⬇️ 下載 {repoName}.zip
            </Button>
          )}
          {siteZip && (
            <a
              href={CLOUDFLARE_UPLOAD_URL}
              target="_blank"
              rel="noreferrer"
              className={getButtonClassName({ variant: "secondary" })}
            >
              打開 Cloudflare Pages ↗
            </a>
          )}
        </div>

        {siteZip && (
          <div className="callout success" style={{ marginTop: 20 }}>
            <strong>🏝️ 準備好了。</strong>
            下載後解壓縮，拖到 Cloudflare 的 Upload your static files 區，看到檔案後按 Deploy。
            如果 Cloudflare 問你 build command，代表走錯路線，請回上一頁選 Upload your static files。
          </div>
        )}

        {error && <div className="callout error" style={{ marginTop: 20 }}>{error}</div>}

        <div className="callout info" style={{ marginTop: 20 }}>
          <strong>想讓 AI agent 幫你做？</strong>
          下載的 zip 裡附有 <code>README.md</code>，裡面有給 Claude / ChatGPT 的逐步指令。
          你只要把它貼給 agent 說「請照這個流程幫我部署」就行。
        </div>
      </div>
    </>
  );
}
