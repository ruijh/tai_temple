import { ancientTrees, pendingTreeLocations, treeLocations, treeRoute, treeRouteSource, treesById } from './ancient-trees.js';
import { loadPhotoPreview } from './remote-images.js';

export function createTreeGuide({make, button, link, openInscription, locate, startRoute}) {
  const dialog=document.getElementById('tree-dialog');
  const record=document.getElementById('tree-record');
  const entries=new Map();
  let activeTree=treeRoute[1];

  function photos(tree) {
    const gallery=make('div',null,tree.compare?'tree-photos tree-compare':'tree-photos');
    for(const photo of tree.photos){
      const figure=make('figure');
      const zoom=()=>openInscription({label:photo.label},{location:tree.location},
        {photoOnly:true,photos:[photo],sections:[],notes:[]});
      const caption=make('figcaption');
      caption.append(make('strong',photo.label),make('small',photo.credit));
      const refs=make('div',null,'side-links');
      if(photo.linkOnly){
        caption.append(make('small','请前往原站查看'));
      }else{
        const preview=button('',null,zoom);
        const image=make('img');
        image.alt=photo.label;
        image.width=photo.width;
        image.height=photo.height;
        preview.setAttribute('aria-label','放大查看'+photo.label);
        preview.append(image);
        figure.append(preview);
        loadPhotoPreview(image,photo,500,()=>{
          preview.remove();
          caption.append(make('small','预览暂不可用，可打开原图或照片出处。'));
          refs.prepend(button('放大查看','tree-zoom-button',zoom));
        },false);
      }
      refs.append(link('原图 ↗',photo.original),link('照片出处 ↗',photo.source));
      if(photo.license)refs.append(link('授权 ↗',photo.license));
      else caption.append(make('small','来源页未标开放许可'));
      caption.append(refs);
      figure.append(caption);
      gallery.append(figure);
    }
    return gallery;
  }

  function drawRecord(tree, focus=false){
    for(const [id,entry] of entries){
      if(tree.id===id)entry.setAttribute('aria-current','true');
      else entry.removeAttribute('aria-current');
    }
    activeTree=tree;
    const point=treeLocations[tree.id];
    const heading=make('div',null,'tree-record-heading');
    heading.append(button('← 返回目录','tree-return',()=>{
      dialog.classList.remove('tree-show-record');
      entries.get(tree.id).focus();
    }),make('p','树号 '+tree.id.slice(2),'zone'),make('h3',tree.label));
    if(tree.alias)heading.append(make('p',tree.alias,'detail-meta'));
    const status=make('div',null,'tree-record-location');
    status.append(make('p',point?'三维可定位 · 相对点位':'树木点位待核','tree-status'),
      button(point?'三维定位此树':'查看所在区域','secondary',()=>{
        dialog.close();
        locate(tree);
      }));
    const facts=make('dl',null,'stele-facts');
    for(const [key,value] of [['树种',tree.species],['林业编号',tree.registry],['位置',tree.location],['树龄',tree.age]]){
      if(value)facts.append(make('dt',key),make('dd',value));
    }
    const references=make('div',null,'side-links tree-references');
    for(const ref of tree.refs)references.append(link(...ref));
    if(point&& !tree.refs.some(([,url])=>url===point.reference[1]))references.append(link(...point.reference));
    record.replaceChildren(heading,status,photos(tree));
    if(tree.compare)record.append(make('p',tree.compare,'tree-caption'));
    const officialPhoto=tree.photos.find(photo=>!photo.license);
    if(officialPhoto&&!tree.refs.some(([,url])=>url===officialPhoto.source)){
      references.prepend(link('官方古树资料 ↗',officialPhoto.source));
    }
    record.append(facts,make('h4','史料与树形'),make('p',tree.history,'description'),references);
    if(point)record.append(make('p',point.evidence+' 三维标示为相对位置。','tree-caption'));
    else record.append(make('p',pendingTreeLocations[tree.id],'tree-caption'));
    record.scrollTop=0;
    if(focus)record.focus({preventScroll:true});
  }

  for(const [index,tree] of ancientTrees.entries()){
    const row=make('li');
    const entry=button('',null,()=>{
      dialog.classList.add('tree-show-record');
      drawRecord(tree,true);
    });
    entry.append(make('strong',tree.label),make('small',tree.id.slice(2)+' · '+tree.location));
    if(!treeLocations[tree.id])entry.append(make('span','待核','tree-status'));
    row.append(entry);
    document.getElementById(index<treeRoute.length?'ancient-cypress-list':'other-tree-list').append(row);
    entries.set(tree.id,entry);
  }
  document.getElementById('tree-route-source').append(link(...treeRouteSource));
  document.getElementById('start-tree-route').addEventListener('click',()=>{
    dialog.close();
    startRoute();
  });

  return function openTrees(id){
    dialog.classList.toggle('tree-show-record',Boolean(id));
    drawRecord(treesById.get(id)??activeTree);
    if(!dialog.open)dialog.showModal();
    if(id)record.focus({preventScroll:true});
  };
}
