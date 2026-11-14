import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const rng = (seed = 85) => () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
};

function texture(w, h, draw, repeat = false) {
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  draw(canvas.getContext('2d'), w, h);
  const tex = new T.CanvasTexture(canvas);
  tex.colorSpace = T.SRGBColorSpace;
  if (repeat) tex.wrapS = tex.wrapT = T.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

function brickTexture(stone = false) {
  return texture(256, 256, (c, w, h) => {
    const random = rng(stone ? 34 : 68);
    c.fillStyle = stone ? '#97978b' : '#575854'; c.fillRect(0, 0, w, h);
    const bw = stone ? 85 : 64, bh = stone ? 64 : 32;
    for (let row = 0; row < h/bh; row++) {
      for (let x = -bw; x < w; x += bw) {
        const value = Math.floor((stone ? 163 : 98) + random()*26);
        c.fillStyle = 'rgb('+value+','+(value-2)+','+(value-(stone ? 12 : 5))+')';
        c.fillRect(x+(row%2 ? bw/2 : 0)+1,row*bh+1,bw-2,bh-2);
      }
    }
    for (let i = 0; i < 3500; i++) {
      c.fillStyle = random() > .5 ? '#ffffff12' : '#181b1820';
      c.fillRect(random()*w,random()*h,1+random()*2,1);
    }
  }, true);
}

function tileTexture(gold) {
  return texture(96, 128, (c,w,h) => {
    const grad = c.createLinearGradient(0,0,w,0);
    for (const [offset,a,b] of [
      [0,'#a96b2b','#484d48'],[.18,'#ce8b3c','#5d6561'],
      [.43,'#f0bf69','#808781'],[.55,'#eab35c','#6f7972'],
      [.77,'#b87932','#505753'],[1,'#a56a2b','#444a46']
    ]) grad.addColorStop(offset,gold?a:b);
    c.fillStyle=grad;c.fillRect(0,0,w,h);
    const random=rng(851);
    for(let i=0;i<650;i++){
      c.fillStyle=random()>.5?'#ffffff12':'#24150f18';
      c.fillRect(random()*w,random()*h,random()*4+1,1+random()*2);
    }
    c.fillStyle=gold?'#713e2450':'#272d2944';
    c.fillRect(0,0,w,3);c.fillRect(0,h/2,w,2);
    c.fillStyle=gold?'#fff4cf45':'#e5e4d638';
    c.fillRect(0,3,w,2);c.fillRect(0,h/2+2,w,1);
  },true);
}

function paintedBeam() {
  return texture(256,54,(c,w,h)=>{
    c.fillStyle='#28585c';c.fillRect(0,0,w,h);
    c.fillStyle='#b59351';c.fillRect(0,2,w,2);c.fillRect(0,h-4,w,2);
    c.strokeStyle='#c0a161';c.lineWidth=1.4;
    for(let x=13;x<w;x+=26){
      c.beginPath();c.moveTo(x,9);c.lineTo(x+12,27);c.lineTo(x,45);c.lineTo(x-12,27);c.closePath();c.stroke();
      c.beginPath();c.arc(x,27,5,0,Math.PI*2);c.stroke();
    }
    c.fillStyle='#57827b';c.fillRect(0,7,w,2);c.fillRect(0,45,w,2);
  },true);
}

function doorTexture() {
  return texture(128,180,(c,w,h)=>{
    c.fillStyle='#5c2823';c.fillRect(0,0,w,h);
    c.fillStyle='#3f241e';c.fillRect(9,10,w-18,104);
    c.strokeStyle='#a16750';c.lineWidth=2;
    c.strokeRect(6,7,w-12,h-14);c.strokeRect(9,114,w-18,52);
    c.save();c.beginPath();c.rect(9,10,w-18,104);c.clip();
    for(let i=-124;i<w+121;i+=13){
      c.beginPath();c.moveTo(i,8);c.lineTo(i+104,115);c.stroke();
      c.beginPath();c.moveTo(i,8);c.lineTo(i-104,115);c.stroke();
    }
    c.restore();
    c.strokeStyle='#9b5c43';c.strokeRect(13,120,w-26,40);
    c.fillStyle='#b8894c';c.fillRect(w/2-4,120,8,4);
  });
}

export function makeMaterials() {
  const surface=(color,options)=>new T.MeshStandardMaterial({color,roughness:.86,...options});
  return {
    brick:surface('#ded9ca',{map:brickTexture()}),
    stone:surface('#ccc4aa',{map:brickTexture(true)}),
    cut:surface('#c1b498'), lightStone:surface('#d1c6ad'), footing:surface('#918975'),
    red:surface('#873c2d'), plaster:surface('#a65942'), wood:surface('#602f23'),
    darkWood:surface('#39251b'), cream:surface('#c3a57a'), dark:surface('#211f18'),
    teal:surface('#326464'), painted:surface('#e3c89e',{map:paintedBeam()}),
    amber:surface('#c08a42'), gilt:surface('#d3ac60',{roughness:.52,metalness:.18}),
    goldRoof:surface('#f3cc91',{map:tileTexture(true),side:T.DoubleSide}),
    greyRoof:surface('#d7ded3',{map:tileTexture(false),side:T.DoubleSide}),
    goldRidge:surface('#bb7e3a'), greyRidge:surface('#59645c'),
    door:surface('#dbb391',{map:doorTexture()}),
    terrain:surface('#444e3f'), yard:surface('#6b6b53'), grass:surface('#4d6047'),
    moss:surface('#46543b'), curb:surface('#838265'), pavement:surface('#96907b'),
    soil:surface('#505747'), water:surface('#3f6966',{roughness:.34}),
    iron:surface('#4d4a3b',{roughness:.63,metalness:.35}),
    bronze:surface('#75613c',{roughness:.57,metalness:.33}),
    wallPanel:surface('#827050'), muralBlank:surface('#a0885e'),
  };
}

const cube = new T.BoxGeometry(1,1,1);
const cylinder = new T.CylinderGeometry(1,1,1,12);
const taper = new T.CylinderGeometry(.87,1,1,12);
const sphere = new T.SphereGeometry(1,12,8);

export function shape(parent, geometry, material, x, y, z, sx=1, sy=1, sz=1) {
  const mesh = new T.Mesh(geometry,material);
  mesh.position.set(x,y,z);
  mesh.scale.set(sx,sy,sz);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
export const box=(p,m,x,y,z,w,h,d)=>shape(p,cube,m,x,y,z,w,h,d);
export const column=(p,m,x,y,z,r,h)=>shape(p,taper,m,x,y,z,r,h,r);
export const orb=(p,m,x,y,z,sx,sy=sx,sz=sx)=>shape(p,sphere,m,x,y,z,sx,sy,sz);
export const round=(p,m,x,y,z,r,h)=>shape(p,cylinder,m,x,y,z,r,h,r);

export function beam(parent, material, from, to, thickness=.14) {
  const a=new T.Vector3(...from), b=new T.Vector3(...to), d=b.clone().sub(a);
  const middle=a.clone().addScaledVector(d,.5);
  const mesh=shape(parent,cylinder,material,middle.x,middle.y,middle.z,thickness,d.length(),thickness);
  mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());
  return mesh;
}
export function row(count, size) {
  return Array.from({length:count+1},(_,i)=>size*(i/count-.5));
}

export function batch(parent) {
  parent.updateMatrixWorld(true);
  const inverse=parent.matrixWorld.clone().invert();
  const groups=new Map();
  const toRemove=[];
  parent.traverse(mesh=>{
    if(!mesh.isMesh || mesh.isInstancedMesh || mesh.userData.dynamic || Array.isArray(mesh.material)) return;
    const key=mesh.material.uuid+':'+mesh.castShadow+':'+mesh.receiveShadow;
    const bucket=groups.get(key) || {material:mesh.material,shadow:mesh.castShadow,receive:mesh.receiveShadow,geometry:[]};
    const source=mesh.geometry;
    let cloned=source.index ? source.toNonIndexed() : source.clone();
    cloned.applyMatrix4(inverse.clone().multiply(mesh.matrixWorld));
    for (const name of Object.keys(cloned.attributes)) {
      if(!['position','normal','uv'].includes(name)&&!(name==='color'&&mesh.material.vertexColors))cloned.deleteAttribute(name);
    }
    bucket.geometry.push(cloned);
    groups.set(key,bucket);
    toRemove.push(mesh);
  });
  toRemove.forEach(mesh=>mesh.removeFromParent());
  for(const group of groups.values()){
    const geometry=mergeGeometries(group.geometry);
    group.geometry.forEach(geometry=>geometry.dispose());
    if(!geometry) throw new Error('无法合并场景网格');
    const mesh=new T.Mesh(geometry,group.material);
    mesh.castShadow=group.shadow;mesh.receiveShadow=group.receive;
    parent.add(mesh);
  }
}

function roofSurface(parent, material, point, across, along, uTiles, vTiles) {
  const geometry = new T.BufferGeometry();
  const positions=[],uvs=[], index=[];
  for (let j=0;j<=along;j++) {
    for (let i=0;i<=across;i++) {
      const u=i/across,v=j/along;
      positions.push(...point(u,v));uvs.push(u*uTiles,v*vTiles);
    }
  }
  for(let j=0;j<along;j++) for(let i=0;i<across;i++){
    const a=j*(across+1)+i,b=a+across+1;
    index.push(a,b,a+1,b,b+1,a+1);
  }
  geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  geometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  shape(parent,geometry,material,0,0,0);
}

export function roof(parent,m,{w,d,base,rise,style='hip',gold=true,topW,topD,ornate=false}) {
  const tile=gold?m.goldRoof:m.greyRoof;
  const ridgeMat=gold?m.goldRidge:m.greyRidge;
  const rx=w/2,rz=d/2;
  const rounded=style.startsWith('roll');
  const hard=style==='hard'||style==='roll';
  const gabled=style==='gable'||style==='rollGable';
  const ridgeX=topW ? topW/2 : hard ? rx : Math.max(rx*.33,rx-rz*.83);
  const ridgeZ=topD ? topD/2 : 0;
  function cross(v){
    const elevation=base+rise*(rounded?Math.sin(v*Math.PI/2):.54*v+.46*v*v);
    let x=T.MathUtils.lerp(rx,ridgeX,v);
    if(gabled) x=T.MathUtils.lerp(rx,ridgeX,Math.min(1,v/.49));
    return [x, elevation, T.MathUtils.lerp(rz,ridgeZ,v)];
  }
  function corner(v, sx, sz) {
    const [x,y,z]=cross(v);
    return [sx*x,y+Math.min(.65,d*.035)*((1-v)**3),sz*z];
  }
  for(const sign of [-1,1]){
    roofSurface(parent,tile,(u,v)=>{
      const [x,y,z]=cross(v);
      return [(u*2-1)*x,y+Math.min(.65,d*.035)*(Math.abs(u*2-1)**6)*((1-v)**3),sign*z];
    },32,12,w/.4,d*.8);
    if(!hard){
      roofSurface(parent,tile,(u,t)=>{
        const v=gabled ? t*.49 : t;
        const [x,y,z]=cross(v);
        return [sign*x,y+Math.min(.65,d*.035)*(Math.abs(u*2-1)**6)*((1-v)**3),(u*2-1)*z];
      },22,12,d/.43,d*.7);
    }
    if(gabled || hard){
      const start=hard?0:.49;
      const gable=m.plaster.clone(); gable.side=T.DoubleSide;
      roofSurface(parent,gable,(u,t)=>{
        const [x,y,z]=cross(start+(1-start)*t);
        return [sign*(x-.05),y,(u*2-1)*z];
      },10,10,1,1);
    }
    for (const side of [-1,1]){
      if(hard) continue;
      for(let n=0;n<10;n++){
        beam(parent,ridgeMat,corner(n/10,sign,side),corner((n+1)/10,sign,side),ornate?.13:.09);
      }
    }
  }
  if(!rounded) beam(parent,ridgeMat,[-ridgeX,base+rise+.08,0],[ridgeX,base+rise+.08,0],ornate?.23:.12);
  if(ornate&&!rounded){
    for(const sign of [-1,1]){
      const x=sign*(ridgeX-.05), y=base+rise+.35;
      const finial=orb(parent,ridgeMat,x,y,0,.47,.6,.23);
      finial.rotation.z=-sign*.42;
      orb(parent,m.amber,x+sign*.18,y+.4,0,.17,.24,.15);
      for(const dir of [-1,1]) for(let n=1;n<=5;n++){
        const [cx,cy,cz]=corner(n*.045,sign,dir);
        orb(parent,ridgeMat,cx,cy+.17,cz,.13,.22,.12);
      }
    }
  }
}

export function plaque(parent,m,text,x,y,z,w,h) {
  box(parent,m.gilt,x,y,z,w+.14,h+.14,.14);
  const label=texture(256,128,(c,cw,ch)=>{
    c.fillStyle='#244d58';c.fillRect(0,0,cw,ch);
    c.strokeStyle='#c5a767';c.lineWidth=4;c.strokeRect(6,6,cw-12,ch-12);
    c.fillStyle='#e7c877';c.textAlign='center';c.textBaseline='middle';
    c.font='bold 54px STSong, SimSun, serif';c.fillText(text,cw/2,ch/2+3,cw-22);
  });
  const mat=new T.MeshBasicMaterial({map:label});
  const frame=shape(parent,new T.PlaneGeometry(w,h),mat,x,y,z+.085);
  frame.castShadow=false;
}

export function pillarCouplet(parent, entry, {x,y,z,width,height,rotation=0}) {
  const scheme={
    red:['#84332c','#ebca80'],
    blueGold:['#244881','#ebca80'],
    blueWhite:['#234b9b','#fff2d6'],
    black:['#252921','#e9c274'],
    stone:['#aea08a','#6b3029'],
  };
  const [ground,ink]=scheme[entry.finish];
  const knownLines=[[x,entry.upper],[-x,entry.lower]];
  for(const [px,line] of knownLines){
    const chars=[...line];
    const label=texture(128,1536,(ctx,w,h)=>{
      ctx.fillStyle=ground;
      ctx.fillRect(0,0,w,h);
      ctx.strokeStyle='#c2a166';
      ctx.lineWidth=6;
      ctx.strokeRect(5,8,w-10,h-16);
      ctx.lineWidth=2;
      ctx.strokeRect(14,24,w-28,h-48);
      ctx.textAlign='center';
      ctx.textBaseline='middle';
      ctx.fillStyle=ink;
      const spacing=(h-112)/chars.length;
      ctx.font='bold '+Math.floor(Math.min(spacing*.94,w*.77))+'px KaiTi, STKaiti, SimSun, serif';
      for(const [i,char] of chars.entries()) ctx.fillText(char,w/2,56+(i+.5)*spacing,w-34);
    });
    const mat=new T.MeshBasicMaterial({map:label});
    const board=shape(parent,new T.PlaneGeometry(width,height),mat,px*Math.cos(rotation),y,z);
    board.rotation.y=rotation;
    board.castShadow=false;
  }
}

export function steps(parent,m,{w,h,z,edge,n=7}) {
  for(let i=0;i<n;i++){
    const y=(i+1)*h/n;
    box(parent,m.cut,0,y/2,z+edge*(n-i-.5),w,y,edge+.025);
    box(parent,m.lightStone,0,y-.035,z+edge*(n-i-.5),w+.07,.07,edge+.04);
  }
}

export function rail(parent,m,x1,z1,x2,z2,y) {
  const count=Math.max(1,Math.round(Math.hypot(x2-x1,z2-z1)/1.65));
  const x=(x2-x1)/count,z=(z2-z1)/count;
  const dx=Math.max(.18,Math.abs(x)),dz=Math.max(.18,Math.abs(z));
  for(let i=0;i<=count;i++){
    const px=x1+i*x,pz=z1+i*z;
    box(parent,m.lightStone,px,y+.51,pz,.18,1.02,.18);
    box(parent,m.cut,px,y+.98,pz,.27,.11,.27);
    if(i===count) continue;
    box(parent,m.lightStone,px+x/2,y+.67,pz+z/2,dx,.10,dz);
    box(parent,m.lightStone,px+x/2,y+.24,pz+z/2,dx,.14,dz);
  }
}

