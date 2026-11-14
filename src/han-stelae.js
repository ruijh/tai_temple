import hanRecords from './han-stones.json';

export const hanEntries = hanRecords;

const labels = {
  's-1923':'御制汉柏图碑',
  's-1901':'第一山碑',
  's-1961':'观海碑',
  's-1959':'汉柏图赞碑',
  's-1920':'张鹏翮题汉柏诗碑',
  's-1897':'篑为山碑',
  's-1919':'刘海粟题汉柏碑',
  's-1960':'汉柏凌寒碑',
  's-1873':'明岱岳庙碑',
  's-1889':'元蒿里山神祠诗碑',
  's-1878':'乾隆五经论碑',
  's-1842':'秋兴八首诗碑',
};

export const hanStelae = Object.entries(hanRecords).map(([id,record])=>({
  id,label:labels[id]??record.name,kind:'stele',area:'a-han',
  group:record.location.includes('东碑墙')?'汉柏院东碑墙':/汉柏亭|汉亭/.test(record.location)?'汉柏亭周边':'汉柏院',
  photo:record.photo?.key,
}));
