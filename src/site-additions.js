// Relative scene coordinates in metres. Detail cards disclose the survey limits.
const layout='layout';
const old='oldGuide';
const east='东路', west='西路', middle='中路';
const corner='城垣';
const sideGate=(id,label,x,z,near,angle,notes,refs)=>({
  id,label,x,z,near,angle,kind:'wallgate',shape:'sideGate',
  estimated:{w:15,d:6.2,h:6.2}, focus:[23,8,3.2],
  record:{zone:corner,location:(x>0?'东':'西')+'城墙',description:notes,dimensions:{},sources:['gateLayout',...refs],
    modelNote:'城墙开口按历史总平与院落关系定位。门洞剖面、墙厚和构件尺度为示意。'},
});
const courtPart=(id,label,x,z,shape,estimated,location,description,extra={})=>({
  id,label,x,z,shape,estimated,near:'a-dong',kind:'landmark',cluster:'东御座配属',
  angle:extra.angle??0,focus:extra.focus??[15,7,2],photo:extra.photo,
  record:{zone:east,location,description,dimensions:extra.dimensions??{},sources:[layout,'dongRecent','dongCourtPhoto'],
    modelNote:extra.modelNote??'实景可对照院落与屋面关系。单体位置、屋面尺寸及门窗细部为示意。'},
});
const siteMark=(id,label,x,z,near,description,refs,ruin=false)=>({
  id,label,x,z,near,kind:'historic',shape:ruin?'ruin':'marker',cluster:'遗址与旧址',focus:[ruin?24:13,ruin?15:8,.32],
  estimated:{w:ruin?9:3,h:ruin?.45:.8},
  record:{zone:near==='a-han'?east:west,location:near==='a-han'?'汉柏院北部':near==='a-tang'?'唐槐院及其北侧':'雨花道院一带',
    description,dimensions:{},sources:refs,
    modelNote:ruin?'遗址所在片区见地方志和发掘记录。低矮基址为示意，砖石边界与现存构件待现场测绘。'
      :'点位按文献中的相对方位示意。标识表示历史位置，建筑原轮廓待核。'},
});
const southDoor=(id,label,x,clear)=>({
  id,label,x,z:0,near:'b-zhengyang',kind:'landmark',shape:'southDoor',cluster:'城门与角楼',
  focus:[19,6,2.8],estimated:{w:clear+2,h:6.8},clear,
  record:{zone:corner,location:x>0?'正阳门东侧':'正阳门西侧',
    description:Math.abs(x)<20?'南向五门之一，在正阳门近旁。地方志载门道宽 5.9 米，与正阳门门道等深。':'南向五门之外侧门洞，城墙航拍可辨门洞位置。',
    dimensions:Math.abs(x)<20?{passage_clear_width_m:5.9,passage_depth_m:17.8}:{},sources:[layout,'gateLayout','aerialHigh'],
    modelNote:'沿用南墙门洞体块，洞顶曲线和构件做法为示意。'},
});

export const addedSites = [
  courtPart('b-dong-hanging','东御座垂花门',111,-138,'hanging',{w:3.9,d:3.2,h:4.65},'东华门内 · 西向',
    '地方志记方形垂花门西向，门东与东华门相对。顶作卷棚悬山，施对接五架梁、五檩。',{angle:-Math.PI/2,focus:[9,5,2.2]}),
  ...[[102,'e','东',Math.PI/2],[63,'w','西',-Math.PI/2]].map(([x,key,side,angle])=>
    courtPart('b-dong-yi-'+key,'东御座'+side+'仪门',x,-138,'yi',{w:1.55,d:1.8,h:4.12},'东御座大门'+side+'侧',
      '两道仪门又称塞门，见双柱、方墩柱础和卷棚歇山顶。地方志记每门宽 1.55 米、通高 4.12 米。',
      {angle,focus:[6.4,4.2,2],dimensions:{width_m:1.55,height_m:4.12},
        modelNote:'面阔和通高按地方志。东、西为站内方位称呼，门深和精确位置为示意。'})),
  ...[[96.5,'e','东',1,4.1],[67.9,'w','西',2,6.1]].map(([x,key,side,bays,w])=>
    courtPart('b-dong-ear-'+key,'东御座'+side+'耳房',x,-173,'ear',{w,d:4.8,h:4.05},'东御座正殿'+side+'侧',
      '地方志记'+side+'耳房'+(bays===1?'一':'两')+'间，卷棚硬山顶。',{focus:[11,6,2],dimensions:{facade_bays:bays}})),
  courtPart('b-dong-gallery','东御座回廊',91.7,-163.5,'gallery',{w:15,h:3.7},'正殿、配殿与大门之间',
    '地方志称内廊，连接正殿、配殿及大门，为双柱、四檩、四架梁卷棚顶。档案还记录回廊东壁的嵌碑。',{focus:[20,11,1.9],
      modelNote:'模型按连接关系画出多段回廊。每段长度、接点和窗墙细节为示意。'}),
  siteMark('a-huanyong','环咏亭遗址',-94,-180,'a-yuhua',
    '雨花道院清理勘查时发现环咏亭遗址。旧亭曾嵌历代刻石，明代在旧地复建，乾隆时期拓新。管委会的西路导览也称这一带为环咏亭院。',
    ['westSurvey','gateLayout',layout,old],true),
  siteMark('b-yanxi','延禧殿旧址',-82,-97,'a-tang','《泰山志》记旧殿在唐槐以北，原祀延禧真人。另有年表记近现代复建，本点标注历史殿址。',['tangHistoric','repairChronology']),
  siteMark('b-bingling-ruin','炳灵殿旧址',87,-75,'a-han','文献记原炳灵殿在汉柏院北部，旧祀炳灵王，殿后有灵威亭。现有炳灵门是另一个单体。',[layout,'deities']),
  siteMark('b-chengming','诚明堂旧址',-76,-111,'a-tang','在旧延禧殿北侧，文献记为祭官斋宿之所。',[layout,'tangHistoric']),
  siteMark('b-yuxiang','御香亭旧址',-88,-113,'a-tang','在旧延禧殿北侧，文献记作贮放御香之所。',[layout,'tangHistoric']),
  siteMark('b-cangjing','藏经堂旧址',-94,-196,'a-yuhua','清代文献记其在环咏亭以北，旧日曾贮藏经文及典诰。',[layout,'daoli']),
  {
    id:'b-ge-pool',label:'阁老池',x:0,z:-202,near:'b-tiankuang',kind:'landmark',shape:'pool',cluster:'主殿前院',
    focus:[22,13,.35],estimated:{h:1.5},
    record:{zone:middle,location:'仁安门以北、扶桑石以南',description:'院中方池周设石栏，旧馆导览记东西 11.4 米、南北 7.9 米，池内外有九块太湖石。实景照片可见池底铺石。',
      dimensions:{width_m:11.4,depth_m:7.9},sources:[old,'gePoolPhoto','daoli'],modelNote:'池的平面尺度采导览记录。栏板、池石与场景坐标为示意。'},
  },
  {
    id:'b-fusang',label:'扶桑石（迷糊石）',x:0,z:-229,near:'b-tiankuang',kind:'landmark',shape:'rock',cluster:'主殿前院',
    focus:[10,6,1.6],estimated:{w:3,h:2.9},
    record:{zone:middle,location:'阁老池以北、天贶殿前小露台',description:'又称介石、迷糊石。泰安市政府实景资料可见褐色立石、壁面凹孔和摸福活动。按记载，孤忠柏在石北侧。',
      dimensions:{},sources:['fusangPhoto','fusangCustom','daoli'],modelNote:'褐色石体和凹孔按照片表现。石高、孔深、表面细节及点位为示意。'},
  },
  sideGate('b-donghua','东华门（青阳门）',118.35,-138,'a-dong',Math.PI/2,
    '东墙城门，通向东御座横向通路。泰安年鉴记载东城墙及东华门曾列入文物景点维修、复建项目。',['eastGateRepair','plan']),
  sideGate('b-xihua','西华门（素景门）',-118.35,-142,'a-yuhua',-Math.PI/2,
    '西墙城门，邻雨花道院。勘查确认原门位置，2005 年修复竣工，报道记按旧址所见的排叉柱形式修复。',['westSurvey','westGateRepair','plan']),
  southDoor('b-side-south-e','东掖门',16,5.9),
  southDoor('b-side-south-w','西掖门',-16,5.9),
  southDoor('b-yanggao','仰高门',46,5),
  southDoor('b-jianda','见大门',-46,5),
  ...[[1,0,'se','巽楼','东南'],[-1,0,'sw','坤楼','西南'],[1,-405.7,'ne','艮楼','东北'],[-1,-405.7,'nw','乾楼','西北']].map(([sign,z,key,label,side])=>({
    id:'b-tower-'+key,label,x:sign*116.55,z,y:5.1,angle:z===0?0:Math.PI,kind:'landmark',shape:'corner',cluster:'城门与角楼',focus:[26,15,10],
    record:{zone:corner,location:side+'隅',description:'岱庙四角楼之一，名取自八卦方位。现存建筑为近现代复建。',
      dimensions:{height_m:11.4,facade_bays:5},sources:[layout,old,'aerialHigh'],modelNote:'方位及总体体量参照文献，现模型屋面转角、梁架和门窗为示意。'},
  })),
  ...[[1,'e','东'],[-1,'w','西']].flatMap(([sign,key,side])=>[
    {
      id:'b-hall-'+key,label:side+'环廊',x:sign*35.8,z:-249,near:'b-tiankuang',angle:-sign*Math.PI/2,kind:'landmark',shape:'mainGallery',cluster:'主殿前院',
      focus:[20,10,2.5],estimated:{w:26,h:5.2},
      record:{zone:middle,location:'天贶殿院'+side+'翼',description:'近现代沿旧廊基陆续恢复，围合天贶殿院，部分廊房用于文物陈列。',
        dimensions:{},sources:[layout,old,'aerialHigh'],modelNote:'环廊连续体块、各段间距及布展为示意。'},
    },
    {
      id:'b-hall-tower-'+key,label:side+'侧钟鼓楼',x:sign*36,z:-217,near:'b-tiankuang',angle:-sign*Math.PI/2,kind:'landmark',shape:'mainTower',cluster:'主殿前院',
      focus:[24,12,4.7],estimated:{w:15,h:9.3},
      record:{zone:middle,location:side+'环廊中段',description:'此处可定位'+side+'侧楼。历史平面图与清代《泰山道里记》对东、西楼名称的标法不同，网页先按方位标注。',
        dimensions:{},sources:['plan','daoli',layout,'aerialHigh'],modelNote:'楼体和廊房连接为示意。现挂钟鼓和门牌待现场核对。'},
    },
  ]),
  ...[
    ['b-stele-gallery','东碑廊',31.6,-256,'b-hall-e','东环廊北段',
      '旧馆导览记东环廊北段设历代碑刻陈列。馆藏包括衡方碑、张迁碑、孙夫人碑、双束碑和何人麟《望岳》诗碑。'],
    ['b-han-relief-gallery','汉画像石陈列',-31.6,-251,'b-hall-w','西环廊',
      '旧馆导览记西环廊曾按出土地陈列泰山一带汉画像石，并复原汉墓前室。题材包括百戏、车马、狩猎与神话。'],
    ['b-yuhua-east-gallery','雨花道院东碑廊',-61.1,-202,'a-yuhua','雨花道院东侧',
      '泰山石刻数据库记《岱庙瞻田复归记碑》等置于此。'],
    ['b-yuhua-west-gallery','雨花道院西碑廊',-105.2,-202,'a-yuhua','雨花道院西侧',
      '泰山石刻数据库记《禁止私卖庙田碑》置于此。'],
  ].map(([id,label,x,z,near,location,description])=>({
    id,label,x,z,near,kind:'landmark',shape:'marker',cluster:'石刻陈列',estimated:{h:1},
    focus:[12,6,1.5],record:{zone:x>0||id==='b-han-relief-gallery'?middle:west,location,description,
      dimensions:{},sources:[old,'stones'],modelNote:'标记为陈列区域示意。当前展厅边界与单件展位待核。'},
  })),
  {
    id:'b-baixi',label:'百戏图画像石',x:-30.5,z:-253,near:'b-han-relief-gallery',
    kind:'landmark',shape:'marker',cluster:'石刻陈列',photo:'baixi',estimated:{h:1},
    focus:[10,4.5,1.2],record:{zone:middle,location:'泰安市博物馆藏',
      description:'1960 年出土于大汶口汶河北东汉墓，原为墓室中柱，石面以浅浮雕表现戏舞的人与兽。',
      dimensions:{},sources:['baixiPhoto',old],modelNote:'场景指向汉画像石陈列区域。此件当前展位待核。'},
  },
  {
    id:'b-houzai-loft',label:'厚载门门楼（望岳阁）',x:0,z:-405.7,y:4.6,near:'b-houzai',kind:'landmark',shape:'loft',angle:Math.PI,cluster:'城门与角楼',
    focus:[21,11,6.3],estimated:{w:19,h:4.8},
    record:{zone:corner,location:'厚载门上方',description:'厚载门上的北门楼，旧馆导览作望岳阁，《泰安历史文化遗迹志》作望云阁。地方志记 1984 年仿宋式复建。',
      dimensions:{},sources:[layout,old],modelNote:'可切换到楼台高度北望。栏板位置、楼内构造与远景为示意。'},
  },
];

export const siteAdditions = Object.fromEntries(addedSites.map(({id,label,record})=>[id,{name:label,...record}]));

export const addedSources = {
  baixiPhoto:['百戏图画像石馆藏实拍','https://commons.wikimedia.org/wiki/File:Stone_Relief_of_Baixi_Picture,_Tai%27an_Museum.jpg'],
  gateLayout:['泰山管委会 · 岱庙三路与城门','https://tsgw.taian.gov.cn/art/2021/6/13/art_198322_10286362.html'],
  repairChronology:['《泰安市情》泰山保护建设年表','https://shandong-chorography.org/database/b9/section/9-newsite-3506/article/138/'],
  dongRecent:['东御座近年实拍','https://commons.wikimedia.org/wiki/File:20260721_%E5%B2%B1%E5%BA%99_%E4%B8%9C%E5%BE%A1%E5%BA%A7.jpg'],
  eastGateRepair:['《泰安年鉴》东墙及东华门修缮','https://shandong-chorography.org/database/d90/section/5/article/169/'],
  westGateRepair:['西华门修复竣工现场报道','https://news.sina.com.cn/c/2005-09-06/07496870829s.shtml'],
  gePoolPhoto:['阁老池与石栏实景','https://www.daimiao.cn/i_images_2015/glc.jpg'],
  fusangPhoto:['泰安市政府 · 迷糊石实景与摸福','https://www.taian.gov.cn/art/2011/3/23/art_46700_4064059.html'],
  fusangCustom:['泰安市政府 · 玩迷糊石','https://www.taian.gov.cn/art/2011/2/23/art_55413_4074169.html'],
};

export const addedCredits = {
  baixi:{
    label:'百戏图画像石',author:'Huanokinhejo',source:addedSources.baixiPhoto[1],
    original:'https://upload.wikimedia.org/wikipedia/commons/f/f3/Stone_Relief_of_Baixi_Picture%2C_Tai%27an_Museum.jpg',
    license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',
  },
};
