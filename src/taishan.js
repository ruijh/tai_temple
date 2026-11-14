import * as T from 'three';
import grid from './taishan-elevation.json';
import { mountainRoutes, mountainPlaces, jointAscent, sutraBranch } from './taishan-routes.js';
import { cliffRock, cliffRoutePoints } from './cliff-route-points.js';
import { box, column, roof, plaque, steps, batch } from './geometry.js';

const [west,south,east,north]=grid.bounds;
const origin=mountainPlaces.temple.at;
const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
const ratio=(value,low,high)=>clamp((value-low)/(high-low),0,1);
const lerp=T.MathUtils.lerp;
const base=150;
const vertical=.32;

function sample(lon,lat){
  const fx=ratio(lon,west,east)*(grid.width-1);
  const fy=ratio(lat,north,south)*(grid.height-1);
  const x=Math.min(grid.width-2,Math.floor(fx)), y=Math.min(grid.height-2,Math.floor(fy));
  const offset=y*grid.width+x;
  const a=grid.elevation;
  return lerp(lerp(a[offset],a[offset+1],fx-x),lerp(a[offset+grid.width],a[offset+grid.width+1],fx-x),fy-y);
}

function regionPoint(lon,lat,elevation=sample(lon,lat)){
  return new T.Vector3((lon-origin[0])*11100,(elevation-base)*vertical,(origin[1]-lat)*13500);
}

function coastPoint(lon,lat,elevation){
  const northward=lat-origin[1];
  const proportion=ratio(northward,.035,.063);
  const x=(lon-origin[0]+.027*proportion)*14800;
  const z=-530-northward*16600;
  const foothill=ratio(northward,.0007,.013);
  return new T.Vector3(x,-4+Math.max(0,elevation-base)*.33*foothill,z);
}

function terrain(transform,view){
  const values=[],colors=[],indices=[];
  const shades=['#6b7956','#3d6253','#536b61','#929580'].map(color=>new T.Color(color));
  const color=new T.Color();
  for(let j=0;j<grid.height;j++)for(let i=0;i<grid.width;i++){
    const index=j*grid.width+i;
    const elevation=grid.elevation[index];
    const p=transform(lerp(west,east,i/(grid.width-1)),lerp(north,south,j/(grid.height-1)),elevation);
    const lateral=(grid.elevation[index+1]??elevation)-elevation;
    const along=(grid.elevation[index+grid.width]??elevation)-elevation;
    const rough=ratio(Math.hypot(lateral,along),55,130);
    color.copy(shades[0]).lerp(shades[1],ratio(elevation,200,550)).lerp(shades[2],ratio(elevation,750,1440));
    color.lerp(shades[3],rough*.43).multiplyScalar(.90+.085*Math.sin(i*.71+j*.25)+.08*Math.cos(i*.18-j*.30));
    values.push(...p);
    colors.push(color.r,color.g,color.b);
    if(j===grid.height-1||i===grid.width-1)continue;
    indices.push(index,index+grid.width,index+1,index+1,index+grid.width,index+grid.width+1);
  }
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(values,3));
  geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return new T.Mesh(geometry,new T.MeshStandardMaterial({vertexColors:true,roughness:.98,flatShading:view==='mountain'}));
}

export const createTaishanBackdrop=()=>terrain(coastPoint,'backdrop');

function pathPoints(segment){
  if(segment.kind==='cable'){
    const [a,b]=segment.points.map(pair=>regionPoint(...pair).add(new T.Vector3(0,24,0)));
    return Array.from({length:33},(_,i)=>{
      const t=i/32;
      const p=a.clone().lerp(b,t);
      const e=(sample(lerp(segment.points[0][0],segment.points[1][0],t),lerp(segment.points[0][1],segment.points[1][1],t))-base)*vertical;
      p.y=Math.max(p.y,e+19);
      return p;
    });
  }
  if(segment.kind==='mapped')return segment.points.map(at=>regionPoint(...at).add(new T.Vector3(0,6.5,0)));
  const path=new T.CatmullRomCurve3(segment.points.map(([lon,lat])=>new T.Vector3(lon,0,lat)),false,'centripetal');
  return path.getPoints(139).map(p=>regionPoint(p.x,p.z).add(new T.Vector3(0,6.5,0)));
}

function routeLine(segment,color) {
  const group=new T.Group();
  const points=pathPoints(segment);
  const material=new T.MeshBasicMaterial({color,transparent:true,opacity:1,depthWrite:false,fog:false});
  const radius=segment.kind==='road'?2.2:1.85;
  if(segment.kind==='cable'){
    for(let i=0;i<points.length-2;i+=3){
      const curve=new T.LineCurve3(points[i],points[i+2]);
      group.add(new T.Mesh(new T.TubeGeometry(curve,1,radius,5,false),material));
    }
  }else{
    const mapped=segment.kind==='mapped';
    const curve=mapped?new T.CurvePath():new T.CatmullRomCurve3(points);
    if(mapped)for(let i=1;i<points.length;i++)curve.add(new T.LineCurve3(points[i-1],points[i]));
    group.add(new T.Mesh(new T.TubeGeometry(curve,mapped?points.length*5:points.length,radius,6,false),material));
  }
  return {group,material};
}

function mountainBuilding(material,place) {
  const g=new T.Group();
  if(place.model==='south'){
    for(const side of [-1,1]){
      box(g,material.brick,side*5,2.2,0,5.9,4.4,9.3);
      box(g,material.plaster,side*4.85,5.4,0,5.4,2,8.2);
    }
    for(let i=-8;i<=8;i++){
      const x=i*.26,bottom=2.45+1.2*Math.sqrt(1-(x/2.25)**2);
      box(g,material.stone,x,(4.45+bottom)/2,0,.28,4.45-bottom,9.3);
    }
    box(g,material.cut,0,4.6,0,16.2,.38,9.6);
    box(g,material.red,0,6.45,0,13.2,3.3,7.6);
    for(const x of [-5,-2.5,0,2.5,5]) box(g,material.door,x,6.55,3.85,1.92,2.55,.18);
    roof(g,material,{w:17.4,d:11,base:8.1,rise:3.5,style:'gable',gold:false});
    plaque(g,material,place.name,0,4.1,4.76,2.9,1);
    steps(g,material,{w:5.2,h:.65,z:4.8,edge:.58,n:4});
  }else if(place.model==='summit'){
    box(g,material.cut,0,.30,0,21,.60,14);
    box(g,material.red,0,3.4,0,16,6.5,10);
    roof(g,material,{w:19,d:13,base:6.65,rise:3.3,style:'gable',gold:false});
    plaque(g,material,'玉皇頂',0,5.6,5.2,3.6,1.1);
  }else{
    const stone=place.model!=='east';
    for(const x of [-3.4,3.4]){
      box(g,material.cut,x,.24,0,1.5,.48,2.5);
      column(g,stone?material.stone:material.red,x,3.08,0,.39,5.7);
    }
    box(g,stone?material.cut:material.wood,0,5.68,0,8.6,1,.72);
    roof(g,material,{w:10,d:3.65,base:6.23,rise:1.55,style:'gable',gold:false});
    plaque(g,material,place.name,0,5.71,.45,3.8,.90);
  }
  batch(g);
  return g;
}

export function createTaishanScene(material){
  const scene=new T.Scene();
  scene.background=new T.Color('#687f85');
  scene.fog=new T.FogExp2('#6b8386',.00023);
  scene.add(terrain(regionPoint,'mountain'));
  scene.add(new T.HemisphereLight('#eff7f3','#617064',2));
  const sun=new T.DirectionalLight('#ffe4c1',2.55);
  sun.position.set(-700,920,220);scene.add(sun);
  const routeLayers=new Map(), props=new Map(), places=new Map(), routesGroup=new T.Group();
  scene.add(routesGroup);
  const addRoute=(id,segments,color)=>{
    const strands=segments.map(segment=>routeLine(segment,color));
    for(const strand of strands)routesGroup.add(strand.group);
    routeLayers.set(id,strands);
  };
  for(const route of mountainRoutes) addRoute(route.id,route.segments,route.color);
  addRoute('joint',[jointAscent],mountainRoutes[0].color);
  addRoute('hongmen-cliff-branch',[sutraBranch],'#f3a582');
  for(const [id,place] of Object.entries(mountainPlaces)){
    const ground=regionPoint(...place.at);
    if(id==='temple'){
      const site=new T.Group();
      box(site,material.brick,0,2,0,28,4,46);
      box(site,material.yard,0,4.08,0,24,.25,42);
      box(site,material.red,0,5.8,-8,12,3.3,7.2);
      roof(site,material,{w:15,d:9,base:7.45,rise:2.4,style:'hip',gold:true});
      box(site,material.red,0,5.5,12,10,2.8,5.5);
      roof(site,material,{w:12,d:7,base:6.9,rise:1.9,style:'gable',gold:true});
      site.position.copy(ground);site.userData.mountain=id;
      batch(site);scene.add(site);props.set(id,site);
    }
    const mark=new T.Mesh(new T.SphereGeometry(place.model?4.7:3.2,12,8),new T.MeshBasicMaterial({color:'#f6d69c',fog:false}));
    mark.position.copy(ground);mark.position.y+=5;
    scene.add(mark);
    if(place.model){
      const building=mountainBuilding(material,place);
      building.position.copy(ground);building.position.y+=1.0;
      building.userData.mountain=id;
      scene.add(building);props.set(id,building);
    }
    places.set(id,{...place,ground});
  }
  for(const [id,point] of Object.entries(cliffRoutePoints)){
    places.set(id,{cliff:true,ground:regionPoint(...cliffRock(point).at)});
  }
  function chooseRoute(id){
    for(const [key,strands] of routeLayers){
      const active=!id||key===id||key==='joint'&&id==='dongyudao';
      for(const {group,material} of strands){
        group.visible=key==='joint'?id==='dongyudao':key==='hongmen-cliff-branch'?id==='hongmen':true;
        material.opacity=active?1:.19;
      }
    }
  }
  function setCloseView(close){
    routesGroup.visible=!close;
  }
  chooseRoute(null);
  return {scene,places,chooseRoute,setCloseView,picks:[...props.values()]};
}
