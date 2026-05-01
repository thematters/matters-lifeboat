import { useEffect, useState } from "react";
import {
  buildFingerprintPage,
  PinataClient,
  type PinataUploadResult,
} from "@matters/lifeboat-core";
import type { SharedSession } from "../App";
import { BackupGate } from "../components/BackupGate";
import { Button } from "../components/Button";
import { TextField } from "../components/TextField";

interface Props {
  session: SharedSession;
  setSession: (s: SharedSession) => void;
  onBack: () => void;
}

type Stage = "intro" | "token" | "preview" | "uploading" | "done";
type Uploads = { proof: PinataUploadResult; backup: PinataUploadResult };

export function FlowB({ session, setSession, onBack }: Props) {
  const [stage, setStage] = useState<Stage>("intro");
  const [token, setToken] = useState("");
  const [tokenStatus, setTokenStatus] = useState<"idle" | "checking" | "ok" | "bad">("idle");
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [upload, setUpload] = useState<Uploads | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

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
          title="⚓ 多放一份：先備份再上傳"
          reason="先做完整備份，再產生一張可分享的文章地址頁，一起上傳到你的 Pinata。第一步是輸入 Matters 帳號。"
          onComplete={(zip) => setSession({ ...session, zip, user: { userName: zip.manifest.source.userName } as any })}
          ctaLabel="繼續設定 Pinata 臨時門票 →"
        />
      </>
    );
  }

  const zip = session.zip;
  const userName = zip.manifest.source.userName;
  const cids = [...new Set(zip.manifest.articles.map((a) => a.dataHash).filter(Boolean))];
  const fileName = `${userName}-lifeboat-backup.zip`;
  const proofPage = buildFingerprintPage(zip.manifest);

  async function verifyToken() {
    setTokenStatus("checking");
    setTokenError(null);
    sessionStorage.setItem("matters-lifeboat:pinata-jwt", token);
    try {
      const c = new PinataClient({ jwt: token });
      const ok = await c.verifyAuth();
      if (ok) {
        setTokenStatus("ok");
        setStage("preview");
      } else {
        setTokenStatus("bad");
        setTokenError("Pinata 說這張門票不對。請確認你是從 Pinata 的 API Keys 頁面複製完整那串字。");
      }
    } catch (e) {
      setTokenStatus("bad");
      setTokenError((e as Error).message);
    }
  }

  async function runUpload() {
    setStage("uploading");
    setUploadError(null);
    try {
      const client = new PinataClient({ jwt: token });
      const proof = await client.uploadPublicFile(proofPage.blob, proofPage.fileName);
      const backup = await client.uploadPublicFile(zip.blob, fileName);
      setUpload({ proof, backup });
      setStage("done");
    } catch (e) {
      setUploadError((e as Error).message);
      setStage("preview");
    }
  }

  return (
    <>
      <button className="back" onClick={onBack}>
        ← 回到選擇
      </button>

      {stage === "intro" && (
        <div className="card">
          <h2>⚓ 多放一份到自己的保存空間</h2>
          <p>
            你的備份裡有 <strong>{zip.manifest.stats.totalArticles}</strong> 篇文章、
            <strong>{zip.manifest.stats.totalImages}</strong> 張圖片，以及
            <strong>{cids.length}</strong> 個文章地址。
          </p>
          <p>
            這一步會上傳兩個東西：一張可以打開和分享的「文章地址頁」，
            以及一份完整備份。地址頁給人看，完整備份留給你自己保存。
          </p>
          <div className="trust">
            <strong>流程會分三步，很像把檔案放進雲端硬碟：</strong>
            <br />
            ① 從 Pinata 複製一張臨時門票
            <br />
            ② Lifeboat 測試這張門票能不能用
            <br />
            ③ 你按「上傳」後，Pinata 回傳可分享連結
          </div>
          <Button variant="primary" onClick={() => setStage("token")}>
            我有 Pinata 帳號，照步驟開始 →
          </Button>
          <span style={{ marginLeft: 12, display: "inline-block" }}>
            <Button
              variant="secondary"
              onClick={() =>
                window.open("https://app.pinata.cloud/developers/api-keys", "_blank")
              }
            >
              打開 Pinata API Keys ↗
            </Button>
          </span>
        </div>
      )}

      {stage === "token" && (
        <div className="card">
          <h2>貼上 Pinata 的臨時門票</h2>
          <p>
            Pinata 會給你一串很長的字，正式名稱叫 JWT。你可以先把它想成「只給這次上傳用的臨時門票」。照這樣點：
          </p>
          <ol className="simple-steps">
            <li>打開 Pinata，左邊選 <strong>API Keys</strong>。</li>
            <li>按 <strong>New Key</strong>。</li>
            <li>名稱填 <code>matters-lifeboat</code>。</li>
            <li>權限選 <strong>Files: Read + Write</strong>，其他不用開。</li>
            <li>建立後複製那串很長、開頭像 <code>eyJ</code> 的字。</li>
          </ol>
          <div className="trust">
            <strong>安全提醒：</strong>
            這串字只放在這個瀏覽器分頁裡，關掉分頁就清掉；它不會送到 Lifeboat 伺服器。
          </div>
          <TextField
            multiline
            rows={4}
            style={{ fontFamily: "var(--font-family-mono)", fontSize: 13 }}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
            error={tokenError ?? undefined}
          />
          <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
            <Button
              variant="primary"
              disabled={!token || tokenStatus === "checking"}
              loading={tokenStatus === "checking"}
              onClick={() => void verifyToken()}
            >
              {tokenStatus === "checking" ? "跟 Pinata 打招呼⋯" : "測試這張門票 →"}
            </Button>
            <Button variant="secondary" onClick={() => setStage("intro")}>
              上一步
            </Button>
          </div>
        </div>
      )}

      {stage === "preview" && (
        <div className="card">
          <h2>預覽：即將上傳 2 個檔案</h2>
          <p>
            會先上傳一張可分享的文章地址頁；
            接著上傳完整備份檔。大小約
            <strong> {(zip.bytes.length / 1024 / 1024).toFixed(2)} MB</strong>。
          </p>
          <div className="trust">
            <strong>為什麼不是只上傳壓縮檔？</strong>
            壓縮檔適合保存，但別人打開前不知道裡面是什麼。文章地址頁可以直接分享，清楚列出每篇文章的 Matters 連結和 IPFS 連結。
          </div>
          {uploadError && <div className="callout error">{uploadError}</div>}
          <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Button variant="primary" onClick={() => void runUpload()}>
              確認，上傳地址頁與完整備份
            </Button>
            <Button variant="tertiary" onClick={() => setStage("token")}>
              回上一步
            </Button>
          </div>
        </div>
      )}

      {stage === "uploading" && (
        <div className="card">
          <h2>🚀 正在上傳到 Pinata⋯</h2>
          <div className="progress-outer">
            <div className="progress-inner" style={{ width: "70%" }} />
          </div>
          <div className="callout info">
            正在把文章地址頁與完整備份上傳到 Pinata。請先不要關閉分頁。
          </div>
        </div>
      )}

      {stage === "done" && upload && (
        <div className="card">
          <h2>⚓ 完成：多一份保障</h2>
          <div className="stats">
            <div className="stat">
              <div className="v">2</div>
              <div className="k">檔案已上傳</div>
            </div>
            <div className="stat">
              <div className="v">{cids.length}</div>
              <div className="k">文章地址已保留</div>
            </div>
          </div>
          <div className="callout success" style={{ marginTop: 16 }}>
            <strong>恭喜，你已經把自己的心血結晶，多備一份到分散式儲存系統。</strong>
            <br />
            多一分保存，就多一分保障。下面兩個連結，一個方便分享，一個是完整備份。
            <br />
            地址頁代號：<code>{upload.proof.cid}</code>
            <br />
            分享連結：<a href={upload.proof.gatewayUrl} target="_blank" rel="noreferrer">{upload.proof.gatewayUrl}</a>
            <br />
            完整備份代號：<code>{upload.backup.cid}</code>
            <br />
            完整備份連結：<a href={upload.backup.gatewayUrl} target="_blank" rel="noreferrer">{upload.backup.gatewayUrl}</a>
          </div>
        </div>
      )}
    </>
  );
}
