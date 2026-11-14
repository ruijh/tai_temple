import * as T from 'three';
import { photoPreviewUrl } from './remote-images.js';

async function fetchImage(url) {
  const response=await fetch(url,{signal:AbortSignal.timeout(10000)});
  if(!response.ok) throw new Error('Image request failed: '+response.status);
  return createImageBitmap(await response.blob());
}

function rectify(image,corners,width,height) {
  const source=document.createElement('canvas');
  source.width=image.width;
  source.height=image.height;
  const pixels=source.getContext('2d',{willReadFrequently:true});
  pixels.drawImage(image,0,0);
  const input=pixels.getImageData(0,0,source.width,source.height).data;

  const canvas=document.createElement('canvas');
  canvas.width=width;
  canvas.height=height;
  const context=canvas.getContext('2d');
  const output=context.createImageData(width,height);

  // Map the unit rectangle to the four corners on the photograph.
  const [[x0,y0],[x1,y1],[x2,y2],[x3,y3]]=corners;
  const dx1=x1-x2, dx2=x3-x2, dy1=y1-y2, dy2=y3-y2;
  const dx=x0-x1+x2-x3, dy=y0-y1+y2-y3;
  const determinant=dx1*dy2-dx2*dy1;
  const g=(dx*dy2-dy*dx2)/determinant;
  const h=(dx1*dy-dy1*dx)/determinant;
  const a=x1-x0+g*x1, b=x3-x0+h*x3;
  const d=y1-y0+g*y1, e=y3-y0+h*y3;

  for(let row=0;row<height;row++){
    const v=(row+.5)/height;
    for(let col=0;col<width;col++){
      const u=(col+.5)/width;
      const z=g*u+h*v+1;
      const x=(a*u+b*v+x0)/z*(source.width-1);
      const y=(d*u+e*v+y0)/z*(source.height-1);
      const left=Math.floor(x), top=Math.floor(y);
      const fx=x-left, fy=y-top;
      const i=(top*source.width+left)*4, j=i+source.width*4;
      const target=(row*width+col)*4;
      for(let c=0;c<3;c++){
        const upper=input[i+c]*(1-fx)+input[i+4+c]*fx;
        const lower=input[j+c]*(1-fx)+input[j+4+c]*fx;
        output.data[target+c]=upper*(1-fy)+lower*fy;
      }
      output.data[target+3]=255;
    }
  }
  context.putImageData(output,0,0);
  return new T.CanvasTexture(canvas);
}

export async function loadSteleTexture({photo,corners,previewWidth},aspect) {
  let image;
  const url=photo.original;
  if(previewWidth){
    try { image=await fetchImage(photoPreviewUrl(url,previewWidth)); }
    catch { image=await fetchImage(url); }
  }else image=await fetchImage(url);
  try {
    const height=aspect>1?Math.max(1,Math.round(2048/aspect)):1024;
    const width=aspect>1?2048:Math.max(1,Math.round(height*aspect));
    const texture=rectify(image,corners,width,height);
    texture.colorSpace=T.SRGBColorSpace;
    return texture;
  } finally {
    image.close();
  }
}
