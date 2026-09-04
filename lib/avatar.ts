import sharp from 'sharp';
import {validate} from './calendar.js';
export async function fetchAvatar(username:string):Promise<string|null>{
  validate(username,'last-year');
  try{
    let url=new URL(`https://github.com/${username}.png?size=128`);
    const signal=AbortSignal.timeout(5000);
    for(let i=0;i<4;i++){
      if(url.protocol!=='https:'||!['github.com','avatars.githubusercontent.com'].includes(url.hostname)||url.username||url.password||url.port)return null;
      const response=await fetch(url,{redirect:'manual',signal});
      if([301,302,303,307,308].includes(response.status)){const location=response.headers.get('location');await response.body?.cancel();if(!location)return null;url=new URL(location,url);continue;}
      if(!response.ok||!/^image\/(png|jpeg|webp)/.test(response.headers.get('content-type')??'')||Number(response.headers.get('content-length'))>500000){await response.body?.cancel();return null;}
      const reader=response.body?.getReader();if(!reader)return null;
      let length=0;const chunks:Uint8Array[]=[];
      while(true){const {value,done}=await reader.read();if(done)break;length+=value.length;if(length>500000){await reader.cancel();return null;}chunks.push(value);}
      const png=await sharp(Buffer.concat(chunks),{limitInputPixels:4000000}).resize(128,128,{fit:'cover'}).png().toBuffer();
      return 'data:image/png;base64,'+png.toString('base64');
    }
  }catch{/* Avatar is optional; never replace valid calendar data with an error. */}
  return null;
}
