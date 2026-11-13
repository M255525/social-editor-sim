// 引擎回歸測試：node tools/test_engine.mjs
import { createRequire } from 'module';
const S = createRequire(import.meta.url)('../data.js');
let fail = 0, games = 0, crises = 0, burn = 0, grades = {};
const ok = (c, m) => { if(!c){ fail++; if(fail < 15) console.log('FAIL', m); } };
const R = S.rng(777), pick = a => a[Math.floor(R() * a.length)];
for(let i = 0; i < 3000; i++){
  const G = S.newGame({code:'T' + i});
  const brand = pick(Object.keys(S.BRANDS));
  const ps = Object.keys(S.PILLARS).sort(() => R() - .5).slice(0, 3);
  Object.assign(G.c, {brand, plat:pick(Object.keys(S.PLATFORMS)), tone:pick(Object.keys(S.TONES)), aud:pick(Object.keys(S.AUDS)), pillars:ps});
  G.quiz = {food:R() < .5, copy:R() < .5, ad:R() < .5};
  S.startGame(G); games++;
  ok(G.ev.id === 'launch' && G.followers === S.BRANDS[brand].f0, 'start');
  let guard = 0;
  while(G.stage !== 'end' && guard++ < 40){
    if(G.stage === 'crisis'){ crises++; S.rescue(G, R() < .7); continue; }
    const e = S.EV[G.ev.id]; ok(!!e, 'event ' + G.ev.id);
    if(e.cond) ok(e.cond(G), 'cond ' + e.id);
    if(S.evTool(G, e)) ok(!!S.TOOLS[S.evTool(G, e)], 'tool ' + S.evTool(G, e));
    ok(S.evText(G, e).length > 5, 'text');
    S.chooseEvent(G, Math.floor(R() * e.ch.length));
    const d = {posts:pick(S.POSTS), promo:pick(S.PROMO), ads:pick(S.ADS), mat:pick(Object.keys(S.MATS)), fmt:pick(Object.keys(S.FORMATS)), reply:pick(Object.keys(S.REPLY))};
    const f = S.forecast(G, d);
    for(const k of ['reach','gain','churn','orders','revenue','cost','profit','q']) ok(Number.isFinite(f[k]), 'forecast finite ' + k);
    const r = S.simulate(G, d);
    if(r.burnout) burn++;
    for(const k of ['reach','gain','churn','orders','revenue','cost','profit','followers','trust','stamina']) ok(Number.isFinite(r[k]), 'finite ' + k);
    ok(r.followers >= 50 && r.trust >= 0 && r.trust <= 1 && r.stamina >= 0 && r.stamina <= 100, 'range');
    r.tips.forEach(t => ok(!!S.TOOLS[t.tool], 'tip tool ' + t.tool));
  }
  ok(G.stage === 'end' && G.hist.length <= 12, 'ended');
  const fs = S.finalScore(G);
  ok('SABCD'.includes(fs.grade) && Number.isFinite(fs.score), 'score');
  if(G.over !== 'done') ok(fs.grade === 'D', 'not done = D');
  else ok(G.hist.length === 12, 'done = 12');
  if(fs.over && G.over === 'done') ok('SABCD'.indexOf(fs.grade) > 'SABCD'.indexOf(fs.raw) || fs.raw === 'D', 'over budget downgrades');
  grades[fs.grade] = (grades[fs.grade] || 0) + 1;
}
const run = () => { const G = S.newGame({code:'SAME'}); Object.assign(G.c, {brand:'cafe', plat:'ig', tone:'artsy', aud:'office', pillars:['teach','daily','ask']}); S.startGame(G);
  while(G.stage === 'month'){ S.chooseEvent(G, 0); S.simulate(G, S.defaultDec(G)); } return JSON.stringify(G.hist.map(h => [h.ev && h.ev.id, h.followers])); };
ok(run() === run(), 'deterministic');
S.QUIZ.forEach(q => ok(q.a === 0 && q.opts.length === 3, 'quiz ' + q.id));
Object.keys(S.BRANDS).forEach(b => Object.keys(S.PILLARS).forEach(p => ok(S.BRANDS[b].fit[p] > 0, 'fit ' + b + p)));
console.log('games', games, 'crises', crises, 'burnouts', burn, 'grades', JSON.stringify(grades), fail ? 'FAILED ' + fail : 'ALL PASS');
process.exit(fail ? 1 : 0);
