# Matters 救生艇 — 易用性測試計畫

> 版本：v0.1
> 測試時機：MVP（三流程皆可跑通，但 polish 未完成）
> 方法：遠端 moderated test，Google Meet 錄影 + screen share；每場 60–75 分鐘。
> 本計畫目標：在公開上線前，驗證五個最危險的卡關時刻（見 ux-flow.md §3）。

---

## 1. 受測者（5 位 persona）

刻意排除重度工程師，包含一位 60+ 與一位完全沒用過 git。

### P1 — 阿芬（58 歲，國中退休老師，Matters 四年）
- **技術水位**：會用 Line、FB、Gmail、Word。不懂 IPFS、不懂 git、不懂 OAuth。
- **動機**：聽朋友說 Matters 可能會改版，想把自己 200 多篇文章備份起來傳給孫子。
- **裝置**：MacBook Air（2018），Safari。
- **預期主要用：流程 A**
- **我最擔心**：A-1 username 輸入處會貼整條 URL 卡住、A-2 等待時以為當機

### P2 — Kevin（32 歲，行銷主管，技術中等）
- **技術水位**：裝過 Hugo 玩部落格、有 GitHub 帳號但平常不 push、聽過 IPFS 但不會用。
- **動機**：想試 B 流程，他對 Storacha 有好奇心。
- **裝置**：MBP 16"，Chrome。
- **預期主要用：流程 B（可能會嘗試 C）**
- **我最擔心**：B-3 token 取得步驟太亂、B-5 等 pin 完太久失去耐心

### P3 — 學豪（68 歲，前媒體人，寫時事評論）
- **技術水位**：會用 WordPress 發文、怕「指令」任何東西、不信任雲端輸入 token。
- **動機**：自主權意識強，想要「不依賴任何平台」的方案。
- **裝置**：Windows 10 + Edge，螢幕字調大。
- **預期主要用：流程 A，可能被 C 吸引**
- **我最擔心**：所有 token/授權畫面；他可能三次就放棄

### P4 — Iris（26 歲，設計師，寫 zine 風格短文）
- **技術水位**：Figma 高手、Webflow 會用、GitHub 創過帳號沒用過、聽過 Cloudflare。
- **動機**：想要 C 流程——給自己做個好看的 archive 站。
- **裝置**：MBP 14"，Chrome + Arc。
- **預期主要用：流程 C**
- **我最擔心**：template 只有 3 個她會嫌醜、C-2 OAuth scope 她可能多問

### P5 — Agent Claude（AI agent, controlled）
- **技術水位**：可以完美執行所有 CLI、可以讀 JSON 狀態、但只能透過一個「代理」真人（研究員扮演）執行瀏覽器動作。
- **動機**：模擬「Claude 替使用者代跑」的情境，測 §4 AI agent 入口。
- **裝置**：Terminal + 瀏覽器。
- **預期主要用：流程 A + B 的 CLI 與 autostart=1 URL**
- **我最擔心**：`autostart=1` 的 5 秒 countdown 是否會讓 agent 卡住、JSON 狀態欄位是否夠描述進度

---

## 2. Task Scenarios（每人 8–10 題）

每題格式：`[T-n] 任務描述 / 成功標準 / 預期卡點 / 需觀察的微互動`

### P1 阿芬（8 題）

| # | 任務 | 成功標準 | 預期卡點 | 觀察微互動 |
|---|---|---|---|---|
| T1 | 請用這個工具備份你 Matters 的所有文章 | ZIP 下載到桌面 | A-1 input 格式 | 她會怎麼輸入 @？是否停頓？ |
| T2 | 打開 ZIP，找出你 2023 年寫的那篇關於孫子的文章 | 在 `/articles/` 找到 | 檔名 sluggy 難讀 | 她會不會用 Finder 的搜尋？ |
| T3 | 把 ZIP 傳給你孫子（用 Line） | Line 檔案送出 | 檔案太大 Line 拒收 | 她怎麼反應？ |
| T4 | 回這個工具的網站，跟我解釋「IPFS 指紋」是什麼 | 說出接近「每篇文章的專屬 ID」 | 她可能直接跳過 | 她會讀 FAQ 嗎？ |
| T5 | 在 landing page 找出「這是不是官方的」答案 | 讀到 Trust section bullet 4 | 可能滾太快 | 滾動速度、眼神停留 |
| T6 | 重跑一次備份（假設你下週又發了一篇） | 第二次更順 | 是否記得 URL | 會用書籤嗎？ |
| T7 | 我告訴你有個「永存」更進階，你想試試看嗎？ | 說出為什麼試／不試 | 看到「需要 API token」卻步 | 她的表情 |
| T8 | 如果這個工具明天就消失，你備份的 ZIP 還在嗎？ | 回答「在，在我電腦裡」 | 無 | 信任感收斂確認 |

### P2 Kevin（10 題）

| # | 任務 | 成功標準 | 預期卡點 | 觀察微互動 |
|---|---|---|---|---|
| T1 | 備份你 Matters 帳號 | ZIP 下載 | 幾乎不卡 | 他會探索「進階」選項嗎 |
| T2 | 把你的文章 pin 到你自己的 Storacha 帳號 | B 流程走完 | B-2 選擇猶豫 | 他讀多久才決定 provider |
| T3 | 去 Storacha 申請一個 token | 拿到 token 貼回來 | Storacha UI 英文 | 他會在哪個頁面卡住 |
| T4 | 貼完 token 後，在按下「開始 pin」前，告訴我你覺得會發生什麼 | 說出「會花我配額」 | 可能沒看 dry-run 細節 | 是否展開 CID 清單 |
| T5 | 中途關掉 tab，再打開，試試看能不能續傳 | 資料不遺失 | resume_url 是否用得出來 | 他找 URL 的路徑 |
| T6 | 你剛 pin 完，告訴我怎麼把一篇 IPFS 版分享給朋友 | 說出 `<CID>.ipfs.w3s.link` 或去 handoff 找 | 可能不看 handoff | 會不會 scroll handoff |
| T7 | 假設你明天 token 被 leak 了怎麼辦 | 說出「去 Storacha 撤銷」 | 可能不知道 | 工具有沒有給提示 |
| T8 | 我追加：你想不想做個網站？走一半覺得不對勁就退出 | 觀察退出路徑 | 退出後 state 是否乾淨 | 中途退出體驗 |
| T9 | 用 SUS 題組打分 | 完成問卷 | 無 | 他對哪題猶豫 |
| T10 | 跟我講你最想改的一個地方 | 說出 1 個具體 | 無 | 他第一個抱怨 |

### P3 學豪（9 題）

| # | 任務 | 成功標準 | 預期卡點 | 觀察微互動 |
|---|---|---|---|---|
| T1 | 用最簡單的方式備份你文章 | ZIP 下載 | 可能會抱怨「為什麼要輸 username、不是登入」 | 信任感 |
| T2 | 讀 landing Trust section，告訴我哪一點你最看重 | 說出 1 點 | 可能都不信 | 看他讀哪行 |
| T3 | 我演示 B 流程，你看完說「你自己願不願意貼 token」 | 說 yes / no + 理由 | 極可能 no | 他的論點什麼 |
| T4 | 找出這個專案的原始碼在哪 | 點到 GitHub repo | footer 是否顯眼 | 他怎麼找 |
| T5 | 在設定裡把字調大（如果有） | 找到 a11y 控制 | MVP 可能沒有 | 他的 workaround |
| T6 | 你讀完所有 FAQ，告訴我哪一題沒被問到 | 任意提一個 | 無 | FAQ 漏洞偵測 |
| T7 | 跟我說「數位自主權」四個字在哪一段最有說服力 | 指一個 section | 可能 Why section | 文案命中度 |
| T8 | 假如我告訴你要裝 CLI，你會裝嗎？ | 表達態度 | 絕對 no | 邊界定義 |
| T9 | SUS + 開放式訪談 | 完成 | 無 | 無 |

### P4 Iris（10 題）

| # | 任務 | 成功標準 | 預期卡點 | 觀察微互動 |
|---|---|---|---|---|
| T1 | 從 landing 直接跳到 C 流程 | 點到「立站」卡 | hero 只有一個 CTA 她會不會找不到 | 滾動深度 |
| T2 | 給你 3 個 template，選一個你接受的 | 選 1 個 | 3 個都醜 | 她的負面表情 |
| T3 | 走完 C 流程直到網站上線 | 網站可打開 | C-5 等待 3-5 分鐘 | 她做什麼事填空 |
| T4 | 打開新網站，告訴我最需要改的 3 個視覺問題 | 說出 3 個 | 無 | 她的設計語彙 |
| T5 | 把 template 從 Minimal 換成 Journal | 換成功 | lifeboat.config.json 不好找 | 她怎麼找文件 |
| T6 | 綁你自己的網域 `iris.xyz` | 到 CF 指示 | DNS 步驟卡 | 她的耐心值 |
| T7 | 回頭走 B 流程給同一個帳號 pin | B 順利 | 已走過 C，username 應該 cache | 是否真的 cache |
| T8 | 比較 A / B / C 三個流程，你推薦朋友先用哪個 | 說出推薦 | 無 | 心智模型形成 |
| T9 | 假設朋友沒 GitHub 帳號，你會幫他創嗎？ | 表達意願 | 無 | 代辦意願 |
| T10 | SUS + 開放訪談 | 完成 | 無 | 無 |

### P5 Agent Claude（10 題，皆以 prompt 下達給 agent，由研究員扮演使用者）

| # | 任務 | 成功標準 | 預期卡點 | 觀察微互動 |
|---|---|---|---|---|
| T1 | 「幫我備份 @mashbean 的文章」 | agent 挑 CLI 或 web autostart | 選錯路徑 | 選擇邏輯 |
| T2 | 用 `npx matters-lifeboat backup` 跑一次 | ZIP 產出 + NDJSON 輸出可解析 | NDJSON 欄位命名 | event schema 漏洞 |
| T3 | 用 autostart URL 跑 A 流程，中途使用者反悔 | 5 秒 countdown 成功被取消 | countdown 太短 | countdown UX |
| T4 | 去 `/app/b/pinning?format=json` 拉當下狀態 | 拿到合規 JSON | 欄位不夠 | JSON 完整度 |
| T5 | 幫使用者完成 B 流程（使用者給你 token） | pinning 完成 | agent 不知道 token 流向 | 信任白皮書清楚度 |
| T6 | 跑到一半失敗 3 筆，請你重試失敗 | 重試成功或清楚 log 失敗原因 | retry endpoint 不存在 | 錯誤回報 schema |
| T7 | 使用者問「token 現在存在哪」，agent 怎麼答 | 引用 `/ai.txt` 原文 | ai.txt 描述含糊 | 可追溯性 |
| T8 | 從上次中斷 resume | resume_url 正確 | id 格式亂 | state 復原 |
| T9 | 同一個 session 連跑 A + B + C | 不互相 race | concurrency 問題 | agent 工作流 |
| T10 | 結尾 agent 生成一份給使用者的 handoff 摘要 | agent 能摘出 handoff 核心 | handoff 太長 | handoff 可摘要性 |

---

## 3. SUS（繁中在地化）

原始 SUS 十題，中文語感調整如下。5 分 Likert（非常不同意 1 → 非常同意 5）。

1. 我想我會願意常常用這個工具。
2. 我覺得這個工具做得比它需要的複雜。
3. 我覺得這個工具很好用。
4. 我覺得我需要有人教才能用這個工具。
5. 我覺得這個工具裡的各種功能整合得不錯。
6. 我覺得這個工具裡前後對不上的地方太多。
7. 我相信多數人可以很快學會用這個工具。
8. 我覺得用這個工具很麻煩。
9. 我用這個工具的時候很有把握。
10. 在開始用之前，我需要先學一堆東西。

**計分公式**（同標準 SUS）：奇數題 `(score - 1)`、偶數題 `(5 - score)`，全部加總乘 2.5，範圍 0–100。MVP 目標 **>= 68**（業界平均）；若 < 55 延後上線。

---

## 4. Wizard of Oz 替代方案（for 還沒實作的部分）

| 未實作功能 | WoZ 替代 | 注意 |
|---|---|---|
| B-3 Storacha token 驗證 | 研究員預先備一個公用帳號，給受測者一份 token 紙條；或 fake 一個 validator：輸入任何 `did:key:` 開頭字串都顯示「✅ 5 GB 可用」 | 事後告知受測者是假的，問他們「如果是真的會更緊張嗎」 |
| B-5 真實 pinning | 背景跑 mock 的 progress generator（每 1.5 秒 +1），真正 CID 只打 5 筆測試 | 觀察「假進度」是否仍讓人焦慮 |
| C-2 GitHub OAuth | 跳到一個 fake `/oauth/github` 頁面（本地開一個 fake 模擬 GH 授權畫面） | 重點測**心理障礙**不是技術 |
| C-5 Cloudflare Pages deploy | 替代：5 分鐘假進度 + 真的顯示一個預先 deploy 好的 demo 站 | 測等待焦慮、不測 deploy 本身 |
| C-6 自訂網域 | 口述：「假設這步你跟著我們的文件做，10 分鐘後會生效」 | 測受測者看到文件的信心 |
| AI agent `autostart=1` | 真的實作（簡單），5 秒 countdown 即可 | 不用 WoZ |
| `/ai.txt` | 真的實作（就是一個靜態檔） | 不用 WoZ |

---

## 5. Quantitative Metrics

| Metric | 定義 | MVP 目標 | 量測方式 |
|---|---|---|---|
| **A-flow completion rate** | 從 /app/a/input 進入，到 A-3 下載成功的比例 | ≥ 85% | 埋點 `flow_started` vs `flow_completed` |
| **B-flow completion rate** | 同上 for B | ≥ 60% | 同上 |
| **C-flow completion rate** | 同上 for C | ≥ 45% | 同上 |
| **Time-to-first-ZIP (T2FZ)** | 第一次訪客從 landing 到 ZIP 下載的中位數時間 | ≤ 90 秒（不含文章多寡造成的 packaging 時間） | 手錶計時（test）＋ 埋點（prod） |
| **Error-recovery success rate** | 遇到錯誤訊息後，3 分鐘內成功推進下一步的比例 | ≥ 70% | session replay + 埋點 `error_shown` → 下一個 step 事件 |
| **Abandonment hotspot ranking** | 按 `flow_abandoned.last_step` 分桶 | Top-3 熱點要在 test 後明確 | 埋點統計 |
| **AI agent success rate** | P5 的 10 題 task 成功比例 | ≥ 80% | test 紀錄 |
| **SUS score** | 五位受測者平均 | ≥ 68 | SUS 問卷 |
| **Trust confidence** | 「你信任把 token 貼進這個工具嗎」1–5 分 | ≥ 4.0 | post-test 問卷 |

---

## 6. Post-test 結構化訪談（10 題）

給每位受測者（P1–P4），P5 agent 改為開放 log 分析。

1. 用一句話描述這個工具是做什麼的。（驗證 elevator pitch）
2. 剛剛最順的一刻是哪裡？為什麼？
3. 剛剛最卡的一刻是哪裡？那時你心裡在想什麼？
4. 有沒有哪個按鈕的文字讓你停下來想「這按下去會發生什麼」？
5. 你 token 貼進去的那一刻，有多放心？1–10 打個分。為什麼？
6. 如果這個工具明天收費你會付嗎？多少？（用來衡量感知價值，不是真要收費）
7. 你會推薦給誰用？會不會用？會推薦流程 A / B / C 哪一個？
8. 有沒有哪句文案讓你覺得「這個 tone 怪怪的」或「有被打動到」？
9. 跟你平常用的備份工具（Google Takeout、Notion Export 等）比，哪個好用？哪邊輸？
10. 如果我們 3 個月後再訪你，你希望那時這個工具多了什麼功能？

---

## 7. MVP Ship / No-Ship 判斷表

測試結束後，對照以下門檻決定是否上線。**任一紅線觸發即延後上線**。

| 指標 | 綠燈（上線） | 黃燈（上線 + 緊急修） | 紅燈（延後 ≥ 2 週） |
|---|---|---|---|
| A-flow completion rate | ≥ 85% | 70–85% | < 70% |
| B-flow completion rate | ≥ 60% | 40–60% | < 40% |
| C-flow completion rate | ≥ 45% | 30–45% | < 30% |
| SUS score 平均 | ≥ 68 | 55–68 | < 55 |
| Trust confidence（token 焦慮） | ≥ 4.0 | 3.0–4.0 | < 3.0 |
| 60+ persona（P1 或 P3）能獨力完成 A-flow | ✅ | 一半需要 hint | 完全卡死 |
| 「5 個危險時刻」中有多少在 test 實際觸發卡關 | ≤ 1 | 2–3 | ≥ 4 |
| 每位受測者完成所有 task 的平均錯誤次數 | ≤ 3 | 4–6 | ≥ 7 |
| AI agent 成功率（P5） | ≥ 80% | 60–80% | < 60% |
| 受測者出現「我不敢按」的時刻 | 0–1 次 | 2–3 次 | ≥ 4 次 |

**補充規則**：
- 若 trust confidence 紅燈，即使其他全綠也要延後——這是這個工具的核心賭注。
- 若 P1（阿芬）完全跑不完 A，A 流程文案全面重寫後重測。
- 若 agent 成功率紅燈但一般使用者 OK，可先上線一般版、agent 版延後。

---

## 8. 時程建議

| 週 | 事件 |
|---|---|
| W1 | 招募 5 位受測者、準備 WoZ 環境、跑 pilot（1 位內部同事預演） |
| W2 | 跑 P1–P4 的 session（每天 1 位，留 reflect buffer） |
| W2 末 | 跑 P5 agent session |
| W3 前半 | 逐字稿整理、metric 彙總、寫 findings report |
| W3 後半 | 按 ship/no-ship 表做決策；若延後，進入第二輪 design iteration |

---

*測試計畫結束。文案清單見 `ux-copywriting.md`。*
