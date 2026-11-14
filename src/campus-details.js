import * as T from 'three';
import { box, column, round, roof, rail, plaque, rng } from './geometry.js';

function gate(m,site) {
  const g=new T.Group(), {w,d,h}=site.estimated;
  const hanging=site.shape==='hanging';
  const span=hanging?w*.79:w;
  for(const x of [-span/2,span/2]) {
    box(g,m.cut,x,.15,0,.53,.30,.57);
    column(g,m.red,x,h*.362,0,.135,h*.68);
    if(hanging) for(const z of [-d*.29,d*.29]){
      column(g,m.wood,x,h*.36,z,.095,h*.63);
      round(g,m.gilt,x,h*.61,z,.13,.25);
    }
  }
  box(g,m.painted,0,h*.66,0,span+.53,.36,.38);
  box(g,m.wood,0,h*.72,0,span+.72,.24,d*.75);
  roof(g,m,{w:w+1.05,d,base:h*.746,rise:h*.235,style:hanging?'roll':'rollGable',gold:false});
  return g;
}

function galleries(m) {
  const root=new T.Group();
  for(const [x,z,w,angle] of [[73,-165,11,0],[93,-164,11,0],[73,-147,11,0],[93,-147,11,0],[83,-144.6,9,0],[79,-158,13,Math.PI/2],[87,-158,13,Math.PI/2]]){
    const g=new T.Group(), d=1.65;
    g.position.set(x,0,z);g.rotation.y=angle;
    box(g,m.lightStone,0,.16,0,w,.32,d+.3);
    for(let k=0;k<=4;k++)for(const side of [-1,1]){
      const px=w*(k/4-.5);
      box(g,m.cut,px,.35,d*side*.43,.25,.21,.25);
      column(g,m.red,px,1.45,d*side*.43,.09,2.23);
    }
    for(const side of [-1,1])box(g,m.painted,0,2.6,d*side*.46,w+.12,.26,.19);
    roof(g,m,{w:w+.42,d:d+.6,base:2.76,rise:.86,style:'roll',gold:false});
    root.add(g);
  }
  return root;
}

const baseStone=new T.IcosahedronGeometry(1,2);
function crag(m,seed,w,h,d,hole=false) {
  const g=new T.Group(), random=rng(seed);
  const geometry=baseStone.clone(), a=geometry.attributes.position, shade=new Float32Array(a.count*3);
  for(let i=0;i<a.count;i++){
    const x=a.getX(i),y=a.getY(i),z=a.getZ(i);
    const n=1+.12*Math.sin(11*x+7*y+5*z)+.09*Math.cos(19*x-4*y+10*z+seed);
    a.setXYZ(i,x*w*.5*n*(.76-.20*y)+y*w*.12,(y*.48+.5)*h,z*d*.48*n);
    const tint=.78+.13*Math.sin(14*x+3*y)+.12*Math.cos(10*y-5*z);
    shade.set([tint,tint*.93,tint*.79],i*3);
  }
  geometry.setAttribute('color',new T.BufferAttribute(shade,3));
  geometry.computeVertexNormals();
  const mat=m.cut.clone();mat.vertexColors=true;
  const rock=new T.Mesh(geometry,mat);
  rock.castShadow=true;rock.receiveShadow=true;
  g.add(rock);
  if(hole){
    // A recessed dark patch conveys the photographed cavity without claiming its depth.
    const recess=new T.Mesh(new T.CircleGeometry(.28,13),new T.MeshStandardMaterial({color:'#3f3424',roughness:1}));
    recess.position.set(-.24,h*.49,d*.47);
    recess.scale.set(.75,1.43,1);
    recess.rotation.y=.06;g.add(recess);
  }
  g.rotation.y=hole?-.16:(random()-.5)*1.9;
  return g;
}

function stonePool(m,dim) {
  const g=new T.Group(), w=dim.width_m,d=dim.depth_m;
  box(g,m.cut,0,.095,0,w,.19,d);
  box(g,m.stone,0,.21,0,w-.56,.045,d-.56);
  for(const x of [-w/2,w/2]) rail(g,m,x,-d/2,x,d/2,.21);
  for(const z of [-d/2,d/2]) for(const side of [-1,1]) rail(g,m,side*1.2,z,side*w/2,z,.21);
  const stones=[[-4.2,-2.6,1.48],[-2.45,-2.3,1.84],[.2,-2.89,1.45],[2.45,-2.18,1.27],[4.43,-1.4,1.76],
    [-3.7,1.6,1.3],[-2.04,2.6,1.05],[2.72,2.06,1.5],[4.16,2.61,1.31]];
  stones.forEach(([x,z,h],i)=>{
    const stone=crag(m,i+10,1.76,h,1.22);
    stone.position.set(x,.21,z);g.add(stone);
  });
  return g;
}

export function sideWallGate(m,site) {
  const g=new T.Group(), {w,d,h}=site.estimated, clear=site.id==='b-xihua'?3.65:3.9;
  for(const side of [-1,1]){
    box(g,m.brick,side*(w+clear)/4,h/2,0,(w-clear)/2,h,d);
    box(g,m.cut,side*(clear/2+.12),1.51,0,.24,3.02,d+.03);
    box(g,m.stone,side*(clear/2+.11),.36,d/2+.06,.54,.72,.51);
    if(site.id==='b-xihua'){
      box(g,m.wood,side*(clear/2+.39),2.22,d/2+.17,.28,4.44,.32);
      box(g,m.cut,side*(clear/2+.39),.29,d/2+.19,.45,.58,.45);
    }
    for(const z of [-d/2,d/2])for(let x=clear/2+.7;x<w/2-.2;x+=1.65)box(g,m.brick,side*x,h+.31,z,.8,.65,.40);
  }
  box(g,m.footing,0,.025,0,clear,.09,d+3);
  box(g,m.brick,0,4.8,0,clear,2.8,d);
  box(g,m.cut,0,3.43,d/2,clear+.76,.30,.53);
  box(g,m.lightStone,0,h+.07,0,w+.15,.24,d+.18);
  plaque(g,m,site.id==='b-xihua'?'西華門':'東華門',0,4.3,d/2+.22,2.46,.70);
  return g;
}

export function detailModel(m,site,dimensions,hallBlock) {
  const {shape,estimated}=site;
  if(shape==='hanging'||shape==='yi')return gate(m,site);
  if(shape==='gallery')return galleries(m);
  if(shape==='ear')return hallBlock(m,{...estimated,bays:dimensions.facade_bays,style:'roll',gold:false,base:.37});
  if(shape==='pool')return stonePool(m,dimensions);
  if(shape==='rock'){
    const g=new T.Group(), rock=crag(m,31,3.2,2.88,1.72,true);
    box(g,m.cut,0,.12,0,4.7,.24,3.2);rock.position.y=.22;g.add(rock);
    return g;
  }
  const g=new T.Group();
  if(shape==='ruin'){
    box(g,m.yard,0,.035,0,9.05,.07,6.3);
    for(const x of [-4.4,4.4])box(g,m.stone,x,.19,0,.64,.37,6.4);
    box(g,m.stone,0,.22,-3.02,9.3,.41,.67);
    for(const x of [-3.5,3.5])box(g,m.cut,x,.13,3,2.8,.22,.66);
    for(const x of [-2.7,0,2.7])for(const z of [-1.76,1.65])box(g,m.cut,x,.15,z,.61,.26,.57);
  }else{
    round(g,m.footing,0,.09,0,.78,.18);
    box(g,m.bronze,0,.35,0,1.08,.52,.15);
    box(g,m.gilt,0,.50,.084,.89,.045,.035);
    box(g,m.gilt,0,.39,.084,.60,.038,.035);
  }
  return g;
}
