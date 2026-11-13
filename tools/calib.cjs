// 依「聰明玩法」在 4 個平台的平均結果建議 KPI
const S = require('../data.js');
const BEST = {cafe:{tone:'artsy', aud:'office', pillars:['teach','daily','ask']}, craft:{tone:'artsy', aud:'office', pillars:['daily','ugc','ask']},
  farm:{tone:'fun', aud:'parent', pillars:['daily','ugc','teach']}, gym:{tone:'pro', aud:'office', pillars:['teach','ugc','ask']}};
for(const b of Object.keys(S.BRANDS)){ let F=[], Rv=[];
  for(const p of Object.keys(S.PLATFORMS)) for(let i=0;i<10;i++){
    const G = S.newGame({code:'C'+i}); Object.assign(G.c, {brand:b, plat:p}, JSON.parse(JSON.stringify(BEST[b]))); G.quiz={food:1,copy:1,ad:1}; S.startGame(G);
    while(G.stage !== 'end'){ if(G.stage==='crisis'){S.rescue(G,true);continue;} S.chooseEvent(G,0);
      let d = {posts:G.stamina>70?12:8, promo:.2, ads:3000, mat:'ai', fmt:p==='ig'||G.p.algoVideo?'mix':'img', reply:'daily'};
      if(S.staminaCost(G,d)>G.stamina){d.posts=8; if(S.staminaCost(G,d)>G.stamina) d.posts=4;} S.simulate(G,d); }
    F.push(G.followers); Rv.push(G.cum.rev); }
  const avg=a=>a.reduce((s,x)=>s+x,0)/a.length;
  console.log(b, 'avg fans', Math.round(avg(F)), 'avg rev', Math.round(avg(Rv)), '→ kf', Math.round(avg(F)*.95/100)*100, 'kr', Math.round(avg(Rv)*.95/10000)*10000);
}
