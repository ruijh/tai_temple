export const summitVerse = '会当凌绝顶，一览众山小。';

const wangyue = {
  title:'望岳',
  lines:['岱宗夫如何？齐鲁青未了。','造化钟神秀，阴阳割昏晓。','荡胸生层云，决眦入归鸟。',summitVerse],
};
const rubbingsSource = 'https://commons.wikimedia.org/wiki/File:SSID-11565638_泰山石刻大全_第4冊.pdf';

const autumn = [
  ['玉露凋伤枫树林，巫山巫峡气萧森。','江间波浪兼天涌，塞上风云接地阴。','丛菊两开他日泪，孤舟一系故园心。','寒衣处处催刀尺，白帝城高急暮砧。'],
  ['夔府孤城落日斜，每依北斗望京华。','听猿实下三声泪，奉使虚随八月槎。','画省香炉违伏枕，山楼粉堞隐悲笳。','请看石上藤萝月，已映洲前芦荻花。'],
  ['千家山郭静朝晖，日日江楼坐翠微。','信宿渔人还泛泛，清秋燕子故飞飞。','匡衡抗疏功名簿，刘向传经心事违。','同学少年多不贱，五陵衣马自轻肥。'],
  ['闻道长安似弈棋，百年世事不胜悲。','王侯第宅皆新主，文武衣冠异昔时。','直北关山金鼓震，征西车马羽书迟。','鱼龙寂寞秋江冷，故国平居有所思。'],
  ['蓬莱宫阙对南山，承露金茎霄汉间。','西望瑶池降王母，东来紫气满函关。','云移雉尾开宫扇，日绕龙鳞识圣颜。','一卧沧江惊岁晚，几回青琐点朝班？'],
  ['瞿塘峡口曲江头，万里风烟接素秋。','花萼夹城通御气，芙蓉小苑入边愁。','珠帘绣柱围黄鹄，锦缆牙墙起白鸥。','回首可怜歌舞地，秦中自古帝王州。'],
  ['昆明池水汉时功，武帝旌旗在眼中。','织女机丝虚夜月，石鲸鳞甲动秋风。','波漂菰米沈云黑，露冷莲房坠粉红。','关塞极天唯鸟道，江湖满地一渔翁。'],
  ['昆吾御宿自逶迤，紫阁峰阴入渼陂。','香稻啄余鹦鹉粒，碧梧栖老凤凰枝。','佳人拾翠春相问，仙侣同舟晚更移。','彩笔昔曾千气象，白头吟望若低垂。'],
].map((lines,index)=>({title:'秋兴八首 · 其'+'一二三四五六七八'[index],lines}));

export const inscriptions = {
  's-1845':{
    photos:[],
    sections:[{title:'回马岭',lines:['崇椒越上越嶔崎','傳說真宗回馬斯','若論天書來致奠','到斯回馬已為遲','辛卯仲春下澣御題']}],
    notes:['碑身高 165 厘米、宽 68 厘米。档案链接内附实拍碑面。'],
  },
  's-2421':{
    photos:[
      {label:'碑阴实拍',width:3072,height:4096,
        original:'https://upload.wikimedia.org/wikipedia/commons/1/19/20260721_%E5%B2%B1%E5%BA%99_%E4%BA%94%E5%B2%B3%E7%8B%AC%E5%AE%97.jpg',
        credit:'祝鱼贵 · CC BY-SA 4.0',
        source:'https://commons.wikimedia.org/wiki/File:20260721_岱庙_五岳独宗.jpg',
        license:'https://creativecommons.org/licenses/by-sa/4.0/'},
    ],
    sections:[
      {title:'碑阴大字',lines:['五岳独宗']},
      {title:'碑阳 · 碑额与铭文节录',lines:['大宋东岳天齐仁圣帝碑','节彼泰山，蟠亘大东。一气凝神，五岳推雄。']},
    ],
    notes:['碑阴大字为明代张允济、王贤所题。碑阳为宋代晁迥撰、尹熙古书并篆额，档案链接附碑阳录文。'],
  },
  's-2084':{
    photos:[
      {label:'碑阴实拍',width:2560,height:1600,
        original:'https://upload.wikimedia.org/wikipedia/commons/7/72/%E5%B2%B1%E5%BB%9F%E5%85%A7%E7%9A%84%E7%9F%B3%E7%A2%91%EF%BC%9A%E8%90%AC%E4%BB%A3%E7%9E%BB%E4%BB%B0.jpg',
        credit:'Boreas Sawada · CC BY-SA 4.0',
        source:'https://commons.wikimedia.org/wiki/File:岱廟內的石碑：萬代瞻仰.jpg',
        license:'https://creativecommons.org/licenses/by-sa/4.0/'},
    ],
    sections:[
      {title:'碑阴大字',lines:['萬代瞻仰']},
      {title:'碑阳 · 碑额与碑文节录',lines:['宣和重修泰岳庙记','宣和四年九月，有司以泰岳宫庙完成奏功。']},
    ],
    notes:['碑阳为宇文粹中撰、张漴书篆，档案链接附碑阳录文。'],
  },
  's-2045':{
    photos:[],
    references:[['打开《泰山石刻大全》第四册（扫描第 183 页，书页 644） ↗',rubbingsSource]],
    position:'将扫描第 183 页上方的横置拓片顺时针转 90 度，再从右往左读。右起第三列下段为“会当凌绝顶”，紧邻左列上段为“一览众山小”。',
    sections:[wangyue],
    notes:[
      '碑阳在诗后刻何人麟题记。他由蓬莱调任泰安后登岱，因未见杜甫《望岳》诗碑，遂于乾隆四十九年仲夏书刻。',
      '碑阴上部为登岱诗和题记，后段残泐；下部为咏汉柏七古，题于乾隆四十九年十一月。碑阴及残缺字的录法见官方档案。',
    ],
  },
  's-1842':{
    photos:[
      {label:'汉柏亭及六块连碑实拍',width:6000,height:4000,
        original:'https://upload.wikimedia.org/wikipedia/commons/5/5f/Han_dynasty_cypress_pavilion%2C_Dai_Temple.jpg',
        credit:'Huanokinhejo · CC BY-SA 4.0',
        source:'https://commons.wikimedia.org/wiki/File:Han_dynasty_cypress_pavilion,_Dai_Temple.jpg',
        license:'https://creativecommons.org/licenses/by-sa/4.0/',
        regions:[[28.1,71.0,2.6,6.8]]},
    ],
    references:[['打开《泰山石刻大全》第四册（扫描第 177 页，书页 638 下图） ↗',rubbingsSource]],
    position:'六石自右向左读。《望岳》接在第八首之后，末联在最左一石右端，随后是乾隆四十九年题记。实景与第638页下图的末石拓片可对照，虚线框标到阅读区，漫漶字迹待逐字复核。',
    sections:[...autumn,wangyue],
    notes:['诗文沿用泰山石刻档案录文，个别字与通行诗本有异。末段题记记述何人麟登岱见“一览众山小”石刻后，在浴日养云亭书写《秋兴》与《望岳》。'],
  },
};

