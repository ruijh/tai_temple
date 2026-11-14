import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createCampus, createHorizon, mainSite } from './campus.js';
import { createInterior, tiankuangCollision } from './interior.js';
import { createSecondaryInterior } from './secondary-interior.js';
import { rooms } from './rooms.js';
import { createTaishanScene } from './taishan.js';
import { makeMaterials } from './geometry.js';
import { modelDimensions, sites, siteById, stelae } from './data.js';
import { loadSteleTexture } from './remote-textures.js';

const vec=(values)=>new T.Vector3(...values);
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');

export function mountScene(host, { onPick, onPosition, onReady, onMountainPick, onMountainPosition }) {
  const renderer=new T.WebGLRenderer({antialias:true, powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
  renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.30;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=T.PCFShadowMap;
  renderer.shadowMap.autoUpdate=false;
  const canvas=renderer.domElement;
  canvas.tabIndex=0;
  canvas.setAttribute('aria-label','可交互的岱庙三维模型');
  host.append(canvas);

  const exterior=new T.Scene();
  exterior.background=new T.Color('#495c51');
  exterior.fog=new T.FogExp2('#5d7567',.00072);
  const material=makeMaterials();
  const campus=createCampus(material);
  const steleFaces=stelae.flatMap(({id})=>campus.picks.get(id)[0].children
    .filter(mesh=>mesh.userData.steleFace)
    .map(mesh=>({id,mesh,loading:null})));
  let restorationRequest=0;
  exterior.add(createHorizon(material),campus.scene);
  exterior.add(new T.HemisphereLight('#e4f1e4','#615846',1.60));
  const sun=new T.DirectionalLight('#ffe6c3',2.65);
  sun.position.set(-240,330,135);
  sun.target.position.set(0,0,-135);
  sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);
  Object.assign(sun.shadow.camera,{left:-290,right:290,top:320,bottom:-270,near:25,far:830});
  sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.normalBias=.14;
  sun.shadow.bias=-.0006;
  exterior.add(sun,sun.target);
  renderer.shadowMap.needsUpdate=true;

  const worldCam=new T.PerspectiveCamera(38,1,.6,3200);
  const indoorCam=new T.PerspectiveCamera(65,1,.07,140);
  const mountainCam=new T.PerspectiveCamera(47,1,1,6500);
  const controls=new OrbitControls(worldCam,canvas);
  controls.enableDamping=true;controls.dampingFactor=.10;
  controls.minDistance=8;controls.maxDistance=1900;
  controls.maxPolarAngle=Math.PI*.485;controls.minPolarAngle=.004;
  controls.zoomSpeed=.82;controls.rotateSpeed=.58;
  const interiors=new Map();
  let mountain, mountainFocus=null;
  let interior, activeHall;
  let mode='world', selected=null, move=null, indoorMove=null, currentView='overview';
  let dragging=null;
  let pointerCandidate=null;
  let ready=false;
  let dirty=true, quietFrames=0;
  const movement=new Set();
  const yawPitch=new T.Euler(0,0,0,'YXZ');
  const temp=new T.Vector3(), point=new T.Vector3(), projected=new Map();
  const ring=new T.Mesh(new T.RingGeometry(.962,1,56),new T.MeshBasicMaterial({color:'#e8bf7d',side:T.DoubleSide,transparent:true,opacity:.65,depthWrite:false}));
  ring.rotation.x=-Math.PI/2;
  ring.visible=false;
  exterior.add(ring);

  async function setSteleRestoration(enabled){
    const request=++restorationRequest;
    if(!enabled){
      for(const {mesh} of steleFaces)mesh.visible=false;
      dirty=true;
      return new Set();
    }
    await Promise.allSettled(steleFaces.map(face=>{
      const {mesh}=face;
      if(mesh.material.map)return;
      face.loading??=loadSteleTexture(mesh.userData.steleFace,mesh.scale.x/mesh.scale.y).then(texture=>{
        texture.anisotropy=renderer.capabilities.getMaxAnisotropy();
        mesh.material=new T.MeshStandardMaterial({map:texture,roughness:.98});
      }).finally(()=>{face.loading=null;});
      return face.loading;
    }));
    if(request!==restorationRequest)return new Set();
    const restored=new Set();
    for(const {id,mesh} of steleFaces){
      mesh.visible=Boolean(mesh.material.map);
      if(mesh.visible)restored.add(id);
    }
    dirty=true;
    return restored;
  }

  function framing(key) {
    const aspect=host.clientWidth/Math.max(1,host.clientHeight);
    const factor=Math.max(1, .95/Math.max(.32,aspect));
    if(key==='plan') return {at:[0,0,-128],eye:[0,Math.max(1015,520/aspect),-127.5]};
    if(key==='axis') return {at:[0,0,-153],eye:[0,158*factor,481*factor-153]};
    return {at:[0,0,-143],eye:[307*factor,454*factor,438*factor-143]};
  }
  function fly(eye,at,immediate=false){
    const to=vec(eye), aim=vec(at);
    if(immediate||reduced.matches){
      move=null;
      worldCam.position.copy(to);
      controls.target.copy(aim);
      controls.update();
    } else {
      move={start:performance.now(),from:worldCam.position.clone(),at:controls.target.clone(),to,aim};
    }
    dirty=true;
  }
  function overview(key,immediate=false){
    controls.minDistance=8;
    currentView=key;
    const {at,eye}=framing(key);
    ring.visible=false;
    fly(eye,at,immediate);
  }
  function positionMountain(id) {
    const place=mountain.places.get(id);
    mountain.setCloseView(Boolean(place&&!place.cliff));
    const aspect=mountainCam.aspect;
    if(id){
      const p=place.ground;
      const local=place.cliff ? .6 : place.model ? 1 : 1.65;
      mountainCam.position.copy(p).add(new T.Vector3(96*local,56*local,158*local));
      mountainCam.lookAt(p.x,p.y+12,p.z);
    }else{
      const scale=Math.max(1,1.55/aspect);
      const target=new T.Vector3(-483,115,-622);
      mountainCam.position.copy(target).add(new T.Vector3(273,935,1168).multiplyScalar(scale));
      mountainCam.lookAt(target);
    }
    dirty=true;
  }
  function showMountain(){
    mountain??=createTaishanScene(material);
    mode='mountain';move=null;controls.enabled=false;
    mountainFocus=null;
    resize();
  }
  function leaveMountain(){
    if(mode!=='mountain')return;
    mode='world';controls.enabled=true;dirty=true;
  }
  function mountainRoute(id){
    if(mode!=='mountain')return;
    mountain.chooseRoute(id);
    mountainFocus=null;
    positionMountain(null);
  }
  function locateMountain(id){
    if(mode!=='mountain'||!mountain.places.has(id))return;
    mountainFocus=id;
    positionMountain(id);
  }
  function focus(id,steleSide) {
    const site=siteById.get(id);
    if(!site) return;
    selected=id;
    currentView='focus';
    const dim=modelDimensions(id);
    const h=dim.height_m ?? site.estimated?.h ?? (site.kind ? 8 : 6);
    const spread=site.kind==='main'?51:site.kind==='wallgate'?52:site.near?Math.max(13,(dim.width_m??site.estimated?.w??12)*.88):site.kind?29:64;
    const aspect=host.clientWidth/Math.max(1,host.clientHeight);
    const offset=Math.max(1,.95/aspect);
    controls.minDistance=8;
    if(site.kind==='stele'){
      const {side}=site.evidence.faces[0];
      const angle=site.angle+((steleSide??side)==='back'?Math.PI:0);
      const distance=Math.max(site.height,site.w/Math.max(.32,aspect))*1.82;
      controls.minDistance=1.15;
      const x=site.x+distance*Math.sin(angle);
      const z=site.z+distance*Math.cos(angle);
      const center=site.y+site.height*.52;
      fly([x,center+.28,z],[site.x,center,site.z]);
      ring.visible=false;
      return;
    }
    if(id==='a-han'){
      fly([site.x-39*offset,51*offset,site.z+33*offset],[site.x+3,1.2,site.z-7]);
      ring.visible=false;
      return;
    }
    const angle=site.angle??(id==='b-houzai'?Math.PI:0);
    const sin=Math.sin(angle),cos=Math.cos(angle);
    if(site.focus){
      const [distance,height,aim]=site.focus;
      const front=distance*offset, side=front*.30;
      fly([site.x+front*sin+side*cos,height*offset,site.z+front*cos-side*sin],[site.x,aim,site.z]);
      ring.position.set(site.x,.19,site.z);
      ring.scale.setScalar(Math.max(1.8,(dim.width_m??site.estimated?.w??7)*.61));
      ring.visible=site.kind!=='wallgate'&&site.shape!=='loft'&&site.shape!=='corner';
      return;
    }
    const side=spread*.63*offset, front=spread*1.25*offset;
    fly([site.x+side*cos+front*sin,h*.8+12.5*offset,site.z+front*cos-side*sin],[site.x,h*.43,site.z]);
    ring.position.set(site.x,.21,site.z);
    ring.scale.setScalar(site.kind==='main'?29:site.kind==='wallgate'?25:site.near?(dim.width_m??site.estimated?.w??12)*.6:site.kind?14:site.w/2+2);
    ring.visible=true;
    dirty=true;
  }
  function lookFromLoft(){
    focus('b-houzai-loft');
    ring.visible=false;
    fly([0,9,-416],[0,292,-1350]);
  }
  function lookThroughGate(id){
    const site=siteById.get(id);
    ring.visible=false;
    currentView='focus';
    fly([site.x,3.05,site.z+13],[site.x,3.1,site.z-20]);
  }
  window.addEventListener('blur',()=>{movement.clear();dragging=null;});
  const resize=()=>{
    const w=host.clientWidth,h=host.clientHeight;
    if(!w||!h) return;
    renderer.setSize(w,h,false);
    worldCam.aspect=indoorCam.aspect=mountainCam.aspect=w/h;
    indoorCam.fov=w/h<.8 ? 78 : 64;
    worldCam.updateProjectionMatrix();indoorCam.updateProjectionMatrix();
    mountainCam.updateProjectionMatrix();
    if(mode==='mountain')positionMountain(mountainFocus);
    if(mode==='world' && currentView!=='focus') overview(currentView,true);
    dirty=true;
  };
  const observer=new ResizeObserver(resize);observer.observe(host);
  resize();overview('overview',true);

  function poseFor(key) {
    const stop=interior.stops[key], position=vec(stop.position);
    const camera=new T.PerspectiveCamera();
    camera.position.copy(position);
    camera.lookAt(vec(stop.look));
    return {position,rotation:camera.quaternion.clone()};
  }
  function go(key,instant=false){
    if(mode!=='hall'||!interior.stops[key]) return;
    movement.clear();
    const goal=poseFor(key);
    if(instant||reduced.matches){
      indoorMove=null;
      indoorCam.position.copy(goal.position);indoorCam.quaternion.copy(goal.rotation);
      yawPitch.setFromQuaternion(indoorCam.quaternion,'YXZ');
    }else{
      indoorMove={start:performance.now(),from:indoorCam.position.clone(),rotation:indoorCam.quaternion.clone(),goal};
    }
    dirty=true;
  }
  function enter(id) {
    const room=rooms[id];
    if(!room || mode==='hall') return;
    if(!interiors.has(id)){
      const estimated=siteById.get(id).estimated;
      const {width_m:width=estimated?.w,depth_m:depth=estimated?.d,facade_bays:bays=estimated?.bays}=modelDimensions(id);
      const bounds={width,depth};
      const scene=new T.Scene();
      scene.background=new T.Color('#34271b');
      const {group,blocked}=id===mainSite.id
        ? {group:createInterior(material,()=>{dirty=true;}),blocked:tiankuangCollision}
        : createSecondaryInterior(id,material,bounds,bays,room);
      scene.add(group);
      interiors.set(id,{scene,bounds,blocked,stops:room.stops});
    }
    interior=interiors.get(id);activeHall=id;
    mode='hall';move=null;renderer.toneMappingExposure=1.03;
    controls.enabled=false;
    go('entry',true);
    resize();canvas.focus({preventScroll:true});
  }
  function exit(){
    if(mode!=='hall') return;
    mode='world';renderer.toneMappingExposure=1.30;indoorMove=null;movement.clear();dragging=null;
    controls.enabled=true;
    focus(activeHall);
    dirty=true;
  }

  const raycaster=new T.Raycaster();
  const mouse=new T.Vector2();
  const meshes=[...campus.picks.values()].flat();
  function pickRay(e,camera) {
    const rect=canvas.getBoundingClientRect();
    mouse.set(2*(e.clientX-rect.left)/rect.width-1,1-2*(e.clientY-rect.top)/rect.height);
    raycaster.setFromCamera(mouse,camera);
  }
  function hit(e) {
    pickRay(e,worldCam);
    const best=raycaster.intersectObjects(meshes,true)[0];
    if(!best) return null;
    let root=best.object;
    while(root && !root.userData.site) root=root.parent;
    return root ? {id:root.userData.site,enter:root.userData.enter===true} : null;
  }
  function stopAnimation(){
    if(move){move=null;currentView='focus';}
    dirty=true;
  }
  canvas.addEventListener('wheel',stopAnimation,{passive:true});
  canvas.addEventListener('pointerdown', e=>{
    if(mode==='mountain'){
      pointerCandidate=e.button===0?{id:e.pointerId,x:e.clientX,y:e.clientY}:null;
      return;
    }
    stopAnimation();
    if(mode==='world') {
      pointerCandidate=e.button===0 ? {id:e.pointerId,x:e.clientX,y:e.clientY} : null;
      return;
    }
    if(e.button!==0 || dragging) return;
    indoorMove=null;
    yawPitch.setFromQuaternion(indoorCam.quaternion,'YXZ');
    dragging={id:e.pointerId,x:e.clientX,y:e.clientY};
    canvas.setPointerCapture(e.pointerId);
    canvas.style.cursor='grabbing';
  });
  canvas.addEventListener('pointermove',e=>{
    if(mode!=='hall'){
      if(pointerCandidate && Math.hypot(e.clientX-pointerCandidate.x,e.clientY-pointerCandidate.y)>7) pointerCandidate=null;
      return;
    }
    if(dragging?.id!==e.pointerId) return;
    yawPitch.y-=(e.clientX-dragging.x)*.0034;
    yawPitch.x=T.MathUtils.clamp(yawPitch.x-(e.clientY-dragging.y)*.0034,-1.42,1.42);
    indoorCam.quaternion.setFromEuler(yawPitch);
    dragging.x=e.clientX;dragging.y=e.clientY;dirty=true;
  });
  const release=(e)=>{
    if(mode==='hall'){
      if(dragging?.id===e.pointerId) dragging=null;
      canvas.style.cursor='';
      return;
    }
    if(pointerCandidate?.id===e.pointerId && e.type==='pointerup' &&
       Math.hypot(e.clientX-pointerCandidate.x,e.clientY-pointerCandidate.y)<8){
      if(mode==='mountain'){
        pickRay(e,mountainCam);
        let object=raycaster.intersectObjects(mountain.picks,true)[0]?.object;
        while(object&&!object.userData.mountain)object=object.parent;
        if(object)onMountainPick(object.userData.mountain);
      }else{
        const info=hit(e);
        if(info) onPick(info.id,info.enter);
      }
    }
    pointerCandidate=null;
  };
  canvas.addEventListener('pointerup',release);
  canvas.addEventListener('pointercancel',release);
  canvas.addEventListener('lostpointercapture',e=>{
    if(dragging?.id===e.pointerId) dragging=null;
    canvas.style.cursor='';
  });

  const codeMap={ArrowUp:'KeyW',ArrowDown:'KeyS',ArrowLeft:'KeyA',ArrowRight:'KeyD'};
  const keys=new Set(['KeyW','KeyA','KeyS','KeyD']);
  function key(code,pressed){
    const action=codeMap[code]||code;
    if(!keys.has(action)) return false;
    if(pressed) movement.add(action); else movement.delete(action);
    return true;
  }
  window.addEventListener('keydown',e=>{
    if(mode==='hall' && !e.ctrlKey&&!e.metaKey&&!e.altKey && !document.querySelector('dialog[open]') && key(e.code,true)) e.preventDefault();
  });
  window.addEventListener('keyup',e=>key(e.code,false));

  function advance(delta) {
    if(!movement.size) return;
    indoorMove=null;
    yawPitch.setFromQuaternion(indoorCam.quaternion,'YXZ');
    const forward=Number(movement.has('KeyW'))-Number(movement.has('KeyS'));
    const right=Number(movement.has('KeyD'))-Number(movement.has('KeyA'));
    const speed=4.25*delta/Math.max(1,Math.hypot(forward,right));
    const pos=indoorCam.position;
    const {width,depth}=interior.bounds;
    const x=T.MathUtils.clamp(pos.x+speed*(-forward*Math.sin(yawPitch.y)+right*Math.cos(yawPitch.y)),-width/2+.92,width/2-.92);
    const z=T.MathUtils.clamp(pos.z+speed*(-forward*Math.cos(yawPitch.y)-right*Math.sin(yawPitch.y)),-depth/2+.75,depth/2-.68);
    if(!interior.blocked(x,pos.z)) pos.x=x;
    if(!interior.blocked(pos.x,z)) pos.z=z;
    dirty=true;
  }

  function updateLabels() {
    const width=host.clientWidth,height=host.clientHeight;
    for(const site of sites){
      const h=site.kind==='stele' ? site.y+site.height-.35 : (site.y??0)+(modelDimensions(site.id).height_m ?? site.estimated?.h ?? (site.kind?6:3));
      const z=site.id===mainSite.id? site.z+3 : site.z;
      point.set(site.x,h+1.0,z).project(worldCam);
      const x=(point.x*.5+.5)*width,y=(-point.y*.5+.5)*height;
      const viewDistance=worldCam.position.distanceTo(temp.set(site.x,0,site.z));
      projected.set(site.id,{x,y,visible:x>25&&x<width-25&&y>117&&y<height-45&&point.z<1&&point.z>-1,
        close:viewDistance<95});
    }
    onPosition(projected,currentView,selected);
  }

  let then=performance.now();
  const smooth=t=>t*t*(3-2*t);
  function render(now) {
    const dt=Math.min(.05,(now-then)/1000);then=now;
    if(mode==='world'){
      if(move) {
        const t=Math.min(1,(now-move.start)/730), k=smooth(t);
        worldCam.position.lerpVectors(move.from,move.to,k);
        controls.target.lerpVectors(move.at,move.aim,k);
        if(t===1)move=null;
        dirty=true;
      }
      const changed=controls.update();
      if(changed) quietFrames=6;
      if(dirty||quietFrames>0||!ready){
        renderer.render(exterior,worldCam);
        updateLabels();
        if(!ready){ready=true;onReady();}
        quietFrames=Math.max(0,quietFrames-1);
      }
    }else if(mode==='mountain'){
      if(dirty){
        renderer.render(mountain.scene,mountainCam);
        const positions=new Map();
        for(const [id,place] of mountain.places){
          point.copy(place.ground);point.y+=12;point.project(mountainCam);
          const x=(point.x*.5+.5)*host.clientWidth,y=(-point.y*.5+.5)*host.clientHeight;
          positions.set(id,{x,y,visible:point.z<1&&point.z>-1&&x>-5&&x<host.clientWidth+5&&y>99&&y<host.clientHeight-35});
        }
        onMountainPosition(positions,mountainFocus);
      }
    }else{
      if(indoorMove){
        const t=Math.min(1,(now-indoorMove.start)/690), k=smooth(t);
        indoorCam.position.lerpVectors(indoorMove.from,indoorMove.goal.position,k);
        indoorCam.quaternion.slerpQuaternions(indoorMove.rotation,indoorMove.goal.rotation,k);
        if(t===1){
          yawPitch.setFromQuaternion(indoorCam.quaternion,'YXZ');
          indoorMove=null;
        }
        dirty=true;
      }
      advance(dt);

      if(dirty) renderer.render(interior.scene,indoorCam);
    }
    dirty=false;
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
  return {overview,focus,enter,exit,go,key,lookFromLoft,lookThroughGate,showMountain,leaveMountain,mountainRoute,locateMountain,setSteleRestoration};
}



