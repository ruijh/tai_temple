import * as T from 'three';
import { box, orb, beam } from './geometry.js';

export function guardianLion(m, material, {cub=false,cubSide=1}={}) {
  const g=new T.Group();
  box(g,material,0,.10,0,.67,.20,.92);
  orb(g,material,0,.50,-.12,.276,.31,.305);
  orb(g,material,0,.67,.09,.255,.32,.241);
  for(const sign of [-1,1]){
    orb(g,material,sign*.210,.38,-.10,.134,.21,.202);
    orb(g,material,sign*.161,.382,.213,.096,.25,.114);
    orb(g,material,sign*.162,.214,.302,.133,.072,.151);
    for(const offset of [-.063,0,.063]){
      orb(g,m.footing,sign*.162+offset,.208,.411,.025,.021,.024);
    }
  }
  orb(g,material,0,.935,.141,.276,.265,.229);
  orb(g,material,0,1.028,.295,.191,.191,.155);
  for(const sign of [-1,1]){
    orb(g,material,sign*.173,1.15,.269,.075,.086,.078);
    orb(g,m.footing,sign*.105,1.058,.414,.041,.032,.018);
    beam(g,material,[sign*.065,1.102,.433],[sign*.165,1.092,.407],.027);
    orb(g,material,sign*.084,.989,.448,.103,.061,.085);
    orb(g,material,sign*.104,.94,.432,.082,.049,.071);
    for(let i=0;i<5;i++){
      const angle=(i*.59)+.36;
      orb(g,material,sign*Math.sin(angle)*.222,.951+Math.cos(angle)*.22,.267,.061,.066,.055);
    }
  }
  orb(g,m.footing,0,.975,.471,.116,.042,.036);
  orb(g,material,0,.943,.461,.118,.041,.067);
  orb(g,material,0,1.025,.481,.067,.040,.049);
  const tail=new T.CatmullRomCurve3([
    [.21,.30,-.15],[.28,.40,-.31],[.28,.56,-.40],[.14,.69,-.42],[.05,.68,-.37],
  ].map(v=>new T.Vector3(...v)));
  g.add(new T.Mesh(new T.TubeGeometry(tail,9,.047,7),material));
  orb(g,material,.053,.68,-.38,.073,.064,.055);
  if(cub){
    const small=guardianLion(m,material);
    small.scale.setScalar(.36);
    small.position.set(cubSide*.26,.12,.30);
    small.rotation.y=-cubSide*.35;
    g.add(small);
  }
  return g;
}
