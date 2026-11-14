// Upper and lower lines follow the physical positions when facing the facade.
export const couplets = {
  'b-tiankuang': [
    {
      title:'前檐明间 · 红地抱柱联', status:'照片与清代文献互证',
      upper:'青社開封峙者宗山稱嶽長', lower:'蒼精降德聖惟產物與天齊',
      aliases:'青社开封峙者宗山称岳长 苍精降德圣惟产物与天齐',
      photo:'hall', sources:['eastTour'], finish:'red', mount:'inner',
    },
    {
      title:'前檐次间 · 蓝地抱柱联', status:'照片与联书互证',
      upper:'雲行雨施不崇朝而遍天下', lower:'理大物博祖陽氣之發東方',
      aliases:'云行雨施不崇朝而遍天下 理大物博祖阳气之发东方',
      photo:'hall', sources:['coupletBook'], finish:'blueWhite', mount:'outer',
      note:'正面照左联末字被行人遮挡，依《楹联丛话》补读。',
    },
    {
      title:'殿内 · 吴云旧联', status:'清代文献记载 · 现挂位置待核',
      upper:'帝出乎震', lower:'人生于寅',
      sources:['daoli'], finish:'black',
      note:'《泰山道里记》载为吴云题联。现挂联板形制与位置待核。',
    },
    {
      title:'殿内 · 神位前联', status:'图文转录 · 原件待核',
      upper:'木德承天橐籥陰陽甄品匯', lower:'青祗司令監觀上下仰靈威',
      aliases:'木德承天橐籥阴阳甄品汇 青祗司令监观上下仰灵威',
      sources:['tiankuangNotes'], finish:'blueWhite',
      note:'转录可供对照，「祗」等字和联板现状待近照校核。',
    },
  ],
  'b-shuming': [
    {
      title:'后寝正宫 · 前檐抱柱联', status:'按现挂联照片录文',
      upper:'震出泰亨萬物廣生推聖德', lower:'雲蒸雨降八方甘澤遍崇朝',
      aliases:'淑明殿 震出泰亨万物广生推圣德 推盛德 云蒸雨降八方甘泽遍崇朝',
      photo:'shuming', sources:['eastTour'], finish:'blueGold', mount:'inner',
      note:'清代《东巡金石录》录作「推盛德」「徧崇朝」。三维联板采用照片中的「聖」「遍」。',
    },
  ],
  'b-yuanjun': [
    {
      title:'前檐 · 红地抱柱联', status:'两期实景照片对读',
      upper:'碧落高居金臺傳妙訣', lower:'蒼生溥佑木德仰慈恩',
      aliases:'碧落高居金台传妙诀 苍生溥佑木德仰慈恩',
      photo:'yaocan', finish:'red', mount:'inner',
      note:'两张照片分别补足被遮挡的联文。',
      sources:['yaocanRecent'],
    },
    {
      title:'门框 · 黑地金字联', status:'按实景照片录文',
      upper:'五嶽巨鎮推岱宗', lower:'插天萬仞青芙蓉',
      aliases:'五岳巨镇推岱宗 插天万仞青芙蓉',
      finish:'black', mount:'door', sources:['yaocanRecent','daizongVerse'],
      note:'联文亦见《湖海诗传》所收诗作。',
    },
  ],
  'b-yaocan-yimen': [
    {
      title:'遥参亭 · 仪门门联', status:'文献记载',
      upper:'倚山踞城無雙地', lower:'奉神祈福第一宮',
      aliases:'倚山踞城无双地 奉神祈福第一宫',
      sources:['yaocanArticle'], finish:'red', mount:'gateway',
      note:'位置在元君殿南面、遥参亭山门内的仪门。联板形制为示意。',
    },
  ],
  'b-dai-arch': [
    {
      title:'南面 · 施天裔刻联', status:'文献记载',
      upper:'峻極于天贊化體元生萬物',lower:'帝出乎震赫聲濯靈鎮東方',
      aliases:'峻极于天赞化体元生万物 帝出乎震赫声濯灵镇东方',
      sources:['oldGuide'],finish:'stone',mount:'south',
    },
    {
      title:'北面 · 赵祥星刻联', status:'石柱照片与文献对读',
      upper:'為眾嶽之統宗萬國具瞻巍巍乎德何可尚',lower:'操群靈之總攝九州待命蕩蕩乎功孰與京',
      aliases:'为众岳之统宗万国具瞻巍巍乎德何可尚 操群灵之总摄九州待命荡荡乎功孰与京',
      sources:['oldGuide','archStudy'],finish:'stone',mount:'north',
      photo:'arch',
      note:'照片拍自坊北，重复字在石柱上用重文号。模型用直排文字示意。',
    },
  ],
  'a-yuhua': [
    {
      title:'雨花藏头联', status:'清代文献记载 · 原悬挂处待核',
      upper:'雨不崇朝徧天下',lower:'花隨流水到人間',aliases:'雨不崇朝遍天下 花随流水到人间',
      sources:['coupletLandmarks'],finish:'paper',
      note:'梁章钜记此联在雨花道院，未记是哪一处建筑或何人题写。「徧」同「遍」。',
    },
  ],
  'a-axis': [
    {
      title:'梁章钜宿岱庙题联', status:'清代作者自记 · 原悬挂处待核',
      upper:'攬月居然凌上界',lower:'搴雲便要灑齊州',aliases:'揽月居然凌上界 搴云便要洒齐州',
      sources:['coupletLandmarks','coupletLandmarksVariant'],finish:'paper',
      note:'梁章钜记在岱庙留宿时应庙僧之请作此联，未记后来悬于何处。传本有「㧛」「攓」「洒」等异写。',
    },
  ],
  'b-han-pavilion': [
    {
      title:'汉柏亭抱柱联',status:'导游词转录 · 联板与挂柱待核',
      upper:'萬壑千岩凌霄漢',lower:'登高壯觀天地間',
      aliases:'万壑千岩凌霄汉 登高壮观天地间 魏传统 汉碑亭 百鸟朝岳',
      pending:true,finish:'paper',
      position:'汉柏院北端的汉柏亭。导游词记作亭柱抱联，哪一面、哪一对柱及上下联的实物左右位置待核。',
      note:'导游词称魏传统题书，尚缺联板题款印证。1996 年出版的《魏传统书法作品选集》已找到出版记录，这副联是否收入仍待查。下联见李白《庐山谣寄卢侍御虚舟》，上联出处待考。图录依转录次序排列。',
      sources:['hanPavilionCoupletLead','hanPavilionLiBai','hanPavilionWeiAlbum','hanPavilionGazette','hanPavilionSouth','hanPavilionNorth'],
    },
  ],
};

export const coupletPlaces = [
  {id:'b-tiankuang',group:'殿宇'},
  {id:'b-shuming',group:'殿宇',label:'淑明殿（后寝宫正宫）'},
  {id:'b-yuanjun',group:'殿宇',label:'遥参亭碧霞元君殿'},
  {id:'b-yaocan-yimen',group:'门坊',label:'遥参亭仪门'},
  {id:'b-dai-arch',group:'门坊'},
  {id:'a-yuhua',group:'院落'},
  {id:'a-axis',group:'庙内位置待考',label:'岱庙（殿院待考）'},
  {id:'b-han-pavilion',group:'待核地点',sources:[
    'hanPavilion1962','hanPavilionPhoto','hanPavilionRepair2004','hanPavilionRepair2008','hanPavilionSurvey',
    'hanPavilionChenAlbum','hanPavilionMuseumAlbum',
  ]},
  {id:'b-dong-main',group:'待核地点',sources:['dongFacade','dongRecent','dongInteriorPhoto','layout']},
  {id:'b-luban',group:'待核地点',sources:['lubanFacade','lubanReport','oldGuide']},
  {id:'b-peitian',group:'待核地点',sources:['peitianDoor','peitianPhoto','peitianOblique','layout']},
  {id:'b-renan',group:'待核地点',sources:['renanPhoto','renanPlaques','layout']},
];

export const coupletNotes = {
  'b-han-pavilion':'1962 年汉碑亭合影已有图注，原图待核。2017 年南面和 2012 年亭内朝北照片的可见柱面上，均未见可辨认的联板。年鉴记载了 2004 年台基维修及 2008 年保护维修，未交代联板拆挂。岱庙普查档案与两本 1992 年版《岱庙》的相关图版仍待查阅。',
  'b-dong-main':'2017 年正殿近照可辨「東御座」匾，明间门框未见成对联板。2026 年照片的下部被前方屋顶遮挡，室内展陈照片也未见可辨联文。门联、柱联待核。',
  'b-luban':'旧馆复建后正面照可辨「魯班殿」匾，明间及可见檐柱未见成对联板。旧馆导览另载「萬代工師」匾。殿内及旧联待核。',
  'b-peitian':'2015 年正面近照能看清「配天門」匾和明间门框，未见成对联板。树冠遮住两侧部分檐柱，《泰安历史文化遗迹志》的建筑条目未提供联文。门联、柱联待核。',
  'b-renan':'实拍及现场记述可核檐下「仁安門」竖匾和门楣「天下歸仁」横匾。明间可见柱段未见成对联板，外侧柱列仍有树枝遮挡。门联、柱联待核。',
};
