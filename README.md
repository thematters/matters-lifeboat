# Matters 救生艇 · matters-lifeboat

**一鍵把你的 matters.town 文章備份、永存、甚至立一個自己的站。**

> 這不是因為 matters 會消失。是因為，**你寫的字，本來就該由你保管。**

---

## 這個工具做什麼

三條路，由你選，一次比一次深一點：

### 🛟 備份（Backup）— 30 秒
輸入你的 matters.town 用戶名 → 下載一個 zip。
裡面是所有文章的 Markdown、原圖、metadata、每一篇的 IPFS CID。
不用註冊、不用登入、不給我們任何資料。

### 🌊 永存（Preserve）— 3 分鐘
在備份之後，貼一個免費的 Storacha 或 Pinata 帳號 API token。
每一篇文章的 IPFS CID 會被 re-pin 到你的帳號底下。
從此，即使 matters.town 不再 pin 你的文章，內容仍可從 IPFS 取回。

### 🏝️ 立站（Liberate）— 5 分鐘
在備份之後，授權 GitHub → 自動建立一個你自己的 repo → Cloudflare Pages 自動部署。
產出跟 matters 官方 IPNS 站相同結構的個人網站。網址、樣式、字體、主權，都在你手上。

---

## 為什麼要做

Matters 自己的產品經理團隊（包括我 @mashbean，Matters 總經理）相信：

**創作者的資料主權不是口號，是基礎設施該做的事。**

Matters 站本身早就把你的文章打包成 IPFS bundle 推到 Storacha 和 Pinata。
這個工具把「這件事你自己也能做、隨時都能做」變成**按一個鈕**。

備份是一種好習慣 —— 跟刷牙、鎖門、定期存硬碟一樣。
不是因為會出事，是因為這是對自己創作的尊重。

---

## 現在就開始

- **網站版（零安裝）**：<https://lifeboat.matters.town>（部署中）
- **AI Agent 代理**：把本 README 貼給 Claude / ChatGPT，告訴它「請幫我備份 matters 用戶名 XXX」，它就能用本 repo 的工具完成。詳見 [`docs/agent-usage.md`](docs/agent-usage.md)
- **CLI（給有程式基礎的人）**：`npx @matters/lifeboat export --user YOUR_USERNAME`

---

## 它怎麼運作

```
你的 matters.town 用戶名
    ↓
    ↓ (公開 GraphQL API，匿名可查)
    ↓
server.matters.town/graphql
    ↓
    ↓ 抓所有文章：markdown、html、tags、IPFS CID、圖片 URL
    ↓
瀏覽器裡打包 zip（不經過任何伺服器）
    ↓
    ↓
    ├─→ 下載到你電腦（A 路徑結束）
    ├─→ pin 到你的 Storacha / Pinata（B 路徑）
    └─→ push 到你的 GitHub + Cloudflare Pages（C 路徑）
```

---

## Monorepo 結構

```
packages/
├── core/      TypeScript 共用邏輯（GraphQL、zip、pin、frontmatter）
├── worker/    Cloudflare Worker — GraphQL CORS proxy
├── app/       React + Vite — 使用者操作介面
└── landing/   Astro — 產品首頁（使用 thematters/design-system tokens）

docs/
├── ux-flow.md              UX 流程規格
├── usability-test-plan.md  易用性測試計畫
└── ux-copywriting.md       微文案清單
```

---

## 授權

MIT。你可以自己架一份、改一份、商用一份。數位自主是相互的。

本專案目前在 `mashbean/matters-lifeboat`，未來會轉移到 `thematters/matters-lifeboat`。
