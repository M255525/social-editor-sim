const S = require('../data.js');
const BEST = {cafe:{tone:'artsy', aud:'office', pillars:['teach','daily','ask']}, craft:{tone:'artsy', aud:'office', pillars:['daily','ugc','ask']},
  farm:{tone:'fun', aud:'parent', pillars:['daily','ugc','teach']}, gym:{tone:'pro', aud:'office', pillars:['teach','ugc','ask']}};
const strat = process.argv[2] || 'smart';
for(const b of Object.keys(S.BRANDS)) for(const p of Object.keys(S.PLATFORMS)){
  const G = S.newGame({code:'M1'}); Object.assign(G.c, {brand:b, plat:p}, JSON.parse(JSON.stringify(BEST[b]))); S.startGame(G);
  const sum = {}; let n = 0;
  while(G.stage === 'month'){ S.chooseEvent(G, 2 < S.EV[G.ev.id].ch.length ? 2 : S.EV[G.ev.id].ch.length - 1);
    const d = strat === 'smart' ? {posts:8, promo:.2, ads:3000, mat:'ai', fmt:'mix', reply:'daily'} : {posts:8, promo:.4, ads:30000, mat:'pro', fmt:'mix', reply:'some'};
    const r = S.simulate(G, d); n++; for(const k of ['q','organic','disc','viral','adReach','clicks','orders','revenue','gain','churn']) sum[k] = (sum[k]||0) + r[k]; }
  const o = {}; for(const k in sum) o[k] = k === 'q' ? +(sum[k]/n).toFixed(2) : Math.round(sum[k]/n);
  console.log(b, p, 'end fans', G.followers, JSON.stringify(o));
}
