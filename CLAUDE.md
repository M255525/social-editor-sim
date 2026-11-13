# social-editor-sim — 小編經營記：社群經營模擬

教學用社群經營模擬遊戲（[[my-first-shop-sim]] 的姊妹作，**同一套「籌備關卡→逐月事件＋決策→月報→結算→工具護照」骨架，但畫面刻意不同**：手機社群 App 風，左邊一支手機顯示粉專頁、KPI 進度、貼文動態與小編體力）。

2026-11-14 建立。使用者從「類似遊戲還能做什麼主題」的建議中選了「小編經營記」。

- 純靜態：`index.html`（CSS）＋`data.js`（引擎，`window.SOC`，node 可 require）＋`app.js`（畫面）＋`watermark.js`（列印浮水印）＋`manual.html`＋PWA。
- 本機預覽 port **8878**（`.claude/launch.json` 的 `social-editor-sim`）。visitor-badge `m255525.socialeditorsim`。
- 部署：`.github/workflows/pages.yml`（push master 自動部署）：<https://m255525.github.io/social-editor-sim/>（2026-11-14 上線；repo 由使用者自己 `gh repo create`）。程式牆在 REPO_META。

## 玩法與引擎（data.js）
- 籌備 6 關：品牌（4 個虛構品牌，各有 f0／KPI 粉絲 kf／KPI 導購營收 kr／年度預算 budget／淡旺季）→ 平台（fb／ig／threads／line）→ 語氣（3）→ 受眾（4）→ 內容支柱選 3（6 種）→ 法規小考 3 題（食品廣告不得宣稱醫療效能＝食安法 §28、圖片著作權、薦證廣告要揭露合作關係）。★ 合適度直接顯示在選項上，是刻意的教學設計。
- 每月：事件（`EVENTS`，20 個，`cond/months/minMonth/once/w`；`trend/kol/adreject/image` 依支柱或小考結果有不同結果，寫在 `chooseEvent`）→ 決策（發文數、導購比例、廣告、素材、格式、回留言）→ `compute()` 同時給預估（noise=1）與實際（±15%）。
- 觸及＝粉絲自然觸及＋探索曝光（`DISC`，與粉絲數無關，讓新帳號也有機會）＋分享擴散＋廣告曝光。廣告帶粉與轉單效率刻意壓低（`adReach*.0006` 粉、`*.0012` 點擊）——**曾經因為廣告太強，每月砸 3 萬就穩拿 S，改過一次**。
- 小編體力：月底 +45，爆肝（體力不夠）當月品質 ×0.6、信任 −0.03、下月發文上限 4 篇、體力回到 55（原本 40 會形成每月爆肝的死循環，已修）。
- 信任度往上加時乘 `(1−trust)×1.6`，避免認真玩一下就滿分。
- 評等：S＝兩 KPI ≥120% 且信任 ≥0.6；A＝都 ≥100%；B＝都 ≥80% 或一個達標另一個 ≥60%；C＝平均 ≥50%；D＝其餘或沒做滿（辭職／被請走）。**超出年度預算降一級，>2 倍、>4 倍再各降一級**。信任 <0.15 老闆約談一次（`rescue`），第二次被請走。
- KPI 是用 `node tools/calib.cjs`（固定聰明玩法 × 4 平台平均）校準的；平衡檢查 `node tools/sim_balance.cjs`（smart／lazy／spend）。目前：選對平台的聰明玩法 A～S（咖啡與手作→IG、果園→FB／LINE、健身→LINE），其餘多半 B／C；狂砸廣告數字漂亮但超支降成 C；偷懶全 D。
- **改 data.js 後跑 `node tools/test_engine.mjs`**（隨機 3000 局：數值有限、事件條件、工具存在、超支會降級、同代碼可重現）。

## 畫面（app.js）
- localStorage 前綴 `ses.`：`game`、`board`、`stamps`、`fs`、`fold`、`warnSeen`、`marquee`；⚙「🧹 清除全部資料」清掉後四者以外的 `ses.*`。
- `phoneHtml()` 畫手機（平台色 `PLAT_COLOR` 只用顏色，不用平台 logo）；貼文標題 `POSTS_TXT` 依品牌×支柱。通知彈窗 3.5 秒後淡出。
- 工具 23 個，全部 m255525.github.io 上的線上工具（2026-11-14 逐一確認 200），總地圖連創作者小鎮。
- 測試掛鉤 `window._ses`；端對端 `python tools/e2e_play.py <輸出資料夾> [寬度]`（需先開 8878）。

## 標準配備
跑馬燈（不可關）、⚙ 常用設定（收合式＋關於本工具）、首訪警語＋頁面入口、`manual.html#creator` 完整版（改 `tools/manual_body.html` 後跑 `python tools/build_manual.py`）、PWA（`tools/make_icons.py`；改版升 `service-worker.js` 的 `CACHE_NAME`）、訪客計數器、列印浮水印。無序號、無 AI。
