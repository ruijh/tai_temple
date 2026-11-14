const commonsFiles = 'https://upload.wikimedia.org/wikipedia/commons/';
const commonsThumbnails = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/';

export function photoPreviewUrl(original, width) {
  if(!original.startsWith(commonsFiles)) return original;
  const path=original.slice(commonsFiles.length);
  return commonsThumbnails+path+'/'+width+'px-'+path.split('/').at(-1);
}

export function loadPhotoPreview(image, original, width, onFailure=()=>image.remove()) {
  const preview=photoPreviewUrl(original,width);
  image.addEventListener('error',()=>{
    if(preview===original){
      onFailure();
      return;
    }
    image.addEventListener('error',onFailure,{once:true});
    image.src=original;
  },{once:true});
  image.loading='lazy';
  image.decoding='async';
  image.src=preview;
}
