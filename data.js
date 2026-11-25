/* 小編經營記 — 遊戲資料＋規則引擎（瀏覽器與 node 都能用）
   觸及率、轉換率、廣告費、粉絲成長都是「遊戲設定」，用來練習社群經營判斷，不是真實平台數據。 */
(function(root){
'use strict';

function hash(s){ var h = 2166136261 >>> 0; s = String(s); for(var i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
function rng(seed){ var a = seed >>> 0; return function(){ a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function R(G, salt){ return rng(hash(G.code + ':' + G.month + ':' + salt)); }
var CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function newCode(rand){ rand = rand || Math.random; var s = ''; for(var i = 0; i < 6; i++) s += CODE_CHARS[Math.floor(rand() * CODE_CHARS.length)]; return s; }
function cleanCode(s){ return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8); }
function clamp(v, a, b){ return v < a ? a : v > b ? b : v; }
function money(n){ n = Math.round(n || 0); return (n < 0 ? '-' : '') + String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function pct(v){ return Math.round(v * 100) + '%'; }

/* ---------- 工具 ---------- */
var TOOLS = {
  'creator-town':            {n:'創作者小鎮', ic:'🏘', d:'27 個 AI 內容創作工具的總地圖'},
  'coffee-ig-planner':       {n:'社群內容規劃報告', ic:'📸', d:'品牌變數一填，排出一個月的社群內容規劃'},
  'annual-marketing-calendar': {n:'全年度行銷行事曆', ic:'📅', d:'52 週檔期：節日、季節、在地活動'},
  'SocialPost':              {n:'社群貼文產生器', ic:'✍', d:'一鍵產生各平台的貼文文案'},
  'social-post-grader':      {n:'社群貼文健診站', ic:'🩺', d:'貼文發出前先打分數，找出地雷與可以改的地方'},
  'where-what-how-strategy-studio': {n:'商業策略工作室', ic:'🧭', d:'想清楚賣給誰、賣什麼、怎麼贏'},
  'business-model-canvas-generator': {n:'商業模式圖產生器', ic:'🧩', d:'品牌的客群、價值主張、通路一張圖看懂'},
  'ai-image-prompt-studio':  {n:'AI 繪圖提示詞工廠', ic:'🎨', lic:true, d:'產生生圖提示詞，做出自己的原創圖片'},
  'ai-video-prompt-studio':  {n:'AI 短影片提示詞產生器', ic:'🎬', lic:true, d:'Sora／Veo／Runway／Kling 短影片提示詞'},
  'ai-video-spec-generator': {n:'AI 影片規格產生器', ic:'🎞', d:'主題、結構、風格 → 分鏡草稿與檢查清單'},
  'ai-video-studio-play':    {n:'AI 影音工坊', ic:'📽', d:'素材＋配音＋字幕，在瀏覽器合成短影片'},
  'ai-music-prompt-studio':  {n:'音樂提示詞產生器', ic:'🎵', lic:true, d:'做自己的配樂提示詞，不用怕版權'},
  'comic-prompt-studio':     {n:'漫畫分鏡提示詞工坊', ic:'💭', d:'把一段話變成多格圖文漫畫'},
  'line-sticker-studio':     {n:'LINE 貼圖自動化助手', ic:'🐻', d:'台詞、生圖、切格、去背，做成品牌貼圖'},
  'text-organizer-studio':   {n:'文字整理編輯器', ic:'🗂', d:'雜亂草稿整理成有標題的文件'},
  'skill-prompt-studio':     {n:'AI 技能提示詞工坊', ic:'🧠', lic:true, d:'把你的小編寫作風格做成 AI 技能'},
  'ai-prompt-generator':     {n:'AI 提示詞產生器', ic:'💡', lic:true, d:'TAG／APE／CO-STAR 等框架提示詞'},
  'amazon-review-reply-generator': {n:'客評／客訴回覆信產生器', ic:'💬', lic:true, d:'原為電商設計，回覆抱怨的原則一樣適用'},
  'private-domain-rfm-studio': {n:'私域流量與 RFM 分析', ic:'👥', lic:true, d:'把粉絲與顧客分群，找出該回訪的人'},
  'IPA_Kano':                {n:'IPA × Kano 滿意度分析', ic:'📊', lic:true, d:'問卷分析出該先改善哪些地方'},
  'product-keyword-cloud':   {n:'關鍵字文字雲產生器', ic:'☁', lic:true, d:'從評論與貼文找出大家在講的關鍵字'},
  'mentors-panel':           {n:'AI 思維顧問團', ic:'🧓', d:'找 12 種思考角色一起想對策'},
  'scam-message-checker':    {n:'詐騙訊息紅綠燈', ic:'🚦', d:'可疑訊息貼上來，看紅黃綠燈'}
};
function toolUrl(id){ return 'https://m255525.github.io/' + id + '/'; }

/* ---------- 品牌（全部虛構） ----------
   aov 客單價、margin 毛利率、f0 起始粉絲、kf／kr 老闆給的 KPI（12 個月後粉絲數／全年導購營收）、
   fit 各內容支柱跟這個品牌合不合（1＝普通）、season 每月買氣、aud 合適的受眾 */
var BRANDS = {
  cafe: {n:'晨光巷咖啡', ic:'☕', biz:'巷口自家烘焙咖啡館', aov:280, margin:.6, f0:800, kf:2000, kr:34000, budget:72000,
    fit:{teach:1.1, daily:1.15, promo:.9, ugc:1, trend:.95, ask:1.05}, aud:{office:1.2, student:1.05, parent:.9, senior:.8},
    season:[.95,1,1,1,1,.95,.9,.9,1,1.05,1.05,1.1], desc:'咖啡知識、店內日常，熟客很多但年輕人不太認識你'},
  craft:{n:'小島手作', ic:'💍', biz:'手作銀飾工作室（網路接單）', aov:980, margin:.55, f0:500, kf:1800, kr:120000, budget:90000,
    fit:{teach:.95, daily:1.1, promo:.95, ugc:1.2, trend:1, ask:1.05}, aud:{office:1.15, student:1.1, parent:.85, senior:.7},
    season:[.9,1.3,.9,.9,1.2,.9,.85,1.1,.9,.95,1.15,1.35], desc:'作品漂亮，客人愛分享；檔期一到訂單就爆'},
  farm: {n:'阿嬤的果園', ic:'🍊', biz:'在地小農柑橘果園（宅配）', aov:780, margin:.45, f0:400, kf:1450, kr:85000, budget:72000,
    fit:{teach:1, daily:1.25, promo:.95, ugc:1.05, trend:.9, ask:1}, aud:{office:.95, student:.7, parent:1.2, senior:1.15},
    season:[1.4,1.3,.8,.6,.5,.5,.5,.6,.7,.9,1.35,1.5], desc:'冬天產季訂單爆量，夏天幾乎沒東西賣'},
  gym:  {n:'鐵人健身教室', ic:'🏋', biz:'社區小班制健身工作室', aov:2200, margin:.7, f0:700, kf:1800, kr:320000, budget:120000,
    fit:{teach:1.3, daily:1, promo:.85, ugc:1.15, trend:1, ask:1}, aud:{office:1.2, student:1, parent:1, senior:.9},
    season:[1.4,1.05,1,1.05,1.2,1.15,1,.9,1,1,.9,.75], desc:'乾貨教學最吃香；年初和夏天前最多人想運動'}
};
/* ---------- 平台（遊戲設定） ----------
   reach 每篇貼文觸及粉絲的比例、viral 被分享擴散的程度、intent 看到後去買的意願、ad 廣告效率、
   video 短影音加成、look 素材品質有多重要、fee 每則訊息成本（只有 LINE） */
var PLATFORMS = {
  fb:     {n:'Facebook 粉絲專頁', ic:'📘', reach:.09, viral:.8, intent:1.1, ad:1, video:1.1, look:.8, eng:1, fee:0,
    aud:{office:1, student:.7, parent:1.25, senior:1.3}, desc:'年齡層較高、放連結方便，但自然觸及低'},
  ig:     {n:'Instagram', ic:'📷', reach:.14, viral:1, intent:.8, ad:1, video:1.35, look:1.3, eng:1.2, fee:0,
    aud:{office:1.15, student:1.3, parent:.95, senior:.6}, desc:'看圖看影片的地方，素材品質很重要，短影音吃香'},
  threads:{n:'Threads', ic:'🧵', reach:.2, viral:1.5, intent:.5, ad:.7, video:.85, look:.6, eng:1.3, fee:0,
    aud:{office:1.15, student:1.3, parent:.8, senior:.5}, desc:'文字為主、容易爆紅擴散，但導購比較難'},
  line:   {n:'LINE 官方帳號', ic:'💚', reach:.85, viral:.08, intent:1.5, ad:.8, video:.7, look:.7, eng:.6, fee:.2,
    aud:{office:1.05, student:.8, parent:1.2, senior:1.3}, desc:'訊息幾乎都送得到、導購最強，但不會擴散，傳越多越貴'}
};
var TONES = {
  pro:  {n:'專業可靠', ic:'🎓', fit:{cafe:1, craft:.95, farm:.95, gym:1.15}, plat:{fb:1.05, ig:.95, threads:.9, line:1.05}, desc:'像專家一樣說明，信任感高'},
  fun:  {n:'幽默親切', ic:'😆', fit:{cafe:1.05, craft:1, farm:1.1, gym:1.05}, plat:{fb:1, ig:1, threads:1.2, line:1}, desc:'像朋友聊天，容易被分享，但用詞要小心'},
  artsy:{n:'文青質感', ic:'🌿', fit:{cafe:1.15, craft:1.2, farm:.95, gym:.85}, plat:{fb:.9, ig:1.2, threads:1, line:.9}, desc:'畫面與文字都講究氛圍，適合視覺品牌'}
};
var AUDS = {office:{n:'上班族', ic:'💼'}, student:{n:'學生', ic:'🎒'}, parent:{n:'爸媽', ic:'👨‍👩‍👧'}, senior:{n:'銀髮族', ic:'👵'}};
var PILLARS = {
  teach:{n:'乾貨教學', ic:'📚', desc:'教大家一招，會被收藏、信任感上升'},
  daily:{n:'幕後日常', ic:'🎬', desc:'讓粉絲認識你，黏著度高'},
  promo:{n:'優惠促銷', ic:'🏷', desc:'導購效果好，太多會讓粉絲退追'},
  ugc:  {n:'顧客見證', ic:'🙌', desc:'客人說好才是真的好，轉換率上升'},
  trend:{n:'時事梗', ic:'🔥', desc:'容易爆紅擴散，但有風險'},
  ask:  {n:'互動提問', ic:'❓', desc:'留言變多，演算法比較願意推'}
};
var POSTS = [4, 8, 12, 16];
var PROMO = [0, .2, .4, .6];
var ADS = [0, 3000, 10000, 30000];
var MATS = {
  phone:{n:'手機隨拍', ic:'📱', cost:0,    q:0,   time:1,   desc:'免錢，看起來就是隨手拍'},
  ai:   {n:'AI 工具輔助', ic:'🤖', cost:800, q:.15, time:.75, desc:'用 AI 做圖、寫稿、剪片，省時又有質感（每月工具費）'},
  pro:  {n:'請攝影師', ic:'📸', cost:9000, q:.3,  time:.85, desc:'畫面最專業，但很貴'}
};
var FORMATS = {img:{n:'圖文為主', v:0}, mix:{n:'圖文影音各半', v:.5}, video:{n:'短影音為主', v:1}};
var REPLY = {daily:{n:'每天回', cost:12, trust:.012}, some:{n:'有空才回', cost:5, trust:0}, none:{n:'不回', cost:0, trust:-.03}};
var CPM = 150;            // 廣告每千次曝光成本（遊戲設定）
var DISC = 300, FAN_ORG = .013, CLICK = .1;   // 探索曝光基數、自然觸及轉粉率、導購點擊率（遊戲設定）
var START_MONTH = 1;      // 1 月上任
var MONTHS = 12;

/* ---------- 新遊戲 ---------- */
function newGame(o){
  return {v:1, code:cleanCode(o.code) || newCode(), name:String(o.name || '').slice(0, 16),
    stage:'prep', step:0, c:{brand:null, plat:null, tone:null, aud:null, pillars:[]},
    qa:{}, quiz:{}, stars:0, month:0, followers:0, trust:.5, stamina:100, exp:0, cum:{rev:0, profit:0, reach:0, spent:0},
    p:{algoVideo:false, fakeFans:0, burnout:false, demAdd:0, trustHit:0, warned:false, sticker:false, ugcBoost:0},
    hist:[], ev:null, dec:null, last:null, over:null, created:Date.now()};
}
function startGame(G){
  var b = BRANDS[G.c.brand];
  G.followers = b.f0; G.stage = 'month'; G.month = 0; G.ev = pickEvent(G); G.dec = defaultDec(G);
  return G;
}
function calMonth(G){ return ((START_MONTH - 1 + G.month) % 12) + 1; }
function defaultDec(G){
  var l = G.hist[G.hist.length - 1];
  if(l) return JSON.parse(JSON.stringify(l.dec));
  return {posts:8, promo:.2, ads:3000, mat:'phone', fmt:'img', reply:'some'};
}
function pillarFit(G){ var b = BRANDS[G.c.brand], ps = G.c.pillars; if(!ps.length) return 1; return ps.reduce(function(s, k){ return s + b.fit[k]; }, 0) / ps.length; }
function has(G, k){ return G.c.pillars.indexOf(k) >= 0; }
function audFit(G){ return BRANDS[G.c.brand].aud[G.c.aud] * PLATFORMS[G.c.plat].aud[G.c.aud]; }
function toneFit(G){ var t = TONES[G.c.tone]; return t.fit[G.c.brand] * t.plat[G.c.plat]; }
function staminaCost(G, dec){
  var f = FORMATS[dec.fmt].v, m = MATS[dec.mat];
  return Math.round(dec.posts * 4 * (1 + .8 * f) * m.time + REPLY[dec.reply].cost);
}
function quality(G, dec){
  var pl = PLATFORMS[G.c.plat], m = MATS[dec.mat];
  var q = .5 + m.q * pl.look + (toneFit(G) - 1) * .8 + (pillarFit(G) - 1) * 1.2 + Math.min(G.exp, .2) - dec.promo * .35;
  var after = G.stamina - staminaCost(G, dec) + 0;
  if(after < 0) q *= .6; else if(after < 25) q -= .08;
  if(dec.posts >= 16) q -= .05;
  return clamp(q, .1, 1.4);
}

/* ---------- 一個月的結果（不含亂數＝預估；含亂數＝實際） ---------- */
function compute(G, dec, noise){
  var b = BRANDS[G.c.brand], pl = PLATFORMS[G.c.plat], ev = (G.ev && G.ev.mul) || {}, m = calMonth(G);
  noise = noise || 1;
  var q = quality(G, dec), f = FORMATS[dec.fmt].v;
  var fmtMul = 1 + (pl.video - 1) * f;
  if(G.p.algoVideo && f < .5 && G.c.plat !== 'line') fmtMul *= .85;
  var pp = Math.pow(dec.posts, .8);
  var organic = G.followers * pl.reach * (.5 + q) * audFit(G) * fmtMul * pp * (ev.reach || 1) * noise;
  var disc = G.c.plat === 'line' ? 0 : DISC * Math.sqrt(pl.viral) * (.5 + q) * audFit(G) * fmtMul * pp * (ev.reach || 1) * noise;
  var adReach = dec.ads / CPM * 1000 * pl.ad * audFit(G);
  var er = .035 * (.5 + q) * pl.eng * (has(G, 'ask') ? 1.2 : 1) * (1 - dec.promo * .5) * (dec.reply === 'daily' ? 1.15 : dec.reply === 'none' ? .85 : 1);
  var eng = (organic + disc + adReach * .15) * er;
  var shares = eng * .12 * pl.viral * (has(G, 'trend') ? 1.3 : 1) * (G.c.tone === 'fun' ? 1.15 : 1);
  var viral = shares * 25 * (ev.viral || 1);
  var reach = organic + disc + adReach + viral;
  // 粉絲
  var gain = G.c.plat === 'line'
    ? 50 + adReach * .0012 + (organic * .004) * q
    : ((organic + disc) * FAN_ORG + viral * .02) * q * (has(G, 'daily') ? 1.1 : 1) + adReach * .0006;
  gain *= (ev.fans || 1) * (1 + G.p.demAdd);
  var churnRate = .012 + dec.promo * .035 + (dec.reply === 'none' ? .01 : 0) + (dec.posts >= 16 && G.c.plat === 'line' ? .03 : 0) + G.p.fakeFans;
  var churn = G.followers * churnRate;
  // 導購
  var promoShare = Math.max(dec.promo, .05);
  var clicks = (organic + disc + viral * .3) * promoShare * CLICK * pl.intent * (has(G, 'promo') ? 1.15 : 1) + adReach * .0012 * pl.intent;
  var conv = .045 * (.4 + G.trust) * (has(G, 'ugc') ? 1.2 : 1) * (1 + G.p.ugcBoost);
  var orders = clicks * conv * b.season[m - 1] * (ev.orders || 1);
  var revenue = orders * b.aov;
  var msgFee = pl.fee * G.followers * dec.posts;
  var cost = dec.ads + MATS[dec.mat].cost + msgFee - (ev.cash || 0);
  var profit = revenue * b.margin - cost;
  return {q:q, disc:Math.round(disc), organic:Math.round(organic), adReach:Math.round(adReach), viral:Math.round(viral), reach:Math.round(reach), eng:Math.round(eng), er:er,
    gain:Math.round(gain), churn:Math.round(churn), clicks:Math.round(clicks), orders:Math.round(orders), revenue:Math.round(revenue),
    msgFee:Math.round(msgFee), cost:Math.round(cost), profit:Math.round(profit), stCost:staminaCost(G, dec)};
}
function forecast(G, dec){ return compute(G, dec, 1); }

function simulate(G, dec){
  G.dec = dec;
  var rand = R(G, 'noise'), noise = .85 + rand() * .3, ev = (G.ev && G.ev.mul) || {};
  var r = compute(G, dec, noise);
  var before = G.followers;
  G.followers = Math.max(50, Math.round(G.followers + r.gain - r.churn));
  // 體力
  var st = G.stamina - r.stCost, burnout = st < 0;
  G.stamina = clamp((burnout ? 0 : st) + 45, 0, 100);
  if(burnout){ G.stamina = 55; }   // 爆肝後被迫休息，回到 55
  // 信任（口碑）
  var dT = REPLY[dec.reply].trust + (r.q - .75) * .04 - Math.max(0, dec.promo - .3) * .08 + (has(G, 'teach') ? .005 : 0) + (ev.trust || 0) - (burnout ? .03 : 0);
  if(dT > 0) dT *= (1 - G.trust) * 1.6;   // 越接近滿分越難再往上
  G.trust = clamp(G.trust + dT, 0, 1);
  G.exp += .02;
  G.p.fakeFans = Math.max(0, G.p.fakeFans - .01);
  G.cum.rev += r.revenue; G.cum.profit += r.profit; G.cum.reach += r.reach; G.cum.spent = (G.cum.spent || 0) + r.cost;
  var res = Object.assign(r, {month:G.month, cal:calMonth(G), dec:dec, ev:G.ev && G.ev.id ? {id:G.ev.id, ch:G.ev.ch} : null,
    before:before, followers:G.followers, trust:G.trust, dT:dT, stamina:G.stamina, burnout:burnout, noise:noise});
  res.tips = tips(G, res);
  G.hist.push(res); G.last = res;
  if(G.trust < .15){
    if(!G.p.warned){ G.stage = 'crisis'; }
    else { G.stage = 'end'; G.over = 'fired'; }
  } else advance(G);
  return res;
}
function advance(G){
  G.month += 1;
  if(G.month >= MONTHS){ G.stage = 'end'; G.over = 'done'; G.ev = null; return; }
  G.stage = 'month'; G.ev = pickEvent(G); G.dec = defaultDec(G);
  if(G.last && G.last.burnout){ G.dec.posts = Math.min(G.dec.posts, 4); }
}
/* 信任崩盤：老闆約談一次 */
function rescue(G, stay){
  G.p.warned = true;
  if(stay){ G.trust = .32; G.followers = Math.round(G.followers * .9); advance(G); }
  else { G.stage = 'end'; G.over = 'quit'; }
}

/* ---------- 教練 ---------- */
function tips(G, r){
  var out = [], d = r.dec, pl = PLATFORMS[G.c.plat];
  if(r.burnout) out.push({t:'小編爆肝了！這個月貼文品質大打折扣。下個月少發一點，或用 AI 工具省時間。', tool:'SocialPost'});
  else if(G.stamina < 50 && d.posts >= 12) out.push({t:'體力只剩 ' + G.stamina + '，再這樣發下去會爆肝。可以先把一個月的內容排好，省下臨時想梗的時間。', tool:'coffee-ig-planner'});
  if(d.promo >= .4 && r.churn > r.gain) out.push({t:'業配感太重：這個月退追 ' + money(r.churn) + ' 人，比新粉絲還多。把導購比例降下來，多做有價值的內容。', tool:'social-post-grader'});
  if(r.q < .65 && d.mat === 'phone' && pl.look > 1) out.push({t:'在 ' + pl.n + ' 上素材品質很吃重，手機隨拍有點吃虧。試試用 AI 做圖。', tool:'ai-image-prompt-studio'});
  if(G.c.plat !== 'line' && d.fmt === 'img' && (pl.video > 1.1 || G.p.algoVideo)) out.push({t:'這個平台現在偏愛短影音，全部做圖文會少掉不少觸及。', tool:'ai-video-spec-generator'});
  if(d.ads >= 10000 && r.revenue * BRANDS[G.c.brand].margin < d.ads) out.push({t:'廣告花了 ' + money(d.ads) + ' 元，賺回來的毛利還不夠付廣告費。先把內容做好再加碼。', tool:'where-what-how-strategy-studio'});
  if(d.reply === 'none') out.push({t:'不回留言，粉絲會覺得被冷落，信任和互動都在下降。', tool:'amazon-review-reply-generator'});
  if(G.c.plat === 'line' && r.msgFee > 3000) out.push({t:'LINE 訊息費這個月花了 ' + money(r.msgFee) + ' 元（遊戲設定）。好友越多每則越貴，可以用分眾只傳給會買的人。', tool:'private-domain-rfm-studio'});
  if(d.promo === 0 && r.orders < 5) out.push({t:'完全沒有導購內容，粉絲喜歡你但不知道怎麼買。放一點點優惠或購買連結。', tool:'SocialPost'});
  if(!out.length) out.push({t:r.profit > 0 ? '這個月內容和導購的平衡不錯，繼續保持！' : '內容穩定在累積，粉絲多了之後導購會慢慢跟上。', tool:'annual-marketing-calendar'});
  return out.slice(0, 3);
}

/* ---------- 事件 ---------- */
function videoUsed(G){ return G.hist.some(function(h){ return h.dec.fmt !== 'img'; }); }
var EVENTS = [
  {id:'launch', ic:'👋', title:'新官上任', w:0, tool:'coffee-ig-planner',
    text:function(G){ return '你是' + BRANDS[G.c.brand].n + '的新小編。老闆說：「粉專交給你了！第一篇要怎麼開場？」'; },
    ch:[{t:'自我介紹＋問大家想看什麼', r:'留言區熱鬧起來，大家知道換了一個很有心的小編。', e:{trust:.03, reach:1.1}},
        {t:'直接貼本月優惠', r:'有人下單，但互動冷冷的。', e:{orders:1.2, trust:-.02}},
        {t:'先觀察一個月再說', r:'粉專靜悄悄的。', e:{reach:.9}}]},
  {id:'algo', ic:'⚙', title:'演算法改版了', w:3, once:true, minMonth:2, cond:function(G){ return G.c.plat !== 'line'; }, tool:'ai-video-prompt-studio',
    text:function(G){ return PLATFORMS[G.c.plat].n + '宣布調整推薦機制：之後會優先推薦短影音和有真實互動的內容。'; },
    ch:[{t:'開始學做短影音', r:'這個月多花了點力氣學剪片。從現在起，短影音比例低於一半的貼文觸及會少 15%。', e:{algoVideo:true, stamina:-10}},
        {t:'繼續做圖文，觀察看看', r:'從現在起，圖文為主的貼文觸及少了 15%。', e:{algoVideo:true}}]},
  {id:'flame', ic:'🧯', title:'留言區炎上', w:3, once:true, tool:'social-post-grader',
    text:function(){ return '上週一篇貼文的用詞被網友截圖，說是「歧視」「沒水準」，留言區湧進兩百則罵聲。'; },
    ch:[{t:'誠懇道歉，說明會怎麼改', r:'雖然被罵了幾天，但道歉得體，有人反而稱讚你處理得好。', e:{trust:-.02}},
        {t:'刪文，當作沒發生', r:'有人截圖「小編刪文了」，再被罵一輪。', e:{trust:-.08}},
        {t:'回嗆：「是你們想太多」', r:'被新聞報導，聲量很大但都是罵聲，信任重挫。', e:{trust:-.18, reach:1.4, fans:.6}}]},
  {id:'trend', ic:'🔥', title:'熱門話題爆發', w:3, tool:'SocialPost',
    text:function(){ return '一個網路迷因正在洗版，大家都在玩同一個梗。'; },
    ch:[{t:'結合品牌，自然地玩一下', r:'', e:{}},
        {t:'硬蹭，跟品牌沒什麼關係也要發', r:'有人覺得好笑，也有人覺得很硬。', e:{reach:1.15, trust:-.02}},
        {t:'不蹭，照原本的內容走', r:'穩穩的。', e:{}}]},
  {id:'copycat', ic:'📋', title:'文案被抄了', w:2, once:true, tool:'comic-prompt-studio',
    text:function(){ return '你熬夜寫的爆文，被另一家粉專一字不改貼出去，還比你多讚。'; },
    ch:[{t:'截圖存證，私訊對方要求下架', r:'對方道歉下架了。你也決定之後做更有自己風格、很難抄的圖文。', e:{trust:.02}},
        {t:'發文公審', r:'粉絲幫你出氣，但也有人覺得吵架很難看。', e:{reach:1.2, trust:-.03}},
        {t:'算了', r:'心很累。', e:{stamina:-10}}]},
  {id:'festival', ic:'🎊', title:'節日檔期快到了', w:5, months:[2,5,8,11,12], tool:'annual-marketing-calendar',
    text:function(G){ return ({2:'情人節', 5:'母親節', 8:'父親節', 11:'雙 11', 12:'聖誕節'})[calMonth(G)] + '快到了，同業都在準備活動。'; },
    ch:[{t:'推檔期限定組合＋倒數貼文', r:'準備物料花了 3000 元，這個月訂單明顯變多。', e:{cash:-3000, orders:1.35, stamina:-8}},
        {t:'跟平常一樣', r:'買氣被別家的活動吸走一些。', e:{orders:.95}}]},
  {id:'kol', ic:'🤳', title:'網紅來談合作', w:3, once:true, tool:'coffee-ig-planner',
    text:function(){ return '一位 3 萬粉絲的網紅說：「1 萬 5 幫你發一篇推薦，要不要寫『合作』看你。」'; },
    ch:[{t:'合作，並清楚標示是合作', r:'粉絲覺得坦白很加分，新粉絲和訂單都變多。', e:{cash:-15000, fans:1.5, orders:1.3, trust:.01}},
        {t:'合作，但請他不要寫是業配', r:'', e:{cash:-15000, fans:1.5, orders:1.3}},
        {t:'婉拒', r:'什麼都沒發生。', e:{}}]},
  {id:'adreject', ic:'🚫', title:'廣告被拒審', w:3, once:true, tool:'social-post-grader',
    text:function(G){ return '老闆寫的廣告文案：「' + ({cafe:'每天一杯，幫你降血壓', craft:'戴上就能轉運招財', farm:'吃了可以治感冒', gym:'保證一個月瘦 10 公斤'})[G.c.brand] + '」被平台退件了。老闆很不高興。'; },
    ch:[{t:'跟老闆說明為什麼不能這樣寫，改成誠實的說法', r:'', e:{}},
        {t:'換個說法、用諧音字繞過審核', r:'', e:{}}]},
  {id:'image', ic:'🖼', title:'被檢舉盜圖', w:3, once:true, tool:'ai-image-prompt-studio',
    text:function(G){ return G.quiz.copy ? '有人來問你的圖是不是網路抓的。你開店前就知道不能亂用網路圖片，所有圖都是自己拍或有授權的。' : '一位攝影師來信：你上個月用的那張美照是他的作品，要你付授權費。'; },
    ch:[{t:'處理', r:'', e:{}}]},
  {id:'ugc', ic:'🙌', title:'客人主動標記你', w:3, once:true, tool:'private-domain-rfm-studio',
    text:function(){ return '一位客人拍了超美的開箱照，還標記了你的帳號。'; },
    ch:[{t:'經過同意後分享，並謝謝他', r:'客人很開心，其他人也想被分享。之後每個月轉換率提高。', e:{ugcBoost:.1, trust:.02}},
        {t:'按個讚就好', r:'錯過一個好素材。', e:{}}]},
  {id:'complain', ic:'📩', title:'粉絲私訊客訴', w:3, once:true, tool:'amazon-review-reply-generator',
    text:function(){ return '一位粉絲私訊：「上次買的東西有瑕疵，訊息你們三天都沒回！再不回我就公開發文。」'; },
    ch:[{t:'馬上回覆、道歉、補寄（花 1000 元）', r:'粉絲發了一篇「客服超好」的貼文。', e:{cash:-1000, trust:.04}},
        {t:'已讀不回', r:'他真的公開發文了。', e:{trust:-.07, reach:1.05}}]},
  {id:'boss', ic:'👔', title:'老闆要你每天發三篇', w:3, once:true, minMonth:3, tool:'mentors-panel',
    text:function(){ return '老闆看到別家很紅，說：「我們也一天發三篇，粉絲就會多了吧！」'; },
    ch:[{t:'拿數據跟老闆溝通：質比量重要', r:'老闆被說服了，還誇你有在看數據。', e:{trust:.01}},
        {t:'照做', r:'這個月體力狂掉，內容越來越水。', e:{stamina:-35, reach:1.15}}]},
  {id:'sticker', ic:'🐻', title:'要不要做品牌 LINE 貼圖？', w:2, once:true, tool:'line-sticker-studio',
    text:function(){ return '有粉絲說：「你們的吉祥物好可愛，出貼圖我一定買！」'; },
    ch:[{t:'做一組送給粉絲（花 5000 元）', r:'貼圖在群組裡被傳來傳去，品牌曝光多了。', e:{cash:-5000, stamina:-15, fans:1.3, trust:.03}},
        {t:'先不要', r:'專心做貼文。', e:{}}]},
  {id:'lottery', ic:'🎁', title:'老闆想辦抽獎衝粉', w:3, once:true, tool:'SocialPost',
    text:function(){ return '老闆說：「辦個抽獎，條件是按讚、分享到自己的版面、標記 3 位好友！」部分平台的活動規範不允許把「分享到個人頁面」當參加條件。'; },
    ch:[{t:'改成「留言回答問題」抽獎，並說明得獎資料怎麼使用', r:'粉絲成長穩穩的，留言區很有內容。', e:{cash:-2000, fans:1.3, trust:.02}},
        {t:'照老闆說的辦', r:'粉絲暴增，但很多是只為抽獎的路人，之後一直退追。', e:{cash:-2000, fans:2.2, fakeFans:.03, trust:-.02}},
        {t:'不辦', r:'省下了錢。', e:{}}]},
  {id:'stale', ic:'😪', title:'粉絲說內容看膩了', w:2, once:true, minMonth:4, tool:'IPA_Kano',
    text:function(){ return '留言：「最近每篇都差不多耶……」互動率連續兩個月下滑。'; },
    ch:[{t:'做一份問卷，問粉絲想看什麼', r:'找到大家最想看的兩種內容，之後粉絲成長變快。', e:{demAdd:.08, trust:.02}},
        {t:'自己腦補換個風格', r:'有些改對了，有些沒人看。', e:{demAdd:.02}}]},
  {id:'viral', ic:'🚀', title:'一支影片爆了', w:3, once:true, cond:videoUsed, tool:'ai-video-spec-generator',
    text:function(){ return '你上週拍的短影音觀看數破 10 萬！'; },
    ch:[{t:'趁勢再拍續集，置頂導購連結', r:'這個月觸及和粉絲都大爆發。', e:{viral:3, fans:1.6, stamina:-10}},
        {t:'順其自然', r:'熱度慢慢退了。', e:{viral:1.8, fans:1.2}}]},
  {id:'music', ic:'🎵', title:'影片配樂被靜音', w:2, once:true, cond:videoUsed, tool:'ai-music-prompt-studio',
    text:function(){ return '你用了一首流行歌當配樂，影片被平台靜音，還收到版權通知。'; },
    ch:[{t:'改用授權音樂或自己做配樂', r:'之後的影片都安心用。', e:{trust:.01}},
        {t:'換一首流行歌再試試', r:'又被靜音一次，觸及掉了。', e:{reach:.85}}]},
  {id:'fake', ic:'🎭', title:'有人冒充你的帳號', w:2, once:true, tool:'scam-message-checker',
    text:function(){ return '有假帳號用你的大頭貼私訊粉絲：「恭喜中獎，請點連結填寫資料領獎」。'; },
    ch:[{t:'立刻發公告提醒粉絲，並檢舉假帳號', r:'粉絲謝謝你的提醒。', e:{trust:.03}},
        {t:'不理它', r:'有粉絲被騙了，跑來罵你。', e:{trust:-.08}}]},
  {id:'quiet', ic:'☕', title:'平靜的一個月', w:3, tool:'skill-prompt-studio',
    text:function(){ return '沒什麼大事發生。正好把你的寫作風格整理起來，以後寫稿更快。'; },
    ch:[{t:'好好經營', r:'', e:{}}]}
];
var EV = {}; EVENTS.forEach(function(e){ EV[e.id] = e; });
function evText(G, e){ return typeof e.text === 'function' ? e.text(G) : e.text; }
function evTool(G, e){ return typeof e.tool === 'function' ? e.tool(G) : e.tool; }
function pickEvent(G){
  if(G.month === 0) return {id:'launch', ch:null, mul:{}};
  var last = G.hist[G.hist.length - 1], seen = {};
  G.hist.forEach(function(h){ if(h.ev) seen[h.ev.id] = 1; });
  var m = calMonth(G), pool = [], tot = 0;
  EVENTS.forEach(function(e){
    if(!e.w) return;
    if(e.once && seen[e.id]) return;
    if(e.months && e.months.indexOf(m) < 0) return;
    if(e.minMonth && G.month < e.minMonth) return;
    if(e.cond && !e.cond(G)) return;
    if(last && last.ev && last.ev.id === e.id) return;
    pool.push(e); tot += e.w;
  });
  if(!pool.length) return {id:'quiet', ch:null, mul:{}};
  var r = R(G, 'event')() * tot, pick = pool[pool.length - 1];
  for(var i = 0; i < pool.length; i++){ r -= pool[i].w; if(r < 0){ pick = pool[i]; break; } }
  return {id:pick.id, ch:null, mul:{}};
}
function chooseEvent(G, i){
  var e = EV[G.ev.id], c = e.ch[i] || e.ch[0], x = c.e || {};
  var mul = {reach:x.reach || 1, fans:x.fans || 1, orders:x.orders || 1, viral:x.viral || 1, cash:x.cash || 0, trust:x.trust || 0};
  var note = c.r;
  if(e.id === 'trend' && i === 0){
    if(has(G, 'trend')){ mul.reach = 1.4; mul.fans = 1.3; note = '你本來就常玩時事梗，這篇自然又好笑，被大量分享！'; }
    else { mul.reach = 1.12; note = '效果還不錯，但不是你平常的風格，粉絲有點意外。'; }
  }
  if(e.id === 'kol' && i === 1){
    if(G.quiz.ad){ mul.trust = -.04; note = '你其實知道推薦文要揭露合作關係……良心不安。後來被網友發現，信任下降。'; }
    else { mul.trust = -.1; note = '被網友抓包是沒揭露的業配，留言區炸鍋，信任大跌。'; }
  }
  if(e.id === 'adreject'){
    if(i === 0){ mul.trust = .03; note = G.quiz.food ? '你開店前就知道誇大或宣稱療效的廣告會出事，老闆被你說服了，還誇你專業。' : '你上網查了相關規定，說服老闆改成誠實的說法，廣告順利上架。'; }
    else { mul.trust = -.06; mul.cash = -5000; note = '廣告繞過審核上了，結果被網友檢舉，還收到主管機關關切，花了 5000 元處理。'; }
  }
  if(e.id === 'image'){
    if(G.quiz.copy){ mul.trust = .01; note = '你拿出原始檔和授權紀錄，對方就沒話說了。'; }
    else { mul.cash = -12000; mul.trust = -.03; note = '付了 1 萬 2 千元和解，並把所有網路抓的圖都換掉。之後改用自己拍的或 AI 做的原創圖。'; }
  }
  ['demAdd', 'ugcBoost', 'fakeFans'].forEach(function(k){ if(x[k]) G.p[k] += x[k]; });
  if(x.algoVideo) G.p.algoVideo = true;
  if(x.stamina) G.stamina = clamp(G.stamina + x.stamina, 0, 100);
  G.ev = {id:e.id, ch:i, mul:mul, note:note};
  return G.ev;
}

/* ---------- 結算 ---------- */
function finalScore(G){
  var b = BRANDS[G.c.brand], fA = G.followers / b.kf, rA = G.cum.rev / b.kr;
  var done = G.over === 'done';
  var spent = G.cum.spent || 0, over = spent > b.budget;
  var grade = !done ? 'D' : fA >= 1.2 && rA >= 1.2 && G.trust >= .6 ? 'S' : fA >= 1 && rA >= 1 ? 'A' : Math.min(fA, rA) >= .8 || (Math.max(fA, rA) >= 1 && Math.min(fA, rA) >= .6) ? 'B' : (fA + rA) / 2 >= .5 ? 'C' : 'D';
  var raw = grade;
  var down = {S:'A', A:'B', B:'C', C:'D', D:'D'};
  if(over && done) grade = down[grade];
  if(spent > b.budget * 2 && done) grade = down[grade];
  if(spent > b.budget * 4 && done) grade = down[grade];
  var score = Math.round(Math.max(0, 300 + Math.min(fA, 2) * 400 + Math.min(rA, 2) * 400 + G.trust * 300 + G.stars * 40 - (done ? 0 : 300) - (over ? Math.min(400, (spent - b.budget) / b.budget * 400) : 0)));
  var burn = G.hist.filter(function(h){ return h.burnout; }).length;
  var avgEr = G.hist.length ? G.hist.reduce(function(s, h){ return s + h.er; }, 0) / G.hist.length : 0;
  return {spent:spent, budget:b.budget, over:over, raw:raw, fA:fA, rA:rA, followers:G.followers, rev:G.cum.rev, profit:G.cum.profit, reach:G.cum.reach, trust:G.trust, score:score, grade:grade, burn:burn, avgEr:avgEr, months:G.hist.length};
}
var GRADE_TXT = {
  S:'神小編！兩個 KPI 都超標兩成，粉絲又信任你，老闆要幫你加薪了。',
  A:'KPI 全部達標，老闆很滿意，續約沒問題。',
  B:'差一點點就達標，老闆覺得你有潛力，明年再拚。',
  C:'離 KPI 還有一段距離。回頭看看哪幾個月觸及或導購掉下來。',
  D:'粉專沒能經營起來。看看教練的提醒，換個策略再挑戰一次。'
};

/* ---------- 籌備小考 ---------- */
var QUIZ = [
  {id:'food', q:'老闆想在食品廣告寫「喝了可以降血壓」，可以嗎？',
    opts:['不行，食品廣告不得宣稱醫療效能', '可以，加一句「個人感受」就好', '可以，只要真的有客人這樣說'], a:0,
    exp:'食品的標示與廣告不得涉及醫療效能；就算加註「個人感受」也一樣有問題。其他商品也不能誇大不實（例如「保證瘦 10 公斤」）。', src:'食品安全衛生管理法第 28 條、公平交易法'},
  {id:'copy', q:'網路搜尋到一張很美的照片，可以直接拿來發文嗎？',
    opts:['不行，要用自己拍的、取得授權，或照授權條件使用的圖', '可以，只要註明出處', '可以，只要不是拿來賣東西'], a:0,
    exp:'網路上的照片大多受著作權保護；「註明出處」不等於取得授權。自己拍、買授權圖庫、或用 AI 做原創圖比較安全（AI 工具也要看各家使用條款）。', src:'著作權法'},
  {id:'ad', q:'收了廠商的錢或免費商品寫推薦文，應該怎麼做？',
    opts:['在貼文清楚揭露合作關係', '不用說，看起來比較自然', '有人私訊問再說就好'], a:0,
    exp:'推薦者與廠商之間有利益關係（收錢、收商品）時，應該讓消費者知道，否則可能構成不實廣告；平台也多半有「品牌合作」標籤可以用。', src:'公平交易法、公平會對薦證廣告的規範'}
];

var API = {hash:hash, rng:rng, newCode:newCode, cleanCode:cleanCode, clamp:clamp, money:money, pct:pct,
  TOOLS:TOOLS, toolUrl:toolUrl, DISC:DISC, BRANDS:BRANDS, PLATFORMS:PLATFORMS, TONES:TONES, AUDS:AUDS, PILLARS:PILLARS,
  POSTS:POSTS, PROMO:PROMO, ADS:ADS, MATS:MATS, FORMATS:FORMATS, REPLY:REPLY, CPM:CPM, START_MONTH:START_MONTH, MONTHS:MONTHS,
  EVENTS:EVENTS, EV:EV, QUIZ:QUIZ, GRADE_TXT:GRADE_TXT,
  newGame:newGame, startGame:startGame, calMonth:calMonth, defaultDec:defaultDec, pillarFit:pillarFit, audFit:audFit, toneFit:toneFit,
  staminaCost:staminaCost, quality:quality, compute:compute, forecast:forecast, simulate:simulate, rescue:rescue,
  pickEvent:pickEvent, chooseEvent:chooseEvent, evText:evText, evTool:evTool, finalScore:finalScore, has:has};
if(typeof module === 'object' && module.exports) module.exports = API; else root.SOC = API;
})(this);
