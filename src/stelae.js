import * as T from 'three';
import { box, orb, shape, beam } from './geometry.js';

const castGeometry = new Map();
const plane = new T.PlaneGeometry(1,1);

function addFaces(group,site,stone,width,height,depth,bottom) {
  for(const entry of site.evidence.faces){
    const sign=entry.side==='front'?1:-1;
    const [u,v,w,h]=entry.rect??[0,0,1,1];
    const face=shape(group,plane,stone,sign*width*(u+w/2-.5),bottom+height*(1-v-h/2),
      sign*(depth/2+.006),width*w,height*h,1);
    face.rotation.y=sign===1?0:Math.PI;
    face.castShadow=false;
    face.visible=false;
    face.userData.steleFace=entry;
    face.userData.dynamic=true;
  }
}

function headGeometry(form){
  if(castGeometry.has(form)) return castGeometry.get(form);
  const outline=new T.Shape();
  outline.moveTo(-.5,0);outline.lineTo(.5,0);
  outline.bezierCurveTo(.49,.56,.25,1,0,1);
  outline.bezierCurveTo(-.25,1,-.49,.56,-.5,0);
  outline.closePath();
  const geometry=new T.ExtrudeGeometry(outline,{depth:1,bevelEnabled:false,curveSegments:12});
  geometry.translate(0,0,-.5);
  castGeometry.set(form,geometry);
  return geometry;
}

function chamfered(parent,m,x,y,z,w,h,d,top){
  shape(parent,new T.CylinderGeometry(.5*top,.5,1,4,1,false,Math.PI/4),m,x,y,z,w*Math.SQRT2,h,d*Math.SQRT2);
}

function tablet(g,m,site,w,h,d,bottom,{arch=false,photographed=true}={}){
  const top=arch ? Math.min(h*.32, site.form==='turtle' ? w*.63 : w*.42) : 0;
  const plain=h-top;
  const stone=site.tone==='dark'?m.footing:m.cut;
  box(g,stone,0,bottom+plain/2,0,w,plain,d);
  if(arch) shape(g,headGeometry(site.form),stone,0,bottom+plain,0,w,top,d);
  if(photographed) addFaces(g,site,stone,w,plain,d,bottom);
}

function turtle(g,m,site,baseH) {
  const w=site.id==='s-2084'?2.75:2.62, d=site.id==='s-2084'?5:4.25;
  box(g,m.footing,0,.14,.15,w+.32,.28,d+.18);
  orb(g,m.stone,0,baseH*.49,0,w*.51,baseH*.48,d*.36);
  orb(g,m.cut,0,baseH*.49,d*.39,w*.22,baseH*.28,d*.16);
  orb(g,m.stone,0,baseH*.45,-d*.35,w*.19,baseH*.22,d*.17);
  for(const x of [-w*.39,w*.39]) for(const z of [-d*.24,d*.21]){
    orb(g,m.cut,x,.34,z,w*.23,.24,d*.14);
  }
  for(const x of [-w*.10,w*.10]) orb(g,m.dark,x,baseH*.54,d*.513,.045);
  const y=baseH*.48;
  beam(g,m.footing,[-w*.16,y,d*.52],[w*.16,y,d*.52],.028);
}

export function createStele(m,site){
  const g=new T.Group();
  const {w,d,height,form}=site;
  if(form==='embedded'){
    box(g,m.footing,0,height/2,0,w,height,d);
    addFaces(g,site,m.footing,w,height,d,0);
    return g;
  }
  const base=site.baseH??(form==='turtle'?1.43:form==='flat'?.10:.24);
  if(form==='turtle') turtle(g,m,site,base);
  else if(form==='round') {
    box(g,m.footing,0,.08,0,w*1.60,.16,Math.max(.77,d*2.28));
    chamfered(g,m.cut,0,(base+.16)/2,0,w*1.42,base-.16,Math.max(.7,d*1.98),.83);
  } else {
    box(g,m.footing,0,base*.2,0,w*1.3,base*.4,Math.max(.62,d*1.72));
    box(g,m.cut,0,base*.68,0,w*1.19,base*.64,Math.max(.54,d*1.57));
  }
  if(form==='tablet'){
    const cap=site.headH??Math.max(.26,height-base-(site.bodyH??height*.63));
    const body=site.bodyH??height-base-cap;
    tablet(g,m,site,w,body,d,base);
    box(g,m.stone,0,base+body+cap/2,0,w*1.12,cap,d*1.14);
    box(g,m.cut,0,height-.045,0,w*1.16,.09,d*1.16);
    return g;
  }
  if(form==='turtle' && site.bodyH){
    tablet(g,m,site,w,site.bodyH,d,base);
    const headY=base+site.bodyH,capH=height-headY;
    tablet(g,m,site,site.headW,capH,site.headD,headY,{arch:true,photographed:false});
    return g;
  }
  tablet(g,m,site,w,height-base,d,base,{arch:form==='turtle'||form==='round'});
  return g;
}

