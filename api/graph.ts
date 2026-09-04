import type { IncomingMessage,ServerResponse } from 'node:http';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import opentype from 'opentype.js';
import sharp from 'sharp';
import {fetchCalendar,HttpError} from '../lib/calendar.js';
import {options,render} from '../lib/render.js';
import {params,fail,cache} from '../lib/http.js';
const bytes=readFileSync(join(process.cwd(),'public/fonts/mono.ttf'));
const font=opentype.parse(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));
export default async function handler(req:IncomingMessage,res:ServerResponse){
  if(req.method!=='GET'){res.statusCode=405;res.end();return;}
  try {
    const p=params(req);let o;try{o=options(p);}catch(e){throw new HttpError(400,(e as Error).message);}
    const data=await fetchCalendar(p.get('username')??'mvtiburcio',p.get('period')??'last-year');
    const svg=render(data,o,(text,x,y,size,fill)=>{const path=font.getPath(text,x-font.getAdvanceWidth(text,size)/2,y,size);path.fill=fill;return path.toSVG(2);});
    const body=o.format==='svg'?Buffer.from(svg):await sharp(Buffer.from(svg)).png().toBuffer();
    if(body.length>4400000)throw new HttpError(413,'Imagem grande demais. Reduza as dimensões ou use SVG.');
    cache(res);res.setHeader('Content-Type',o.format==='svg'?'image/svg+xml':'image/png');res.setHeader('Content-Disposition',`inline; filename="${data.username}-calendar.${o.format}"`);res.end(body);
  }catch(e){fail(res,e);}
}
