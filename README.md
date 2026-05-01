# Matters 救生艇 · matters-lifeboat

**給 matters.town 寫作者的開源備份工具。**

> 你的文字，你自己收著。備份不是因為今天會出事，而是因為創作者本來就該握有自己的副本。

網站版：<https://lifeboat.matters.town>

---

## 這個工具做什麼

首頁維持三個主流程，從簡單到完整：

### 🛟 A. 下載完整備份

輸入 Matters 帳號，下載一個 ZIP。
裡面有公開文章、圖片、授權資訊、原始 Matters 連結和 IPFS 文章地址。

不用註冊、不用登入；文章和門票不會被保存到 Lifeboat 伺服器。

### ⚓ B. 放到自己的保存空間

如果你想多留一份在線上，可以把兩個檔案上傳到自己的 Pinata：

- 一張可以打開、可以分享的文章地址頁
- 一份完整備份 ZIP

Pinata 會給你一串很長的臨時門票，正式名稱叫 JWT。Lifeboat 只在這個瀏覽器分頁裡使用它，關掉分頁就清掉。

### 🏝️ C. 蓋一個自己的站

把文章做成一包純靜態網站檔案。
到 Cloudflare 選 **Upload your static files**，把解壓後的資料夾拖上去，最後按 **Deploy**。

不需要 GitHub、不需要寫程式、不需要 build command。

### 補充：文章地址簿

如果你還不想下載完整備份，可以先保存一份很小的文章地址簿。
它只整理既有 Matters 文章連結和 IPFS 連結，不包含全文和圖片。

這適合先把「我的文章在哪裡」收在自己手上，之後再補做完整備份、Pinata 保存或架站。

---

## 為什麼要做

Matters 長期重視開放網路與創作者的資料主權。
Matters 文章本來就有 IPFS 地址；救生艇把這些地址、完整備份、Pinata 保存和 Cloudflare 架站整理成一般人也能按完的流程。

備份是一種好習慣。
就像照片會存在手機和雲端，文章也可以多留一份在自己手上。

---

## 現在就開始

- **網站版**：<https://lifeboat.matters.town>
- **AI agent 操作手冊**：[`AGENT.md`](AGENT.md)
- **測試報告**：[`docs/flow-test-report-2026-05-01.md`](docs/flow-test-report-2026-05-01.md)

如果要交給 AI agent，可以直接說：

> 請用 Matters 救生艇幫我備份 matters 用戶名 XXX。先下載完整備份；如果我要線上保存，再引導我用 Pinata；如果我要架站，再產出 Cloudflare 可上傳的網站包。

---

## 它怎麼運作

```
你的 matters.town 用戶名
    ↓
公開 GraphQL API
    ↓
server.matters.town/graphql
    ↓
抓取公開文章、圖片 URL、授權資訊、IPFS 文章地址
    ↓
在瀏覽器裡打包
    ↓
    ├─→ 下載完整 ZIP 到你電腦（A）
    ├─→ 上傳文章地址頁 + backup.zip 到你的 Pinata（B）
    ├─→ 產生靜態網站包，拖到 Cloudflare 後按 Deploy（C）
    └─→ 可選：只下載文章地址簿
```

Lifeboat 有一個 Cloudflare Worker proxy，用來解決瀏覽器 CORS 限制。
它只轉送 GraphQL JSON 請求，不保存文章、不保存 Pinata 門票，也沒有資料庫。

---

## Monorepo 結構

```
packages/
├── core/      TypeScript 共用邏輯：GraphQL、ZIP、文章地址簿、Pinata、靜態網站
├── worker/    Cloudflare Worker：GraphQL CORS proxy
├── app/       React + Vite：使用者操作介面
└── landing/   靜態產品首頁

docs/
├── flow-test-report-2026-05-01.md  完整人工與 agent 流程測試報告
├── ux-flow.md                      UX 流程規格
├── usability-test-plan.md          易用性測試計畫
└── ux-copywriting.md               微文案清單
```

---

## 本機開發

需要 Node.js 18+。

```bash
git clone https://github.com/thematters/matters-lifeboat.git
cd matters-lifeboat
npm install
npm run build
```

常用指令：

```bash
npm run dev:app
npm run dev:landing
npm run test:flow
```

---

## 授權

MIT。
你可以自己架一份、改一份、協助使用者備份自己的文章。

文章內容的再利用仍受原作者授權限制；備份檔內會逐篇記錄授權資訊。
