import { axis, yards, sideHalls, landmarks, stelae, stoneCatalog, sites, siteById, records, sources, credits, enclosure, hallInterior, treeSites } from './data.js';
import { rooms } from './rooms.js';
import { couplets, coupletPlaces, coupletNotes } from './couplets.js';
import { mountScene } from './view.js';
import { mountainPlaces, mountainRoutes } from './taishan-routes.js';
import { createInscriptionViewer, hasInscription, hasInscriptionPhoto, hasTranscription } from './inscription-viewer.js';
import { inscriptions } from './inscription-texts.js';
import archivalInscriptions from './archival-inscriptions.json';
import { createCliffGallery } from './cliff-gallery.js';
import { cliffInscriptions, cliffSections } from './cliff-inscriptions.js';
import { cliffMapSource, cliffRoutePoints } from './cliff-route-points.js';
import { hongmenPathSource } from './taishan-hongmen-path.js';
import { ancientTrees, pendingTreeLocations, treeLocations, treeRoute, treesById } from './ancient-trees.js';
import { createTreeGuide } from './tree-guide.js';
import { loadPhotoPreview } from './remote-images.js';

const $ = id => document.getElementById(id);
const stage=$('stage'), detail=$('detail-panel'), hint=$('scene-hint');
const route=$('route-list'), minimap=$('minimap'), labels=$('labels');
const guide=$('guide-dialog'), about=$('about-dialog'), stonesDialog=$('stone-dialog');
const coupletDialog=$('couplet-dialog'), coupletContent=$('couplet-content');
const coupletGroup=$('couplet-group'), coupletQuery=$('couplet-query'), coupletReset=$('couplet-reset');
const viewLabels=new Map(), routeButtons=new Map(), mapButtons=new Map();
const hallId='b-tiankuang';
const roomIds=Object.keys(rooms);
const annexes=[...sideHalls,...landmarks];
const stoneWrap=stoneCatalog.filter(stone=>stone.area==='a-han');
let selected=hallId, mode='world', currentView='overview', stop='entry', controller, renderFailed=false;
let activeMountainRoute=null, activeMountainPlace=null;
let activeTreeStop=null;
const treeRouteButtons=new Map();
const redRoute=mountainRoutes.find(route=>route.id==='hongmen');
const cliffSectionAtPlace={red:'red',middle:'yunbu',south:'shibapan',peak:'yuhuang'};
const mappedCliffs=cliffInscriptions.filter(entry=>cliffRoutePoints[entry.id]);
const mappedById=new Map(mappedCliffs.map(entry=>[entry.id,entry]));
const individualCliffLabels=mappedCliffs.filter(entry=>!cliffRoutePoints[entry.id].rock).map(entry=>entry.id);
let restoreStelae=false, restorationRequest=0;
let restoredStelae=new Set(), restoringStelae=false;
const openInscription=createInscriptionViewer({make,button,link,credits});
const openCliffs=createCliffGallery({make,button,link,openInscription,showRoute:id=>{
  if(!controller)return false;
  openMountain(redRoute);
  if(id)locateMountain(id);
  stage.scrollIntoView({block:'nearest'});
  return true;
}});
$('nav-cliffs').addEventListener('click',()=>openCliffs());
const openTrees=createTreeGuide({make,button,link,openInscription,locate:locateTree,
  startRoute:()=>visitTreeStop(treeRoute[0])});
$('nav-trees').addEventListener('click',()=>openTrees());
$('tree-route-catalog').addEventListener('click',()=>openTrees(activeTreeStop?.id));
$('exit-tree-route').addEventListener('click',()=>{activeTreeStop=null;setOverview('axis');});

function make(tag,text,cls) {
  const el=document.createElement(tag);
  if(text) el.textContent=text;
  if(cls) el.className=cls;
  return el;
}
function button(text,cls,handler){
  const b=make('button',text,cls);
  b.type='button';
  b.addEventListener('click',handler);
  return b;
}
function link(label,href){
  const a=make('a',label);
  a.href=href;
  if(href.startsWith('http')){a.target='_blank';a.rel='noopener noreferrer';}
  return a;
}

function routeRow(index,labelText,description,choose){
  const li=make('li');
  const open=button('',null,choose);
  const label=make('span');
  label.append(make('b',labelText),make('small',description));
  open.append(make('span',String(index+1).padStart(2,'0'),'number'),label,make('span','›','chev'));
  li.append(open);
  return li;
}
for(const [i,site] of axis.entries()){
  const li=routeRow(i,site.label,site.text,()=>selectSite(site.id));
  route.append(li);routeButtons.set(site.id,li.firstElementChild);
}
for(const [i,tree] of treeRoute.entries()){
  const li=routeRow(i,tree.label,tree.id.slice(2)+(treeLocations[tree.id]?'':' · 根位待核'),()=>visitTreeStop(tree));
  $('tree-route-stops').append(li);treeRouteButtons.set(tree.id,li.firstElementChild);
}
for(const site of sites){
  const style={stele:'scene-stele',historic:'scene-historic',tree:'scene-tree'};
  const label=button('','scene-label '+(style[site.kind]??(site.kind?'':'map-yard')),()=>{
    if(rooms[site.id]) enterHall(site.id);
    else selectSite(site.id);
  });
  label.append(make('i'),make('span',site.label)); label.title=site.label;
  label.setAttribute('aria-label',rooms[site.id]?'点击进入'+site.label:'定位'+site.label);
  label.hidden=true;
  labels.append(label);
  viewLabels.set(site.id,label);
}

const ns='http://www.w3.org/2000/svg';
function svg(tag,attrs){
  const node=document.createElementNS(ns,tag);
  for(const [a,v] of Object.entries(attrs)) node.setAttribute(a,v);
  return node;
}
const mapSvg=svg('svg',{viewBox:'0 0 120 140',preserveAspectRatio:'none','aria-hidden':'true'});
const mapX=x=>60+x*.37;
const mapY=z=>104+z*.231;
mapSvg.append(svg('rect',{x:mapX(-enclosure.width/2),y:mapY(-enclosure.length),width:enclosure.width*.37,height:enclosure.length*.231,fill:'#3a4c39',stroke:'#93a18b','stroke-width':1}));
for(const site of yards){
  mapSvg.append(svg('rect',{x:mapX(site.x-site.w/2),y:mapY(site.z-site.d/2),width:site.w*.37,height:site.d*.231,fill:'#5a674c',stroke:'#7f8468','stroke-width':.55}));
}
mapSvg.append(svg('line',{x1:60,y1:mapY(-enclosure.length),x2:60,y2:mapY(125),stroke:'#d8b77c','stroke-opacity':.75,'stroke-dasharray':'3 2'}));
for(const site of axis){
  const siteDim=records[site.id].dimensions;
  const w=Math.min(35,siteDim.width_m??(site.kind==='wallgate'?45:12))*.37;
  const d=(siteDim.depth_m??12)*.231;
  mapSvg.append(svg('rect',{x:60-w/2,y:mapY(site.z)-d/2,width:w,height:d,fill:'#cda65e','fill-opacity':.82}));
}
minimap.append(mapSvg);
for(const site of sites){
  const variant={stele:' map-point-stele',tree:' map-point-tree'};
  const spot=button('','map-point'+(variant[site.kind]??''),()=>selectSite(site.id));
  spot.title=site.label;
  spot.setAttribute('aria-label','小图定位'+site.label);
  spot.style.left=(mapX(site.x)/120*100)+'%';
  spot.style.top=(mapY(site.z)/140*100)+'%';
  minimap.append(spot);mapButtons.set(site.id,spot);
}

function imageFigure(key, alt, caption, zoom) {
  const credit=credits[key];
  const fig=make('figure',null,'detail-figure');
  const image=make('img');
  image.alt=alt;
  const preview=zoom?button('','inscription-preview',zoom):image;
  if(zoom){
    preview.setAttribute('aria-label','放大查看'+alt);
    preview.append(image);
  }
  const cap=make('figcaption');
  cap.append(link('打开原图 ↗',credit.original),document.createTextNode(' · '),
    link(caption,credit.source),document.createTextNode(' · '+credit.author+' · '),link(credit.license,credit.licenseUrl));
  loadPhotoPreview(image,credit,330,()=>{
    preview.remove();
    cap.append(make('span',' · 预览暂不可用'));
  },false);
  fig.append(preview,cap);
  return fig;
}
function infoLinks(record,photo) {
  const foot=make('div',null,'side-links');
  const source=sources[record.sources[0]];
  if(record.archive) foot.append(link('查看石刻档案 ↗',record.archive));
  else if(source) foot.append(link('史料来源 ↗',source[1]));
  if(photo) {
    const {license,licenseUrl}=credits[photo];
    if(licenseUrl) foot.append(link(license,licenseUrl));
    else foot.append(make('span',license));
  }
  return foot;
}
function facts(items){
  const list=make('dl',null,'metrics');
  for(const [label,value,unit] of items){
    const item=make('div'), number=make('dd',String(value));
    if(unit)number.append(make('small',unit));
    item.append(make('dt',label),number);list.append(item);
  }
  return list;
}

let coupletSite=null;
coupletGroup.append(make('option','全部地点'),...[...new Set(coupletPlaces.map(place=>place.group))].map(group=>make('option',group)));

function renderCouplets(){
  const query=coupletQuery.value.trim().replace(/[\s\p{P}]+/gu,'');
  let count=0,places=0,pendingCount=0;
  coupletContent.replaceChildren();
  for(const {id,group,label=siteById.get(id)?.label,sources:placeSources=[]} of coupletPlaces){
    if(coupletSite&&id!==coupletSite)continue;
    if(coupletGroup.selectedIndex!==0&&group!==coupletGroup.value)continue;
    const matches=text=>text.replace(/[\s\p{P}]+/gu,'').includes(query);
    const entries=(couplets[id]??[]).filter(entry=>matches([label,records[id]?.name,entry.title,entry.upper,entry.lower,entry.aliases,entry.position,entry.note].join(' ')));
    const pending=coupletNotes[id];
    if(!entries.length&&(!pending||!matches(label+pending)))continue;
    const recorded=entries.filter(entry=>!entry.pending).length;
    count+=recorded;
    pendingCount+=entries.length-recorded;
    if(recorded&&id!=='a-axis')places++;
    const section=make('section',null,'couplet-place');
    const heading=make('div',null,'couplet-place-heading');
    heading.append(make('h3',label));
    if(siteById.has(id))heading.append(button(group==='待核地点'?'定位建筑':'在岱庙定位','secondary',()=>{
      coupletDialog.close();
      selectSite(id);
      stage.scrollIntoView({block:'nearest'});
    }));
    section.append(heading);
    for(const entry of entries){
      const item=make('article',null,'couplet-entry');
      item.append(make('h4',entry.title),make('p',entry.status,'fact'));
      if(entry.position)item.append(make('p',entry.position,'description'));
      const pair=make('div',null,'couplet-pair');
      for(const [position,text] of [['上联',entry.upper],['下联',entry.lower]]){
        const line=make('div',null,'couplet-line '+entry.finish);
        line.append(make('strong',position),make('p',text));
        pair.append(line);
      }
      item.append(pair);
      if(entry.note)item.append(make('p',entry.note,'description'));
      const refs=make('div',null,'side-links');
      if(entry.photo){
        const credit=credits[entry.photo];
        refs.append(link('实景原图 ↗',credit.original),link('照片出处 ↗',credit.source),
          link(credit.license,credit.licenseUrl));
      }
      for(const key of entry.sources)refs.append(link(sources[key][0]+' ↗',sources[key][1]));
      item.append(refs);
      section.append(item);
    }
    if(pending)section.append(make('p',pending,'couplet-pending'));
    if(placeSources.length){
      const refs=make('div',null,'side-links');
      for(const key of placeSources)refs.append(link(sources[key][0]+' ↗',sources[key][1]));
      section.append(refs);
    }
    coupletContent.append(section);
  }
  $('couplet-count').textContent=[
    ...(count||!pendingCount?[count+' 副']:[]),
    ...(places?[places+' 处有地点记录']:[]),
    ...(pendingCount?[pendingCount+' 副待核']:[]),
  ].join(' · ');
  if(!coupletContent.children.length)coupletContent.append(make('p','没有匹配的楹联，可更换关键词或地点类型。','couplet-pending'));
}

function showCouplets(id=null){
  coupletSite=id;
  coupletGroup.selectedIndex=0;
  coupletGroup.parentElement.hidden=Boolean(id);
  coupletReset.hidden=!id;
  coupletQuery.value='';
  renderCouplets();
  if(!coupletDialog.open)coupletDialog.showModal();
  coupletDialog.scrollTop=0;
}
coupletQuery.addEventListener('input',renderCouplets);
coupletGroup.addEventListener('change',renderCouplets);
coupletReset.addEventListener('click',()=>{showCouplets();coupletGroup.focus();});
$('nav-couplets').addEventListener('click',()=>showCouplets());

function appendCouplets(id){
  const entries=couplets[id];
  if(entries||coupletNotes[id]){
    const label=entries?.some(entry=>!entry.pending)?'查看楹联 · '+entries.length+' 副':'查看楹联核对记录';
    detail.append(button(label,'secondary',()=>showCouplets(id)));
  }
  if(coupletNotes[id])detail.append(make('p',coupletNotes[id],'fact'));
}


function drawStele(site,record) {
  detail.replaceChildren(
    make('p',site.group+' · 石刻','zone'),make('h2',site.label),
    make('p',record.dating || '年代见档案','detail-meta')
  );
  if(record.name!==site.label)detail.append(make('p',record.name,'stele-formal'));
  if(site.photo){
    const figure=imageFigure(site.photo,site.label+'碑照','照片出处 ↗',()=>openInscription(site,record));
    figure.classList.add('stele-figure');
    detail.append(figure);
  }
  if(hasInscription(site)) detail.append(button(hasInscriptionPhoto(site)?'查看碑照与碑文':'查看碑文','secondary',()=>openInscription(site,record)));
  const {location,locationSource,faces}=site.evidence;
  for(const face of faces){
    detail.append(button('看实拍碑面 · '+face.label,'secondary',async ()=>{
      if(!restoreStelae)await toggleRestoration();
      if(restoreStelae&&selected===site.id)controller?.focus(site.id,face.side);
    }));
    const {photo}=face;
    const photoLinks=make('div',null,'side-links');
    photoLinks.append(link('碑面原图 ↗',photo.original),link('照片出处 ↗',photo.source),link('授权 ↗',photo.license));
    detail.append(photoLinks);
  }
  appendSteleFacts(detail,site,record);
  const position=make('p',location+' 场景坐标按现有建筑比例换算。','fact');
  const links=infoLinks(record,site.photo);
  links.prepend(link('位置依据 ↗',locationSource));
  detail.append(position,button('查阅碑刻图录','secondary',()=>openStones(site.group)),links);
}

function appendSteleFacts(container,site,record) {
  container.append(make('p',record.description,'description'));
  const values=[
    ['通高',record.dimensions.overall_height_m,'m'],
    ['碑身高',site.bodyHeight,'m'],
    ['形制',record.form],
    ['档案位置',record.location],
    ['题署',record.inscriber],
    ['原始尺寸',record.archivalSize],
  ].filter(([,value])=>value);
  const list=make('dl',null,'stele-facts');
  for(const [label,value,unit] of values){
    list.append(make('dt',label),make('dd',String(value)+(unit?' '+unit:'')));
  }
  container.append(list);
}

const stoneContent=$('stone-content'), stoneGroup=$('stone-group'), stoneQuery=$('stone-query');
const stoneScope=$('stone-scope');
const stoneCount=$('stone-count');
const archiveDialog=$('stone-archive-dialog');
const archiveBody=$('stone-archive-content');
const orderedGroups=['全部位置','汉柏院','汉柏院东碑墙','汉柏亭周边','配天门前','天贶殿前','东碑廊','东御座','唐槐院','雨花道院','炳灵门外','遥参亭','双龙池','后寝宫','馆藏与文献'];
stoneGroup.append(...orderedGroups.map(text=>make('option',text)));
const matchesStoneGroup=(site,group)=>group==='全部位置'||(group==='汉柏院'?site.area==='a-han':site.group===group);

function showArchive(site,record) {
  $('stone-archive-title').textContent=site.label;
  archiveBody.replaceChildren(make('p',record.dating,'detail-meta'));
  appendSteleFacts(archiveBody,site,record);
  archiveBody.append(make('p',record.status==='文献记载'?'文献所记，现陈列或开放状态待现场核实。':'仅收录于图录，场景落点待核实。','description'));
  const actions=make('div',null,'stone-archive-actions');
  if(hasInscription(site)) actions.append(button(hasTranscription(site.id)
    ? hasInscriptionPhoto(site)?'查看碑照与碑文':'查看碑文' : '放大碑照','secondary',()=>openInscription(site,record)));
  if(site.area&&siteById.has(site.area)&&record.status!=='文献记载') actions.append(button('定位所在区域','secondary',()=>{
    archiveDialog.close();
    stonesDialog.close();
    selectSite(site.area);
  }));
  archiveBody.append(actions,infoLinks(record,site.photo));
  archiveDialog.showModal();
  archiveDialog.scrollTop=0;
}

function renderStones(){
  const normalized=value=>value.toLowerCase().replace(/[\s\p{P}]+/gu,'');
  const query=normalized(stoneQuery.value);
  const filtered=stoneCatalog.filter(site=>{
    const rec=records[site.id];
    return (stoneScope.value==='all'||siteById.has(site.id))&&matchesStoneGroup(site,stoneGroup.value)&&
      normalized([site.label,rec.name,rec.location,rec.dating,rec.description,...(rec.aliases??[]),
        ...(archivalInscriptions[site.id]??[]),...(inscriptions[site.id]?.sections.flatMap(section=>section.lines)??[])].join(' ')).includes(query);
  });
  stoneCount.textContent=filtered.length+' 条';
  stoneContent.replaceChildren();
  for(const site of filtered){
    const record=records[site.id];
    const hasModel=siteById.has(site.id);
    const tile=button('','stone-tile',()=>{
      if(hasModel){stonesDialog.close();selectSite(site.id);}
      else showArchive(site,record);
    });
    if(site.photo){
      const img=make('img');
      img.alt='';
      loadPhotoPreview(img,credits[site.photo],250);
      tile.append(img);
    }
    const caption=make('span');
    caption.append(make('strong',site.label),make('small',record.location),make('small',record.dating||'年代见档案'));
    caption.append(make('small',hasModel?'三维可定位':record.status==='文献记载'?'文献记载':'仅图录'));
    tile.append(caption,make('span','›','stone-chevron'));
    stoneContent.append(tile);
  }
  if(!filtered.length)stoneContent.append(make('p','没有匹配的碑刻，可更换关键词或位置。','stone-empty'));
}
function openStones(group='全部位置'){
  stoneGroup.value=group;
  stoneScope.value='all';
  stoneQuery.value='';
  renderStones();
  stonesDialog.showModal();
}
stoneGroup.addEventListener('change',renderStones);
stoneScope.addEventListener('change',renderStones);
stoneQuery.addEventListener('input',renderStones);
$('nav-stones').addEventListener('click',()=>openStones());


function drawDetail(){
  if(mode==='mountain'){drawMountain();return;}
  const site=siteById.get(selected);
  const tree=site.kind==='tree'?treesById.get(selected):activeTreeStop?.area===selected?activeTreeStop:null;
  if(mode==='world'&&tree){drawTreeDetail(tree);return;}
  const record=records[selected];
  const room=rooms[selected];
  if(!site||!record) return;
  if(mode==='hall'){
    const {title,copy,photo,caption}=room.stops[stop];
    detail.replaceChildren(
      make('p','殿内 · '+site.label,'zone'),make('h2',title),make('p',copy,'description')
    );
    const d=record.dimensions;
    const dimensions=selected===hallId
      ? stop==='mural' ? [['壁画总长',62,'m'],['壁画高',3.3,'m'],['所在墙面',3,'面']]
        : [['外檐柱',hallInterior.outer_columns,'根'],['中围金柱',hallInterior.middle_columns,'根'],['内槽金柱',hallInterior.inner_columns,'根']]
      : [['面阔',d.width_m,'m'],['进深',d.depth_m,'m'],['开间',d.facade_bays,'间']];
    const known=dimensions.filter(([,value])=>Number.isFinite(value));
    if(known.length)detail.append(facts(known));
    if(room.evidence)detail.append(make('p','室内示意','room-status'));
    if(photo) detail.append(imageFigure(photo,credits[photo].label,caption));
    if(room.note) detail.append(make('p',room.note,'fact'));
    appendCouplets(selected);
    detail.append(button('返回庙城','secondary',exitHall),infoLinks(records[room.archive]??record,photo));
    if(room.evidence){
      const refs=make('div',null,'side-links');
      for(const key of room.evidence)refs.append(link(sources[key][0]+' ↗',sources[key][1]));
      detail.append(refs);
    }
    return;
  }
  if(site.kind==='stele'){
    drawStele(site,record);
    return;
  }
  detail.replaceChildren(make('p',record.zone+(site.id===hallId?' · 主殿':''),'zone'),make('h2',site.label),
    make('p',site.id===hallId?'北宋始建 · 大中祥符二年（1009）':record.location,'detail-meta'));
  if(site.photo) detail.append(imageFigure(site.photo,site.label+'实景',site.id==='b-yuanjun'?'遥参亭实景 ↗':'实景照片 ↗'));
  if(site.id===hallId) detail.append(make('p','岱庙祭祀东岳大帝的主殿。九开间坐落于双层石台之上，黄琉璃瓦覆重檐庑殿顶。殿内保存泰山神出巡与回銮壁画。','description'));
  else detail.append(make('p',record.description,'description'));
  const d=record.dimensions;
  const fields=[
    ['面阔',d.width_m,'m'],['进深',d.depth_m,'m'],['通高',d.height_m,'m'],
    ['门洞宽',d.passage_clear_width_m,'m'],['门道深',d.passage_depth_m,'m'],
  ].filter(([,v])=>v);
  if(!d.width_m&&d.facade_bays)fields.push(['面阔',d.facade_bays,'间']);
  if(d.center_passage_clear_width_m)fields.push(['中央门洞',d.center_passage_clear_width_m,'m']);
  if(fields.length) detail.append(facts(fields));
  if(site.id===hallId){
    detail.append(make('p','重檐庑殿 · 面阔九间 · 进深四间','fact'));
  }else{
    const note=record.modelNote??(site.estimated?.w?'建筑点位与外观尺度为示意。':site.estimated?.h?'建筑点位及模型通高为示意。':'场景位置为示意。');
    detail.append(make('p',note,'fact'));
  }
  if(room) detail.append(button('进入'+site.label+' ↗','primary',()=>enterHall(site.id)));
  if(site.shape==='loft') detail.append(button('从楼台北望泰山','secondary',()=>controller?.lookFromLoft()));
  if(site.id==='b-peitian'||site.id==='b-renan'){
    detail.append(button('查看穿堂视角','secondary',()=>controller?.lookThroughGate(site.id)));
  }
  appendCouplets(selected);
  const related=annexes.filter(hall=>hall.near===site.id);
  if(related.length){
    const list=make('div',null,'related-halls');
    for(const hall of related){
      const item=button(hall.label,null,()=>selectSite(hall.id));
      item.append(make('small',rooms[hall.id]?'可入殿':hall.kind==='historic'?'历史点位':'↗'));
      list.append(item);
    }
    detail.append(list);
  }
  const stoneGroupBySite={'a-han':'汉柏院','a-tang':'唐槐院','a-yuhua':'雨花道院',
    'b-yuhua-east-gallery':'雨花道院','b-yuhua-west-gallery':'雨花道院','b-stele-gallery':'东碑廊',
    'a-dong':'东御座','b-peitian':'配天门前','b-tiankuang':'天贶殿前'};
  const group=stoneGroupBySite[site.id];
  if(group)detail.append(button('查看'+group+'碑刻'+(site.id==='a-han'?' · '+stoneWrap.length+' 条':''),'secondary',()=>openStones(group)));
  const treesHere=ancientTrees.filter(tree=>tree.area===site.id);
  if(treesHere.length)detail.append(button('查看附近古树','secondary',()=>openTrees(treesHere[0].id)));
  if(site.id==='a-yaocan') detail.append(button('定位碧霞元君殿','secondary',()=>selectSite('b-yuanjun')));
  if(site.id==='b-yuanjun') detail.append(button('查看遥参亭院落','secondary',()=>selectSite('a-yaocan')));
  if(site.shape&&site.near){
    const owner=siteById.get(site.near);
    detail.append(button('返回'+owner.label,'secondary',()=>selectSite(owner.id)));
  }
  if(site.shape){
    const refs=make('div',null,'side-links');
    for(const key of record.sources) refs.append(link(sources[key][0]+' ↗',sources[key][1]));
    detail.append(refs);
  }else detail.append(infoLinks(record,site.photo));
  if(renderFailed) for(const b of detail.querySelectorAll('.primary')) b.disabled=true;
}

function drawTreeDetail(tree){
  const point=treeLocations[tree.id];
  detail.replaceChildren(make('p','古树名木 · '+tree.id.slice(2),'zone'),make('h2',tree.label),
    make('p',tree.location,'detail-meta'),make('p',tree.history,'description'),
    facts([['树种',tree.species],['树龄',tree.age]]),
    make('p',point?'三维标记按地标确定相对位置。':pendingTreeLocations[tree.id],'fact'),
    button(tree.compare?'看实拍与乾隆碑图':'查看档案与实拍照片','primary',()=>openTrees(tree.id)));
  if(activeTreeStop?.id!==tree.id)return;
  const i=treeRoute.indexOf(tree);
  if(i>0)detail.append(button('上一站 · '+treeRoute[i-1].label,'secondary',()=>visitTreeStop(treeRoute[i-1])));
  if(i+1<treeRoute.length)detail.append(button('下一站 · '+treeRoute[i+1].label,'secondary',()=>visitTreeStop(treeRoute[i+1])));
  else detail.append(button('返回古树图录','secondary',()=>openTrees()));
}

function syncSelection(){
  const routeSite=siteById.get(selected);
  for(const site of sites){
    const active=site.id===selected;
    viewLabels.get(site.id).classList.toggle('active',active);
    const marker=mapButtons.get(site.id);
    marker.classList.toggle('active',active);
    if(site.kind!=='stele'&&site.near) marker.hidden=!active&&site.near!==selected&&site.near!==routeSite.near;
    const row=routeButtons.get(site.id);
    if(row){
      if(active||routeSite.near===site.id&&routeSite.kind==='hall')row.setAttribute('aria-current','step');
      else row.removeAttribute('aria-current');
    }
  }
  for(const [id,row] of treeRouteButtons){
    if(id===activeTreeStop?.id)row.setAttribute('aria-current','step');
    else row.removeAttribute('aria-current');
  }
}
const viewButtons=[...document.querySelectorAll('[data-view]')];
const stopList=$('walk-stops'), stageEnter=$('stage-enter');
const stageInscription=$('stage-inscription');
const restoreButton=$('view-restore');
stageInscription.addEventListener('click',()=>openInscription(siteById.get(selected),records[selected]));
restoreButton.addEventListener('click',()=>toggleRestoration());
async function toggleRestoration(){
  if(!controller)return;
  const request=++restorationRequest;
  restoreStelae=!restoreStelae;
  restoringStelae=restoreStelae;
  syncView();
  const restored=await controller.setSteleRestoration(restoreStelae);
  if(request!==restorationRequest)return;
  restoredStelae=restored;
  restoringStelae=false;
  syncView();
}
function syncView(){
  const site=siteById.get(selected);
  const inMountain=mode==='mountain';
  $('axis-guide').hidden=inMountain||Boolean(activeTreeStop);
  $('tree-guide').hidden=inMountain||!activeTreeStop;
  $('mountain-guide').hidden=!inMountain;
  $('mountain-labels').hidden=!inMountain;
  $('mountain-actions').hidden=!inMountain;
  $('nav-world').classList.toggle('nav-active',!inMountain&&!activeTreeStop);
  $('nav-trees').classList.toggle('nav-active',!inMountain&&Boolean(activeTreeStop));
  $('nav-mountain').classList.toggle('nav-active',inMountain);
  for(const b of viewButtons) b.setAttribute('aria-pressed',b.dataset.view===currentView);
  restoreButton.setAttribute('aria-pressed',String(restoreStelae));
  for(const b of stopList.children) b.setAttribute('aria-pressed',b.dataset.stop===stop);
  $('walk-ui').hidden=mode!=='hall';
  $('view-switch').hidden=mode!=='world';
  $('map-card').hidden=mode!=='world';
  const showInscription=mode==='world'&&site.kind==='stele'&&hasInscription(site);
  if(showInscription)stageInscription.textContent=(hasInscriptionPhoto(site)?'碑照与碑文':'查看碑文')+' ↗';
  stageEnter.hidden=!rooms[selected];
  stageInscription.hidden=!showInscription;
  $('scene-cta').hidden=mode!=='world'||(!rooms[selected]&&!showInscription);
  if(rooms[selected])stageEnter.textContent='进入'+site.label+' ↗';
  labels.hidden=mode!=='world';
  stage.dataset.mode=mode;
  stage.dataset.steleRestoration=String(restoreStelae);
  if(inMountain){
    const region=mountainPlaces[activeMountainPlace];
    const cliff=mappedById.get(activeMountainPlace);
    $('view-kicker').textContent=cliff?'泰山摩崖石刻':region?'泰山地标':activeMountainRoute?'登山线路':'岱庙以北';
    $('scene-title').textContent=cliff?.title??region?.name??activeMountainRoute?.name??'泰山 · 五路登岱';
    hint.textContent=activeMountainRoute===redRoute?'选择地标或石刻查看位置':'点击路线或地标查看 · 走向示意';
    return;
  }
  const focusLabel=site.kind==='stele'?(restoreStelae&&restoredStelae.has(site.id)?'碑面实拍贴图':'碑刻定位'):site.kind==='tree'?'古树定位':'建筑定位';
  $('view-kicker').textContent=mode==='hall'?site.label+'室内'+(rooms[selected].evidence?' · 示意':''):
    activeTreeStop?'寻访千年古柏':({overview:'庙城全景',axis:'中轴视角',plan:'俯视总平',focus:focusLabel}[currentView]);
  $('scene-title').textContent= mode==='hall'?rooms[selected].stops[stop].title:({overview:'一座庙城，三路院落',axis:'从南门向北',plan:'城垣与三路',focus:activeTreeStop?.label??site.label}[currentView]);
  hint.textContent=mode==='hall'?'拖动转头 · WASD / 方向键移动 · Esc 返回':'拖动旋转 · 滚轮缩放 · 点击场景中的对象';
  if(activeTreeStop&&!treeLocations[activeTreeStop.id])hint.textContent='根位待核 · 显示所在区域';
  if(restoreStelae&&mode==='world'){
    if(restoringStelae)hint.textContent='正在从原站载入实拍碑面…';
    else if(currentView==='focus'&&site.kind==='stele'){
      hint.textContent=restoredStelae.has(site.id)
        ? site.evidence.faces.map(face=>face.label).join(' / ')+' · 实拍贴图'
        : '原站碑面暂不可贴图，可从详情打开原图';
    }else{
      hint.textContent='已还原 '+restoredStelae.size+' / '+stelae.length+' 条碑刻';
      if(restoredStelae.size<stelae.length)hint.textContent+=' · 其余碑面可从详情打开原图';
    }
  }
}
function locateTree(tree){
  if(activeTreeStop&&treeRoute.includes(tree)){visitTreeStop(tree);return;}
  selectSite(treeLocations[tree.id]?tree.id:tree.area);
  stage.scrollIntoView({block:'nearest'});
}
function visitTreeStop(tree){
  activeTreeStop=tree;
  selectSite(treeLocations[tree.id]?tree.id:tree.area,true);
  stage.scrollIntoView({block:'nearest'});
}
function selectSite(id,keepTreeStop=false){
  if(!siteById.has(id))return;
  if(mode==='mountain')leaveMountain();
  if(mode==='hall') exitHall();
  if(!keepTreeStop&&activeTreeStop){
    activeTreeStop=treeRoute.find(tree=>tree.id===id)??null;
  }
  selected=id;currentView='focus';
  controller?.focus(id);
  syncSelection();syncView();drawDetail();
}
function setOverview(view){
  if(mode==='mountain')leaveMountain();
  if(mode==='hall') exitHall();
  currentView=view;controller?.overview(view);syncSelection();syncView();drawDetail();
}
function enterHall(id){
  const room=rooms[id];
  if(!controller || !room) return;
  if(mode==='mountain')leaveMountain();
  if(mode==='hall'){
    if(selected===id)return;
    exitHall();
  }
  activeTreeStop=null;
  controller.enter(id);
  selected=id;mode='hall';stop='entry';
  stopList.replaceChildren(...Object.entries(room.stops).map(([key,view])=>{
    const target=button(view.label,null,()=>goStop(key));
    target.dataset.stop=key;
    return target;
  }));
  syncSelection();syncView();drawDetail();
  stage.scrollIntoView({block:'nearest'});
}
function exitHall(){
  if(mode!=='hall')return;
  controller?.exit();
  mode='world';currentView='focus';
  syncView();drawDetail();
  stageEnter.focus({preventScroll:true});
}
function goStop(key){
  if(mode!=='hall'||!rooms[selected].stops[key])return;
  controller?.go(key);stop=key;syncView();drawDetail();
}

const mountainLabels=new Map(), mountainRouteButtons=new Map();
for(const [id,place] of Object.entries(mountainPlaces)){
  const marker=button(place.name,'scene-label mountain-marker'+(place.model?' mountain-gate':''),()=>locateMountain(id));
  marker.setAttribute('aria-label','泰山定位'+place.name);
  marker.hidden=true;
  $('mountain-labels').append(marker);mountainLabels.set(id,marker);
}
for(const entry of mappedCliffs){
  const marker=button(entry.title,'scene-label mountain-marker mountain-cliff-marker',()=>locateMountain(entry.id));
  marker.setAttribute('aria-label','定位摩崖石刻 '+entry.title);
  marker.hidden=true;
  $('mountain-labels').append(marker);mountainLabels.set(entry.id,marker);
}
for(const route of mountainRoutes){
  const item=make('li');
  const choose=button('',null,()=>pickMountainRoute(route));
  const name=make('span');
  name.append(make('strong',route.name),make('small',route.mode));
  choose.append(make('i'),name);
  choose.style.setProperty('--route-color',route.color);
  choose.setAttribute('aria-pressed','false');
  item.append(choose);$('mountain-routes').append(item);mountainRouteButtons.set(route,choose);
}
function drawMountain(){
  const cliff=mappedById.get(activeMountainPlace);
  if(cliff){
    const point=cliffRoutePoints[cliff.id];
    detail.replaceChildren(make('p','红门线 · 摩崖石刻','zone'),make('h2',cliff.title),
      make('p',point.location,'description'),facts([['位置',cliff.position],['年代',cliff.date??'待考']]),
      button(cliff.pictures?.length?'查看实景照片与释文':'查看释文与档案','primary',()=>openCliffs(cliff.section,cliff.id)),
      button('返回红门线路','secondary',()=>pickMountainRoute(redRoute)),
      link(point.rock?'同一岩体的地图位置 ↗':'单件地图位置 ↗',cliffMapSource(point)));
    return;
  }
  const place=mountainPlaces[activeMountainPlace];
  const title=place?.name??activeMountainRoute?.name??'登山线路';
  const description=place?.description??activeMountainRoute?.description??'从岱庙北望泰山。点选线路查看沿途地标，或直接定位四道天门。';
  detail.replaceChildren(make('p',place?'泰山 · 地标':'泰山 · 游览图','zone'),make('h2',title),make('p',description,'description'));
  if(place?.elevation)detail.append(facts([['文献海拔',place.elevation]]));
  if(activeMountainPlace==='temple')detail.append(button('切换至岱庙近景','primary',()=>setOverview('overview')));
  if(place?.model) detail.append(make('p','山门与山顶建筑在远景中放大表现，构件和局部位置为示意。','fact'));
  const destinations=make('div',null,'related-halls mountain-destinations');
  const ids=activeMountainRoute?.stops??['middle','south','east','north','peak'];
  for(const id of ids)destinations.append(button(mountainPlaces[id].name,null,()=>locateMountain(id)));
  detail.append(destinations,make('p',activeMountainRoute===redRoute
    ?'红门至玉皇顶及经石峪支线采用 OpenStreetMap 步道数据。'
    :'地形采用数字高程数据。路线按官方导览的节点与衔接关系勾勒。','fact'));
  if(activeMountainRoute===redRoute||cliffSectionAtPlace[activeMountainPlace]){
    detail.append(button('查阅摩崖石刻','secondary',()=>openCliffs(cliffSectionAtPlace[activeMountainPlace]??'all')));
  }
  if(activeMountainRoute===redRoute){
    const stops=make('section',null,'mountain-cliff-stops');
    stops.append(make('h3','已标注的摩崖石刻（'+mappedCliffs.length+' 条）'));
    for(const section of cliffSections){
      const entries=mappedCliffs.filter(entry=>entry.section===section.id);
      if(!entries.length)continue;
      const group=make('details');
      group.open=cliffSectionAtPlace[activeMountainPlace]===section.id;
      const choices=make('div',null,'related-halls mountain-destinations');
      for(const entry of entries)choices.append(button(entry.title,null,()=>locateMountain(entry.id)));
      group.append(make('summary',section.label+' · '+entries.length+' 条'),choices);
      stops.append(group);
    }
    detail.append(stops);
  }
  const links=make('div',null,'side-links');
  if(place?.source)links.append(link('地标史料 ↗',place.source));
  if(activeMountainRoute)links.append(link('官方线路说明 ↗',activeMountainRoute.source));
  if(activeMountainRoute===redRoute)links.append(link('红门盘道地图资料 ↗',hongmenPathSource));
  links.append(link('Mapzen / Tilezen 高程 ↗','https://registry.opendata.aws/terrain-tiles/'),
    link('NASA / USGS SRTM ↗','https://github.com/tilezen/joerd/blob/master/docs/attribution.md'),
    link('© OpenStreetMap 贡献者 ↗','https://www.openstreetmap.org/copyright'));
  detail.append(links);
}
function pickMountainRoute(route){
  activeMountainRoute=route;
  activeMountainPlace=null;
  if(route!==redRoute)for(const id of mappedById.keys())mountainLabels.get(id).hidden=true;
  controller?.mountainRoute(route?.id??null);
  for(const [key,b] of mountainRouteButtons)b.setAttribute('aria-pressed',key===route);
  syncView();drawDetail();
}
function locateMountain(id){
  activeMountainPlace=id;
  controller?.locateMountain(id);
  syncView();drawDetail();
  stage.scrollIntoView({block:'nearest'});
}
function openMountain(route=null){
  if(!controller)return;
  activeTreeStop=null;
  if(mode==='hall')exitHall();
  if(mode!=='mountain'){controller.showMountain();mode='mountain';}
  pickMountainRoute(route);
}
function leaveMountain(){
  controller?.leaveMountain();
  mode='world';
  drawDetail();
}

for(const b of viewButtons) b.addEventListener('click',()=>setOverview(b.dataset.view));
$('nav-world').addEventListener('click',()=>{activeTreeStop=null;setOverview('overview');});
$('nav-mountain').addEventListener('click',()=>openMountain());
$('temple-view').addEventListener('click',()=>setOverview('overview'));
$('show-all-routes').addEventListener('click',()=>pickMountainRoute(null));
$('mountain-overview').addEventListener('click',()=>pickMountainRoute(activeMountainRoute));
$('exit-hall').addEventListener('click',exitHall);
stageEnter.addEventListener('click',()=>enterHall(selected));
$('fullscreen').addEventListener('click',async()=>{
  try {
    if(document.fullscreenElement) await document.exitFullscreen();
    else if(stage.requestFullscreen) await stage.requestFullscreen();
  } catch {hint.textContent='当前浏览器窗口暂无法切换全屏。';}
});
window.addEventListener('keydown',e=>{
  if(e.key==='Escape' && mode==='hall' && !document.querySelector('dialog[open]') && !document.fullscreenElement)exitHall();
});
for(const b of document.querySelectorAll('[data-move]')){
  b.addEventListener('pointerdown',e=>{b.setPointerCapture(e.pointerId);controller?.key(b.dataset.move,true)});
  for(const event of ['lostpointercapture','pointerup','pointercancel']){
    b.addEventListener(event,()=>controller?.key(b.dataset.move,false));
  }
  b.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();controller?.key(b.dataset.move,true);}});
  b.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter')controller?.key(b.dataset.move,false);});
  b.addEventListener('blur',()=>controller?.key(b.dataset.move,false));
}

const guideNode=$('guide-content');
const guideFilters=[...document.querySelectorAll('[data-guide]')];
const halls=[...roomIds.map(id=>siteById.get(id)),...sideHalls.filter(site=>!rooms[site.id])];
const guideEntries={all:[...axis,...yards,...annexes],halls,enter:halls.filter(site=>rooms[site.id]),yards,
  sites:landmarks.filter(site=>site.shape),
  couplets:coupletPlaces.filter(({id})=>siteById.has(id)).map(({id})=>siteById.get(id))};
function drawGuide(filter) {
  for(const b of guideFilters)b.setAttribute('aria-pressed',b.dataset.guide===filter);
  guideNode.replaceChildren();
  for(const site of guideEntries[filter]){
    const room=rooms[site.id], tile=make('article',null,'guide-item');
    const locate=button('','guide-locate',()=>{
      guide.close();selectSite(site.id);
      if(filter==='couplets')showCouplets(site.id);
    });
    if(site.photo){
      const img=make('img');
      img.alt='';
      loadPhotoPreview(img,credits[site.photo],330);
      locate.append(img);
    }
    const caption=make('span');
    caption.append(make('b',site.label),make('small',filter==='couplets'
      ? couplets[site.id]?.some(entry=>!entry.pending) ? couplets[site.id].length+' 副楹联' : '楹联待核' : site.cluster||site.text||records[site.id].location));
    locate.append(caption);
    tile.append(locate);
    if(room&&filter!=='couplets'){
      const enter=button('入殿漫游 ↗','guide-enter',()=>{guide.close();enterHall(site.id);});
      enter.setAttribute('aria-label','入殿漫游 · '+site.label);
      enter.disabled=renderFailed;
      tile.append(enter);
    }
    guideNode.append(tile);
  }
}
function openGuide(filter){
  drawGuide(filter);
  guide.showModal();
  guide.scrollTop=0;
}
for(const b of guideFilters)b.addEventListener('click',()=>drawGuide(b.dataset.guide));
$('nav-guide').addEventListener('click',()=>openGuide('all'));
$('nav-halls').textContent='殿宇 · '+roomIds.length+' 座可入内';
$('nav-halls').addEventListener('click',()=>openGuide('halls'));
$('about').addEventListener('click',()=>about.showModal());
const aboutNode=$('about-content');
aboutNode.append(make('p','主殿、配天门、仁安门等采用已核对的文献尺寸。城域按东西 236.7 米、南北 405.7 米搭建。院落和建筑落位参照历史总平与航拍，支路、植栽和远景为示意。'),
 make('p','天贶殿室内按文献柱数和陈设布局建模。其余殿室按可查的开间及陈设记录组织空间。标注「示意」的殿室可跟随各自的史料和实景链接查阅。楹联正文据照片或文献录入，三维字形采用印刷字体。'));
const plan=make('details');
plan.append(make('summary','历史总平图'),link('查阅论文第 50 页图 17 ↗',sources.plan[1]));
aboutNode.append(plan);
const origins=make('details');
origins.append(make('summary','史料与照片署名'));
origins.append(make('p','实拍照片引用原站图片地址。照片旁保留原图、出处与许可信息。碑刻还原以浏览器从原站载入的照片为底图，在浏览器中裁切和校正透视。CC BY-SA 图像的处理结果沿用原授权。'));
const bibliography=make('ul');
for(const key of ['layout','overview','guide','plan','aerialHigh','palace']){
  const item=make('li');const [name,url]=sources[key];item.append(link(name+' ↗',url));bibliography.append(item);
}
for(const credit of Object.values(credits).filter(credit=>credit.licenseUrl)){
  const item=make('li');
  item.append(link(credit.label+' ↗',credit.source),document.createTextNode(' · '+credit.author+' · '),
    credit.licenseUrl?link(credit.license,credit.licenseUrl):document.createTextNode(credit.license));
  bibliography.append(item);
}
for(const id of ['s-2421','s-2084','s-1842']){
  const photo=inscriptions[id].photos[0];
  const item=make('li');
  item.append(link(records[id].name+'碑面贴图原照 ↗',photo.original),document.createTextNode(' · '),
    link('照片出处 ↗',photo.source),document.createTextNode(' · '+photo.credit+' · '),link('授权 ↗',photo.license));
  bibliography.append(item);
}
origins.append(bibliography);aboutNode.append(origins);

syncSelection();syncView();drawDetail();
requestAnimationFrame(()=>{
  try{
    controller=mountScene($('view'),{
      onPick(id,enter){if(enter)enterHall(id);else selectSite(id);},
      onPosition(points,view,focusId){
        const accepted=[];
        const nearby=stelae.filter(site=>site.near===selected||site.evidence.anchor===selected);
        const nearbyHalls=annexes.filter(site=>site.near&&(site.near===selected||site.near===siteById.get(selected).near));
        const nearbyTrees=treeSites.filter(site=>site.near===selected||site.near===siteById.get(selected).near);
        const ranked=[selected,...(view==='focus'?nearby:stelae).map(site=>site.id),hallId,'b-dong-main',
          ...(view==='focus'?nearbyTrees:treeSites).map(site=>site.id),...nearbyHalls.map(site=>site.id),
          ...axis.slice().reverse().map(s=>s.id),...yards.map(s=>s.id)];
        const rankedSet=new Set(ranked);
        for(const s of [...stelae,...annexes,...treeSites]) if(!rankedSet.has(s.id))viewLabels.get(s.id).hidden=true;
        for(const id of new Set(ranked)){
          const node=viewLabels.get(id), pos=points.get(id);
          const crowd=accepted.some(at=>Math.abs(pos.x-at.x)<61&&Math.abs(pos.y-at.y)<19);
          const object=siteById.get(id);
          const nearbyStele=nearby.includes(object);
          const stoneFocus=view==='focus'&&siteById.get(focusId)?.kind==='stele';
          const relatedHall=nearbyHalls.includes(object);
          const show=pos.visible && !crowd && (stoneFocus?id===focusId:
            view!=='focus'||id===focusId||nearbyStele||relatedHall||nearbyTrees.includes(object)||!pos.close);
          node.hidden=!show;
          if(!show)continue;
          node.style.left=pos.x+'px';node.style.top=pos.y+'px';accepted.push(pos);
        }
      },
      onReady(){$('stage-load').hidden=true;stage.dataset.ready='true';},
      onMountainPick:locateMountain,
      onMountainPosition(points,focused){
        const filled=[];
        const priority=[focused,...(activeMountainRoute===redRoute?['red','middle',...individualCliffLabels]:[]),
          'south','middle','east','north','peak','temple','red','village','pear','peach','candles'].filter(Boolean);
        for(const id of mappedById.keys())mountainLabels.get(id).hidden=true;
        const offsets={south:[-32,4],north:[24,-26],peak:[65,9],temple:[-18,-12],peach:[20,-10]};
        for(const id of new Set(priority)){
          const b=mountainLabels.get(id), p=points.get(id);
          const [dx,dy]=!focused&&offsets[id]||[0,0];
          const x=Math.max(30,Math.min(stage.clientWidth-30,p.x+dx)), y=p.y+dy;
          const visible=p.visible&&(!focused||focused===id)&&!filled.some(q=>Math.abs(q.x-x)<50&&Math.abs(q.y-y)<20);
          b.hidden=!visible;
          b.classList.toggle('active',id===focused);
          if(visible){b.style.left=x+'px';b.style.top=y+'px';filled.push({x,y});}
        }
      },
    });
  }catch(error){
    renderFailed=true; console.error(error);
    $('stage-load').textContent='三维场景需要支持 WebGL 2 的浏览器。建筑图录仍可查阅。';
    $('stage-enter').disabled=true;
    $('nav-mountain').disabled=true;
    for(const b of detail.querySelectorAll('.primary')) b.disabled=true;
  }
});


