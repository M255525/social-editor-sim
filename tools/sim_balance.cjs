const S = require('../data.js');
const BEST = {cafe:{tone:'artsy', aud:'office', pillars:['teach','daily','ask']}, craft:{tone:'artsy', aud:'office', pillars:['daily','ugc','ask']},
  farm:{tone:'fun', aud:'parent', pillars:['daily','ugc','teach']}, gym:{tone:'pro', aud:'office', pillars:['teach','ugc','ask']}};
function play(brand, plat, strat, code){
  const G = S.newGame({code}); Object.assign(G.c, {brand, plat}, JSON.parse(JSON.stringify(BEST[brand])));
  G.quiz = {food:true, copy:true, ad:true}; S.startGame(G);
  while(G.stage !== 'end'){
    if(G.stage === 'crisis'){ S.rescue(G, true); continue; }
    S.chooseEvent(G, 0);
    let d = S.defaultDec(G);
    if(strat === 'smart'){ d = {posts:G.stamina > 70 ? 12 : 8, promo:.2, ads:3000, mat:'ai', fmt:plat==='ig'||G.p.algoVideo?'mix':'img', reply:'daily'}; if(S.staminaCost(G,d) > G.stamina){ d.posts = 8; if(S.staminaCost(G,d) > G.stamina) d.posts = 4; } }
    if(strat === 'lazy') d = {posts:16, promo:.6, ads:0, mat:'phone', fmt:'img', reply:'none'};
    if(strat === 'spend') d = {posts:8, promo:.4, ads:30000, mat:'pro', fmt:'mix', reply:'some'};
    S.simulate(G, d);
  }
  return S.finalScore(G);
}
for(const b of Object.keys(S.BRANDS)) for(const p of Object.keys(S.PLATFORMS)) for(const st of ['smart','lazy','spend']){
  let sp=0, g={}, fa=0, ra=0, pr=0, n=15;
  for(let i=0;i<n;i++){ const f=play(b,p,st,'B'+i); g[f.grade]=(g[f.grade]||0)+1; fa+=f.fA; ra+=f.rA; pr+=f.profit; sp+=f.spent; }
  console.log(b.padEnd(6), p.padEnd(8), st.padEnd(6), 'fans', (fa/n*100).toFixed(0).padStart(4)+'%', 'rev', (ra/n*100).toFixed(0).padStart(4)+'%', 'profit', Math.round(pr/n/1000).toString().padStart(5)+'k', 'spent', Math.round(sp/n/1000)+'k', JSON.stringify(g));
}
