import { inscriptions } from './inscription-texts.js';

function facePhoto(id,side,label,corners,previewWidth) {
  return {side,label,corners,previewWidth,photo:inscriptions[id].photos[0]};
}

// Face corners are normalized coordinates on the original photo, clockwise from the top left.
// Offsets are in scene meters relative to that feature.
export const verifiedStelae = {
  's-2421': {
    anchor:'b-zhengyang',offset:[-30,0,-51],
    location:'配天门西南的西碑台。与宣和碑东西相对。',
    locationSource:'https://shandong-chorography.org/database/b9/section/13-newsite-3510/article/551/',
    model:{w:2.17,d:.63,form:'turtle',baseH:1.43,tone:'pale'},
    faces:[facePhoto('s-2421','back','碑阴 · 五岳独宗',
      [[.4434,.2361],[.6425,.2990],[.6681,.7525],[.4737,.7526]],1920)],
  },
  's-2084': {
    anchor:'b-bingling',offset:[-3,0,-10],
    location:'配天门东南，炳灵门外北侧。与祥符碑东西相对。',
    locationSource:'https://shandong-chorography.org/database/b9/section/13/article/553/',
    model:{w:2.05,d:.68,form:'turtle',baseH:1.92,bodyH:5.47,headW:2.65,headD:.87,tone:'warm'},
    faces:[facePhoto('s-2084','back','碑阴 · 万代瞻仰',
      [[.4721,.3664],[.5454,.3475],[.5404,.6919],[.4672,.6922]])],
  },
  's-1842': {
    anchor:'b-han-pavilion',offset:[0,.89,4.507],
    location:'汉柏亭二层台基南墙中央。正面实景中六石连续并排。',
    locationSource:'https://commons.wikimedia.org/wiki/File:Han_dynasty_cypress_pavilion,_Dai_Temple.jpg',
    model:{w:5.78,d:.08,height:.48,form:'embedded',tone:'dark'},
    faces:[facePhoto('s-1842','front','南墙 · 六块连碑',
      [[.1979,.7080],[.8425,.7029],[.8471,.7781],[.1977,.7833]],3840)],
  },
};
