const register = ['泰山管委会古树一览表', 'https://tsgw.taian.gov.cn/art/2021/5/21/art_198501_10285999.html'];
const protection = ['首批「国保单位·古树名木」协同保护名录', 'https://wwj.gansu.gov.cn/wwj/c105449/202510/174233540/files/2fc28cb95f8441b1bb30a3f32cec1e8b.pdf'];
const scenicTrees = ['泰山管委会《岱庙八景（古柏）》', 'https://tsgw.taian.gov.cn/art/2021/6/17/art_162237_10286459.html'];
const treeIntroductions = ['泰山管委会古树介绍', 'https://tsgw.taian.gov.cn/art/2021/5/21/art_198501_10285998.html'];
const urbanTreeRegister = ['《泰安市城市绿地系统专项规划》古树表', 'https://www.taian.gov.cn/module/download/downfile.jsp?classid=0&filename=dd2bf4b56b9c40e9bfe24d23147726d5.pdf'];
const qianlongStele = ['泰山石刻档案《御制汉柏之图》', 'https://tsgw.taian.gov.cn/art/2023/4/13/art_322517_1923.html'];
const daimiaoAerial = ['齐鲁壹点岱庙航拍', 'https://ishare.ifeng.com/c/s/7rNAi1nVslO'];
const commonsCC0 = 'https://creativecommons.org/publicdomain/zero/1.0/';
const forestImages = 'https://lyj.taian.gov.cn/picture/';
const mountImages = 'https://tsgw.taian.gov.cn/picture/';

export const ancientTrees = [
  {
    id:'t-A0006', label:'挂印封侯', species:'侧柏', area:'b-zhengyang',
    location:'正阳门内东侧', age:'约 2100 年（林业资料估计）',
    history:'老柏主干倾斜，离地约八米的枝杈长着一处形似猴头的树瘤。「挂印封侯」的誉名有附会关羽挂印及萧何受封两种民间解释。2024 年，以此柏种子育成的两株幼苗赠予陕西茂陵博物馆。',
    photos:[{label:'挂印封侯实拍', original:mountImages+'0/6fa2926f67414632a29e3e66ba3198f5.png',
      source:'https://tsgw.taian.gov.cn/art/2026/1/21/art_363606_10320237.html', credit:'泰山风景名胜区管理委员会'}],
    refs:[register,['泰安市林业局「挂印封侯」', 'https://lyj.taian.gov.cn/art/2015/12/21/art_47485_3423540.html'],
      ['泰山管委会汉柏幼苗记录', 'https://tsgw.taian.gov.cn/art/2024/4/18/art_48270_10311876.html']],
  },
  {
    id:'t-A0001', label:'双干连理', alias:'汉柏连理 · 汉柏凌寒', species:'侧柏', area:'a-han',
    location:'汉柏院西北角，赤眉斧痕西侧', age:'约 2100 年（林业资料估计）', registry:'37090200001',
    history:'原为双干同根。泰安市林业局记载西干早年枯死，东干仍生长。泰山管委会记乾隆于 1762 年谒岱庙时见此树，后来绘图刻石。现存碑阳刻汉柏图，碑阴和两侧还刻有三次到泰安时题咏古柏的诗。',
    photos:[
      {label:'双干连理实拍', width:3000, height:4000, credit:'H2v5o68z · 2026 年 · CC0',
        source:'https://commons.wikimedia.org/wiki/File:岱庙汉柏连理.jpg',
        original:'https://upload.wikimedia.org/wikipedia/commons/c/c0/%E5%B2%B1%E5%BA%99%E6%B1%89%E6%9F%8F%E8%BF%9E%E7%90%86.jpg', license:commonsCC0},
      {label:'乾隆《御制汉柏之图》碑阳实拍', width:3000, height:4000, credit:'H2v5o68z · 2026 年 · CC0',
        source:'https://commons.wikimedia.org/wiki/File:乾隆汉柏图.jpg',
        original:'https://upload.wikimedia.org/wikipedia/commons/0/03/%E4%B9%BE%E9%9A%86%E6%B1%89%E6%9F%8F%E5%9B%BE.jpg', license:commonsCC0},
    ],
    refs:[register,['泰安市林业局「汉柏凌寒」', 'https://lyj.taian.gov.cn/art/2015/12/18/art_47485_3423536.html'],
      ['泰山管委会「汉柏连理」', 'https://tsgw.taian.gov.cn/art/2026/1/21/art_363606_10320242.html'],qianlongStele,
      ['故宫博物院《清代乾隆御制汉柏图及青玉插屏》', 'https://www.dpm.org.cn/Uploads/File/2022/04/20/u625f6f9919af6.pdf']],
    compare:'碑阳刻的是乾隆时期的树形，可与实拍对看双干的分叉、枯干和今天的树冠。两幅图的视角与比例各异。',
  },
  {
    id:'t-A0002', label:'赤眉斧痕', species:'侧柏', area:'a-han', registry:'37090200002',
    location:'汉柏院西北部，双干连理东侧', age:'约 2100 年（林业资料估计）',
    history:'树干下部可见斧状痕迹和红斑。《水经注》引《从征记》，记泰山庙古柏及赤眉斫柏的旧闻。把今日这株树与古书所写的那一株相认，属于当地传说。',
    photos:[
      {label:'赤眉斧痕全景', original:forestImages+'-1/4d5f6e7244684c1cb0021dca8c6935d5.png',
        source:'https://lyj.taian.gov.cn/art/2025/7/3/art_358946_10299537.html', credit:'郑波 · 泰安市林业局'},
      {label:'赤眉斧痕树干近照', original:forestImages+'-1/e98a9b4c78ed41e7ac40acf2aaaa423a.png',
        source:'https://lyj.taian.gov.cn/art/2025/7/3/art_358946_10299537.html', credit:'泰安市林业局'},
    ],
    refs:[register,scenicTrees,['《水经注》卷二十四《汶水》', 'https://www.shidianguji.com/book/NGJ89241200000329016941/chapter/1lvyb6hrb9smr']],
  },
  {
    id:'t-A0003', label:'岱峦苍柏', alias:'汉柏影翠', species:'侧柏', area:'a-han', registry:'37090200003',
    location:'汉柏院西南部，影翠池北面', age:'约 2100 年（林业资料估计）',
    history:'泰安市林业局记古柏立在影翠池北面，冠形开展，夏日倒映在池水中，因此又称「汉柏影翠」。全景可对看低斜的主干与宽展的树冠。',
    photos:[{label:'岱峦苍柏全景', original:forestImages+'-1/ad917d752972439eb7960b6053a13c1f.jpg',
      source:'https://lyj.taian.gov.cn/art/2025/7/8/art_358946_10299599.html', credit:'从军 · 泰安市林业局'}],
    refs:[register,['泰安市林业局「岱峦苍柏」方位', 'https://lyj.taian.gov.cn/art/2015/12/21/art_47485_5331193.html'],
      ['《泰山志》汉柏院与影翠池', 'https://shandong-chorography.org/database/b9/section/1/article/126/']],
  },
  {
    id:'t-A0004', label:'苍龙吐虬', alias:'古柏老桧', species:'圆柏（桧柏）', area:'a-han', registry:'37090200004',
    location:'汉柏院西南角，炳灵门南侧碑亭东侧、影翠池西南', age:'约 2100 年（林业资料估计）',
    history:'林业局记载，古圆柏中空后曾补植一株侧柏，今日侧柏已枯，老圆柏仍存活。粗干有许多树瘤，向下弯的枝条形似龙须，因此得名「苍龙吐虬」。',
    photos:[
      {label:'苍龙吐虬全景', original:forestImages+'0/s_8b28bfad022e4bebb7c9355521dad622.jpg',
        source:'https://lyj.taian.gov.cn/art/2025/7/18/art_358946_10299718.html', credit:'薛巍 · 泰安市林业局'},
      {label:'苍龙吐虬树干近照', original:forestImages+'0/s_1f75c3fca2784902a79ff4682accf840.jpg',
        source:'https://lyj.taian.gov.cn/art/2025/7/18/art_358946_10299718.html', credit:'郑波 · 泰安市林业局'},
    ],
    refs:[register,scenicTrees,
      ['树干、石栏与院内建筑同框', 'https://you.ctrip.com/travels/taian746/4165393.html#:~:text=%E8%8B%8D%E9%BE%99%E5%90%90%E8%99%AC'],
      ['汉柏院西南角与碑亭实地记录', 'https://www.sohu.com/a/791463658_120146601']],
  },
  {
    id:'t-A0005', label:'昂首天外', species:'侧柏', area:'s-2084', registry:'37090200005',
    location:'宣和碑（碑阴「万代瞻仰」）北侧', age:'约 2100 年（林业资料估计）',
    history:'林业局记录树高 15.5 米，是岱庙汉柏中最高的一株。枝干向上伸展，和南侧宣和碑阴的「万代瞻仰」四字相映。',
    photos:[
      {label:'昂首天外全景', original:forestImages+'-1/7639646e9bc9456490e14fb011bb0b50.png',
        source:'https://lyj.taian.gov.cn/art/2025/7/23/art_358946_10299795.html', credit:'郑波 · 泰安市林业局'},
      {label:'昂首天外枝干近照', original:forestImages+'-1/8d33f426d048498b828edc3c7e85b594.png',
        source:'https://lyj.taian.gov.cn/art/2025/7/23/art_358946_10299795.html', credit:'郑波 · 泰安市林业局'},
    ],
    refs:[register,['泰山石刻档案《宋宣和重修泰岳庙记碑》', 'https://tsgw.taian.gov.cn/art/2023/4/13/art_322517_2084.html']],
  },
  {
    id:'t-A0007', label:'唐槐抱子', species:'国槐', area:'a-tang', registry:'37090200007',
    location:'唐槐院西侧，旧延禧殿址文物库房楼以南，近城墙马道', age:'老槐传为唐植，活树为 20 世纪补植',
    history:'明《泰山小史》已有延禧殿前唐槐的记载。泰山管委会记老槐于 1951 年枯死，1952 年道士尚士廉在老干洞中补植新槐。地方志另有 1952 年枯死、1953 年补植的记法。今日仍可看见老干与新树相抱。',
    photos:[{label:'唐槐抱子老干与新槐', original:mountImages+'0/bbfa2ce898da42e3ae17eb439b45cbd0.png',
      source:'https://tsgw.taian.gov.cn/art/2026/1/21/art_363606_10320236.html', credit:'泰山风景名胜区管理委员会'}],
    refs:[register,urbanTreeRegister,
      ['《泰安历史文化遗迹志》岱庙', 'https://shandong-chorography.org/database/b9/section/13/article/351/'],
      ['《泰山志》唐槐与文物库房楼方位', 'https://shandong-chorography.org/database/b9/section/1/article/128/'],
      ['A0007 树牌、老干与库房楼同框原图 ↗', 'https://img2.autoimg.cn/travelplat/g29/M07/8B/EA/ChcCSF4ym9qAfMirAFBnuDziaYE649.jpg'],
      ['汽车之家同组实拍（含城墙马道）', 'https://you.m.autohome.com.cn/details/232284']],
  },
  {
    id:'t-A0009', label:'擎雷银杏', alias:'岱庙银杏', species:'银杏', area:'b-shuming-e', registry:'37090200009',
    location:'天贶殿后，东寝宫院侧', age:'林业局据碑文记为 1678 年栽植',
    history:'泰安市林业局据《重修岱庙历履碑》记，此树植于康熙十七年重修岱庙时。高干、广冠，入秋满树金黄。「擎雷」的誉名来自它仿佛为殿宇遮挡雷电的说法。',
    photos:[{label:'擎雷银杏冠幅与秋色', original:forestImages+'0/24e9d4d183e74148896166a0bdb3df53.jpg',
      source:'https://lyj.taian.gov.cn/art/2025/8/22/art_358946_10300279.html', credit:'郑波、亓伟东 · 泰安市林业局'}],
    refs:[register,treeIntroductions],
  },
  {
    id:'t-A0121', label:'云列三台', alias:'祥云柏', species:'圆柏（桧柏）', area:'a-su',
    location:'岱庙西花园（素景园）西墙内', age:'官方旧资料有 500 余年、约 800 年两种估计',
    history:'树冠分成三簇，如三朵云。林业局记树干从基部裂开，在较高处重新合拢。当地传说三朵祥云曾为出巡的泰山神遮阳，后来化为西花园的古柏。',
    photos:[{label:'云列三台实拍', original:forestImages+'0/c8fde29e971d4b5bb12f8c71e555fb68.jpg',
      source:'https://lyj.taian.gov.cn/art/2016/8/18/art_47485_5331194.html', credit:'泰安市林业局'}],
    refs:[treeIntroductions,scenicTrees,
      ['《泰山志》后花园西墙内记载', 'https://shandong-chorography.org/database/b9/section/1/article/129/'],
      ['泰山工作室树基围栏与园路实拍', 'https://www.sohu.com/a/166002271_729426#:~:text=%E4%BD%8D%E4%BA%8E%E5%B2%B1%E5%BA%99%E5%90%8E%E9%83%A8%E8%A5%BF%E8%8A%B1%E5%9B%AD%E5%86%85']],
  },
];

export const treeRoute = ancientTrees.slice(0,6);
export const treeRouteSource = protection;
export const treesById = new Map(ancientTrees.map(tree=>[tree.id,tree]));

// Relative marks on the existing schematic scene, not survey coordinates.
// Each mark requires both an individual identification and a usable landmark.
export const treeLocations = {
  't-A0006': {
    anchor:'b-zhengyang', offset:[24,-13],
    evidence:'林业局记正阳门内东侧，泰山管委会实拍可辨贴近南城墙的独立围栏和倾斜树干。',
    reference:['正阳门内东侧方位与树形', 'https://lyj.taian.gov.cn/art/2015/12/21/art_47485_3423540.html'],
  },
  't-A0001': {
    anchor:'a-han', offset:[-13,-19],
    evidence:'林业局记汉柏院西北角。全景同框可见双干连理与赤眉斧痕，双干连理在西。',
    reference:['林业局汉柏凌寒方位与照片', 'https://lyj.taian.gov.cn/art/2015/12/18/art_47485_3423536.html'],
  },
  't-A0002': {
    anchor:'t-A0001', offset:[6,0],
    evidence:'林业局确认与双干连理相邻；对照两株同框照片及西北角树牌，赤眉斧痕在东。',
    reference:['两株同框及 A0001 树牌记录', 'https://www.sohu.com/a/791463658_120146601'],
  },
  't-A0003': {
    anchor:'a-han', offset:[-5,-13],
    evidence:'林业局给出影翠池北面，实景可按宽冠、斜干与独立石栏识别。相对场景中的影翠池落点。',
    reference:['林业局影翠池北面记录', 'https://lyj.taian.gov.cn/art/2015/12/21/art_47485_5331193.html'],
  },
  't-A0004': {
    anchor:'a-han', offset:[-14,17],
    evidence:'林业局以编号 37090200004 记在汉柏院西南。地面照可辨粗干、横伸枯枝和石栏，俯拍可将这处方形石栏对到炳灵门南侧碑亭东侧、影翠池西南。',
    reference:daimiaoAerial,
  },
  't-A0005': {
    anchor:'s-2084', offset:[0,-7],
    evidence:'认养表与林业局记录均指向宣和碑北侧，已用树的全景和相邻碑列对照。',
    reference:['林业局宣和碑北侧记录及实拍', 'https://lyj.taian.gov.cn/art/2025/7/23/art_358946_10299795.html'],
  },
  't-A0007': {
    anchor:'a-tang', offset:[-13,7],
    evidence:'原图同框可辨 A0007 蓝色树牌、老干、石栏及库房楼，反向照片可见城墙与上城马道。《泰山志》记库房楼所在的旧延禧殿址在唐槐北面，航拍对得上库房楼和西南城墙的关系。',
    reference:daimiaoAerial,
  },
  't-A0009': {
    anchor:'b-shuming-e', offset:[1,16],
    evidence:'林业局标为东寝宫，秋景照片可见树在天贶殿后；正俯航拍可辨后寝东侧两殿之间的黄色冠幅。',
    reference:['岱庙天贶殿正俯航拍', 'https://ishare.ifeng.com/c/s/7rNAi1nVslO'],
  },
};

export const pendingTreeLocations = {
  't-A0121':'《泰山志》记在后花园西墙内。实拍可辨三簇树冠、树基石栏和园路，现有俯视图仍无法把这处石栏与西墙沿线的具体位置对上。',
};
