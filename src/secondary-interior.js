import * as T from 'three';
import { box, column, round, orb, beam, roof, row, batch } from './geometry.js';

function lattice(g,m,x,z,w,h) {
  const lower=h*.38;
  box(g,m.wood,x,lower/2,z,w,lower,.15);
  box(g,m.red,x,lower*.54,z+.084,w*.78,lower*.68,.026);
  box(g,m.red,x,lower*.54,z-.084,w*.78,lower*.68,.026);
  for(const sx of [-1,1]){
    box(g,m.wood,x+sx*w*.49,h/2,z,.115,h,.18);
    box(g,m.wood,x+sx*w*.32,h*.69,z,.064,h*.30,.11);
  }
  for(const y of [lower,h*.55,h*.83,h]){
    box(g,m.wood,x,y,z,w,.085,.18);
  }
  for(const dx of [-.17,0,.17]) for(const y of [h*.46,h*.91]){
    box(g,m.wood,x+dx*w,y,z,.064,h*.16,.11);
  }
}

function architecture(g,m,bounds,ceiling,style,xs,zs,h) {
  const {width:w,depth:d}=bounds;
  const wallX=w/2-.15,wallZ=d/2-.13;
  box(g,m.stone,0,-.15,0,w+.35,.30,d+.33);
  for(const x of row(15,w)) box(g,m.footing,x,.007,0,.021,.021,d);
  for(const z of row(9,d)) box(g,m.footing,0,.007,z,w,.021,.021);
  box(g,m.darkWood,0,ceiling+.08,0,w,.20,d);
  for(const x of [-wallX,wallX]){
    box(g,m.cream,x,h/2,0,.19,h,d);
    box(g,m.wallPanel,x,h*.16,0,.23,h*.32,d);
    box(g,m.darkWood,x,h*.33,0,.27,.09,d);
  }
  box(g,m.cream,0,h/2,-wallZ,w,h,.20);
  box(g,m.wood,0,.16,-wallZ+.10,w,.32,.14);

  const wallHeight=h-.34;
  for(const x of xs.slice(0,-1).map((x,i)=>(x+xs[i+1])/2)){
    const span=xs[1]-xs[0];
    if(Math.abs(x)>.05) for(const side of [-1,1]){
      lattice(g,m,x+side*span*.221,wallZ,span*.45,wallHeight);
    }
    if(['yuanjun','shuming','sleep'].includes(style) && Math.abs(x)>.05) for(const side of [-1,1]){
      lattice(g,m,x+side*span*.221,-wallZ+.9,span*.45,wallHeight*.95);
    }
  }
  box(g,m.wood,0,wallHeight+.03,wallZ,w,.28,.25);
  for(const x of xs) for(const z of zs){
    const radius=style==='dong'||style==='wing'?.17:.23;
    round(g,m.cut,x,.09,z,radius*1.52,.18);
    column(g,m.red,x,h/2+.1,z,radius,h-.02);
    box(g,m.wood,x,h+.12,z,radius*2.65,.21,.46);
    if(style!=='dong') box(g,m.teal,x,h+.28,z,.76,.19,.52);
  }

  for(const z of zs){
    box(g,style==='dong'?m.darkWood:m.painted,0,h+.30,z,w,.27,.38);
    box(g,m.wood,0,h+.56,z,w,.22,.35);
  }
  for(const x of xs) box(g,m.wood,x,ceiling-.25,0,.25,.35,d);
  for(const z of row(12,d)) {
    const opening=style==='shuming' && Math.abs(z+.60)<1.62;
    if(opening) {
      const width=w/2-1.76;
      for(const side of [-1,1]) box(g,m.teal,side*(1.76+width/2),ceiling-.08,z,width,.14,.105);
    } else box(g,style==='dong'?m.cream:m.teal,0,ceiling-.08,z,w,.14,.105);
  }
}

function backdrop(g,m,z) {
  for(let i=-2;i<=2;i++){
    const x=i*.79;
    box(g,m.dark,x,1.83,z,.75,2.66,.12);
    box(g,m.wood,x,1.83,z,.774,2.73,.079);
    for(let k=0;k<3;k++){
      const dx=.045*((i+2)*k-3),y=1.23+.36*k;
      beam(g,m.bronze,[x-.29,y,z+.075],[x+dx,y+.24+(i+2)*.068,z+.075],.021);
      beam(g,m.bronze,[x+dx,y+.24+(i+2)*.068,z+.075],[x+.31,y+.03,z+.075],.021);
    }
  }
}

function dongDisplay(g,m,z) {
  const rug=new T.MeshStandardMaterial({color:'#903c38',roughness:1});
  box(g,rug,0,.015,z+1,4.9,.026,3.1);
  for(const x of [-2.34,2.34]) box(g,m.amber,x,.033,z+1,.038,.012,2.92);
  for(const dz of [-.45,2.45]) box(g,m.amber,0,.033,z+dz,4.65,.012,.04);
  box(g,m.cut,0,.20,z,5.24,.40,1.82);
  box(g,m.lightStone,0,.085,z+1.13,3.27,.17,.48);
  backdrop(g,m,z-.67);
  for(const x of [-1.13,1.13]) column(g,m.darkWood,x,.62,z+.12,.10,.46);
  box(g,m.darkWood,0,.90,z,2.9,.23,1.12);
  box(g,m.wood,0,.98,z+.52,2.9,.07,.06);
  box(g,m.darkWood,0,1.32,z-.47,2.82,.65,.17);
  box(g,m.gilt,0,1.06,z+.05,2.62,.12,.90);
  for(const x of [-1.13,1.13]) box(g,m.amber,x,1.21,z+.05,.42,.23,.7);
  for(const side of [-1,1]) for(let i=0;i<9;i++){
    const x=side*(1.78+i*.079),bottomX=x+side*.21;
    beam(g,i%2?m.gilt:m.amber,[bottomX,.44,z+.30],[x+side*.17,3.1,z-.06],.048);
  }
  for(let i=-25;i<=25;i++) round(g,i%2?m.gilt:m.amber,i*.092,3.10,z+.30,.055,.35);
}

function altar(g,m,z,yuanjun) {
  const width=yuanjun?3.35:3.92;
  box(g,m.darkWood,0,.19,z,width+.68,.38,1.88);
  box(g,m.red,0,.56,z,width,.35,1.47);
  box(g,m.gilt,0,.79,z,width,.105,1.46);
  box(g,m.wood,0,2.18,z-.60,width,2.74,.27);
  for(const side of [-1,1]){
    const x=side*width*.45;
    column(g,m.red,x,2.08,z+.52,.16,2.55);
    box(g,m.painted,x,3.48,z,.54,.28,1.52);
    box(g,m.amber,x,2.25,z-.421,.04,1.92,.04);
  }
  box(g,m.gilt,0,3.31,z+.74,width,.13,.11);
  if(yuanjun){
    roof(g,m,{w:width+.38,d:1.96,base:3.55,rise:.56,style:'gable',gold:true});
  } else {
    box(g,m.painted,0,3.54,z,width+.38,.31,1.92);
    box(g,m.darkWood,0,3.76,z,width+.54,.16,1.99);
  }
  const mantle=yuanjun?m.gilt:m.teal;
  round(g,m.amber,0,.95,z,.60,.25);
  orb(g,m.red,0,1.41,z,.68,.34,.37);
  column(g,mantle,0,1.9,z,.51,.92);
  orb(g,m.cream,0,2.58,z,.24,.28,.22);
  round(g,mantle,0,2.89,z,.25,.15);
  if(yuanjun) orb(g,m.gilt,0,3,z,.20,.12,.17);
  const tableZ=z+1.39;
  box(g,m.red,0,.95,tableZ,2.88,.18,.72);
  box(g,m.wood,0,.79,tableZ,2.7,.21,.59);
  for(const x of [-1.19,1.19]) for(const dz of [-.24,.24]) box(g,m.wood,x,.39,tableZ+dz,.15,.78,.15);
  round(g,m.bronze,0,1.18,tableZ,.26,.31);
  for(const x of [-.98,.98]){
    round(g,m.gilt,x,1.13,tableZ,.13,.18);
    round(g,m.cream,x,1.37,tableZ,.04,.34);
  }
}

function shumingCaisson(g,m,h) {
  for(let i=0;i<5;i++){
    const span=3.22-i*.47,y=h-.44+i*.084,z=-.60;
    for(const side of [-1,1]){
      box(g,m.painted,0,y,z+side*span/2,span+.18,.085,.22);
      box(g,m.gilt,0,y-.047,z+side*span/2,span,.035,.071);
      box(g,m.painted,side*span/2,y,z,.22,.085,span-.21);
      box(g,m.gilt,side*span/2,y-.047,z,.071,.035,span-.12);
    }
  }
  round(g,m.teal,0,h-.095,-.60,.71,.13);
  orb(g,m.gilt,0,h-.153,-.60,.26,.075,.26);
}

function smallShrine(g,m,z,style) {
  const positions=style==='luban'?[-2.48,-1.28,0,1.28,2.48]:style==='threeShrine'?[-1.12,0,1.12]:[0];
  const width=positions.at(-1)*2+1.34;
  box(g,m.wood,0,.24,z,width,.48,1.22);
  box(g,m.amber,0,.48,z+.62,width,.065,.066);
  box(g,m.darkWood,0,1.49,z-.67,width+.08,2.62,.16);
  for(const x of positions) {
    const h=x===0?1.37:1.03, material=style==='luban'?m.bronze:x===0?m.gilt:m.teal;
    box(g,m.wood,x,.58,z,.74,.20,.68);
    orb(g,material,x,.78+h*.24,z+.06,.33,h*.24,.25);
    column(g,material,x,.89+h*.54,z,.31,h*.62);
    orb(g,m.cream,x,.92+h*.91,z,.17,.22,.16);
    round(g,material,x,1.14+h*.91,z,.18,.09);
  }
  box(g,m.wood,0,.83,z+1.06,Math.min(2.6,width),.15,.51);
  for(const x of [-.48,.48]) box(g,m.darkWood,x,.37,z+1.06,.14,.74,.34);
  round(g,m.bronze,0,1.0,z+1.06,.20,.23);
}

function partitions(g,m,xs,zs,h) {
  for(const x of xs.slice(1,-1)){
    for(const z of [zs[0]+.47,zs[1]-.47]){
      const panel=new T.Group();
      panel.position.set(x,0,z);panel.rotation.y=Math.PI/2;
      lattice(panel,m,0,0,.91,h*.84);
      g.add(panel);
    }
  }
}

export function createSecondaryInterior(id,m,bounds,bays,room) {
  const g=new T.Group();
  const style=room.style ?? {'b-dong-main':'dong','b-yuanjun':'yuanjun','b-shuming':'shuming'}[id];
  const {ceiling}=room;
  const dong=style==='dong', compact=style==='wing'||dong;
  const sideRoom=style==='sleep'||style==='wing';
  const smallHall=Boolean(room.style)&&!sideRoom;
  const {width:w,depth:d}=bounds;
  const xs=style==='sleep'?[-w/2+.33,-2.31,2.31,w/2-.33]:row(bays??3,w-.66);
  const zs=[-d/2+(style==='sleep'?1.51:.58),d/2-(dong?.76:1.67)];
  const architrave=ceiling-(compact?.87:1.25);
  architecture(g,m,bounds,ceiling,style,xs,zs,architrave);
  const exhibitZ=-d/2+(dong?1.76:smallHall?1.86:2.56);
  if(dong) dongDisplay(g,m,exhibitZ);
  else if(smallHall) smallShrine(g,m,exhibitZ,style);
  else if(sideRoom) partitions(g,m,xs,zs,architrave);
  else altar(g,m,exhibitZ,style==='yuanjun');
  if(style==='shuming') shumingCaisson(g,m,ceiling);

  g.add(new T.HemisphereLight('#fff2d0','#655345',1.32));
  const day=new T.DirectionalLight('#ffe7bd',1.08);
  day.position.set(-1,5,12);g.add(day);
  for(const [x,z,power,color] of [[0,2,26,'#fff2d3'],[0,exhibitZ+2,19,'#ffd296'],[-w*.32,0,9,'#b8cbff'],[w*.32,.5,9,'#ffddbd']]){
    const light=new T.PointLight(color,power,20,1.45);
    light.position.set(x,ceiling-.9,z);g.add(light);
  }
  batch(g);
  return {group:g,blocked(x,z){
    if(sideRoom && xs.slice(1,-1).some(cx=>Math.abs(x-cx)<.29 && zs.some((cz,i)=>Math.abs(z-cz-(i===0?.47:-.47))<.65))) return true;
    if(!sideRoom){
      const radius=dong?2.7:style==='luban'?3.28:style==='singleShrine'?1.02:2.28;
      if(Math.abs(x)<radius&&Math.abs(z-exhibitZ)<(smallHall?.86:1.23)) return true;
      if(!dong&&Math.abs(x)<1.58&&Math.abs(z-exhibitZ-(smallHall?1.06:1.39))<.53) return true;
    }
    return xs.some(cx=>zs.some(cz=>(cx-x)**2+(cz-z)**2<.40**2));
  }};
}
