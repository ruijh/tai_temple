import catalog from './catalog.json';
import { hanEntries, hanStelae } from './han-stelae.js';
import { addedSites, siteAdditions, addedSources, addedCredits } from './site-additions.js';
import { supplementalRecords, supplementalStelae } from './stele-register.js';
import { verifiedStelae } from './stele-restoration.js';
import { hasTranscription } from './inscription-viewer.js';
import { ancientTrees, treeLocations } from './ancient-trees.js';

export const records = { ...catalog.objects, ...siteAdditions, ...hanEntries, ...supplementalRecords };
export const credits = {
  ...catalog.credits,
  ...addedCredits,
  ...Object.fromEntries(Object.values({...hanEntries,...supplementalRecords}).filter(record=>record.photo).map(record=>[record.photo.key,record.photo])),
};
export const sources = { ...catalog.sources, ...addedSources };
export const enclosure = {
  width: records['a-axis'].dimensions.enclosure_width_m,
  length: records['a-axis'].dimensions.enclosure_length_m,
};

export const axis = [
  { id: 'b-yaocan-arch', label: '遥参坊', text: '礼仪前庭', z: 123, kind: 'arch', photo: 'yaocan' },
  { id: 'b-yuanjun', label: '碧霞元君殿', text: '遥参亭正殿', z: 84, kind: 'hall', photo: 'yaocan' },
  { id: 'b-dai-arch', label: '岱庙坊', text: '四柱三间石坊', z: 23, kind: 'arch', photo: 'arch' },
  { id: 'b-zhengyang', label: '正阳门', text: '南门 · 五凤楼', z: 0, kind: 'wallgate', photo: 'gate' },
  { id: 'b-peitian', label: '配天门', text: '庙城第二门', z: -100, kind: 'hall', photo: 'peitian' },
  { id: 'b-renan', label: '仁安门', text: '主殿前门', z: -162, kind: 'hall', photo: 'renan' },
  { id: 'b-tiankuang', label: '天贶殿', text: '东岳大帝主殿', z: -287, kind: 'main', photo: 'hall' },
  { id: 'b-shuming', label: '淑明殿', text: '后寝宫正宫', z: -331, kind: 'hall', photo: 'shuming' },
  { id: 'b-houzai', label: '厚载门', text: '北门 · 望云阁', z: -enclosure.length, kind: 'wallgate', photo: 'houzai' },
].map(entry => ({ x: 0, ...entry }));
export const sideHalls = [
  { id:'b-dong-main', x:83, z:-173, near:'a-dong', photo:'dong', form:'roll', base:1.7 },
  { id:'b-dong-match-e', x:101, z:-156, near:'a-dong', angle:-Math.PI/2, form:'roll' },
  { id:'b-dong-match-w', x:65, z:-156, near:'a-dong', angle:Math.PI/2, form:'roll' },
  { id:'b-shuming-e', x:22, z:-330, near:'b-shuming', form:'gable' },
  { id:'b-shuming-w', x:-22, z:-330, near:'b-shuming', form:'gable' },
  { id:'b-linghou', x:26, z:-100, near:'b-peitian', form:'gable', estimated:{w:13.2,d:7.2,h:7.5} },
  { id:'b-taiwei', x:-26, z:-100, near:'b-peitian', form:'gable', estimated:{w:13.2,d:7.2,h:7.5} },
  { id:'b-luban', x:-82, z:-244, near:'a-yuhua', form:'hard', estimated:{h:7.2} },
  { id:'b-yaocan-e', x:19, z:82, near:'a-yaocan', angle:-Math.PI/2, form:'hard', estimated:{w:18,d:5,h:5.35,bays:5} },
  { id:'b-yaocan-w', x:-19, z:82, near:'a-yaocan', angle:Math.PI/2, form:'hard', estimated:{w:18,d:5,h:5.35,bays:5} },
].map(site=>({kind:'hall',label:records[site.id].name,angle:0,base:.55,...site}));
// These centres are interpreted from the historical plan and aerial views.
// Field-survey coordinates and current footprints can replace this layer independently.
export const yards = [
  { id:'a-yaocan', label:'遥参亭院落', x:0,z:78,w:52,d:66.2, photo:'yaocan' },
  { id: 'a-tang', label:'唐槐院', x:-83,z:-53,w:53,d:67, photo:'tang' },
  { id: 'a-han', label:'汉柏院', x:83,z:-53,w:54,d:67 },
  { id: 'a-dong', label:'东御座', x:83,z:-157,w:52,d:49, photo:'dong' },
  { id: 'a-yuhua', label:'雨花道院', x:-82,z:-216,w:54,d:104 },
  { id: 'a-su', label:'素景园', x:-75,z:-367,w:63,d:55 },
  { id: 'a-zi', label:'紫园', x:75,z:-369,w:61,d:52 },
];

export const landmarks = [
  {id:'b-double-pool',x:0,z:143,kind:'landmark',estimated:{w:8,h:.55}},
  {id:'b-yaocan-yimen',x:0,z:101,near:'a-yaocan',kind:'hall',estimated:{w:10,h:5.3}},
  {id:'b-yaocan-south',x:0,z:111,near:'a-yaocan',kind:'hall',estimated:{w:12,h:5.75}},
  {id:'b-yaocan-north',x:0,z:45,near:'a-yaocan',kind:'hall',estimated:{w:12,h:5.75}},
  {id:'b-yaocan-pavilion',x:0,z:62,near:'a-yaocan',kind:'landmark',estimated:{w:6,h:6}},
  {id:'b-bingling',x:57,z:-50,near:'a-han',kind:'hall',angle:Math.PI/2},
  {id:'b-han-pavilion',x:85,z:-83,near:'a-han',kind:'landmark',estimated:{w:16.2,h:7}},
  {id:'b-dong-gate',x:83,z:-138,near:'a-dong',kind:'hall'},
  {id:'b-shen-e',x:26,z:-162,near:'b-renan',kind:'hall'},
  {id:'b-shen-w',x:-26,z:-162,near:'b-renan',kind:'hall'},
  {id:'b-pavilion-e',x:22.2,z:-265,near:'b-tiankuang',kind:'landmark',estimated:{w:6,h:9}},
  {id:'b-pavilion-w',x:-22.2,z:-265,near:'b-tiankuang',kind:'landmark',estimated:{w:6,h:9}},
  {id:'b-bronze',x:83,z:-350,near:'a-zi',kind:'landmark'},
  {id:'b-iron',x:-63,z:-343,near:'a-su',kind:'landmark'},
].map(site=>({label:records[site.id].name,...site})).concat(addedSites);


const landmarkStelae = [
  ['s-2421','祥符碑','配天门前','b-peitian'],
  ['s-2084','宣和碑','配天门前','b-peitian'],
  ['s-2033','天贶殿碑铭','天贶殿前','b-tiankuang'],
  ['s-2073','封祀坛颂碑','天贶殿前','b-tiankuang'],
  ['s-2042','西御制诗碑','天贶殿前','b-pavilion-w'],
  ['s-2043','东御制诗碑','天贶殿前','b-pavilion-e'],
  ['s-2064','衡方碑','东碑廊','b-stele-gallery'],
  ['s-2063','张迁碑','东碑廊','b-stele-gallery'],
  ['s-2045','望岳诗碑','东碑廊','b-stele-gallery'],
  ['s-2426','秦泰山刻石','东御座','a-dong'],
].map(([id,label,group,area])=>({id,label,group,area,kind:'stele',photo:'stele-'+id.slice(2)}));

export const stoneCatalog = [...landmarkStelae,...hanStelae,...supplementalStelae]
  .map(stone=>({...stone,photo:credits[stone.photo]?.original?stone.photo:undefined}));
const catalogById = new Map(stoneCatalog.map(stone=>[stone.id,stone]));
const anchorsById = new Map([...axis,...yards,...landmarks].map(place=>[place.id,place]));
export const stelae = Object.entries(verifiedStelae).map(([id,evidence])=>{
  const stone=catalogById.get(id);
  const anchor=anchorsById.get(evidence.anchor);
  if(!stone||!anchor||!evidence.locationSource||!evidence.faces.length||
    evidence.faces.some(face=>!face.photo?.original)||!hasTranscription(id)){
    throw new Error('碑刻场景缺少对应的档案、位置、碑照或释文 '+id);
  }
  const [x,y,z]=evidence.offset;
  return {...stone,near:stone.area,x:anchor.x+x,y,z:anchor.z+z,angle:0,
    height:records[id].dimensions.overall_height_m,...evidence.model,evidence};
});
const treeAnchors = new Map([...axis,...yards,...sideHalls,...stelae].map(site=>[site.id,site]));
export const treeSites = [];
for(const tree of ancientTrees){
  const point=treeLocations[tree.id];
  if(!point)continue;
  const anchor=treeAnchors.get(point.anchor);
  if(!anchor)throw new Error('古树场景缺少定位参照 '+tree.id);
  const [x,z]=point.offset;
  const site={id:tree.id,label:tree.label,kind:'tree',near:tree.area,x:anchor.x+x,z:anchor.z+z,
    focus:[19,11,4],estimated:{h:4.5,w:3}};
  treeSites.push(site);
  treeAnchors.set(tree.id,site);
}
export const sites = [...axis, ...yards, ...sideHalls, ...landmarks, ...stelae, ...treeSites];
export const siteById = new Map(sites.map(site => [site.id, site]));
export const modelDimensions = id => records[id]?.dimensions || {};
export const hall = modelDimensions('b-tiankuang');
export const platform = modelDimensions('b-platform');
export const hallInterior = modelDimensions('i-tiankuang');


