/* 小編經營記：畫面 */
(function(){
'use strict';
var D = window.SOC, $ = function(id){ return document.getElementById(id); };
var PFX = 'ses.';
function lsGet(k){ try{ return localStorage.getItem(PFX + k); }catch(e){ return null; } }
function lsSet(k, v){ try{ localStorage.setItem(PFX + k, v); }catch(e){} }
function lsDel(k){ try{ localStorage.removeItem(PFX + k); }catch(e){} }
function lsJson(k, d){ try{ var v = JSON.parse(lsGet(k)); return v == null ? d : v; }catch(e){ return d; } }
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]; }); }
var money = D.money, pct = D.pct;
function yuan(n){ return money(n) + ' 元'; }
function signed(n){ return (n > 0 ? '+' : '') + money(n); }
function kfmt(n){ n = Math.round(n); return n >= 10000 ? (Math.round(n / 1000) / 10) + ' 萬' : money(n); }
function fitStars(v){ var n = v >= 1.15 ? 3 : v >= 1 ? 2 : v >= .85 ? 1 : 0; return '<span class="fit" title="合適度">' + '★★★'.slice(0, n) + '<span style="color:#D8D2EA">' + '★★★'.slice(0, 3 - n) + '</span></span>'; }
var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
var PLAT_COLOR = {fb:'#1877F2', ig:'#E1306C', threads:'#1E1638', line:'#06C755'};

var G = loadGame();
var V = {home:!G, report:false, newName:'', newCode:D.newCode()};
var STAMPS = lsJson('stamps', {});
function loadGame(){ var g = lsJson('game', null); return g && g.v === 1 && g.c ? g : null; }
function save(){ if(G) lsSet('game', JSON.stringify(G)); else lsDel('game'); }
var STEP_NAMES = ['品牌', '平台', '語氣', '受眾', '內容支柱', '法規小考'];

/* 貼文標題（虛構） */
var POSTS_TXT = {
  cafe:{teach:'手沖新手最常犯的 3 個錯', daily:'凌晨五點的烘豆日常', promo:'本週限定：第二杯半價', ugc:'熟客拍的拉花太美了', trend:'當最近的迷因遇上咖啡', ask:'你是酸派還是苦派？'},
  craft:{teach:'銀飾變黑？三分鐘救回來', daily:'一只戒指的誕生', promo:'情人對戒限量預購', ugc:'客人的求婚成功照！', trend:'用飾品玩最近的梗', ask:'你最想要哪個新款？'},
  farm:{teach:'怎麼挑到最甜的橘子', daily:'阿嬤今天又在果園唱歌', promo:'產季第一批，預購開跑', ugc:'台北客人的開箱好評', trend:'橘子版的熱門挑戰', ask:'你喜歡酸甜還是純甜？'},
  gym:{teach:'深蹲膝蓋痛？檢查這 3 點', daily:'教練的早餐吃什麼', promo:'新年體驗課 1 堂 199', ugc:'學員三個月的改變', trend:'健身版的熱門梗', ask:'你最想練哪個部位？'}
};
var POST_BG = {teach:'#E8F0FF', daily:'#FFF4E0', promo:'#FFE3EE', ugc:'#E3F8F0', trend:'#F1E6FF', ask:'#FFF9D6'};

/* ---------- 共用 ---------- */
function topBar(){
  return '<div class="top noprint"><h1><span class="logo">✦</span>小編經營記 <small>社群經營模擬</small></h1>' +
    (G && !V.home ? '<button class="ibtn" data-act="home">🏠 首頁</button>' : '') +
    '<button class="ibtn" data-act="passport">🛂 工具護照 <span class="badge">' + Object.keys(STAMPS).length + '</span></button>' +
    '<a class="ibtn" href="manual.html">📖 操作手冊</a><button class="ibtn" data-act="settings" aria-label="常用設定">⚙</button></div>' +
    '<p class="warn-line noprint">觸及率、轉換率、廣告費、粉絲成長都是遊戲設定，用來練習經營判斷，不是真實平台數據。<button data-act="warn">⚠ 使用警語</button></p>';
}
function toolCard(id){
  var t = D.TOOLS[id]; if(!t) return '';
  return '<a class="tcard" data-tool="' + id + '" href="' + D.toolUrl(id) + '" target="_blank" rel="noopener">' + (STAMPS[id] ? '<span class="st">✔ 已蓋章</span>' : '') +
    '<span class="ti">' + t.ic + '</span><span><b>' + (t.lic ? '<span class="lic" title="需序號"></span>' : '') + esc(t.n) + '</b><small>' + esc(t.d) + '</small></span></a>';
}
function toolsBox(ids, title){ return '<div class="tools"><h3>🔧 ' + (title || '這一關對應的真實工具（點開會在工具護照蓋章）') + '</h3><div class="tgrid">' + ids.map(toolCard).join('') + '</div></div>'; }
function footer(){
  return '<footer class="foot noprint">👤 創作者 Mark Tsai（蔡豐全）<a href="mailto:tsaimark@gmail.com">tsaimark@gmail.com</a><br><a href="manual.html">📖 操作手冊</a><a href="#" data-act="warn">⚠ 使用警語</a>' +
    (standalone ? '' : '<a href="#" data-act="install">📲 加入主畫面</a>') + '<a href="' + D.toolUrl('creator-town') + '" target="_blank" rel="noopener" data-tool="creator-town">🏘 創作者小鎮</a>' +
    '<br><img src="https://visitor-badge.laobi.icu/badge?page_id=m255525.socialeditorsim" alt="訪客次數" height="20" loading="lazy" style="vertical-align:middle;margin-top:.4rem"></footer>';
}
function brandTitle(g){ return g.c.brand ? D.BRANDS[g.c.brand].n : '還沒選品牌'; }
function progressText(g){ return g.stage === 'prep' ? '籌備第 ' + (g.step + 1) + ' 關' : g.stage === 'end' ? '已結算' : '第 ' + (g.month + 1) + ' 個月'; }
function monthLabel(i){ return '第 ' + (i + 1) + ' 個月・' + (((D.START_MONTH - 1 + i) % 12) + 1) + ' 月'; }

/* ---------- 手機 ---------- */
function phoneHtml(g, notif){
  var b = g && g.c.brand ? D.BRANDS[g.c.brand] : D.BRANDS.cafe, plat = g && g.c.plat ? g.c.plat : 'ig', bk = g && g.c.brand ? g.c.brand : 'cafe';
  var fol = g && g.followers ? g.followers : b.f0, last = g && g.hist.length ? g.hist[g.hist.length - 1] : null;
  var pillars = g && g.c.pillars.length ? g.c.pillars : ['daily', 'teach', 'ask'];
  var h = '<div class="phone" style="--plat:' + PLAT_COLOR[plat] + '"><div class="screen"><div class="notch"><span>9:41</span><i></i><span>' + (g && g.c.plat ? D.PLATFORMS[plat].ic : '📶') + ' 87%</span></div>';
  if(notif) h += '<div class="notif">' + notif + '</div>';
  h += '<div class="pf"><div class="pfrow"><div class="ava">' + b.ic + '</div><div class="pfstats"><div><b>' + kfmt(fol) + '</b><span>粉絲</span></div>' +
    '<div><b>' + (last ? kfmt(last.reach) : '—') + '</b><span>上月觸及</span></div><div><b>' + (g ? Math.round(g.trust * 100) : 50) + '</b><span>信任度</span></div></div></div>' +
    '<div class="pfname">' + esc(b.n) + '<small>' + esc(b.biz) + (g && g.c.plat ? '・' + D.PLATFORMS[plat].n : '') + '</small></div>';
  if(g && g.c.brand && g.stage !== 'prep'){
    var fA = g.followers / b.kf, rA = g.cum.rev / b.kr, sp = (g.cum.spent || 0) / b.budget;
    h += '<div class="kpi"><div class="kbar">🎯 粉絲 ' + money(g.followers) + ' / ' + money(b.kf) + '<div class="tr"><i style="width:' + Math.min(100, fA * 100) + '%"></i></div></div>' +
      '<div class="kbar">💰 導購營收 ' + kfmt(g.cum.rev) + ' / ' + kfmt(b.kr) + '<div class="tr"><i style="width:' + Math.min(100, rA * 100) + '%"></i></div></div>' +
      '<div class="kbar">🧾 已花預算 ' + kfmt(g.cum.spent || 0) + ' / ' + kfmt(b.budget) + '<div class="tr"><i class="' + (sp > 1 ? 'over' : '') + '" style="width:' + Math.min(100, sp * 100) + '%"></i></div></div></div>';
  }
  h += '</div><div class="feed">';
  pillars.slice(0, 3).forEach(function(k, i){
    var likes = last ? Math.max(1, Math.round(last.eng / 6 * (1 - i * .25))) : 12 - i * 3, com = Math.max(0, Math.round(likes / 9));
    h += '<div class="post"><div class="img" style="background:' + POST_BG[k] + '"><em>' + D.PILLARS[k].ic + ' ' + D.PILLARS[k].n + '</em>' + b.ic + '</div><div class="cap">' + esc(POSTS_TXT[bk][k]) + '</div>' +
      '<div class="acts"><span class="h">♥ ' + money(likes) + '</span><span>💬 ' + com + '</span><span>↗ ' + Math.round(com / 2) + '</span></div></div>';
  });
  h += '</div>';
  if(g && g.stage !== 'prep'){
    var st = g.stamina, col = st > 60 ? 'var(--mint)' : st > 30 ? 'var(--amber)' : 'var(--red)';
    h += '<div class="stam">☕ 小編體力 ' + st + ' / 100' + (st <= 30 ? '　快爆肝了！' : '') + '<div class="tr"><i style="width:' + st + '%;background:' + col + '"></i></div></div>';
  }
  return h + '</div></div>';
}

/* ---------- 首頁 ---------- */
function homeView(){
  var board = lsJson('board', []);
  var h = topBar() + '<section class="card"><div class="hero"><div><h2 class="ttl">粉專交給你了，<br><span>12 個月</span>後見真章。</h2>' +
    '<p class="lead">你是新上任的小編。老闆給你兩個 KPI：<b>粉絲數</b>和<b>社群帶來的營收</b>，外加一筆年度行銷預算。選平台、定語氣、排內容、控預算，還要撐住小編體力。演算法改版、留言區炎上、網紅業配、抽獎衝粉……每一關都連到一個真實的內容創作工具。</p>' +
    '<div class="chipline"><b>籌備 6 關</b><b>經營 12 個月</b><b>每月突發事件</b><b>KPI 結算評等</b><b>🛂 工具護照</b></div>' +
    (G ? '<div class="alert warn">你有一局還沒玩完：<b>' + esc(brandTitle(G)) + '</b>（' + progressText(G) + '）<div class="go" style="margin-top:.5rem"><button class="btn" data-act="resume">▶ 繼續上一局</button><button class="btn alt" data-act="wipeAll">🧹 清除全部資料</button></div></div>' : '') +
    '<div class="row2"><label class="fld">你的小編暱稱（可以空著）<input id="newName" maxlength="16" value="' + esc(V.newName) + '" placeholder="例如：咖啡小編阿凱"></label>' +
    '<label class="fld">關卡代碼<input id="newCode" maxlength="8" value="' + esc(V.newCode) + '" style="text-transform:uppercase;letter-spacing:.15em"></label></div>' +
    '<p class="small">👩‍🏫 上課用：全班輸入<b>同一個關卡代碼</b>，事件與觸及起伏都一樣，比較 KPI 才公平。</p>' +
    '<div class="go"><button class="btn pink big" data-act="start">🚀 開始上任</button>' + (G ? '<span class="small">開新局會蓋掉上一局的進度</span>' : '') + '</div></div>' +
    '<div>' + phoneHtml(null, '🔔 老闆：粉專就交給你囉！') + '</div></div></section>';
  if(board.length) h += '<section class="card"><h2>🏆 這台裝置的排行榜</h2><div class="tblwrap"><table class="board"><tr><th>#</th><th>品牌・平台</th><th>評等</th><th>分數</th><th>粉絲</th><th>導購營收</th><th>代碼</th></tr>' +
    board.slice(0, 10).map(function(x, i){ return '<tr><td>' + (i + 1) + '</td><td>' + esc(x.who) + '</td><td><b>' + x.grade + '</b></td><td class="n">' + x.score + '</td><td class="n">' + money(x.fans) + '</td><td class="n">' + money(x.rev) + '</td><td>' + esc(x.code) + '</td></tr>'; }).join('') + '</table></div></section>';
  h += '<section class="card"><h2>🗺 這個遊戲串起來的工具</h2><p class="lead">遇到哪一關，就會提示對應的工具；點開過的會在「🛂 工具護照」蓋章。全部都在創作者小鎮上。</p>' + toolsBox(['creator-town', 'coffee-ig-planner', 'SocialPost', 'social-post-grader'], '從這幾個開始') + '</section>';
  return h + footer();
}

/* ---------- 籌備 ---------- */
function stepsBar(){ return '<div class="steps">' + STEP_NAMES.map(function(n, i){ return '<span class="' + (i < G.step ? 'ok' : i === G.step ? 'on' : '') + '">' + (i < G.step ? '✔ ' : (i + 1) + '. ') + n + '</span>'; }).join('') + '</div>'; }
function shuffled(salt, n){ var r = D.rng(D.hash(G.code + ':' + salt)), a = []; for(var i = 0; i < n; i++) a.push(i); for(var j = n - 1; j > 0; j--){ var k = Math.floor(r() * (j + 1)), t = a[j]; a[j] = a[k]; a[k] = t; } return a; }
function prepView(){
  var c = G.c, ok = false, tools = [], h = topBar() + stepsBar() + '<div class="stage"><div>' + phoneHtml(G) + '</div><section class="card" style="margin-top:0">';
  if(G.step === 0){
    h += '<h2>第 1 關：你要幫哪個品牌經營社群？</h2><p class="lead">四個品牌都是虛構的。老闆給的 KPI 和預算不一樣。</p><div class="pick">' +
      Object.keys(D.BRANDS).map(function(k){ var b = D.BRANDS[k]; return '<button class="opt" data-brand="' + k + '" aria-pressed="' + (c.brand === k) + '"><span class="oi">' + b.ic + '</span><span><b>' + b.n + '</b><small>' + b.biz + '。' + b.desc + '</small><span class="nums"><span>起始粉絲 ' + money(b.f0) + '</span><span>KPI 粉絲 ' + money(b.kf) + '</span><span>KPI 營收 ' + kfmt(b.kr) + '</span><span>年度預算 ' + kfmt(b.budget) + '</span><span>客單價 ' + money(b.aov) + '</span></span></span></button>'; }).join('') + '</div>';
    ok = !!c.brand; tools = ['business-model-canvas-generator', 'where-what-how-strategy-studio'];
  } else if(G.step === 1){
    h += '<h2>第 2 關：主力經營哪個平台？</h2><p class="lead">一年只專心經營一個主平台。每個平台的觸及、擴散、導購能力都不一樣（遊戲設定）。</p><div class="pick">' +
      Object.keys(D.PLATFORMS).map(function(k){ var p = D.PLATFORMS[k]; return '<button class="opt" data-plat="' + k + '" aria-pressed="' + (c.plat === k) + '"><span class="oi">' + p.ic + '</span><span><b>' + p.n + '</b><small>' + p.desc + '</small><span class="nums"><span>觸及 ' + lvl(p.reach, [.1, .18]) + '</span><span>擴散 ' + lvl(p.viral, [.5, 1.2]) + '</span><span>導購 ' + lvl(p.intent, [.7, 1.2]) + '</span><span>短影音 ' + lvl(p.video, [.9, 1.2]) + '</span></span></span></button>'; }).join('') + '</div>';
    ok = !!c.plat; tools = ['coffee-ig-planner', 'creator-town'];
  } else if(G.step === 2){
    h += '<h2>第 3 關：品牌說話的語氣</h2><p class="lead">★ 是這個語氣跟你的品牌＋平台合不合。</p><div class="pick">' +
      Object.keys(D.TONES).map(function(k){ var t = D.TONES[k]; return '<button class="opt" data-tone="' + k + '" aria-pressed="' + (c.tone === k) + '"><span class="oi">' + t.ic + '</span><span><b>' + t.n + ' ' + fitStars(t.fit[c.brand] * t.plat[c.plat]) + '</b><small>' + t.desc + '</small></span></button>'; }).join('') + '</div>';
    ok = !!c.tone; tools = ['skill-prompt-studio', 'ai-prompt-generator'];
  } else if(G.step === 3){
    h += '<h2>第 4 關：主要想打動誰？</h2><p class="lead">★ 是這群人喜不喜歡你的品牌、常不常用這個平台。</p><div class="pick">' +
      Object.keys(D.AUDS).map(function(k){ var a = D.AUDS[k], f = D.BRANDS[c.brand].aud[k] * D.PLATFORMS[c.plat].aud[k]; return '<button class="opt" data-aud="' + k + '" aria-pressed="' + (c.aud === k) + '"><span class="oi">' + a.ic + '</span><span><b>' + a.n + ' ' + fitStars(f) + '</b></span></button>'; }).join('') + '</div>';
    ok = !!c.aud; tools = ['where-what-how-strategy-studio', 'private-domain-rfm-studio'];
  } else if(G.step === 4){
    h += '<h2>第 5 關：選 3 個內容支柱</h2><p class="lead">內容支柱＝你平常固定會發的幾種主題。★ 是跟品牌合不合。已選 ' + c.pillars.length + ' / 3。</p><div class="pick">' +
      Object.keys(D.PILLARS).map(function(k){ var p = D.PILLARS[k], on = c.pillars.indexOf(k) >= 0; return '<button class="opt" data-pillar="' + k + '" aria-pressed="' + on + '"' + (!on && c.pillars.length >= 3 ? ' disabled' : '') + '><span class="oi">' + p.ic + '</span><span><b>' + p.n + ' ' + fitStars(D.BRANDS[c.brand].fit[k]) + '</b><small>' + p.desc + '</small><small style="color:var(--ink)">例：' + esc(POSTS_TXT[c.brand][k]) + '</small></span></button>'; }).join('') + '</div>';
    ok = c.pillars.length === 3; tools = ['coffee-ig-planner', 'annual-marketing-calendar'];
  } else {
    var qa = G.qa, all = true;
    h += '<h2>第 6 關：小編必考的三題</h2><p class="lead">答對的話，之後遇到相關事件會比較順利。</p>';
    D.QUIZ.forEach(function(q){
      var a = qa[q.id]; if(a == null) all = false;
      h += '<div class="qbox"><p class="q">' + esc(q.q) + '</p><div class="qopts">' + shuffled(q.id, q.opts.length).map(function(oi){
        var cls = a == null ? '' : oi === q.a ? ' class="right"' : oi === a ? ' class="wrong"' : '';
        return '<button data-q="' + q.id + '" data-a="' + oi + '"' + cls + (a != null ? ' disabled' : '') + '>' + esc(q.opts[oi]) + '</button>'; }).join('') + '</div>' +
        (a != null ? '<p class="exp ' + (a === q.a ? 'ok' : 'no') + '">' + (a === q.a ? '⭐ 答對了！' : '答錯了。') + esc(q.exp) + '<br><span class="small">依據：' + esc(q.src) + '（以主管機關最新規定為準）</span></p>' : '') + '</div>';
    });
    ok = all; tools = ['social-post-grader', 'ai-image-prompt-studio'];
  }
  h += toolsBox(tools) + '<div class="go">' + (G.step > 0 ? '<button class="btn alt" data-act="back">← 上一關</button>' : '') +
    (G.step < 5 ? '<button class="btn" data-act="next"' + (ok ? '' : ' disabled') + '>下一關 →</button>' : '<button class="btn pink big" data-act="begin"' + (ok ? '' : ' disabled') + '>🚀 正式上任</button>') + '</div></section></div>';
  return h + footer();
}
function lvl(v, t){ return v >= t[1] ? '高' : v >= t[0] ? '中' : '低'; }

/* ---------- 每月 ---------- */
function monthView(){
  var e = D.EV[G.ev.id], chosen = G.ev.ch != null, dec = G.dec;
  var h = topBar() + '<div class="stage"><div>' + phoneHtml(G, chosen ? null : e.ic + ' ' + esc(e.title)) + '</div><div>' +
    '<span class="mlabel">📅 ' + monthLabel(G.month) + '</span>' +
    '<section class="event" style="margin-top:.6rem"><h2><span class="ei">' + e.ic + '</span>' + esc(e.title) + '</h2><p>' + esc(D.evText(G, e)) + '</p>';
  if(!chosen) h += '<div class="chs">' + e.ch.map(function(c, i){ return '<button data-ev="' + i + '">' + esc(c.t) + '</button>'; }).join('') + '</div>';
  else h += '<div class="result">👉 你選了「' + esc(e.ch[G.ev.ch].t) + '」<br>' + esc(G.ev.note || '') + '</div>';
  var tid = D.evTool(G, e); if(tid) h += '<div class="tgrid" style="margin-top:.6rem">' + toolCard(tid) + '</div>';
  h += '</section>';
  if(!chosen) return h + '<p class="small" style="text-align:center;margin-top:1rem">先處理上面的事件，再排這個月的內容。</p></div></div>' + footer();
  var f = D.forecast(G, dec), b = D.BRANDS[G.c.brand], left = G.stamina - f.stCost;
  h += '<section class="card"><h2>🗓 排這個月的內容</h2>' +
    '<div class="dec"><b>✏ 發文數<small>越多越累；體力會在月底回復 45</small></b><div class="seg">' + D.POSTS.map(function(n){ return '<button data-posts="' + n + '" aria-pressed="' + (dec.posts === n) + '">' + n + ' 篇<small>每週 ' + n / 4 + ' 篇</small></button>'; }).join('') + '</div></div>' +
    '<div class="dec"><b>🏷 導購比例<small>有優惠或購買連結的貼文佔多少</small></b><div class="seg">' + D.PROMO.map(function(n){ return '<button data-promo="' + n + '" aria-pressed="' + (dec.promo === n) + '">' + pct(n) + '</button>'; }).join('') + '</div></div>' +
    '<div class="dec"><b>📣 廣告預算<small>年度預算 ' + kfmt(b.budget) + '，已花 ' + kfmt(G.cum.spent || 0) + '</small></b><div class="seg">' + D.ADS.map(function(n){ return '<button data-ads="' + n + '" aria-pressed="' + (dec.ads === n) + '">' + (n ? money(n) : '不投') + '</button>'; }).join('') + '</div></div>' +
    '<div class="dec"><b>🎨 素材怎麼做</b><div class="mats">' + Object.keys(D.MATS).map(function(k){ var m = D.MATS[k]; return '<button class="opt" data-mat="' + k + '" aria-pressed="' + (dec.mat === k) + '"><span class="oi">' + m.ic + '</span><span><b>' + m.n + '</b><small>' + (m.cost ? money(m.cost) + ' 元・' : '') + m.desc + '</small></span></button>'; }).join('') + '</div></div>' +
    '<div class="dec"><b>🎞 格式<small>短影音比較耗體力</small></b><div class="seg">' + Object.keys(D.FORMATS).map(function(k){ return '<button data-fmt="' + k + '" aria-pressed="' + (dec.fmt === k) + '">' + D.FORMATS[k].n + '</button>'; }).join('') + '</div></div>' +
    '<div class="dec"><b>💬 回留言</b><div class="seg">' + Object.keys(D.REPLY).map(function(k){ return '<button data-reply="' + k + '" aria-pressed="' + (dec.reply === k) + '">' + D.REPLY[k].n + '</button>'; }).join('') + '</div></div>' +
    '<div class="fc"><h3>📊 洞察預估</h3><div class="grid">' +
    '<div><span>預估觸及</span><b>' + kfmt(f.reach) + '</b></div><div><span>新粉絲／退追</span><b>+' + money(f.gain) + ' / −' + money(f.churn) + '</b></div>' +
    '<div><span>預估訂單</span><b>' + money(f.orders) + ' 筆</b></div><div><span>導購營收</span><b>' + kfmt(f.revenue) + '</b></div>' +
    '<div><span>本月花費</span><b>' + money(f.cost) + '</b></div><div><span>內容品質</span><b>' + Math.round(f.q * 100) + '</b></div>' +
    '<div><span>體力消耗</span><b class="' + (left < 0 ? 'neg' : '') + '">−' + f.stCost + '（剩 ' + left + '）</b></div><div><span>毛利−花費</span><b class="' + (f.profit < 0 ? 'neg' : 'pos') + '">' + signed(f.profit) + '</b></div></div>' +
    (left < 0 ? '<div class="warnline">⚠ 體力不夠，這樣排會爆肝，內容品質打六折！</div>' : left < 25 ? '<div class="warnline">⚠ 體力快見底，品質會下降。</div>' : '') +
    ((G.cum.spent || 0) + f.cost > b.budget ? '<div class="warnline">⚠ 這樣花下去會超出年度預算，結算會被降級。</div>' : '') +
    '<p class="small" style="color:#C9C0EE;margin:.4rem 0 0">實際觸及會有 ±15% 的起伏。</p><button class="btn pink big" data-act="run">📤 發布這個月的內容</button></div></section>';
  return h + '</div></div>' + footer();
}

/* ---------- 月報 ---------- */
function row(n, v, cls){ return '<tr' + (cls ? ' class="' + cls + '"' : '') + '><td>' + n + '</td><td class="n">' + v + '</td></tr>'; }
function reportView(){
  var r = G.hist[G.hist.length - 1], e = r.ev ? D.EV[r.ev.id] : null, net = r.followers - r.before;
  var h = topBar() + '<div class="stage"><div>' + phoneHtml(G, r.burnout ? '😵 小編爆肝了……' : '📈 ' + monthLabel(r.month) + '洞察報告出爐') + '</div><div><span class="mlabel">📊 ' + monthLabel(r.month) + '・洞察報告</span>' +
    '<section class="card"><p class="bigmsg" style="color:' + (net >= 0 ? 'var(--mint)' : 'var(--red)') + '">粉絲 ' + signed(net) + '</p><p style="text-align:center;margin:0">導購營收 <b>' + yuan(r.revenue) + '</b>（' + money(r.orders) + ' 筆）・互動率 ' + (r.er * 100).toFixed(1) + '%・信任度 ' + (r.dT >= 0 ? '↑' : '↓') + '</p>' +
    '<div class="report"><div><table class="pl">' +
    '<tr class="h"><td colspan="2">👀 觸及從哪來</td></tr>' + row('粉絲看到', money(r.organic)) + (r.disc ? row('探索／推薦頁', money(r.disc)) : '') + row('被分享擴散', money(r.viral)) + (r.adReach ? row('廣告曝光', money(r.adReach)) : '') + row('<b>總觸及</b>', '<b>' + money(r.reach) + '</b>') +
    '<tr class="h"><td colspan="2">👥 粉絲</td></tr>' + row('新粉絲', '+' + money(r.gain)) + row('退追', '−' + money(r.churn)) +
    '<tr class="h"><td colspan="2">💰 錢</td></tr>' + row('導購營收', money(r.revenue)) + row('毛利（' + pct(D.BRANDS[G.c.brand].margin) + '）', money(Math.round(r.revenue * D.BRANDS[G.c.brand].margin))) +
    (r.dec.ads ? row('廣告費', '−' + money(r.dec.ads)) : '') + (D.MATS[r.dec.mat].cost ? row('素材費', '−' + money(D.MATS[r.dec.mat].cost)) : '') + (r.msgFee ? row('LINE 訊息費', '−' + money(r.msgFee)) : '') +
    (G.hist.length && r.cost - r.dec.ads - D.MATS[r.dec.mat].cost - r.msgFee ? row('事件花費', signed(-(r.cost - r.dec.ads - D.MATS[r.dec.mat].cost - r.msgFee))) : '') +
    row('<b>毛利−花費</b>', '<b class="' + (r.profit < 0 ? 'neg' : 'pos') + '">' + signed(r.profit) + '</b>') + '</table></div>' +
    '<div><h3>🧑‍🏫 社群教練</h3>' + r.tips.map(function(tp){ var tt = D.TOOLS[tp.tool]; return '<div class="tip"><span>' + esc(tp.t) + '</span>' + (tt ? '<a class="tl" data-tool="' + tp.tool + '" href="' + D.toolUrl(tp.tool) + '" target="_blank" rel="noopener">' + tt.ic + ' ' + esc(tt.n) + ' ↗</a>' : '') + '</div>'; }).join('') +
    (e ? '<p class="small" style="margin-top:.6rem">本月事件：' + e.ic + ' ' + esc(e.title) + ' → ' + esc(e.ch[r.ev.ch].t) + '</p>' : '') +
    '<h3 style="margin-top:.8rem">📈 粉絲成長 vs KPI</h3><div class="chart">' + chartSvg() + '</div></div></div>' +
    '<div class="go" style="justify-content:center"><button class="btn pink big" data-act="nextMonth">' + (G.stage === 'end' ? '🏁 看年度結算' : G.stage === 'crisis' ? '😰 老闆找你……' : '➡ 進入' + monthLabel(G.month)) + '</button></div></section></div></div>';
  return h + footer();
}
function chartSvg(){
  var hs = G.hist, b = D.BRANDS[G.c.brand], W = 360, H = 170, pad = 26, top = 16, bot = H - 18, n = D.MONTHS, bw = (W - pad * 2) / n;
  var maxF = Math.max(b.kf * 1.15, Math.max.apply(null, hs.map(function(h){ return h.followers; }).concat([b.f0])));
  var maxR = Math.max(1, Math.max.apply(null, hs.map(function(h){ return h.revenue; })));
  var y = function(v){ return bot - v / maxF * (bot - top); }, yr = function(v){ return bot - v / maxR * (bot - top) * .45; };
  var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="每月粉絲數與 KPI 目標線、每月導購營收">';
  s += '<line x1="' + pad + '" x2="' + (W - pad) + '" y1="' + y(b.kf) + '" y2="' + y(b.kf) + '" stroke="#FF3D7F" stroke-dasharray="5 4"/><text x="' + (W - pad) + '" y="' + (y(b.kf) - 4) + '" font-size="9" text-anchor="end" fill="#FF3D7F">粉絲 KPI ' + money(b.kf) + '</text>';
  hs.forEach(function(h, i){ s += '<rect x="' + (pad + i * bw + 4) + '" y="' + yr(h.revenue).toFixed(1) + '" width="' + (bw - 8) + '" height="' + (bot - yr(h.revenue)).toFixed(1) + '" fill="#C9C0EE" rx="2"><title>' + h.cal + ' 月導購營收 ' + money(h.revenue) + ' 元</title></rect>'; });
  var pts = [(pad).toFixed(1) + ',' + y(b.f0).toFixed(1)].concat(hs.map(function(h, i){ return (pad + (i + 1) * bw).toFixed(1) + ',' + y(h.followers).toFixed(1); })).join(' ');
  s += '<polyline points="' + pts + '" fill="none" stroke="#3D5AFE" stroke-width="2.6"/>';
  hs.forEach(function(h, i){ s += '<circle cx="' + (pad + (i + 1) * bw).toFixed(1) + '" cy="' + y(h.followers).toFixed(1) + '" r="2.6" fill="' + (h.burnout ? '#E5383B' : '#3D5AFE') + '"><title>' + h.cal + ' 月粉絲 ' + money(h.followers) + (h.burnout ? '（爆肝）' : '') + '</title></circle>'; });
  for(var i = 0; i < n; i++) s += '<text x="' + (pad + (i + 1) * bw) + '" y="' + (H - 4) + '" font-size="8.5" text-anchor="middle" fill="#665E83">' + (((D.START_MONTH - 1 + i) % 12) + 1) + '月</text>';
  return s + '<text x="' + pad + '" y="10" font-size="9.5" fill="#665E83">— 粉絲數　▮ 每月導購營收（另一個刻度）　● 紅點＝爆肝</text></svg>';
}

/* ---------- 危機與結算 ---------- */
function crisisView(){
  return topBar() + '<div class="stage"><div>' + phoneHtml(G, '📞 老闆：「你進來一下。」') + '</div><section class="card" style="margin-top:0"><h2>😰 老闆找你約談</h2>' +
    '<p>粉絲對粉專的信任度掉到 <b style="color:var(--red)">' + Math.round(G.trust * 100) + '</b>，留言區越來越多酸言酸語，老闆很擔心品牌形象。</p>' +
    '<p>你可以留下來，提出改善計畫（會掉一成粉絲，但信任度拉回 32）；或是乾脆辭職。</p>' +
    '<div class="alert warn">這是唯一一次機會。之後信任度再掉到 15 以下，老闆就會請你走人。</div>' +
    toolsBox(['social-post-grader', 'IPA_Kano', 'mentors-panel'], '先想清楚哪裡出了問題') +
    '<div class="go"><button class="btn" data-act="stay">📝 提出改善計畫，留下來</button><button class="btn red" data-act="quit">🚪 辭職</button></div></section></div>' + footer();
}
function endView(){
  var f = D.finalScore(G), b = D.BRANDS[G.c.brand], pl = D.PLATFORMS[G.c.plat];
  if(!G.saved){ G.saved = true; addBoard(f); save(); if('SAB'.indexOf(f.grade) >= 0) setTimeout(hearts, 200); }
  var title = G.over === 'done' ? '一年任期結束！' : G.over === 'quit' ? '你辭職了' : '你被請走了';
  var h = topBar() + '<section class="card"><div class="grade"><div class="g ' + f.grade + '">' + f.grade + '</div><div style="flex:1 1 16rem"><h2>' + title + '</h2>' +
    '<p style="margin:.2rem 0">' + b.ic + ' ' + esc(b.n) + '｜' + pl.ic + ' ' + pl.n + '｜' + D.TONES[G.c.tone].n + '・' + D.AUDS[G.c.aud].n + (G.name ? '｜小編：' + esc(G.name) : '') + '</p><p class="small" style="margin:.1rem 0">內容支柱：' + G.c.pillars.map(function(k){ return D.PILLARS[k].ic + D.PILLARS[k].n; }).join('、') + '</p><p class="lead">' + D.GRADE_TXT[f.grade] + '</p>' +
    (f.over && f.raw !== f.grade ? '<div class="alert bad">原本可以拿 <b>' + f.raw + '</b>，但年度預算花了 ' + yuan(f.spent) + '（預算 ' + yuan(f.budget) + '），超支被降成 ' + f.grade + '。</div>' : '') + '</div></div>' +
    '<div class="kp"><div><span>總分</span><b>' + f.score + '</b></div><div><span>粉絲 KPI</span><b style="color:' + (f.fA >= 1 ? 'var(--mint)' : 'var(--red)') + '">' + pct(f.fA) + '</b><span>' + money(f.followers) + ' / ' + money(b.kf) + '</span></div>' +
    '<div><span>營收 KPI</span><b style="color:' + (f.rA >= 1 ? 'var(--mint)' : 'var(--red)') + '">' + pct(f.rA) + '</b><span>' + kfmt(f.rev) + ' / ' + kfmt(b.kr) + '</span></div>' +
    '<div><span>預算使用</span><b style="color:' + (f.over ? 'var(--red)' : 'var(--mint)') + '">' + pct(f.spent / f.budget) + '</b><span>' + kfmt(f.spent) + ' / ' + kfmt(f.budget) + '</span></div>' +
    '<div><span>全年觸及</span><b>' + kfmt(f.reach) + '</b></div><div><span>平均互動率</span><b>' + (f.avgEr * 100).toFixed(1) + '%</b></div>' +
    '<div><span>信任度</span><b>' + Math.round(f.trust * 100) + '</b></div><div><span>爆肝次數</span><b>' + f.burn + '</b></div><div><span>法規小考</span><b>⭐ ' + G.stars + ' / 3</b></div></div>' +
    '<p class="small">評等：S＝兩個 KPI 都達 120% 且信任度 60 以上；A＝兩個都達標；B＝都達 80%，或一個達標另一個 60%；C＝平均 50%；其餘或沒做滿 12 個月＝D。超出年度預算降一級，超過 2 倍、4 倍再各降一級。關卡代碼 <b>' + esc(G.code) + '</b>。</p>' +
    '<div class="chart" style="max-width:34rem">' + chartSvg() + '</div></section>';
  h += '<section class="card"><h2>📜 這一年發生的事</h2><ul class="logl">' + G.hist.map(function(r){ var e = r.ev ? D.EV[r.ev.id] : null; return '<li><span class="m">' + r.cal + ' 月</span><span>' + (e ? e.ic + ' ' + esc(e.title) + ' → ' + esc(e.ch[r.ev.ch].t) : '') + (r.burnout ? ' 😵' : '') + '</span><span class="p" style="color:' + (r.followers - r.before >= 0 ? 'var(--mint)' : 'var(--red)') + '">粉絲 ' + signed(r.followers - r.before) + '</span></li>'; }).join('') + '</ul></section>';
  h += '<section class="card"><h2>🚀 換真的來</h2><p class="lead">遊戲裡做的每個決定，真實世界都有工具可以幫你。下一步建議從這幾個開始：</p><div class="tgrid" style="margin-top:.5rem">' +
    ['coffee-ig-planner', 'annual-marketing-calendar', 'SocialPost', 'social-post-grader', G.c.plat === 'line' ? 'private-domain-rfm-studio' : 'ai-video-spec-generator', 'creator-town'].map(toolCard).join('') + '</div>' +
    '<div class="go noprint"><button class="btn pink" data-act="copyResult">📋 複製成績（交給老師）</button><button class="btn alt" data-act="print">🖨 列印／存成 PDF</button><button class="btn alt" data-act="passport">🛂 看工具護照</button><button class="btn" data-act="again">🔁 再玩一次</button><button class="btn alt" data-act="sameCode">🎯 同一個代碼換個玩法</button></div></section>';
  return h + footer();
}
function resultText(){ var f = D.finalScore(G), b = D.BRANDS[G.c.brand]; return '【小編經營記】代碼 ' + G.code + '｜' + b.n + '・' + D.PLATFORMS[G.c.plat].n + (G.name ? '｜小編 ' + G.name : '') + '｜評等 ' + f.grade + '｜總分 ' + f.score + '｜粉絲 ' + money(f.followers) + '（KPI ' + pct(f.fA) + '）｜導購營收 ' + money(f.rev) + '（KPI ' + pct(f.rA) + '）｜預算使用 ' + pct(f.spent / f.budget) + '｜工具護照 ' + Object.keys(STAMPS).length + ' 章'; }
function addBoard(f){ var bd = lsJson('board', []); bd.push({who:D.BRANDS[G.c.brand].n + '・' + D.PLATFORMS[G.c.plat].n, grade:f.grade, score:f.score, fans:f.followers, rev:f.rev, code:G.code}); bd.sort(function(a, c){ return c.score - a.score; }); lsSet('board', JSON.stringify(bd.slice(0, 20))); }
function hearts(){ var w = document.createElement('div'); w.className = 'hearts'; var cs = ['💖', '👍', '✨', '💬', '❤️']; for(var i = 0; i < 40; i++){ var p = document.createElement('i'); p.textContent = cs[i % cs.length]; p.style.left = Math.random() * 100 + '%'; p.style.animationDelay = Math.random() * 1 + 's'; w.appendChild(p); } document.body.appendChild(w); setTimeout(function(){ w.remove(); }, 4000); }

/* ---------- 護照、彈窗、設定 ---------- */
function passportHtml(){
  var ids = Object.keys(D.TOOLS), got = ids.filter(function(i){ return STAMPS[i]; }).length;
  return '<h2>🛂 工具護照 ' + got + ' / ' + ids.length + '</h2><p class="small">在遊戲裡點開過的真實工具會蓋章。紅點＝需要序號才能完整使用。大部分都在 <a href="' + D.toolUrl('creator-town') + '" target="_blank" rel="noopener" data-tool="creator-town">🏘 創作者小鎮</a> 上。</p><div class="pass">' +
    ids.map(function(i){ var t = D.TOOLS[i]; return '<a class="' + (STAMPS[i] ? 'got' : '') + '" data-tool="' + i + '" href="' + D.toolUrl(i) + '" target="_blank" rel="noopener"><span class="ti">' + t.ic + '</span><b>' + (t.lic ? '<span class="lic"></span>' : '') + esc(t.n) + '</b>' + (STAMPS[i] ? '<span class="small">' + esc(STAMPS[i]) + '</span>' : '') + '</a>'; }).join('') +
    '</div><div class="stack"><button class="btn" data-act="close">關閉</button></div>';
}
function stamp(id){ if(!D.TOOLS[id] || STAMPS[id]) return; var d = new Date(); STAMPS[id] = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate(); lsSet('stamps', JSON.stringify(STAMPS)); toast('🛂 工具護照蓋章：' + D.TOOLS[id].n); setTimeout(render, 50); }
function openModal(h){ $('modalBox').innerHTML = h; $('modal').classList.add('show'); $('modalBox').scrollTop = 0; }
function closeModal(){ $('modal').classList.remove('show'); }
var toastT;
function toast(m){ var o = document.querySelector('.toast'); if(o) o.remove(); var t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = m; document.body.appendChild(t); clearTimeout(toastT); toastT = setTimeout(function(){ t.remove(); }, 3000); }
var WARN_HTML = '<h2>⚠ 使用警語</h2><p><b>這是教學用的模擬遊戲，不是行銷、法律或廣告投放建議。</b></p><ul>' +
  '<li>觸及率、擴散、轉換率、廣告費、訊息費、粉絲成長和事件效果<b>都是遊戲設定</b>，為了練習判斷而簡化，和各平台真實的演算法與收費不同，也會隨平台政策改變。</li>' +
  '<li>平台特性（例如哪個平台適合短影音、哪個導購方便）是一般性的整理，實際請以各平台官方說明為準。</li>' +
  '<li>小考與事件提到的規範（食品廣告不得宣稱醫療效能、圖片著作權、推薦文要揭露合作關係、平台活動規範）是一般性的提醒，個案請以主管機關與平台最新規定為準。</li>' +
  '<li>四個品牌、網紅、留言與事件全部是虛構的。</li>' +
  '<li>遊戲進度、排行榜與工具護照<b>只存在這台裝置的瀏覽器</b>，不會上傳。</li>' +
  '<li>連到的工具是另外的網站，紅點的需要序號。</li></ul>';
function showWarn(){ openModal(WARN_HTML + '<div class="stack"><button class="btn" data-act="close">我知道了</button></div>'); }
function sec(id, title, val, body){ return '<details class="set-sec" data-sec="' + id + '"><summary><span class="sst">' + title + '</span><span class="ssv">' + esc(val) + '</span></summary><div class="set-body">' + body + '</div></details>'; }
function openSettings(){
  var board = lsJson('board', []);
  var h = '<div class="top"><h2 style="flex:1 1 0">⚙ 常用設定</h2><button class="ibtn" data-act="foldall">全部展開／收合</button></div>' +
    sec('view', '顯示', lsGet('fs') === 'xl' ? '大字' : '標準字', '<div class="stack"><button class="btn' + (lsGet('fs') === 'xl' ? ' alt' : '') + '" data-fontsize="m">標準字</button><button class="btn' + (lsGet('fs') === 'xl' ? '' : ' alt') + '" data-fontsize="xl">大字（投影用）</button></div>') +
    sec('game', '遊戲進度', G ? brandTitle(G) + '・' + progressText(G) : '沒有進行中的遊戲', '<p class="small">每一步都會自動存在這台裝置。</p><div class="stack">' + (G ? '<button class="btn alt" data-act="copyCode">複製關卡代碼 ' + esc(G.code) + '</button><button class="btn red" data-act="abandon">放棄這一局</button>' : '<button class="btn" data-act="home">回首頁開新局</button>') + '</div>') +
    sec('board', '排行榜', board.length + ' 筆', '<div class="stack"><button class="btn red" data-act="clearBoard">清除排行榜</button></div>') +
    sec('pass', '工具護照', Object.keys(STAMPS).length + ' 章', '<div class="stack"><button class="btn alt" data-act="passport">打開工具護照</button><button class="btn red" data-act="clearStamps">清除所有蓋章</button></div>') +
    sec('wipe', '🧹 清除全部資料', '', '<p class="small">一次清掉遊戲進度、排行榜和工具護照，回到首頁重新開始。字體設定會保留。</p><div class="stack"><button class="btn red" data-act="wipeAll">清除全部資料，重新開始</button></div>') +
    sec('about', '關於本工具', '', '<p>👤 創作者 Mark Tsai（蔡豐全）<br><a href="mailto:tsaimark@gmail.com">tsaimark@gmail.com</a></p><div class="stack"><a class="btn alt" href="manual.html">📖 操作手冊</a><a class="btn alt" href="manual.html#creator">👤 創作者資訊</a><button class="btn alt" data-act="warn">⚠ 使用警語</button>' +
      (standalone ? '' : '<button class="btn alt" data-act="install">📲 加入主畫面</button>') + '</div><p class="small" style="margin-top:.5rem">訪客數 <img src="https://visitor-badge.laobi.icu/badge?page_id=m255525.socialeditorsim" alt="訪客次數" height="20" loading="lazy" style="vertical-align:middle"></p>') +
    '<div class="stack"><button class="btn" data-act="close">關閉</button></div>';
  openModal(h);
  var open = lsJson('fold', []);
  document.querySelectorAll('.set-sec').forEach(function(d){ d.open = open.indexOf(d.dataset.sec) >= 0; d.addEventListener('toggle', saveFold); });
}
function saveFold(){ var o = []; document.querySelectorAll('.set-sec').forEach(function(d){ if(d.open) o.push(d.dataset.sec); }); lsSet('fold', JSON.stringify(o)); }
function applyView(){ document.documentElement.dataset.fs = lsGet('fs') === 'xl' ? 'xl' : 'm'; }
function confirmBox(msg, act){ openModal('<h2>確定嗎？</h2><p>' + msg + '</p><div class="stack"><button class="btn red" data-act="' + act + '">確定</button><button class="btn alt" data-act="close">取消</button></div>'); }
function copyText(s, ok){ var done = function(){ toast(ok || '已複製'); }; if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(s).then(done, function(){ fallbackCopy(s); done(); }); else { fallbackCopy(s); done(); } }
function fallbackCopy(s){ var t = document.createElement('textarea'); t.value = s; document.body.appendChild(t); t.select(); try{ document.execCommand('copy'); }catch(e){} t.remove(); }
function install(){
  if(window._dp){ window._dp.prompt(); window._dp = null; return; }
  openModal('<h2>📲 加入主畫面</h2><ul><li><b>iPhone／iPad（Safari）</b>：按下方「分享」→「加入主畫面」。</li><li><b>Android（Chrome）</b>：右上角「⋮」→「安裝應用程式」或「加到主畫面」。</li><li><b>電腦（Chrome／Edge）</b>：網址列右邊的安裝圖示。</li></ul><div class="stack"><button class="btn" data-act="close">知道了</button></div>');
}

/* ---------- 主繪製與事件 ---------- */
function render(){
  var h;
  if(!G || V.home) h = homeView();
  else if(G.stage === 'prep') h = prepView();
  else if(V.report) h = reportView();
  else if(G.stage === 'month') h = monthView();
  else if(G.stage === 'crisis') h = crisisView();
  else h = endView();
  $('app').innerHTML = h;
}
function go(fn){ fn(); save(); render(); window.scrollTo(0, 0); }
function upd(){ save(); render(); }
document.addEventListener('click', function(e){
  var el = e.target.closest('[data-tool]');
  if(el && el.tagName === 'A'){ stamp(el.dataset.tool); return; }
  el = e.target.closest('button,a[data-act]');
  if(!el) return;
  var ds = el.dataset;
  if(ds.fontsize){ lsSet('fs', ds.fontsize); applyView(); openSettings(); return; }
  if(G && G.stage === 'prep' && !V.home){
    var c = G.c;
    if(ds.brand){ if(c.brand !== ds.brand){ c.brand = ds.brand; c.pillars = []; } return upd(); }
    if(ds.plat){ c.plat = ds.plat; return upd(); }
    if(ds.tone){ c.tone = ds.tone; return upd(); }
    if(ds.aud){ c.aud = ds.aud; return upd(); }
    if(ds.pillar){ var i = c.pillars.indexOf(ds.pillar); if(i >= 0) c.pillars.splice(i, 1); else if(c.pillars.length < 3) c.pillars.push(ds.pillar); return upd(); }
    if(ds.q){ G.qa[ds.q] = +ds.a; return upd(); }
  }
  if(G && G.stage === 'month' && !V.report && !V.home){
    if(ds.ev != null){ go(function(){ D.chooseEvent(G, +ds.ev); }); return; }
    if(ds.posts){ G.dec.posts = +ds.posts; return upd(); }
    if(ds.promo != null){ G.dec.promo = +ds.promo; return upd(); }
    if(ds.ads != null){ G.dec.ads = +ds.ads; return upd(); }
    if(ds.mat){ G.dec.mat = ds.mat; return upd(); }
    if(ds.fmt){ G.dec.fmt = ds.fmt; return upd(); }
    if(ds.reply){ G.dec.reply = ds.reply; return upd(); }
  }
  var a = ds.act; if(!a) return;
  if(el.tagName === 'A' && el.getAttribute('href') === '#') e.preventDefault();
  if(A[a]) A[a](el);
});
document.addEventListener('input', function(e){ if(e.target.id === 'newName' || e.target.id === 'newCode') keepNew(); });
$('modal').addEventListener('click', function(e){ if(e.target.id === 'modal') closeModal(); });
document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeModal(); });
function keepNew(){ var n = $('newName'), c = $('newCode'); if(n) V.newName = n.value; if(c) V.newCode = c.value; }
function startNew(code){ keepNew(); G = D.newGame({code:D.cleanCode(code) || D.newCode(), name:V.newName.trim()}); V.home = false; V.report = false; save(); render(); window.scrollTo(0, 0); }
var A = {
  close:closeModal, warn:function(){ showWarn(); }, settings:openSettings, install:function(){ closeModal(); install(); },
  passport:function(){ openModal(passportHtml()); },
  home:function(){ closeModal(); V.home = true; V.newCode = D.newCode(); render(); window.scrollTo(0, 0); },
  resume:function(){ V.home = false; render(); window.scrollTo(0, 0); },
  start:function(){ startNew(V.newCode); },
  next:function(){ go(function(){ G.step = Math.min(5, G.step + 1); }); },
  back:function(){ go(function(){ G.step = Math.max(0, G.step - 1); }); },
  begin:function(){
    G.quiz = {}; G.stars = 0;
    D.QUIZ.forEach(function(q){ var ok = G.qa[q.id] === q.a; G.quiz[q.id] = ok; if(ok) G.stars++; });
    go(function(){ D.startGame(G); }); hearts();
  },
  run:function(){ go(function(){ D.simulate(G, G.dec); V.report = true; }); },
  nextMonth:function(){ go(function(){ V.report = false; }); },
  stay:function(){ go(function(){ D.rescue(G, true); }); },
  quit:function(){ go(function(){ D.rescue(G, false); }); },
  again:function(){ V.home = true; V.newCode = D.newCode(); render(); window.scrollTo(0, 0); },
  sameCode:function(){ V.newName = G.name; startNew(G.code); },
  copyResult:function(){ copyText(resultText(), '成績已複製，可以貼到 LINE 或表單'); },
  copyCode:function(){ copyText(G.code, '關卡代碼已複製'); },
  print:function(){ window.print(); },
  abandon:function(){ confirmBox('這一局的進度會刪掉（排行榜和工具護照不受影響）。', 'abandonYes'); },
  abandonYes:function(){ G = null; save(); closeModal(); V.home = true; render(); },
  clearBoard:function(){ confirmBox('排行榜會全部清空。', 'clearBoardYes'); },
  clearBoardYes:function(){ lsDel('board'); closeModal(); render(); toast('排行榜已清除'); },
  clearStamps:function(){ confirmBox('工具護照的蓋章會全部清空。', 'clearStampsYes'); },
  clearStampsYes:function(){ STAMPS = {}; lsDel('stamps'); closeModal(); render(); toast('蓋章已清除'); },
  wipeAll:function(){ confirmBox('遊戲進度、排行榜、工具護照的蓋章都會刪掉，無法復原（字體設定會保留）。', 'wipeAllYes'); },
  wipeAllYes:function(){
    var keep = {fs:1, fold:1, warnSeen:1, marquee:1};
    try{ Object.keys(localStorage).forEach(function(k){ if(k.indexOf(PFX) === 0 && !keep[k.slice(PFX.length)]) localStorage.removeItem(k); }); }catch(e){}
    G = null; STAMPS = {}; V.home = true; V.report = false; V.newName = ''; V.newCode = D.newCode();
    closeModal(); render(); window.scrollTo(0, 0); toast('資料已清除，可以開新的一局了');
  },
  foldall:function(){ var all = document.querySelectorAll('.set-sec'), any = [].some.call(all, function(d){ return !d.open; }); all.forEach(function(d){ d.open = any; }); }
};

/* ---------- 跑馬燈（工作區共用公告，不可關） ---------- */
function initMarquee(){
  var URL_ = "https://script.google.com/macros/s/AKfycbwKX0DNNbY8y4nf90BFTHtxgfqJcHHcZasRrgycl4QAe52_hkjMWSkYk4xOsqU-JPCROw/exec";
  var REFRESH = 20 * 60 * 1000, bar = $('marqueeBar'), track = $('marqueeTrack'), lastKey = null;
  function appendText(c, text){ var re = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, li = 0, m; while((m = re.exec(text))){ if(m.index > li) c.appendChild(document.createTextNode(text.slice(li, m.index))); var a = document.createElement('a'); a.href = m[2]; a.textContent = m[1]; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.style.color = 'inherit'; a.style.textDecoration = 'underline'; c.appendChild(a); li = re.lastIndex; } if(li < text.length) c.appendChild(document.createTextNode(text.slice(li))); }
  function renderM(items){
    if(!items || !items.length) return;
    var k = JSON.stringify(items); if(k === lastKey) return; lastKey = k; track.innerHTML = '';
    var fr = document.createDocumentFragment();
    function pass(){ items.forEach(function(it, i){ if(i > 0) fr.appendChild(document.createTextNode('　★　')); appendText(fr, String(it)); }); }
    pass(); fr.appendChild(document.createTextNode('　★　')); pass(); track.appendChild(fr);
    bar.classList.add('show'); document.body.classList.add('has-marquee');
    track.style.animationDuration = Math.max(track.scrollWidth / 2 / 60, 12) + 's';
  }
  function fetchM(){ fetch(URL_, {method:'POST', body:JSON.stringify({serial:''})}).then(function(r){ return r.json(); }).then(function(d){ if(d && Array.isArray(d.marquee) && d.marquee.length){ lsSet('marquee', JSON.stringify(d.marquee)); renderM(d.marquee); } }).catch(function(){}); }
  renderM(lsJson('marquee', [])); fetchM(); setInterval(fetchM, REFRESH);
}

window.addEventListener('beforeinstallprompt', function(e){ e.preventDefault(); window._dp = e; });
if('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('service-worker.js').catch(function(){});
(function(){ if(!window.SOC_WATERMARK) return; var w = document.createElement('div'); w.id = 'printWm'; w.setAttribute('aria-hidden', 'true'); w.innerHTML = '<img alt="" src="' + window.SOC_WATERMARK + '">'; document.body.appendChild(w); })();
applyView(); render(); initMarquee();
if(!lsGet('warnSeen')){ lsSet('warnSeen', '1'); showWarn(); }
window._ses = {get G(){ return G; }, set G(v){ G = v; }, V:V, render:render, A:A};
})();
