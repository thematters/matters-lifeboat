# Matters 救生艇 — 微文案全清單

> 版本：v0.1
> Tone：數位自主權 / 備份是好習慣 / 平靜、不恐嚇、不焦慮行銷。
> 原則：
> - 繁中優先（台灣用語），英文為對照。
> - 避免「防止」「以免」「萬一」「避免被封」等恐嚇語彙。
> - 用「你」不用「您」——平等、朋友對話的距離。
> - 按鈕優先動詞、次要資訊放括號或 helper text。
> - 錯誤訊息三要素：發生了什麼 / 不是你的錯 / 現在可以做什麼。

---

## 1. 全域按鈕（Primary CTAs）

| 位置 | 繁中 | English | 備註 |
|---|---|---|---|
| Landing hero 主 CTA | 開始備份 → | Start Backup → | 就是最直接的動作，不叫「免費試用」 |
| Landing A 卡片 | 我只想要 ZIP | Just give me the ZIP | 口語、去 jargon |
| Landing B 卡片 | 我要自己留一份 IPFS | I'll pin to my own IPFS | 「自己留」強調自主 |
| Landing C 卡片 | 我要擁有自己的網站 | I'll have my own archive site | 「擁有」關鍵字 |
| A-1 主 CTA | 查看我的文章 | Show me my articles | 查看不是「分析」 |
| A-2 主 CTA | 打包下載 ZIP（預估 2 分鐘） | Pack & download ZIP (~2 min) | 時間寫在按鈕裡 |
| A-3 延伸 CTA | 要不要也把它 pin 到自己的 IPFS？ | Want to pin this to your own IPFS too? | 邀請、不逼迫 |
| B-2 選擇 | 我選 Storacha ／ 我選 Pinata | Use Storacha ／ Use Pinata | 「選」強調決策權 |
| B-3 主 CTA | 確認 token 沒問題，下一步 | Token looks good — next | 「沒問題」三字降焦慮 |
| B-3 測試按鈕 | 測試這個 token | Test this token | |
| B-4 主 CTA | 開始 pin 全部 143 篇 | Pin all 143 articles | 數字具體化 |
| B-4 次要 | 只 pin 第一篇試試 | Pin just one first | baby step |
| B-5 完成延伸 | 要不要也做成網站？ | Also make it a website? | |
| C-2 OAuth | 用 GitHub 登入 | Sign in with GitHub | GitHub 規範用字 |
| C-2 降級 | 先產生 ZIP，我自己上傳 | Skip — I'll upload manually | 尊重路徑 |
| C-3 主 CTA | 看看網站長怎樣 | Preview my site | 「長怎樣」口語 |
| C-4 主 CTA | 用 Minimal 建站 | Build with Minimal | |
| C-6 主 CTA | 打開我的網站 | Open my site | 成就感 |
| 通用「返回」 | 回上一步 | Back | |
| 通用「取消」 | 先不要 | Not now | 不用「取消」的斷絕感 |
| 通用「再試一次」 | 再試一次 | Try again | |

---

## 2. 輸入框 placeholder & helper

| 欄位 | 繁中 placeholder | English placeholder | helper text 繁中 | helper text English |
|---|---|---|---|---|
| A-1 username | @mashbean | @mashbean | 支援 `@mashbean`、`mashbean`、或整條 matters.town 的網址 | Accepts `@mashbean`, `mashbean`, or the full matters.town URL |
| B-3 token (Storacha) | did:key:z6Mk...（貼上你的 Storacha token） | did:key:z6Mk...（paste your Storacha token） | 這個 token 只會存在這個分頁的記憶體，關 tab 就消失 | This token lives only in this tab's memory. Close the tab and it's gone. |
| B-3 token (Pinata) | eyJhbGciOi...（貼上你的 Pinata JWT） | eyJhbGciOi...（paste your Pinata JWT） | 同上 | Same as above |
| C-3 repo 名稱 | mashbean-archive | mashbean-archive | 這會變成你 GitHub 上的 repo 名字 | This becomes your GitHub repo name |

---

## 3. 進度與 Loading 訊息

| 場景 | 繁中 | English |
|---|---|---|
| A-1 查詢中 | 正在找 @mashbean 的文章⋯ | Looking up @mashbean's articles... |
| A-2 打包中 | 正在打包第 47 / 143 篇：〈今天的海邊〉 | Packing article 47 / 143: "Today at the beach" |
| A-2 打包中小字 | 全部在你的瀏覽器跑，沒有任何資料送到我們這邊 | All running in your browser. Nothing sent to us. |
| B-3 測試 token 中 | 正在跟 Storacha 打個招呼⋯ | Saying hi to Storacha... |
| B-5 pinning 中 | 正在 pin 第 87 / 143 篇（剩約 4 分鐘） | Pinning 87 / 143 (~4 min left) |
| B-5 pinning title bar | (87/143) Matters 救生艇 | (87/143) Matters Lifeboat |
| B-5 pinning 中提示 | 可以先去泡杯茶，關 tab 也沒關係，之前 pin 成功的不會掉 | Go make a coffee — closing the tab is fine. What's pinned stays pinned. |
| C-5 deploying 步驟文字 | ①建立 repo ②推送內容 ③設定 Cloudflare ④首次 build ⑤DNS 生效 | ①Create repo ②Push content ③Set up Cloudflare ④First build ⑤DNS propagating |
| C-5 deploying 等待慰語 | 大概還要 2 分鐘。我們真的在動，只是 build 本來就慢。 | About 2 more minutes. Really — builds are just slow. |

---

## 4. 空狀態（Empty States）

| 場景 | 繁中 | English |
|---|---|---|
| A-1 文章數 = 0 | 這個帳號目前沒有公開文章可以備份。如果你剛發的是草稿，它不會出現在這裡。 | This account has no public articles yet. Drafts don't show up here. |
| A-2 勾選 = 0 | 你把所有文章都取消勾選了。至少留一篇才能繼續。 | You've unchecked everything. Pick at least one to continue. |
| B-4 CID 清單展開 = 0 | 沒有 CID 可以 pin，這不太對勁，請回報 issue。 | No CIDs to pin — that's unexpected. Please file an issue. |
| C-4 template preview 失敗 | template 預覽載不出來。沒關係，建站後還是可以換。 | Can't load the preview. Don't worry, you can still switch later. |

---

## 5. 錯誤訊息（三要素版）

格式：**發生了什麼 / 不是你的錯 / 現在可以做什麼**

### 5.1 A-1 輸入階段

| 錯誤代碼 | 繁中 | English |
|---|---|---|
| USER_NOT_FOUND | 找不到 @xxx 這個使用者。／ 可能拼字差一個字母。／ 要不要檢查一下？ | Can't find @xxx. / Might be a typo. / Double-check? |
| NETWORK_DOWN | 連不上 Matters。／ 可能是 matters.town 暫時忙線。／ 過 30 秒再試試？ | Can't reach Matters. / Their server might be busy. / Try again in 30s? |
| ZERO_ARTICLES | @xxx 目前沒有公開文章。／ 這很正常，可能是新帳號或全是草稿。／ 先去 Matters 發一篇，再回來。 | @xxx has no public articles. / Totally normal for new accounts. / Publish something, then come back. |

### 5.2 B-3 Token 階段

| 錯誤代碼 | 繁中 | English |
|---|---|---|
| TOKEN_FORMAT_BAD | 這看起來不是 Storacha token。／ Storacha token 通常以 `did:key:` 開頭。／ 要不要去 Storacha dashboard 重新複製一次？ | Doesn't look like a Storacha token. / They usually start with `did:key:`. / Want to re-copy from your Storacha dashboard? |
| TOKEN_401 | Storacha 說這個 token 無效。／ 可能是過期了，跟你無關。／ 去 Storacha 重新生一個再貼回來。 | Storacha says this token is invalid. / It's probably expired, not your fault. / Generate a new one and paste it back. |
| TOKEN_403 | 這個 token 權限不夠。／ 它被限制成唯讀了。／ 回 Storacha 重新生一個勾選 `Store` scope 的。 | This token doesn't have enough permissions. / It's read-only. / Re-generate with `Store` scope checked. |
| QUOTA_LOW | 你有 143 篇要 pin（約 67 MB），但你的 Storacha 剩 50 MB。／ 這只是免費額度的限制，不是你的問題。／ 要不要先升級，或者勾掉幾篇大的？ | 143 articles (~67 MB) but only 50 MB left on Storacha. / Free tier limit, nothing wrong with you. / Upgrade, or uncheck the bigger articles? |

### 5.3 B-5 Pinning 階段

| 錯誤代碼 | 繁中 | English |
|---|---|---|
| PIN_TIMEOUT | 有 3 筆 pin 超時了。／ IPFS gateway 偶爾會打瞌睡。／ 要不要重試這 3 筆？ | 3 pins timed out. / IPFS gateways nap sometimes. / Retry just those 3? |
| QUOTA_EXHAUSTED | 你的 Storacha 配額滿了。／ 你已經成功 pin 了 87 篇，不會白費。／ 升級帳號繼續，或者就停在這。 | Storacha quota full. / Your 87 pinned articles are safe. / Upgrade to continue, or stop here. |
| PIN_NETWORK | Pinning 中斷了。／ 可能你網路閃了一下。／ 我們會在 10 秒後自動重試。 | Pinning interrupted. / Your network blinked, probably. / Auto-retrying in 10s. |

### 5.4 C 階段

| 錯誤代碼 | 繁中 | English |
|---|---|---|
| GH_REPO_EXISTS | 你已經有一個叫 `mashbean-archive` 的 repo 了。／ 這不是錯，只是你之前用過這名字。／ 覆蓋它，還是換個名字？ | You already have a repo named `mashbean-archive`. / Not an error — you used this name before. / Overwrite, or pick another? |
| GH_SCOPE_MISSING | GitHub 授權少了 `repo` 權限。／ 可能你在授權畫面勾錯了。／ 回到授權一次，勾選 `repo`。 | GitHub authorization missing `repo` scope. / Easy mistake to miss on the permission screen. / Re-authorize with `repo` checked. |
| CF_BUILD_FAIL | 網站 build 失敗，因為第 12 篇 markdown 有個語法問題。／ 這在大批匯入很常見。／ 我們先把它移到 `_drafts/`，網站還是會上線，你有空再回頭修？ | Build failed — article #12 has markdown syntax issues. / Common in bulk imports. / We'll move it to `_drafts/` so the site still ships. Fix later? |
| CF_QUOTA | 你的 Cloudflare 今天 build 額度用完了。／ 免費方案每天有上限，不是永久鎖。／ 明天再來，或用我們的 community CF 帳號。 | Cloudflare build quota hit for today. / Daily free-tier cap, not a permanent lock. / Come back tomorrow, or use our community CF account. |

---

## 6. 成功訊息

| 場景 | 繁中 | English |
|---|---|---|
| A-3 下載成功 | 你備份了 143 篇文章、286 張圖、一份 CID 清單。ZIP 已下載。 | Backed up 143 articles, 286 images, one CID manifest. ZIP downloaded. |
| A-3 子訊息 | 建議順手丟進雲端多備一份。 | Consider dropping it in your cloud storage too. |
| B-5 完成 | 你的 143 篇文章現在有兩份 IPFS pin：Matters 的，跟你自己的。 | Your 143 articles now have two IPFS pins: one on Matters, one on yours. |
| B-5 子訊息 | pinning-receipt.json 是你的收據，建議存一份。 | pinning-receipt.json is your receipt — keep a copy. |
| C-6 完成 | 🎉 你的網站活了：mashbean-archive.pages.dev | 🎉 Your site is live: mashbean-archive.pages.dev |
| C-6 子訊息 | 花了 4 分 12 秒。下一次加新文章會更快。 | Took 4 min 12 sec. Adding new articles next time will be faster. |

---

## 7. Tooltip / Inline 解釋

| 概念 | 繁中 | English |
|---|---|---|
| CID | 每篇文章在 IPFS 上的唯一指紋。不懂也沒關係。 | The unique fingerprint for each article on IPFS. It's OK if this means nothing to you. |
| IPFS | 一個去中心化的檔案網路。簡單說：你的文章有一份副本飄在很多台電腦上，不只有 Matters 一台。 | A decentralized file network. Simply: your articles live on many computers, not just Matters'. |
| Pinning | 請某一台 IPFS 伺服器「記得」你的檔案不要忘掉。 | Asking an IPFS server to "remember" your file and not forget it. |
| Storacha | 基於 Filecoin 的 IPFS pinning 服務，免費 5GB。 | An IPFS pinning service built on Filecoin. 5 GB free. |
| Pinata | 老牌 IPFS pinning 服務，免費 1GB。 | A veteran IPFS pinning service. 1 GB free. |
| Cloudflare Pages | 免費的靜態網站託管服務。 | Free static site hosting. |
| OAuth | 一種「不需要給密碼就能授權」的方法。 | A way to grant access without sharing your password. |
| repo | GitHub 上的一個專案資料夾。 | A project folder on GitHub. |

---

## 8. Trust Bar（全流程頂端常駐，或重要步驟出現）

| 變體 | 繁中 | English |
|---|---|---|
| 全域頂端 slim bar（常駐） | 🔒 全部在你的瀏覽器跑・我們沒有後端・[看原始碼](github) | 🔒 Runs in your browser · No backend · [View source](github) |
| B-3 token 上方大卡 | 🔒 這個 token 只活在這個分頁的記憶體裡<br>關 tab 就消失。我們沒有伺服器可以偷，就算想偷也偷不到。<br>[看這句是真的嗎——原始碼在這](github) | 🔒 This token lives only in this tab's memory<br>Closing the tab wipes it. We have no backend — we couldn't steal it if we tried.<br>[Verify this claim — source here](github) |
| C-2 授權前提示 | 🔒 GitHub 會問你同意哪些權限，只要勾 `repo` 就夠了。我們不需要你其他的東西。 | 🔒 GitHub will ask for permissions. Just `repo` is enough. We don't need anything else. |

---

## 9. Email / Notification 風格訊息（若未來加）

（MVP 沒有 email，但保留語氣模板）

| 場景 | 繁中 | English |
|---|---|---|
| Pinning 跑完（未來 async 版） | 你的 143 篇文章 pin 完了。可以回去看看 receipt：[link] | Your 143 articles are pinned. Check the receipt here: [link] |
| 週備份提醒（未來 cron） | 上次備份是 7 天前。要不要順手再跑一次？不會花你 2 分鐘。 | Last backup was 7 days ago. Want to run it again? Takes under 2 min. |
| Token 即將過期 | 你的 Storacha token 還有 7 天過期。提前更新一下？ | Your Storacha token expires in 7 days. Refresh it in advance? |

---

## 10. Landing FAQ 答案

完整版（與 ux-flow §1.5 的 8 題對齊）：

**Q1 這是官方工具嗎？**
是 Matters 官方開源的。但它不需要 Matters 登入，也不依賴 Matters 的任何私有 API——只用公開 GraphQL，任何人都可以備份任何公開帳號。

**Q2 我要付錢嗎？**
不用。A 流程完全免費；B 流程需要你自己申請一個 Storacha 或 Pinata 帳號，他們都有免費額度；C 流程需要你自己的 GitHub 帳號與 Cloudflare 帳號，也都免費。

**Q3 我不懂 IPFS，我用 A 流程就夠嗎？**
夠了。A 流程就是把你的文章變成 ZIP，跟 Google Takeout 那種匯出一樣，不用懂任何技術。B 跟 C 是進階選項，有興趣再用。

**Q4 Storacha 跟 Pinata 哪個好？**
Storacha 免費空間大（5 GB vs 1 GB），註冊稍快，我們預設推薦它。Pinata 比較老牌，你之前有用過就繼續用它。兩個都可以。

**Q5 GitHub 我完全沒用過可以嗎？**
可以。C 流程會帶你一步一步做，連 GitHub 帳號的註冊都有影片教學。如果走到一半覺得太複雜，隨時可以退回 A 流程下載 ZIP。

**Q6 我的 token 會被你們看到嗎？**
不會。這個工具沒有後端伺服器可以存你的 token。token 只活在你瀏覽器的這個分頁記憶體，關掉就沒了。原始碼開源，你可以自己檢查。

**Q7 我有 500 篇文章會跑很久嗎？**
A 流程約 5 分鐘；B 流程約 20–30 分鐘（IPFS pin 本來就慢）；C 流程第一次約 5 分鐘。500 篇還算小意思，瀏覽器跑得動。

**Q8 Matters 會不會因此把我 ban 掉？**
不會。我們只用公開的 GraphQL API，跟你打開 Matters 網頁看文章是同樣性質的請求，完全符合服務條款。

---

## 11. Tone 一致性檢查表（給實作 reviewer）

實作完拿這張表 review 每個頁面：

- [ ] 沒有「防止平台封殺」「避免文章消失」這類恐嚇語彙
- [ ] 沒有「用戶」，用「你」
- [ ] 沒有「請」「您」「敬請」等過度敬語
- [ ] 所有「Loading」都有具體數字或預估時間
- [ ] 所有錯誤訊息包含「這不是你的錯」的意味（直述不是你的問題，不要說「請檢查你的⋯」）
- [ ] 所有按鈕文字是動詞開頭
- [ ] 所有時間承諾有「預估」「大概」「約」字樣（管理期待）
- [ ] 所有 token / 授權相關 UI 都看得到一句 trust 文案
- [ ] 中文沒有「我們的服務」「我們的產品」這類商業語彙——這是工具，不是服務
- [ ] 英文版有被原生英文讀者讀過一遍（不是中文直譯感）

---

*文案清單結束。此文件應在 UI 實作時作為單一事實來源（single source of truth），所有頁面文字都從這裡引用。*
