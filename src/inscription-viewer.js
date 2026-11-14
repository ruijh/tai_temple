import { inscriptions, summitVerse } from './inscription-texts.js';
import archivalInscriptions from './archival-inscriptions.json';
import { photoPreviewUrl } from './remote-images.js';

export function hasTranscription(id) {
  return Boolean(inscriptions[id]?.sections.length || archivalInscriptions[id]?.length);
}

export function hasInscription(site) {
  return Boolean(site.photo || hasTranscription(site.id));
}

export function hasInscriptionPhoto(site) {
  return Boolean(site.photo || inscriptions[site.id]?.photos.length);
}

export function createInscriptionViewer({ make, button, link, credits }) {
  const dialog = document.getElementById('inscription-dialog');
  const content = document.getElementById('inscription-content');

  return function openInscription(site, record, entry = inscriptions[site.id]) {
    const credit=credits[site.photo];
    const photoOnly=entry?.photoOnly===true;
    const photos = entry?.photos ?? (credit?.licenseUrl ? [{
      original:credit.original,label:'实拍碑照',credit:credit.author+' · '+credit.license,
      source:credit.source,license:credit.licenseUrl,
    }] : []);
    document.getElementById('inscription-title').textContent = site.label;
    document.getElementById('inscription-location').textContent = record.location;
    dialog.querySelector('header button').setAttribute('aria-label',photoOnly?'关闭大图':'关闭碑照与碑文');

    const figure = make('figure', null, 'inscription-figure');
    const tool = make('div', null, 'inscription-tools');
    const viewport = make('div', null, 'inscription-viewport');
    viewport.tabIndex = 0;
    viewport.setAttribute('aria-label','图片。放大后可滚动查看。');
    const frame = make('div', null, 'inscription-frame');
    const photo = make('img');
    const marks = make('div', null, 'inscription-markers');
    marks.setAttribute('aria-hidden','true');
    const status = make('output');
    status.setAttribute('aria-live','polite');
    const caption = make('figcaption');
    frame.append(photo, marks);
    viewport.append(frame);

    let active = photos[0], zoom = 1;
    function resize() {
      if(!photo.naturalWidth)return;
      const fit = Math.min(viewport.clientWidth, viewport.clientHeight * photo.naturalWidth / photo.naturalHeight);
      if (fit > 0) frame.style.width = (fit * zoom) + 'px';
      status.textContent = Math.round(100 * zoom) + '%';
      shrink.disabled = zoom === 1;
      enlarge.disabled = zoom >= 8;
    }
    function scale(next, point) {
      if (!photo.naturalWidth) return;
      const rect = viewport.getBoundingClientRect();
      const x = point ? point.clientX - rect.left : viewport.clientWidth / 2;
      const y = point ? point.clientY - rect.top : viewport.clientHeight / 2;
      const before = frame.getBoundingClientRect();
      const ratioX = (rect.left + x - before.left) / before.width;
      const ratioY = (rect.top + y - before.top) / before.height;
      zoom = Math.min(8, Math.max(1, next));
      resize();
      const after = frame.getBoundingClientRect();
      viewport.scrollBy(after.left + after.width * ratioX - rect.left - x,
        after.top + after.height * ratioY - rect.top - y);
    }
    const shrink = button('−',null,()=>scale(zoom / 1.6));
    const enlarge = button('+',null,()=>scale(zoom * 1.6));
    shrink.setAttribute('aria-label',site.id?'缩小碑照':'缩小图片');
    enlarge.setAttribute('aria-label',site.id?'放大碑照':'放大图片');
    const reset = button('适合窗口',null,()=>scale(1));
    const layout = button('阅读顺序',null,()=> {
      if (layoutNote.hidden) layoutNote.hidden=false;
      layoutNote.scrollIntoView({block:'nearest'});
    });
    const toggle = button('定位诗句',null,()=> {
      if (active?.regions && photo.naturalWidth) {
        const left=Math.min(...active.regions.map(([x])=>x));
        const top=Math.min(...active.regions.map(([,y])=>y));
        const right=Math.max(...active.regions.map(([x,,w])=>x+w));
        const bottom=Math.max(...active.regions.map(([,y,,h])=>y+h));
        zoom = Math.min(8, 80 / (right-left), 90 / (bottom-top));
        resize();
        const rect = viewport.getBoundingClientRect(), bounds = frame.getBoundingClientRect();
        viewport.scrollBy(bounds.left - rect.left + bounds.width * (left+right) / 200 - viewport.clientWidth/2,
          bounds.top - rect.top + bounds.height * (top+bottom) / 200 - viewport.clientHeight/2);
      } else {
        verse?.scrollIntoView({block:'center'});
        verse?.focus({preventScroll:true});
      }
    });
    toggle.hidden = !entry?.position;
    layout.hidden = !entry?.position;
    tool.append(shrink,status,enlarge,reset,toggle,layout);

    const choices = make('div',null,'inscription-choices');
    const photoButtons = photos.map(item=>button(item.label,null,()=>choose(item)));
    choices.append(...photoButtons);
    function choose(item) {
      active = item;
      zoom = 1;
      status.textContent='正在载入图片…';
      shrink.disabled=true;
      enlarge.disabled=true;
      reset.disabled=true;
      viewport.scrollTo(0,0);
      viewport.hidden=false;
      frame.style.width = '';
      photo.alt = site.label+' · '+item.label;
      photo.src = item.original;
      photoButtons.forEach((control,index)=>control.setAttribute('aria-pressed',String(item === photos[index])));
      marks.replaceChildren(...(item.regions ?? []).map((region,index)=>{
        const marker=make('span',item.precise?String(index+1):null,'inscription-marker'+(item.precise?' is-precise':''));
        const [x,y,w,h] = region.map(value=>value+'%');
        Object.assign(marker.style,{left:x,top:y,width:w,height:h});
        return marker;
      }));
      caption.replaceChildren(make('span',item.width ? '原图 '+item.width+' × '+item.height+' 像素' : '实拍照片'));
      if (item.regions) caption.append(make('span',item.precise?'① 会当凌绝顶　② 一览众山小':'虚线框为阅读区示意'));
      if (item.credit) caption.append(make('span',item.credit));
      if (item.license) caption.append(link('授权 ↗',item.license));
      else caption.append(make('span','来源页未标开放许可'));
      const source = item.source ?? record.archive;
      if (source) caption.append(link('图像来源 ↗',source));
      if(item.original)caption.append(link('打开原图 ↗',item.original));
      if (photo.complete) resize();
    }
    photo.addEventListener('load',()=>{
      reset.disabled=false;
      viewport.hidden=false;
      resize();
    });
    photo.addEventListener('error',()=>{
      const preview=photoPreviewUrl(active.original,1920);
      if(photo.src===active.original&&preview!==active.original){
        photo.src=preview;
        return;
      }
      viewport.hidden=true;
      status.textContent='原站图片暂时无法显示，请打开原图或照片出处';
      shrink.disabled=true;
      enlarge.disabled=true;
    });
    photo.addEventListener('click',event=>scale(zoom === 1 ? 2 : 1,event));
    viewport.addEventListener('wheel',event=>{
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      scale(zoom * (event.deltaY < 0 ? 1.18 : 1/1.18),event);
    },{passive:false});
    let drag;
    let dragged = false;
    viewport.addEventListener('pointerdown',event=>{
      if (event.pointerType !== 'mouse' || event.button !== 0 || zoom === 1) return;
      drag = [event.clientX,event.clientY,viewport.scrollLeft,viewport.scrollTop];
      dragged = false;
      viewport.setPointerCapture(event.pointerId);
    });
    viewport.addEventListener('pointermove',event=>{
      if (!drag) return;
      const dx = event.clientX-drag[0], dy = event.clientY-drag[1];
      dragged ||= Math.hypot(dx,dy)>3;
      if (dragged) viewport.scrollTo(drag[2]-dx,drag[3]-dy);
    });
    viewport.addEventListener('pointerup',()=>{
      if (drag && !dragged) scale(1);
      drag = null;
    });
    viewport.addEventListener('pointercancel',()=>{drag=null;});
    photo.draggable = false;

    if(photos.length > 1) figure.append(choices);
    if(active) figure.append(tool,viewport,caption);
    const transcription = make('article',null,'inscription-transcription');
    const archive = record.archive;
    let verse;
    const layoutNote = make('p',entry?.position,'inscription-position');
    layoutNote.hidden = true;
    if(entry){
      if(entry.position){
        const quote = make('blockquote',summitVerse);
        transcription.append(quote,make('p',entry.position,'inscription-position'));
        const order = make('div',null,'inscription-order');
        order.append(make('p','按释文标出阅读顺序'));
        order.append(make('span',entry.sections.length>1?'秋兴其八':'前六句'),make('span','→'),
          make('strong','《望岳》末联'),make('span','→'),make('span','何人麟题记'));
        transcription.append(order);
        figure.append(layoutNote);
      }
      const reading = make('div',null,'inscription-reading');
      for(const section of entry.sections){
        const part = make('section');
        part.append(make('h3',section.title));
        for(const line of section.lines){
          const row = make('p');
          if (line === summitVerse) {
            verse = make('mark',line);
            verse.tabIndex = -1;
            row.append(verse);
          } else row.textContent = line;
          part.append(row);
        }
        if(section.title==='望岳') reading.prepend(part);
        else reading.append(part);
      }
      transcription.append(reading,...entry.notes.map(note=>make('p',note,'inscription-note')));
    } else transcription.append(make('h3','碑刻档案'),make('p',record.description));
    if (archivalInscriptions[site.id]?.length) {
      const appendix = make('details',null,'inscription-appendix');
      appendix.open = !entry;
      appendix.append(make('summary',entry ? '附录碑文（据官方档案）' : '碑文录文（据官方档案）'));
      appendix.append(...archivalInscriptions[site.id].map(line=>make('p',line)));
      transcription.append(appendix);
    }
    if(archive) transcription.append(link(site.id?'核对泰山石刻档案 ↗':'查看石刻资料 ↗',archive));
    for(const reference of entry?.references??[]){
      const item=make('p');
      item.append(link(...reference));
      transcription.append(item);
    }
    content.classList.toggle('inscription-text-only',!active);
    content.classList.toggle('photo-only',photoOnly);
    content.replaceChildren(...(photoOnly ? [figure] : active ? [figure,transcription] : [transcription]));
    if (active) choose(active);
    dialog.showModal();
    const observer = new ResizeObserver(resize);
    observer.observe(viewport);
    dialog.addEventListener('close',()=>observer.disconnect(),{once:true});
    dialog.scrollTop = 0;
    resize();
  };
}
