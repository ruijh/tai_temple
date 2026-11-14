const commonsFiles = 'https://upload.wikimedia.org/wikipedia/commons/';
const commonsThumbnails = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/';

export function photoPreviewUrl(original, width) {
  if(!original.startsWith(commonsFiles)) return original;
  const path=original.slice(commonsFiles.length);
  return commonsThumbnails+path+'/'+width+'px-'+path.split('/').at(-1);
}

function loadRemotePhoto(image, urls, {onLoad, onFailure, lazy=true}){
  const candidates=[...new Set(urls.filter(Boolean))].values();
  let timer;
  const cleanup=()=>{
    clearTimeout(timer);
    image.removeEventListener('load',loaded);
    image.removeEventListener('error',next);
  };
  function loaded(){
    cleanup();
    onLoad?.();
  }
  function next(){
    clearTimeout(timer);
    const {value:url,done}=candidates.next();
    if(done){
      cleanup();
      image.removeAttribute('src');
      onFailure();
      return;
    }
    image.src=url;
    // Lazy images can wait off-screen without starting a network request.
    if(!lazy)timer=setTimeout(next,8000);
  }
  image.loading=lazy?'lazy':'eager';
  image.decoding='async';
  image.addEventListener('load',loaded);
  image.addEventListener('error',next);
  next();
  return cleanup;
}

export function loadPhotoPreview(image, photo, width, onFailure=()=>image.remove(), lazy=true) {
  const {original}=photo;
  const urls=[photoPreviewUrl(original,width),photoPreviewUrl(original,330),original];
  return loadRemotePhoto(image,urls,{onFailure,lazy});
}

export function loadPhotoForZoom(image, photo, onLoad, onFailure){
  const {original,width,height}=photo;
  const large=width>=5000?3840:height>width?1920:1280;
  const urls=[photoPreviewUrl(original,large),photoPreviewUrl(original,960),original];
  return loadRemotePhoto(image,urls,{onLoad,onFailure,lazy:false});
}
