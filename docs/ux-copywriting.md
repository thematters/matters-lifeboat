# Matters 救生艇 — 微文案全清單

> 版本：v0.2（2026-05-01 實測後收斂）
> Tone：數位自主權 / 備份是好習慣 / 平靜、不恐嚇、不焦慮行銷。
> 原則：
> - 繁中優先（台灣用語），英文為對照。
> - 避免「防止」「以免」「萬一」「避免被封」等恐嚇語彙。
> - 用「你」不用「您」——平等、朋友對話的距離。
> - 按鈕優先動詞、次要資訊放括號或 helper text。
> - 錯誤訊息三要素：發生了什麼 / 不是你的錯 / 現在可以做什麼。

---

## 0.1 最新文案決策

- 不對一般使用者說「metadata」「pinByHash」「OAuth」作為主流程。
- `IPFS CID` 先說成「文章地址 / 指紋」，再用括號補 CID。
- `Pinata JWT` 先說成「臨時門票」，避免一開始就讓人覺得像工程設定。
- `Cloudflare` 步驟要明講最後按 `Deploy`；這是實測卡點。
- `Pinata` 完成頁主打「可分享的文章地址頁」，ZIP 是保存用，不是唯一成果。
- 首頁主選項維持三個；「文章地址簿」是補充入口，不與 A/B/C 同級。

## 1. 全域按鈕（Primary CTAs）

| 位置 | 繁中 | English | 備註 |
|---|---|---|---|
| Landing hero 主 CTA | 開始備份 → | Start Backup → | 就是最直接的動作，不叫「免費試用」 |
| Landing 補充入口 | 保存文章地址簿 | Save article address book | 最輕量，不要求先懂 IPFS |
| Landing A 卡片 | 開始備份 | Start backup | 口語、去 jargon |
| Landing B 卡片 | 上傳到 Pinata | Upload to Pinata | 上傳文章地址頁與 ZIP，不再只說 pin |
| Landing C 卡片 | 我要擁有自己的網站 | I'll have my own archive site | 「擁有」關鍵字 |
| 0-1 主 CTA | 產生文章地址簿 → | Create address book → | 不用「匯出 metadata」 |
| A-1 主 CTA | 查看我的文章 | Show me my articles | 查看不是「分析」 |
| A-2 主 CTA | 打包下載 ZIP（預估 2 分鐘） | Pack & download ZIP (~2 min) | 時間寫在按鈕裡 |
| A-3 延伸 CTA | 要不要也把它存到自己的 Pinata/IPFS？ | Want to store this on your own Pinata/IPFS too? | 邀請、不逼迫 |
| B-2 開始 | 我有 Pinata 帳號，照步驟開始 → | I have a Pinata account — start | 幼幼班語氣 |
| B-3 主 CTA | 測試這張門票 → | Test this pass → | JWT 比喻成臨時門票 |
| B-4 主 CTA | 確認，上傳地址頁與完整備份 | Upload address page and backup | 明確說會上傳兩個檔案 |
| B-5 完成延伸 | 要不要也做成網站？ | Also make it a website? | |
| C-2 Cloudflare | 打開 Cloudflare Pages ↗ | Open Cloudflare Pages ↗ | 不需要 GitHub |
| C-3 Deploy | 看到檔案清單後，按 Deploy | Press Deploy after files appear | 補上實測卡點 |
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
| B-3 token (Pinata) | eyJhbGciOi...（貼上你的 Pinata JWT） | eyJhbGciOi...（paste your Pinata JWT） | 同上 | Same as above |
| C-3 Cloudflare 專案名 | mashbean-archive | mashbean-archive | 這會變成你的 Cloudflare 網站名字 | This becomes your Cloudflare site name |

---

## 3. 進度與 Loading 訊息

| 場景 | 繁中 | English |
|---|---|---|
| A-1 查詢中 | 正在找 @mashbean 的文章⋯ | Looking up @mashbean's articles... |
| A-2 打包中 | 正在打包第 47 / 143 篇：〈今天的海邊〉 | Packing article 47 / 143: "Today at the beach" |
| A-2 打包中小字 | 全部在你的瀏覽器跑，沒有任何資料送到我們這邊 | All running in your browser. Nothing sent to us. |
| B-3 測試 token 中 | 正在測試這張 Pinata 門票⋯ | Testing this Pinata pass... |
| B-5 上傳地址頁 | 正在上傳可分享的文章地址頁⋯ | Uploading the shareable address page... |
| B-5 上傳 ZIP | 正在上傳完整 backup.zip⋯ | Uploading the full backup.zip... |
| C-5 Cloudflare 步驟文字 | ①Create application ②Upload your static files ③拖入資料夾 ④按 Deploy ⑤打開網站 | ①Create application ②Upload your static files ③Drop the folder ④Press Deploy ⑤Open site |
| C-5 deploying 等待慰語 | 大概還要 1 分鐘。Cloudflare 正在把你的資料夾變成網站。 | About 1 more minute. Cloudflare is turning the folder into a site. |

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
| TOKEN_FORMAT_BAD | 這看起來不像 Pinata JWT。／ 它通常是一長串、開頭像 `eyJ`。／ 回 Pinata 重新複製一次就好。 | Doesn't look like a Pinata JWT. / It is usually a long string starting with `eyJ`. / Re-copy it from Pinata. |
| TOKEN_401 | Pinata 說這張門票無效。／ 可能只是少複製一段。／ 重新複製 JWT 再貼回來。 | Pinata says this pass is invalid. / You may have missed part of it. / Copy the JWT again. |
| TOKEN_403 | 這張門票不能上傳檔案。／ 可能少勾了 Files 權限。／ 回 Pinata 重新做一張，Files 勾 Read + Write。 | This pass cannot upload files. / Files permission may be missing. / Create a new key with Files Read + Write. |
| QUOTA_LOW | backup.zip 可能超過 Pinata 免費額度。／ 文章地址頁很小，會先上傳成功。／ ZIP 如果失敗，可以先保留在自己電腦。 | backup.zip may exceed your Pinata free quota. / The address page is small and uploads first. / If the ZIP fails, keep it locally. |

### 5.3 B-5 上傳階段

| 錯誤代碼 | 繁中 | English |
|---|---|---|
| UPLOAD_TIMEOUT | 有 3 筆上傳檢查超時了。／ IPFS gateway 偶爾會回應很慢。／ 要不要重試？ | Upload checks timed out. / IPFS gateways can be slow. / Retry? |
| QUOTA_EXHAUSTED | Pinata 額度滿了。／ 文章地址頁如果已經成功，就不會白費。／ ZIP 可以先留在電腦，之後再上傳。 | Pinata quota full. / If the address page succeeded, it is not wasted. / Keep the ZIP locally and upload later. |
| UPLOAD_NETWORK | 上傳中斷了。／ 可能你網路閃了一下。／ 我們會在 10 秒後自動重試。 | Upload interrupted. / Your network blinked, probably. / Auto-retrying in 10s. |

### 5.4 C 階段

| 錯誤代碼 | 繁中 | English |
|---|---|---|
| CF_WRONG_FLOW | 你看到 Build command 了。／ 這代表你選到 GitHub / build 流程。／ 回上一頁，選 Upload your static files。 | You are seeing Build command. / That means you picked the GitHub/build path. / Go back and choose Upload your static files. |
| CF_DEPLOY_MISSING | 還沒看到 Deploy 按鈕。／ 通常是檔案還沒拖進去，或清單還沒跑完。／ 先確認檔案清單有出現，再往頁面底部看。 | No Deploy button yet. / Usually the folder is not fully uploaded. / Wait for the file list, then look near the bottom. |
| CF_BUILD_FAIL | 網站 build 失敗，因為第 12 篇 markdown 有個語法問題。／ 這在大批匯入很常見。／ 我們先把它移到 `_drafts/`，網站還是會上線，你有空再回頭修？ | Build failed — article #12 has markdown syntax issues. / Common in bulk imports. / We'll move it to `_drafts/` so the site still ships. Fix later? |
| CF_QUOTA | 你的 Cloudflare 今天 build 額度用完了。／ 免費方案每天有上限，不是永久鎖。／ 明天再來，或用我們的 community CF 帳號。 | Cloudflare build quota hit for today. / Daily free-tier cap, not a permanent lock. / Come back tomorrow, or use our community CF account. |

---

## 6. 成功訊息

| 場景 | 繁中 | English |
|---|---|---|
| A-3 下載成功 | 你備份了 143 篇文章、286 張圖、一份 CID 清單。ZIP 已下載。 | Backed up 143 articles, 286 images, one CID manifest. ZIP downloaded. |
| A-3 子訊息 | 建議順手丟進雲端多備一份。 | Consider dropping it in your cloud storage too. |
| B-5 完成 | 恭喜，你已經把自己的心血結晶，多備一份到分散式儲存系統。 | You have stored another copy of your work in distributed storage. |
| B-5 子訊息 | 多一分保存，就多一分保障。地址頁方便分享，ZIP 是完整備份。 | More copies, more resilience. The address page is shareable; the ZIP is the full backup. |
| C-6 完成 | 🎉 你的網站活了：mashbean-archive.pages.dev | 🎉 Your site is live: mashbean-archive.pages.dev |
| C-6 子訊息 | 花了 4 分 12 秒。下一次加新文章會更快。 | Took 4 min 12 sec. Adding new articles next time will be faster. |

---

## 7. Tooltip / Inline 解釋

| 概念 | 繁中 | English |
|---|---|---|
| CID | 每篇文章在 IPFS 上的唯一指紋。不懂也沒關係。 | The unique fingerprint for each article on IPFS. It's OK if this means nothing to you. |
| IPFS | 一個去中心化的檔案網路。簡單說：你的文章有一份副本飄在很多台電腦上，不只有 Matters 一台。 | A decentralized file network. Simply: your articles live on many computers, not just Matters'. |
| Pinning | 進階術語：請某一台 IPFS 伺服器「記得」你的檔案不要忘掉。一般使用者只需要知道「多放一份到自己的保存空間」。 | Advanced term: asking an IPFS server to remember your file. For most users, say "store another copy." |
| Pinata | 一個幫你把檔案放到 IPFS 上的服務。可以從免費帳號開始。 | A service that puts your files on IPFS. You can start with a free account. |
| Cloudflare Pages | 免費的靜態網站託管服務。 | Free static site hosting. |
| OAuth | 一種「不需要給密碼就能授權」的方法。 | A way to grant access without sharing your password. |
| repo | GitHub 上的一個專案資料夾。 | A project folder on GitHub. |

---

## 8. Trust Bar（全流程頂端常駐，或重要步驟出現）

| 變體 | 繁中 | English |
|---|---|---|
| 全域頂端 slim bar（常駐） | 🔒 全部在你的瀏覽器跑・我們沒有後端・[看原始碼](github) | 🔒 Runs in your browser · No backend · [View source](github) |
| B-3 token 上方大卡 | 🔒 這個 token 只活在這個分頁的記憶體裡<br>關 tab 就消失。我們沒有伺服器可以偷，就算想偷也偷不到。<br>[看這句是真的嗎——原始碼在這](github) | 🔒 This token lives only in this tab's memory<br>Closing the tab wipes it. We have no backend — we couldn't steal it if we tried.<br>[Verify this claim — source here](github) |
| C-2 Cloudflare 提示 | 🔒 這一步不用 GitHub。選 Upload your static files，拖資料夾，最後按 Deploy。 | 🔒 No GitHub needed here. Pick Upload your static files, drop the folder, then press Deploy. |

---

## 9. Email / Notification 風格訊息（若未來加）

（MVP 沒有 email，但保留語氣模板）

| 場景 | 繁中 | English |
|---|---|---|
| 上傳跑完（未來 async 版） | 你的文章地址頁與完整備份上傳完成了。可以回去看看連結：[link] | Your address page and full backup finished uploading. Check the links here: [link] |
| 週備份提醒（未來 cron） | 上次備份是 7 天前。要不要順手再跑一次？不會花你 2 分鐘。 | Last backup was 7 days ago. Want to run it again? Takes under 2 min. |
| Token 即將過期 | 你的 Pinata 門票還有 7 天過期。提前更新一下？ | Your Pinata pass expires in 7 days. Refresh it in advance? |

---

## 10. Landing FAQ 答案

完整版（與 ux-flow §1.5 的 8 題對齊）：

**Q1 這是開源工具嗎？**
是 Matters 開源的。但它不需要 Matters 登入，也不依賴 Matters 的任何私有 API——只用公開 GraphQL，任何人都可以備份任何公開帳號。

**Q2 我要付錢嗎？**
不用。A 流程完全免費；B 流程需要你自己申請一個 Pinata 帳號；C 流程需要你自己的 Cloudflare 帳號。都可以從免費帳號開始。

**Q3 我不懂 IPFS，我用 A 流程就夠嗎？**
夠了。A 流程就是把你的文章變成 ZIP，跟 Google Takeout 那種匯出一樣，不用懂任何技術。B 跟 C 是進階選項，有興趣再用。

**Q4 Pinata 的 JWT 是什麼？會不會很危險？**
JWT 可以先想成一張臨時門票。救生艇只在這個分頁使用它上傳檔案，不會存到伺服器。你用完後，也可以回 Pinata 把這張門票刪掉。

**Q5 GitHub 我完全沒用過可以嗎？**
可以。現在 C 流程不需要 GitHub；產出純靜態 ZIP 後，把資料夾拖到 Cloudflare 的 Upload your static files 即可。如果走到一半覺得太複雜，隨時可以退回 A 流程下載 ZIP。

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
