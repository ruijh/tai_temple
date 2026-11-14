import supplement from './stele-supplement.json';

export const supplementalRecords = supplement;

const groups = {
  'b-peitian':'配天门前','b-tiankuang':'天贶殿前','b-ge-pool':'天贶殿前',
  'b-stele-gallery':'东碑廊','a-dong':'东御座','a-tang':'唐槐院',
  'a-yuhua':'雨花道院','b-yuhua-east-gallery':'雨花道院','b-yuhua-west-gallery':'雨花道院',
  'b-yaocan':'遥参亭','b-double-pool':'双龙池','b-shuming':'后寝宫',
};

const labels = {
  's-2089':'泰山赞碑',
  's-2074':'金大定重修东岳庙碑',
  's-2034':'明洪武去东岳封号碑',
  's-2031':'明洪武祭祀碑',
  's-2030':'康熙重修东岳庙碑',
  's-2029':'大观圣作之碑',
  's-2062':'孙夫人碑',
};

const areaByParent = {
  'b-yaocan':'a-yaocan',
};

export const supplementalStelae = Object.entries(supplement).map(([id,record])=>{
  const group=groups[record.parent] ?? (record.location.includes('炳灵门')?'炳灵门外':'馆藏与文献');
  const area=areaByParent[record.parent] ?? record.parent ?? (group==='炳灵门外'?'b-bingling':null);
  return {id,label:labels[id]??record.name,group,area,kind:'stele',photo:record.photo?.key};
});
