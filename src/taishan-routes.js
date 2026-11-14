import { hongmenPath, sutraPath, upperHongmenPath, summitHongmenPath } from './taishan-hongmen-path.js';

export const mountainPlaces = {
  temple:{name:'岱庙',at:[117.12511,36.19252],description:'从泰山南麓的岱庙沿古城轴线北行，可经岱宗坊至红门。'},
  red:{name:'红门',at:[117.12243,36.20875],description:'泰山中路石阶盘道的山麓入口，向北经万仙楼、壶天阁至中天门。'},
  village:{name:'天外村',at:[117.1019,36.2051],description:'由天地广场进入西溪，观光公路通往中天门。'},
  pear:{name:'上梨园',at:[117.1500,36.2183],description:'东御道从上梨园一带起步，经东天门、紫气阁至中天门。标注为示意点。'},
  peach:{name:'桃花峪',at:[117.002,36.2256],description:'泰山西麓入口，沿彩石溪方向通往桃花源。'},
  candles:{name:'天烛峰',at:[117.1546,36.2745],description:'泰山东北麓的登山线，经大小天烛峰、后石坞一带登岱顶。标注为示意点。'},
  east:{name:'东天门',at:[117.1270,36.2318],model:'east',
    description:'东御道沿途节点。从上梨园一侧攀登，经东天门、紫气阁抵达中天门。山门形制与位置为示意。',
    source:'https://whlyj.taian.gov.cn/art/2023/9/27/art_334292_10298869.html'},
  middle:{name:'中天门',at:[117.10831,36.23878],model:'middle',
    description:'红门盘道、东御道与天外村公路在此衔接。向上可沿盘道去南天门，或换乘中天门索道至岱顶。',
    source:'https://tsgw.taian.gov.cn/art/2021/5/26/art_363479_10320188.html'},
  south:{name:'南天门',at:[117.09836,36.25547],model:'south',elevation:'1,416 米',
    description:'城楼式两层山门，位于十八盘上端。过南天门可经天街、碧霞祠到玉皇顶。',
    source:'https://shandong-chorography.org/database/b9/section/13/article/454/'},
  north:{name:'北天门',at:[117.10088,36.26026],model:'north',
    description:'岱顶通往后石坞的山口。现石坊为 1984 年重立的双柱单门式。',
    source:'https://tsgw.taian.gov.cn/art/2021/5/26/art_363479_10320185.html'},
  peak:{name:'玉皇顶',at:[117.10308,36.25703],model:'summit',elevation:'1,532.7 米',
    description:'泰山主峰。山顶玉皇庙周围留有无字碑、古登封台等遗存。',
    source:'https://shandong-chorography.org/database/b9/section/13-newsite-3510/article/358/'},
};

const p=id=>mountainPlaces[id].at;
const ridge=[p('south'),[117.09945,36.25575],[117.10143,36.2559],p('peak')];
const upperAscent={kind:'mapped',points:[...upperHongmenPath,...summitHongmenPath.slice(1)]};
const road=(...points)=>({kind:'road',points});
const foot=(...points)=>({kind:'foot',points});
const cable=(from,to)=>({kind:'cable',points:[from,to]});
const zhongCableTop=[117.0971,36.2554];
const peachCableTop=[117.0962,36.2577];

// Waypoints are schematic, anchored to documented junctions and landmarks.
export const mountainRoutes = [
  {id:'hongmen',name:'红门',color:'#f5bc70',mode:'石阶徒步',stops:['temple','red','middle','south','peak'],
    description:'由岱庙沿轴线到红门，走传统御道，经中天门、十八盘和南天门登顶。',
    source:'https://tsgw.taian.gov.cn/art/2019/4/28/art_363479_10320190.html',
    segments:[foot(p('temple'),[117.1241,36.2011],p('red'),hongmenPath[0]),
      {kind:'mapped',points:hongmenPath},upperAscent]},
  {id:'tianwaicun',name:'天外村',color:'#a4d7ff',mode:'观光车 · 索道',stops:['village','middle','south','peak'],
    description:'观光公路经西溪、竹林寺一带至中天门，可在此换乘索道，或接红门线徒步。',
    source:'https://tsgw.taian.gov.cn/art/2026/1/21/art_363479_10320191.html',
    segments:[road(p('village'),[117.091,36.208],[117.082,36.215],[117.0816,36.2235],[117.089,36.2303],[117.1004,36.2333],p('middle')),
      cable(p('middle'),zhongCableTop),foot(zhongCableTop,...ridge)]},
  {id:'dongyudao',name:'东御道',color:'#e2edd0',mode:'石阶徒步',stops:['pear','east','middle','south','peak'],
    description:'从上梨园出发，经东天门到中天门，与红门登山道汇合。',
    source:'https://whlyj.taian.gov.cn/art/2023/9/27/art_334292_10298869.html',
    segments:[foot(p('pear'),[117.144,36.2233],[117.137,36.2249],[117.1314,36.2282],p('east'),[117.121,36.2353],[117.113,36.2392],p('middle'))],
    shared:'hongmen'},
  {id:'taohuayu',name:'桃花峪',color:'#f1a9bc',mode:'观光车 · 索道',stops:['peach','peak'],
    description:'从西麓沿彩石溪、红雨川一带上行至桃花源，再换乘索道到岱顶。',
    source:'https://tsgw.taian.gov.cn/art/2021/5/26/art_198322_10286096.html',
    segments:[road(p('peach'),[117.018,36.236],[117.034,36.246],[117.052,36.251],[117.065,36.258],[117.0806,36.2596]),
      cable([117.0806,36.2596],peachCableTop),foot(peachCableTop,[117.0998,36.2579],p('peak'))]},
  {id:'tianzhufeng',name:'天烛峰',color:'#d2b9ff',mode:'后山徒步',stops:['candles','north','peak'],
    description:'从东北麓登山，经天烛峰、后石坞一带，到北天门后接岱顶步道。',
    source:'https://tsgw.taian.gov.cn/art/2021/5/26/art_363479_10320185.html',
    segments:[foot(p('candles'),[117.146,36.269],[117.132,36.264],[117.119,36.262],[117.110,36.2609],p('north'),[117.1009,36.2586],p('peak'))]},
];

export const sutraBranch = {kind:'mapped',points:sutraPath};

// On the map, the shared upper section remains in the red-gate colour.
export const jointAscent=upperAscent;
