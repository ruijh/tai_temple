import { cliffInscriptions, cliffReferences, cliffSections, cliffSources } from './cliff-inscriptions.js';
import { cliffRoutePoints } from './cliff-route-points.js';
import { loadPhotoPreview } from './remote-images.js';

const searchKey=value=>value.toLowerCase().replace(/[\s\p{P}]+/gu,'');
const sections=new Map(cliffSections.map(section=>[section.id,section]));
const surveys=[
  ['全部路段','all'],
  ...cliffSections.map(section=>[section.label,section.id]),
];

export function createCliffGallery({ make, button, link, openInscription, showRoute }) {
  const dialog=document.getElementById('cliff-dialog');
  const nav=document.getElementById('cliff-sections');
  const list=document.getElementById('cliff-list');
  const detail=document.getElementById('cliff-detail');
  const query=document.getElementById('cliff-query');
  const count=document.getElementById('cliff-count');
  const sources=document.getElementById('cliff-sources');
  let sectionFilter='all', selected=null, activeButton;

  const sectionButtons=surveys.map(([label,id])=>{
    const item=button(label,id==='valley'?'cliff-branch':null,()=>{
      sectionFilter=id;
      closeDetail(false);
      renderList();
    });
    return [id,item];
  });
  nav.append(...sectionButtons.map(([,item])=>item));
  const evidence=make('details');
  evidence.append(make('summary','调研范围与资料'),
    make('p','沿红门盘路，经中天门、南天门至岱顶，含经石峪支线和日观峰。'),
    make('p','全红门游览线记有 300 多处摩崖刻石，红门管理区记有 103 处。两项统计采用不同范围。'));
  const references=make('ul');
  for(const ref of ['route','survey','list','area','book']){
    const item=make('li');
    item.append(link(...cliffSources[ref]));
    references.append(item);
  }
  evidence.append(references);
  sources.append(evidence);

  function openPhoto(entry) {
    const {pictures,text,textLabel,title,position,note}=entry;
    const photos=pictures.map(picture=>({...picture,label:picture.caption}));
    const sections=text||!entry.readingPending?[{title:textLabel??(text?'题刻录文':'著录题字'),lines:text??[title]}]:[];
    openInscription({label:title},{location:position,archive:cliffReferences(entry)[0]?.[1]},
      {photos,sections,notes:note?[note]:[]});
  }

  function drawDetail(entry, focus=false) {
    detail.replaceChildren();
    const section=sections.get(entry.section);
    const toolbar=make('div',null,'cliff-detail-tools');
    toolbar.append(button('← 返回目录','cliff-return',()=>closeDetail(true)),
      make('p',section.name,'zone'));
    detail.append(toolbar,make('h3',entry.title));
    const mapped=cliffRoutePoints[entry.id];
    detail.append(make('p',mapped?'已核岩面 · 红门线路标注':entry.state??'地图点位待核','cliff-status'));
    const picture=entry.pictures?.[0];
    if(picture){
      const figure=make('figure',null,'cliff-photo');
      const expand=button('',null,()=>openPhoto(entry));
      expand.setAttribute('aria-label','放大查看'+picture.caption);
      const photo=make('img');
      photo.alt=picture.caption;
      expand.append(photo);
      const caption=make('figcaption',picture.caption+' · '+entry.pictures.length+' 张照片可放大');
      caption.append(make('small',picture.credit),link('打开原图 ↗',picture.original),link('图像来源 ↗',picture.source));
      if(picture.license)caption.append(link('授权 ↗',picture.license));
      loadPhotoPreview(photo,picture.original,960,()=>{
        expand.remove();
        caption.append(make('small','预览暂不可用'),button('查看照片与释文','secondary',()=>openPhoto(entry)));
      });
      figure.append(expand,caption);
      detail.append(figure);
    }else if(!entry.state)detail.append(make('p','高清实景照片待补。','cliff-note'));
    const facts=make('dl',null,'stele-facts');
    for(const [label,value] of [['位置',entry.position],['年代',entry.date??'待考'],['题署',entry.author??'待考'],['档案尺寸',entry.size]]){
      if(value)facts.append(make('dt',label),make('dd',value));
    }
    detail.append(facts);
    if(mapped&&showRoute){
      detail.append(make('p',mapped.location,'cliff-note'),button('在泰山线路定位','secondary',()=>{
        if(showRoute(entry.id))dialog.close();
      }));
    }
    if(entry.text||!entry.readingPending){
      const reading=make('section',null,'cliff-reading');
      reading.append(make('h4',entry.textLabel??(entry.text?'石刻录文':'著录题字')));
      for(const line of entry.text??[entry.title])reading.append(make('p',line));
      detail.append(reading);
    }else detail.append(make('p','刻文待复核。','cliff-note'));
    if(entry.note)detail.append(make('p',entry.note,'cliff-note'));
    const foot=make('div',null,'cliff-detail-sources');
    foot.append(make('h4','资料来源'));
    for(const ref of cliffReferences(entry))foot.append(link(...ref));
    detail.append(foot);
    detail.scrollTop=0;
    if(focus)detail.focus({preventScroll:true});
  }

  function closeDetail(returnFocus) {
    const previous=activeButton;
    selected=null;
    activeButton=null;
    dialog.classList.remove('cliff-show-detail');
    previous?.removeAttribute('aria-current');
    if(returnFocus)previous?.focus();
  }

  function renderList() {
    const term=searchKey(query.value);
    const matches=cliffInscriptions.filter(entry=>
      (sectionFilter==='all'||entry.section===sectionFilter)&&
      searchKey([entry.title,entry.aliases,entry.date,entry.author,entry.position,...(entry.text??[])].join(' ')).includes(term));
    count.textContent=matches.length+' 条';
    for(const [id,item] of sectionButtons)item.setAttribute('aria-pressed',String(id===sectionFilter));
    list.replaceChildren();
    activeButton=null;
    for(const section of cliffSections){
      const entries=matches.filter(entry=>entry.section===section.id);
      if(!entries.length)continue;
      const group=make('section',null,'cliff-group');
      const heading=make('h3',section.name);
      const description=make('p',section.description,'cliff-section-description');
      const rows=make('ul');
      for(const entry of entries){
        const li=make('li');
        const row=button('','cliff-row',()=>{
          activeButton?.removeAttribute('aria-current');
          selected=entry;
          activeButton=row;
          row.setAttribute('aria-current','true');
          dialog.classList.add('cliff-show-detail');
          drawDetail(entry,true);
        });
        row.append(make('strong',entry.title),make('small',[entry.date,entry.author].filter(Boolean).join(' · ')||entry.position));
        const availability=[entry.pictures?.length?'有照片':'',cliffRoutePoints[entry.id]?'可定位':''].filter(Boolean);
        if(availability.length)row.append(make('span',availability.join(' · '),'cliff-row-note'));
        if(selected===entry){
          row.setAttribute('aria-current','true');
          activeButton=row;
        }
        li.append(row);
        rows.append(li);
      }
      group.append(heading,description,rows);
      list.append(group);
    }
    if(!matches.length){
      closeDetail(false);
      list.append(make('p','没有匹配的石刻，可更换关键词或路段。','cliff-empty'));
      detail.replaceChildren();
    }else if(!matches.includes(selected)){
      detail.replaceChildren(make('p','选择一条石刻查看位置、录文和史料。','cliff-empty'));
    }
  }

  query.addEventListener('input',()=>{
    closeDetail(false);
    renderList();
  });
  if(showRoute){
    const route=button('查看红门登山线','secondary',()=>{
      if(showRoute())dialog.close();
    });
    sources.append(route);
  }
  return function openCliffs(section='all',entryId) {
    sectionFilter=section;
    query.value='';
    closeDetail(false);
    selected=cliffInscriptions.find(entry=>entry.id===entryId)??null;
    renderList();
    if(!dialog.open)dialog.showModal();
    sectionButtons.find(([id])=>id===sectionFilter)?.[1].scrollIntoView({block:'nearest',inline:'nearest'});
    dialog.querySelector('.cliff-index').scrollTop=0;
    dialog.scrollTop=0;
    if(selected){
      dialog.classList.add('cliff-show-detail');
      activeButton?.scrollIntoView({block:'nearest'});
      drawDetail(selected,true);
    }
  };
}
