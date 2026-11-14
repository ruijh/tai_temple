import * as T from 'three';
import { axis, yards, sideHalls, enclosure, modelDimensions, hall, platform, stelae, siteById, treeSites } from './data.js';
import { rooms } from './rooms.js';
import { couplets } from './couplets.js';
import { box, column, round, orb, beam, roof, steps, rail, plaque, pillarCouplet, row, batch, rng } from './geometry.js';

import { createStele } from './stelae.js';
import { detailModel, sideWallGate } from './campus-details.js';
import { createTaishanBackdrop } from './taishan.js';
import { guardianLion } from './guardian-lions.js';

export const mainSite = axis.find(site=>site.kind==='main');
const frontWidth=22.9, frontDepth=8.95;

function platformBox(g,m,w,d,h,z=0) {
  box(g,m.stone,0,h*.45,z,w-.28,h*.9,d-.28);
  box(g,m.cut,0,h*.1,z,w,.2*h,d);
  box(g,m.lightStone,0,h*.94,z,w,h*.12,d);
}

function brackets(g,m,x,y,z,scale=1) {
  box(g,m.darkWood,x,y,z,.4*scale,.29*scale,.48*scale);
  box(g,m.teal,x,y+.24*scale,z,.72*scale,.23*scale,.66*scale);
  box(g,m.painted,x,y+.47*scale,z,.85*scale,.23*scale,1.08*scale);
  box(g,m.gilt,x,y+.58*scale,z,.32*scale,.11*scale,.82*scale);
}

function frame(g,m,{w,d,bays=5,floor=.65,eaves=6,depthBays=2,open=false,ornate=false,radius}) {
  const xs=row(bays,w);
  const zs=row(depthBays,d);
  const columnH=eaves-floor-.63;
  const r=radius ?? (w>29?.39:.22);
  for(const x of xs) for(const z of [zs[0],zs.at(-1)]){
    round(g,m.cut,x,floor+.10,z,r*1.4,.20);
    column(g,m.red,x,floor+.2+columnH*.5,z,r,columnH);
    if(ornate) brackets(g,m,x,eaves-.65,z,1.14);
  }
  for(const x of [xs[0],xs.at(-1)]) for(const z of zs.slice(1,-1)){
    round(g,m.cut,x,floor+.10,z,r*1.4,.20);
    column(g,m.red,x,floor+.2+columnH*.5,z,r,columnH);
    if(ornate) brackets(g,m,x,eaves-.65,z,1.08);
  }
  for(const z of [zs[0],zs.at(-1)]){
    box(g,m.wood,0,eaves-.18,z,w+.5,.40,.55);
    box(g,m.painted,0,eaves-.65,z,w+.25,.53,.54);
    for(let i=0;i<bays;i++){
      const x=(xs[i]+xs[i+1])/2;
      if(ornate) for(const dx of [-1,0,1]) brackets(g,m,x+dx*w/bays*.22,eaves-.59,z, .73);
      if(open && Math.abs(x)<w/bays*.54) continue;
      const doorW=(xs[i+1]-xs[i])*.85;
      const back=z*.77;
      box(g,m.darkWood,x,floor+.22,back,doorW,.44,.28);
      for(const side of [-1,1]){
        box(g,m.door,x+side*doorW*.246,(floor+eaves-.83)/2,back,doorW*.482,eaves-floor-.83,.19);
      }
    }
  }
  for(const x of [xs[0],xs.at(-1)]){
    box(g,m.wood,x,eaves-.18,0,.56,.4,d+.5);
    box(g,m.painted,x,eaves-.64,0,.61,.48,d+.3);
    box(g,m.plaster,x*.93,floor+columnH*.5,0,.25,columnH*.95,d*.79);
  }
}

function hallBlock(m,{w,d,h,bays=5,style='gable',gold=true,base=.62,baseW=w+1,baseD=d+1.1,open=false,sign,inscriptions=[],frontSteps=true}) {
  const g=new T.Group();
  platformBox(g,m,baseW,baseD,base);
  const eaves=h*.62;
  frame(g,m,{w,d,bays,floor:base,eaves,open,ornate:w>=17});
  roof(g,m,{w:w+2.65,d:d+2.85,base:eaves,rise:h-eaves-.13,style,gold,ornate:w>=17});
  box(g,m.wood,0,eaves-.11,0,w+1.32,.17,d+1.58);
  if(sign) plaque(g,m,sign,0,eaves-.64,d/2+.35,Math.min(w*.24,4.5),.90);
  for(const inscription of inscriptions){
    const door=inscription.mount==='door';
    pillarCouplet(g,inscription,{x:w/bays*(door?.47:.5),y:(eaves+base)*(door?.445:.5),z:door?d*.385+.15:d/2+.27,width:door?.32:.43,height:(eaves-base)*(door?.56:.68)});
  }
  if(frontSteps&&base>.3) steps(g,m,{w:Math.min(w*.34,4.8),h:base,z:baseD*.5+.03,edge:.43,n:3});
  return g;
}

function stoneArch(m,{w,d,h,inscriptions=[],stoneLions=false}) {
  const g=new T.Group();
  const xs=[-.47,-.19,.19,.47].map(v=>v*w);
  for(let i=0;i<4;i++){
    const x=xs[i], high=i===0||i===3?h*.60:h*.80;
    box(g,m.footing,x,.26,0,.98,.52,1.35);
    box(g,m.stone,x,high*.5,0,.61,high,.64);
    for(const z of [-.58,.58]){
      box(g,m.cut,x,.65,z,.62,1.07,.47);
      if(stoneLions){
        const lion=guardianLion(m,m.lightStone,{cub:true,cubSide:i%2?1:-1});
        lion.position.set(x,1.12,z*1.35);
        lion.rotation.y=z<0?Math.PI:0;
        g.add(lion);
      }
    }
  }
  for(let i=0;i<3;i++){
    const width=xs[i+1]-xs[i], offset=(xs[i+1]+xs[i])*.5;
    const y=i===1?h*.74:h*.52;
    box(g,m.lightStone,offset,y,0,width+.6,.62,.77);
    box(g,m.cut,offset,y+.61,0,width+.72,.46,.95);
    const cap=new T.Group();
    cap.position.x=offset;g.add(cap);
    roof(cap,m,{w:width+1.24,d:Math.max(d*.52,1.45),base:y+.84,rise:i===1?h*.15:h*.11,style:'gable',gold:false});
    box(g,m.stone,offset,y+.81,0,width+1.0,.24,Math.max(d*.47,1.32));
  }
  for(const entry of inscriptions){
    const north=entry.mount==='north';
    pillarCouplet(g,entry,{x:w*.19,y:h*.47,z:north?-.324:.324,width:.42,height:h*.40,rotation:north?Math.PI:0});
  }
  return g;
}

function towerGateway(m,{h=19,w,d,baseH=8.6,passages,sign,bays=5,loft}) {
  const g=new T.Group();
  let edge=-w/2;
  for(const [x,clear] of passages){
    const left=x-clear/2, right=x+clear/2;
    if(left>edge) box(g,m.brick,(edge+left)/2,baseH/2,0,left-edge,baseH,d);
    const rise=Math.min(baseH*.26,clear*.36);
    const spring=baseH*.48;
    for(let n=0;n<20;n++){
      const u=(n+.5)/10-1;
      const bottom=spring+rise*Math.sqrt(1-u*u);
      box(g,m.brick,left+(n+.5)*clear/20,(baseH+bottom)*.5,0,clear/20+.012,baseH-bottom,d);
    }
    edge=right;
  }
  if(edge<w/2) box(g,m.brick,(edge+w/2)/2,baseH/2,0,w/2-edge,baseH,d);
  box(g,m.stone,0,baseH+.14,0,w+.5,.32,d+.4);
  box(g,m.brick,0,baseH+.38,-d/2,w,.54,.42);
  box(g,m.brick,0,baseH+.38,d/2,w,.54,.42);
  for(let x=-w/2+1;x<w/2;x+=2.3){
    box(g,m.brick,x,baseH+.76,d/2,.96,.57,.44);
    box(g,m.brick,x,baseH+.76,-d/2,.96,.57,.44);
  }
  const head=hallBlock(m,{w:bays===5?frontWidth:w*.72,d:bays===5?frontDepth:d*.68,h:h-baseH,bays,sign,base:.27});
  head.position.y=baseH+.15;
  if(loft)loft(head);else g.add(head);
  return g;
}

function outsideMain(m) {
  const g=new T.Group();
  const low=platform.platform_height_reference_m-hall.upper_platform_height_m;
  platformBox(g,m,hall.lower_platform_width_m,hall.lower_platform_depth_m,low,2.5);
  const upper=new T.Group();upper.position.y=low;
  platformBox(upper,m,hall.upper_platform_width_m,hall.upper_platform_depth_m,hall.upper_platform_height_m);
  g.add(upper);
  const terrace=platform.depth_m;
  platformBox(g,m,platform.width_m,terrace,low,16.3);
  steps(g,m,{w:8,h:low,z:16.3+terrace/2,edge:.53,n:10});
  const edge=platform.width_m/2-.22, end=16.3+terrace/2-.23;
  rail(g,m,-edge,11,-edge,end,low);
  rail(g,m,edge,11,edge,end,low);
  rail(g,m,-edge,end,-4.15,end,low);
  rail(g,m,4.15,end,edge,end,low);
  steps(g,m,{w:8.0,h:low+.6,z:9.87,edge:.44,n:3});
  const w=hall.width_m,d=hall.depth_m,eaves=9.75;
  frame(g,m,{w,d,bays:hall.facade_bays,depthBays:hall.depth_bays,floor:low+.6,eaves,open:true,ornate:true,radius:.39});
  box(g,m.darkWood,0,5.84,.15,w-1.8,6.1,.48); box(g,m.darkWood,0,eaves-.11,0,w+2.5,.32,d+2.75);
  roof(g,m,{w:w+4.9,d:d+4.8,base:eaves,rise:2.72,topW:w-5.2,topD:d-6,ornate:true});
  box(g,m.painted,0,12.77,0,w-4.9,1.56,d-5.7);
  box(g,m.darkWood,0,13.7,0,w-3.5,.3,d-4.0);
  roof(g,m,{w:w-1.7,d:d-1.5,base:13.86,rise:hall.height_m-14.28,style:'hip',ornate:true});
  plaque(g,m,'宋天贶殿',0,13.56,(d-1.5)/2+.10,3.85,1.28);
  for(const entry of couplets['b-tiankuang'].filter(item=>item.mount)){
    const outer=entry.mount==='outer';
    pillarCouplet(g,entry,{x:w/hall.facade_bays*(outer?1.5:.5),y:6.25,z:d/2+.455,width:.63,height:4.5});
  }
  box(g,m.iron,0,low+.82,20,3,1.15,1.16);
  for(const x of [-1.3,1.3]) for(const z of [19.55,20.45]) box(g,m.iron,x,low+.29,z,.17,.61,.17);
  for(const x of [-7.1,7.1]){
    const vessel=new T.Mesh(new T.CylinderGeometry(.64,.43,.83,14),m.bronze);
    vessel.position.set(x,low+.42,20);g.add(vessel);
    round(g,m.iron,x,low+.84,20,.67,.11);
  }
  return g;
}

function simple(m,id,override={}) {
  const d=modelDimensions(id);
  return hallBlock(m,{w:d.width_m??10,d:d.depth_m??6,h:d.height_m??6,bays:d.facade_bays??3,...override});
}

function pavilion(m,gold=true) {
  const g=new T.Group();
  const r=2.5;
  round(g,m.stone,0,.24,0,r+.10,.48);
  for(let i=0;i<6;i++){
    const a=i*Math.PI/3;
    column(g,m.red,Math.cos(a)*r,.51+2.22,Math.sin(a)*r,.16,4.5);
  }
  const mat=gold?m.goldRoof:m.greyRoof;
  const tiers=[{r:3.38,y:4.93},{r:2.21,y:5.63},{r:.06,y:7.28}];
  for(let i=0;i<tiers.length-1;i++){
    const at=tiers[i], next=tiers[i+1];
    const part=new T.Mesh(new T.CylinderGeometry(next.r,at.r,next.y-at.y,6,1,true),mat);
    part.position.y=(at.y+next.y)/2;
    g.add(part);
  }
  orb(g,m.gilt,0,7.44,0,.23,.32,.23);
  return g;
}

function trees(parent,m,cells) {
  const random=rng(1977), data=[];
  for(const [x,z,w,d,count] of cells) for(let i=0;i<count;i++){
    data.push([x+(random()-.5)*w,z+(random()-.5)*d,2.8+random()*5.3,random()]);
  }
  const object=new T.Object3D();
  const trunk=new T.InstancedMesh(new T.CylinderGeometry(.68,1,1,6),m.darkWood,data.length);
  const leaves=new T.InstancedMesh(new T.IcosahedronGeometry(1,1),new T.MeshStandardMaterial({color:'white',roughness:1,flatShading:true}),data.length*4);
  const colors=['#40583c','#536748','#63714c','#344935','#6a754c','#455f46'];
  let index=0;
  data.forEach(([x,z,h,v],i)=>{
    object.position.set(x,h*.35,z);object.rotation.set(0,v*12,.10*(v-.5));
    object.scale.set(.20+v*.17,h*.69,.20+v*.17);object.updateMatrix();trunk.setMatrixAt(i,object.matrix);
    for(const [ox,oy,oz] of [[0,.87,0],[.18,.65,.12],[-.2,.77,0],[.03,1.05,-.13]]){
      object.position.set(x+ox*h,oy*h,z+oz*h);
      object.rotation.set(v*2,v*10,0);
      object.scale.set(h*(.25+v*.10),h*.32,h*.28);
      object.updateMatrix();leaves.setMatrixAt(index,object.matrix);
      leaves.setColorAt(index++,new T.Color(colors[Math.floor(random()*colors.length)]));
    }
  });
  leaves.castShadow=true;leaves.receiveShadow=true;trunk.castShadow=true;
  parent.add(trunk,leaves);
}

function courtGrid(g,m,{x=0,z,w,d,material=m.yard,grid=true}) {
  box(g,material,x,.025,z,w,.08,d);
  if (!grid) return;
  for(let i=-w*.5+2.6;i<w*.5-1;i+=2.6) box(g,m.soil,x+i,.072,z,.044,.010,d-.4);
  for(let j=-d*.5+2.6;j<d*.5-1;j+=2.6) box(g,m.soil,x,.073,z+j,w-.45,.010,.047);
}

function longWall(g,m,x,z,w,d) {
  box(g,m.brick,x,2.85,z,w,5.7,d);
  box(g,m.cut,x,5.74,z,w+.12,.20,d+.16);
  const n=Math.round(Math.max(w,d)/2.35);
  for(let i=0;i<n;i++){
    if(w>d) box(g,m.brick,x+(i+.5)*w/n-w/2,6.08,z,1.10,.62,d*.51);
    else box(g,m.brick,x,6.08,z+(i+.5)*d/n-d/2,w*.51,.62,1.10);
  }
}

function divider(g,m,x,z,w,d) {
  box(g,m.plaster,x,1.5,z,w,3,d);
  box(g,m.greyRidge,x,3.05,z,w+.25,.24,d+.23);
}

export function createCampus(m) {
  const scene = new T.Group(), staticGround=new T.Group(), picks=new Map();
  scene.add(staticGround);
  const add=(g,x,z,id,y=0,rot=0)=>{
    g.position.set(x,y,z);g.rotation.y=rot;
    if(id){ g.userData.site=id; if(!picks.has(id)) picks.set(id,[]);picks.get(id).push(g); }
    batch(g);scene.add(g);
    return g;
  };
  const span=enclosure.width/2, end=-enclosure.length;
  const ground=box(staticGround,m.terrain,0,-2.3,-175,3200,3.76,2250);
  ground.castShadow=false;
  box(staticGround,m.grass,0,-.39,end/2,enclosure.width,.80,enclosure.length);
  box(staticGround,m.footing,0,-.34,77,142,.75,159);
  courtGrid(staticGround,m,{x:0,z:-202,w:19,d:398,material:m.pavement});
  courtGrid(staticGround,m,{x:0,z:72,w:16,d:146,material:m.pavement});
  courtGrid(staticGround,m,{z:-136,w:65,d:149});
  courtGrid(staticGround,m,{z:-233,w:72,d:113});
  courtGrid(staticGround,m,{z:-321,w:70,d:67});
  courtGrid(staticGround,m,{z:-378,w:39,d:50});
  for(const x of [-72,72]) courtGrid(staticGround,m,{x,z:-142,w:123,d:8,material:m.pavement});
  for(const x of [-59,59]) courtGrid(staticGround,m,{x,z:-218,w:7,d:370,material:m.pavement,grid:false});
  for(const y of yards){
    if(y.id==='a-yaocan')continue;
    courtGrid(staticGround,m,{x:y.x,z:y.z,w:y.w,d:y.d,material:m.yard,grid:false});
    for(const side of [-1,1]){
      if(y.id==='a-dong'){
        const boundary=y.x+side*y.w/2;
        divider(staticGround,m,boundary,-163,.72,36);
        divider(staticGround,m,boundary,-133.7,.72,2.4);
      }else divider(staticGround,m,y.x+side*y.w/2,y.z,.72,y.d);
      divider(staticGround,m,y.x+side*y.w*.32,y.z-y.d/2,y.w*.34,.72);
    }
  }
  for(const sign of [-1,1]){
    longWall(staticGround,m,sign*(58+span)/2,0,span-58,6.2);
    longWall(staticGround,m,sign*(13+span)/2,end,span-13,5.8);
    const gate=siteById.get(sign>0?'b-donghua':'b-xihua');
    const edge=gate.estimated.w/2;
    const south=gate.z+edge,north=gate.z-edge;
    longWall(staticGround,m,sign*span,south/2,5.7,-south);
    longWall(staticGround,m,sign*span,(north+end)/2,5.7,north-end);
    add(sideWallGate(m,gate),gate.x,gate.z,gate.id,0,gate.angle);
    for(const z of [-29,-71]) divider(staticGround,m,sign*32,z,.8,23);
    divider(staticGround,m,sign*37,-232,1,131);
    divider(staticGround,m,sign*37,-311,1,19);
    divider(staticGround,m,sign*25,74,.8,62);
  }
  for(const z of [-3,end]) box(staticGround,m.cut,0,.06,z,35,.14,9);
  box(staticGround,m.pavement,0,.64,-131,9.4,1.20,61.5);
  for(const side of [-1,1]){
    box(staticGround,m.stone,side*4.8,1.18,-131,.21,.22,60.8);
    box(staticGround,m.plaster,side*39,-.1,-367,19,.1,35);
  }

  for(const [z,width,length] of [[104,46,12],[47,45,13]]){
    courtGrid(staticGround,m,{z,w:width,d:length,material:m.pavement,grid:true});
  }
  const pool=new T.Group();
  box(pool,m.cut,0,.23,0,8,.50,5.7);
  box(pool,m.water,0,.50,0,6.9,.08,4.5);
  add(pool,0,143,'b-double-pool');
  const frontyard=new T.Group();
  for(const x of [-25.8,25.8]) divider(frontyard,m,x,78,.65,66.2);
  for(const z of [45,111]) for(const x of [-15.6,15.6]) divider(frontyard,m,x,z,20.3,.65);
  add(frontyard,0,0,'a-yaocan');
  for(const id of ['b-yaocan-south','b-yaocan-yimen','b-yaocan-north']){
    const site=siteById.get(id);
    const building=hallBlock(m,{...site.estimated,d:4.1,bays:3,gold:false,open:true,base:.30,
      sign:id==='b-yaocan-south'?'泰山第一行宮':null,inscriptions:couplets[id]});
    add(building,site.x,site.z,id);
  }
  const yaocanPavilion=new T.Group();
  platformBox(yaocanPavilion,m,6,6,.42);
  for(const x of [-2,2])for(const z of [-2,2])column(yaocanPavilion,m.red,x,2.04,z,.16,3.22);
  roof(yaocanPavilion,m,{w:6.4,d:6.4,base:3.65,rise:2.16,topW:.22,gold:false});
  round(yaocanPavilion,m.greyRidge,0,5.87,0,.18,.34);
  add(yaocanPavilion,0,62,'b-yaocan-pavilion');

  for(const site of axis){
    let g;
    const d=modelDimensions(site.id);
    if(site.kind==='main') g=outsideMain(m);
    else if(site.kind==='arch') g=stoneArch(m,{w:d.width_m??8.6,d:d.depth_m??2.5,h:d.height_m??5.8,
      inscriptions:couplets[site.id],stoneLions:site.id==='b-dai-arch'});
    else if (site.id==='b-zhengyang') g=towerGateway(m,{h:d.height_m,w:116,d:d.center_passage_depth_m,passages:[[-46,5],[-16,5.90],[0,d.center_passage_clear_width_m],[16,5.90],[46,5]],sign:'岱庙'});
    else if (site.id==='b-houzai') g=towerGateway(m,{h:d.height_m,w:27,d:14,baseH:4.45,passages:[[0,4.6]],sign:'厚载门',bays:3,
      loft:head=>add(head,site.x,site.z,'b-houzai-loft',4.6,Math.PI)});
    else if(site.id==='b-yuanjun') g=simple(m,site.id,{base:.65,baseW:21.5,baseD:14.4,open:true,sign:'資生普潤',inscriptions:couplets[site.id]});
    else if(site.id==='b-shuming') g=simple(m,site.id,{base:.75,open:true,sign:'權輿造化',inscriptions:couplets[site.id]});
    else g=simple(m,site.id,{base:1.2,open:true,sign:site.label});
    g.userData.enter=Boolean(rooms[site.id]);
    add(g,site.x,site.z,site.id);
  }
  for(const [id,span,z,metal] of [['b-yaocan-arch',5.85,125.2,m.iron],['b-peitian',8.1,-91.5,m.bronze]]){
    for(const side of [-1,1]){
      const guardian=guardianLion(m,metal);
      add(guardian,side*span,z,id,0,side*-.08);
    }
  }
  for(const site of sideHalls){
    const g=simple(m,site.id,{
      style:site.form, gold:false, base:site.base, sign:site.id==='b-dong-main'?'東御座':site.label, ...site.estimated,
      ...(site.id==='b-dong-main'?{baseW:19.06,baseD:10.5}:{}),
    });
    g.userData.enter=Boolean(rooms[site.id]);
    add(g,site.x,site.z,site.id,0,site.angle);
  }
  for(const side of [-1,1]) {
    const gateId=side<0?'b-shen-w':'b-shen-e';
    add(simple(m,gateId,{w:12,d:7.2,h:7.3,gold:false,open:true}),side*26,-162,gateId);
    const key=side>0?'e':'w';
    for(const [z,w] of [[-184,48],[-256,62]]){
      add(hallBlock(m,{w,d:5.1,h:5.2,bays:Math.round(w/5),gold:false,style:'hard',base:.29}),side*35.8,z,'b-hall-'+key,0,-side*Math.PI/2);
    }
    add(hallBlock(m,{w:15,d:8,h:9.3,bays:3,gold:true}),side*36,-217,'b-hall-tower-'+key,0,-side*Math.PI/2);
    add(pavilion(m),side*22.2,-265,side<0?'b-pavilion-w':'b-pavilion-e',2.05);
    add(hallBlock(m,{w:31,d:4.2,h:4.9,bays:7,gold:false,style:'hard',base:.2}),side*33,-315,'b-shuming',0,Math.PI/2);
  }
  for(const site of sitesWithShapes()){
    const {x,z,id,angle,shape}=site;
    if(shape==='corner'){
      const g=hallBlock(m,{w:14,d:11,h:11.4,bays:5,gold:true,base:.31});
      box(g,m.brick,0,-2.4,0,16.5,5.5,14.5);
      add(g,x,z,id,site.y,angle);
    }else if(shape==='southDoor'){
      const g=new T.Group(), d=modelDimensions('b-zhengyang').center_passage_depth_m;
      const hit=new T.Mesh(new T.BoxGeometry(site.clear+.9,6.65,d+.14),new T.MeshBasicMaterial({visible:false}));
      hit.position.y=3.325;hit.userData.dynamic=true;
      g.add(hit);
      add(g,x,z,id);
    }else add(detailModel(m,site,modelDimensions(id),hallBlock),shape==='gallery'?0:x,shape==='gallery'?0:z,id,0,angle);
  }
  const hanWall=new T.Group();
  box(hanWall,m.plaster,107.12,1.62,-49,.75,3.25,59);
  box(hanWall,m.greyRidge,107.12,3.36,-49,1.06,.24,59.2);
  box(hanWall,m.plaster,95.22,1.30,-80,.72,2.6,19.6);
  box(hanWall,m.greyRidge,95.22,2.70,-80,.97,.22,19.8);
  box(hanWall,m.plaster,74.86,1.15,-84,.64,2.30,13.6);
  box(hanWall,m.greyRidge,74.86,2.39,-84,.88,.22,13.7);
  box(hanWall,m.plaster,85,1.20,-88.54,20.9,2.40,.66);
  box(hanWall,m.greyRidge,85,2.49,-88.54,21.1,.22,.90);
  add(hanWall,0,0,'a-han');
  for(const stone of stelae) add(createStele(m,stone),stone.x,stone.z,stone.id,stone.y,stone.angle);
  add(simple(m,'b-bingling',{style:'hard',gold:false,open:true}),57,-50,'b-bingling',0,Math.PI/2);
  const hanPavilion=hallBlock(m,{w:16.2,d:8.5,h:7,bays:3,gold:false,base:.93,frontSteps:false});
  hanPavilion.position.y=1.88;
  const hanTerrace=new T.Group();
  box(hanTerrace,m.stone,0,.94,0,15.4,1.88,9.08);
  hanTerrace.add(hanPavilion);
  add(hanTerrace,85,-83,'b-han-pavilion');
  add(simple(m,'b-dong-gate',{style:'roll',gold:false,open:true}),83,-138,'b-dong-gate');
  for(const [x,z,w,d,h,id,rot] of [
    [-81,-76,24,8,6.3,'a-tang',0],[-104,-51,22,6.5,5.9,'a-tang',Math.PI/2],
    [-64,-204,60,5.1,5.1,'a-yuhua',Math.PI/2],[-102,-204,60,5.1,5.1,'a-yuhua',Math.PI/2],
    [89,-294,23,7.2,5.4,'a-zi',0],[-82,-308,26,6.7,5.6,'a-su',0],
    [86,-382,24,6.0,5.9,'a-zi',0],[-85,-385,24,6.0,5.8,'a-su',0],
  ]) add(hallBlock(m,{w,d,h,bays:w>25?7:5,style:'hard',gold:false}),x,z,id,0,rot);
  for(const [x,z,id,r] of [[-79,-365,'a-su',9],[-86,-48,'a-tang',5],[78,-60,'a-han',4]]){
    const pond=new T.Group();
    round(pond,m.cut,0,.17,0,r+.7,.36);
    round(pond,m.water,0,.36,0,r,.08);
    add(pond,x,z,id);
  }
  const copper=new T.Group(), dim=modelDimensions('b-bronze');
  const w=dim.width_m??4.45, d=dim.depth_m??3.27;
  platformBox(copper,m,w+3,d+3,1.68);
  platformBox(copper,m,w+.56,d+.50,2.44);
  for(const x of [-w*.43,w*.43])for(const z of [-d*.42,d*.42]){
    column(copper,m.bronze,x,3.7,z,.115,2.52);
  }
  box(copper,m.bronze,0,5.04,0,w,.25,d);
  const copperRoof={...m,goldRoof:m.bronze,goldRidge:m.bronze,plaster:m.bronze};
  roof(copper,copperRoof,{w:w+1,d:d+1,base:5.11,rise:.93,style:'gable'});
  roof(copper,copperRoof,{w:w*.83,d:d*.93,base:6.01,rise:1.13,style:'gable'});
  add(copper,83,-350,'b-bronze');
  const iron=new T.Group();
  for(let i=0;i<4;i++){
    round(iron,m.iron,0,.3+i*.75,0,1.4-i*.2,.44);
    round(iron,m.dark,0,.53+i*.75,0,1.52-i*.2,.16);
  }
  add(iron,-63,-343,'b-iron');
  batch(staticGround);
  const plantCells=[
    [-93,-33,25,20,11],[92,-32,26,24,11],[-72,-63,11,17,5],[85,-66,25,13,6],
    [-37,-39,14,53,13],[37,-39,14,53,13],[-19,-135,10,41,6],[19,-135,10,41,6],
    [-22,-214,14,58,16],[22,-214,14,58,16],[-27,-281,6,21,4],[27,-281,6,21,4],
    [-43,-340,13,86,17],[46,-347,12,82,17],[-92,-351,28,64,20],[93,-351,26,53,20],
    [-76,-213,16,56,15],[88,-187,30,11,7],[83,-264,39,28,15],
    [-110,-174,9,279,37],[111,-178,8,278,34],[-10,-382,43,22,11],
    [-32,82,11,76,17],[32,80,11,76,17]
  ];
  trees(scene,m,plantCells);
  const markerMaterial=new T.MeshStandardMaterial({color:'#4e855e',roughness:.65});
  for(const {id,x,z} of treeSites){
    const marker=new T.Group();
    round(marker,m.cut,0,.10,0,.72,.2);
    column(marker,m.darkWood,0,1.03,0,.085,1.88);
    const emblem=box(marker,markerMaterial,0,2.13,0,.92,.92,.18);
    emblem.rotation.z=Math.PI/4;
    orb(marker,m.gilt,0,2.13,.105,.15,.15,.035);
    add(marker,x,z,id);
  }
  return { scene,picks };
}

function sitesWithShapes(){
  const linked=new Set(['hanging','yi','ear','gallery','pool','rock','ruin','marker','corner','southDoor']);
  return [...siteById.values()].filter(site=>linked.has(site.shape));
}

export function createHorizon(m) {
  const horizon=new T.Group();
  const ground=box(horizon,m.terrain,0,-4.25,-450,3900,.8,3200);
  ground.castShadow=false;ground.receiveShadow=false;
  batch(horizon);
  horizon.add(createTaishanBackdrop());
  return horizon;
}




