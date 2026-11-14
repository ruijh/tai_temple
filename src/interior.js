import * as T from 'three';
import { credits, hall, hallInterior } from './data.js';
import { box, column, round, orb, row, batch, beam } from './geometry.js';
import { photoPreviewUrl } from './remote-images.js';

const columnGrids = [
  {xs:row(hall.facade_bays,hall.width_m),zs:row(5,hall.depth_m-.9),r:hallInterior.column_diameter_reference_m/2,h:5.95},
  {xs:row(7,36),zs:row(3,12.2),r:.36,h:6.35},
  {xs:row(3,24.4),zs:row(3,8.3),r:.33,h:7.04},
];

const columnPoints = columnGrids.flatMap(({xs,zs,r,h})=>xs.flatMap(x=>zs
  .filter(z=>x===xs[0]||x===xs.at(-1)||z===zs[0]||z===zs.at(-1))
  .map(z=>({x,z,r,h}))));
export function tiankuangCollision(x,z){
  const inShrine=Math.abs(x)<4.6 && z < -3.46 && z > -7.62;
  return inShrine || columnPoints.some(p=>(p.x-x)**2+(p.z-z)**2<(p.r+.20)**2);
}

function buildColumns(group,m) {
  for(const {x,z,r,h} of columnPoints){
    round(group,m.cut,x,.20,z,r*1.52,.40);
    round(group,m.lightStone,x,.38,z,r*1.31,.17);
    column(group,m.red,x,.44+h*.5,z,r,h);
    box(group,m.wood,x,h+.42,z,r*3,.39,r*2.8);
    box(group,m.teal,x,h+.72,z,r*4.2,.31,r*2.6);
    box(group,m.painted,x,h+1.01,z,r*4.6,.3,r*4.5);
  }
}

function ceiling(group,m) {
  const w=hall.width_m/2, bays=row(hall.facade_bays,hall.width_m);
  box(group,m.darkWood,0,9.63,0,hall.width_m+1,.18,hall.depth_m+.6);
  for(const x of bays){
    const crossesCaisson=Math.abs(Math.abs(x)-3.18)<2.63;
    const runs=crossesCaisson?[[-8.59,-5.31],[5.31,8.59]]:[[-8.59,8.59]];
    for(const [start,end] of runs){
      const z=(start+end)*.5;
      box(group,m.painted,x,7.89,z,.42,.52,end-start);
      box(group,m.wood,x,8.29,z,.64,.54,end-start);
    }
  }
  for(const z of [-7.9,-5.38,-2.69,0,2.69,5.38,7.9]){
    const runs=Math.abs(Math.abs(z)-2.7)<2.57?[[-w,-5.86],[-.57,.57],[5.86,w]]:[[-w,w]];
    for(const [start,end] of runs) box(group,m.painted,(start+end)*.5,8.69,z,end-start,.44,.47);
  }
  for(const x of [-w+4,-w+8,-w+12,w-12,w-8,w-4]) for(const z of [-4.2,-1.4,1.4,4.2]){
    box(group,m.teal,x,9.35,z,3.87,.10,2.65);
    for(const s of [-1,1]){
      box(group,m.amber,x+s*1.69,9.27,z,.07,.07,2.36);
      box(group,m.amber,x,9.26,z+s*1.13,3.34,.07,.07);
    }
  }
  for(const [x,z] of [[-3.18,-2.7],[3.18,-2.7],[-3.18,2.7],[3.18,2.7]]){
    for(let i=0;i<4;i++){
      const span=5.06-i*.74,y=8.19+i*.33;
      const segment=new T.Group();
      segment.position.set(x,y,z);segment.rotation.y=i%2 ? Math.PI/8 : 0;
      for(let j=0;j<8;j++){
        const a=j*Math.PI/4,b=(j+1)*Math.PI/4;
        const p=[Math.cos(a)*span/2,.09,Math.sin(a)*span/2];
        const q=[Math.cos(b)*span/2,.09,Math.sin(b)*span/2];
        beam(segment,m.amber,p,q,.12);
        beam(segment,m.painted,p.map((v,k)=>k===1?v-.18:v),q.map((v,k)=>k===1?v-.18:v),.18);
      }
      group.add(segment);
    }
    round(group,m.teal,x,9.22,z,1.28,.16);
    orb(group,m.gilt,x,9.04,z,.49,.14,.49);
  }
}

function shrine(g,m) {
  const z=-5.5;
  for(const [w,d,y,h] of [[8.8,3.9,.29,.58],[7.8,3.3,.68,.23],[7.3,3.0,.83,.12]]){
    box(g,m.wood,0,y,z,w,h,d);
    box(g,m.gilt,0,y+h*.45,z+d*.5,w,.07,.07);
  }
  box(g,m.darkWood,0,3.13,z-1.31,6.14,4.75,.33);
  for(const x of [-3.16,3.16]){
    column(g,m.red,x,3.02,z+1.10,.29,4.51);
    column(g,m.gilt,x,3.02,z-1.27,.18,4.52);
    for(const y of [1.08,2.04,3.22,4.69,5.18]) box(g,m.amber,x,y,z,.39,.19,2.66);
    for(const z1 of [-6.48,-5.76,-5.0]) box(g,m.gilt,x,3.6,z1,.07,2.84,.10);
  }
  box(g,m.gilt,0,5.55,z,7.0,.35,3.15);
  box(g,m.painted,0,5.33,z+1.56,6.6,.42,.25);
  box(g,m.wood,0,5.95,z,5.6,.48,2.66);
  box(g,m.gilt,0,6.22,z,4.65,.14,2.18);
  box(g,m.amber,0,1.42,z,2.86,.59,1.5);
  orb(g,m.gilt,0,2.31,z+.1,1.46,.51,.81);
  orb(g,m.amber,0,3.09,z-.05,.85,1.20,.53);
  orb(g,m.amber,-.76,2.72,z+.23,.57,.56,.47);
  orb(g,m.amber,.76,2.72,z+.23,.57,.56,.47);
  orb(g,m.cream,0,4.32,z,.49,.58,.48);
  orb(g,m.darkWood,0,4.08,z+.40,.23,.30,.10);
  box(g,m.darkWood,0,4.96,z,.9,.25,.54);
  box(g,m.iron,0,5.2,z,1.18,.12,.82);
  for(let i=-4;i<=4;i++){
    box(g,m.gilt,i*.112,4.88,z+.42,.032,.5,.036);
    orb(g,m.amber,i*.112,4.66,z+.42,.062,.062,.062);
  }
  box(g,m.cream,0,3.18,z+.67,.25,.92,.13);
  box(g,m.darkWood,0,.89,-2.84,5.32,.19,1.22);
  for(const x of [-2.21,2.21]) for(const z of [-3.20,-2.47]){
    box(g,m.wood,x,.43,z,.23,.86,.23);
  }
  round(g,m.bronze,0,1.22,-2.82,.52,.44);
  for(const x of [-1.67,1.67]){
    round(g,m.gilt,x,1.24,-2.81,.16,.53);
    round(g,m.gilt,x,1.61,-2.81,.061,.43);
    orb(g,m.amber,x,1.89,-2.81,.065,.11,.065);
  }
}

export function createInterior(m, onTextureReady) {
  const g=new T.Group();
  const w=hall.width_m,d=hall.depth_m;
  const outer=row(hall.facade_bays,w);
  box(g,m.stone,0,-.14,0,w+.7,.28,d+.32);

  const zLineCount=Math.round(d/1.42);
  const xLineCount=Math.round(w/1.9);
  for(const x of row(xLineCount,w)) box(g,m.footing,x,.007,0,.030,.027,d);
  for(const z of row(zLineCount,d)) box(g,m.footing,0,.008,z,w,.029,.036);

  // 28 = 2*(10+6)-4, 20 = 2*(8+4)-4, 12 = 2*(4+4)-4.
  buildColumns(g,m);
  for (const x of [-w/2+.38,w/2-.38]){
    box(g,m.wallPanel,x,3.04,0,.25,6.1,d);
    box(g,m.darkWood,x,1.02,0,.33,.25,d);
    box(g,m.painted,x,5.58,0,.40,.54,d);
    box(g,m.gilt,x,5.30,0,.40,.075,d);
  }
  box(g,m.wallPanel,0,3.01,-d/2+.13,w,6.15,.24);
  box(g,m.darkWood,0,1.02,-d/2+.27,w,.22,.37);
  box(g,m.painted,0,5.62,-d/2+.27,w,.53,.41);
  for(let i=0;i<hall.facade_bays;i++){
    if(i===4) continue;
    const x=(outer[i]+outer[i+1])/2, span=outer[i+1]-outer[i];
    for(const s of [-1,1]) box(g,m.door,x+s*span*.25,2.49,d/2-.38,span*.48,4.96,.19);
  }
  box(g,m.painted,0,5.18,d/2-.4,w,.45,.30);
  box(g,m.darkWood,0,.12,d/2-.39,w,.24,.38);
  for(const z of [-6.56,6.32]){
    box(g,m.painted,0,7.25,z,w,.47,.4);
    box(g,m.gilt,0,7.49,z,w,.048,.42);
  }
  ceiling(g,m);
  shrine(g,m);

  const muralMount=new T.Group();
  muralMount.position.set(w/2-.54,3.19,.35);
  muralMount.rotation.y=-Math.PI/2;
  const muralWidth=4.42,muralHeight=3.3;
  box(muralMount,m.darkWood,0,0,-.05,muralWidth+.21,muralHeight+.18,.13);
  const visual=new T.Mesh(new T.PlaneGeometry(muralWidth,muralHeight),new T.MeshBasicMaterial({color:'#bba484',side:T.DoubleSide}));
  visual.position.z=.036;
  visual.userData.dynamic=true;
  muralMount.add(visual);
  g.add(muralMount);
  const mural=credits.mural.original;
  const loader=new T.TextureLoader();
  const applyMural=texture=>{
    texture.colorSpace=T.SRGBColorSpace;
    texture.anisotropy=6;
    visual.material.color.set('#e7ddca');
    visual.material.map=texture;
    visual.material.needsUpdate=true; onTextureReady();
  };
  loader.load(photoPreviewUrl(mural,960),applyMural,undefined,()=>{
    loader.load(mural,applyMural,undefined,()=>{});
  });

  const hem=new T.HemisphereLight('#fef1e0','#574331',.88);
  g.add(hem);
  for(const [x,y,z,power,color] of [[0,6,4.7,34,'#ffe7be'],[-10,5,-4,13,'#ffd3a4'],[9,5,1,24,'#ffe2b9'],[1,5.8,-4.3,18,'#eabf80']]){
    const light=new T.PointLight(color,power,27,1.45);
    light.position.set(x,y,z);g.add(light);
  }
  const sun=new T.DirectionalLight('#f3d2a9',.64);
  sun.position.set(-4,8,15);
  g.add(sun);
  batch(g);
  return g;
}



