import {themes,luminance} from './themes.js';
import type { Calendar } from './calendar.js';
export type Options = { width:number; height:number; background:string; color:string; shape:string; layout:string; format:string; theme?:string; bg?:string; end?:string; texture:string; intensity:number; angle:number; scale:number; position:number; avatar:boolean };
export const defaults = {width:1290,height:2796,background:'github',color:'green',shape:'rounded',layout:'mosaic',format:'png'};
export function options(params: URLSearchParams): Options {
  const o = {...defaults,...Object.fromEntries(params)};
  const width=Number(o.width),height=Number(o.height);
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<320||height<320||width>4096||height>4096||width*height>9000000) throw new Error('Dimensões: 320–4096 px por lado, até 9 milhões de pixels.');
  if(!['github','light','oled'].includes(o.background)||!['square','rounded','circle'].includes(o.shape)||!['mosaic','weekly'].includes(o.layout)||!['png','svg'].includes(o.format)) throw new Error('Configuração de imagem inválida.');
  if(o.color!=='green'&&!/^#[a-f\d]{6}$/i.test(o.color)) throw new Error('Cor inválida. Use green ou hexadecimal.');
  const theme=params.get('theme')??undefined, selected=themes.find(t=>t.id===theme);
  if(theme&&!selected)throw new Error('Tema inválido.');
  const bg=params.get('bg')??selected?.bg,end=params.get('end')??selected?.end;
  if([bg,end].some(c=>c!==undefined&&!/^#[a-f\d]{6}$/i.test(c)))throw new Error('Cor de fundo inválida.');
  const texture=params.get('texture')??selected?.texture??'none';
  if(!['none','paper','dots','topo'].includes(texture))throw new Error('Textura inválida.');
  const number=(key:string,fallback:number,min:number,max:number)=>{const n=Number(params.get(key)??fallback);if(!Number.isFinite(n)||n<min||n>max)throw new Error('Ajuste inválido: '+key);return n;};
  if(params.has('avatar')&&!['0','1'].includes(params.get('avatar')!))throw new Error('Avatar inválido.');
  return {width,height,background:o.background,color:params.get('color')??selected?.accent??o.color,shape:o.shape,layout:o.layout,format:o.format,theme,bg,end,texture,intensity:number('intensity',.12,0,.35),angle:number('angle',135,0,360),scale:number('scale',1,.6,1.15),position:number('position',.5,0,1),avatar:params.get('avatar')==='1'};
}
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]!));
export type TextRenderer = (text:string,x:number,y:number,size:number,fill:string)=>string;
export function render(calendar:Calendar,o:Options,textRenderer?:TextRenderer) {
  const prefix="w"+[...JSON.stringify([o,calendar.username])].reduce((hash,c)=>Math.imul(hash^c.charCodeAt(0),16777619)>>>0,2166136261).toString(36);
  const {width:w,height:h}=o, bg=o.bg??(o.background==='light'?'#f6f8fa':o.background==='oled'?'#000000':'#0d1117'), end=o.end??bg, light=luminance(bg)>.4, zero=light?'#81868c':'#67737c', ink=luminance(bg)+luminance(end)>.65?'#182027':'#edf3f7', accent=o.color==='green'?'#39d353':o.color;
  const legacy=!o.theme&&!o.bg&&!o.end&&!o.avatar&&o.scale===1&&o.position===.5&&o.texture==='none';
  const portrait=h>w, inset=w*.08, maxW=w-inset*2, maxH=h*(portrait?.47:.55);
  const offset=o.layout==='weekly'?new Date(calendar.days[0].date+'T00:00:00Z').getUTCDay():0;
  const cols=o.layout==='weekly'?Math.ceil((calendar.days.length+offset)/7):Math.max(10,Math.round(Math.sqrt(calendar.days.length*maxW/maxH)));
  const rows=o.layout==='weekly'?7:Math.ceil(calendar.days.length/cols);
  const step=Math.min(maxW/cols,maxH/rows)*o.scale,size=step*.76,gw=cols*step,gh=rows*step,x0=(w-gw)/2,naturalY=(h-gh)/2-(portrait?0:h*.03),safeTop=h*(portrait?.25:.12),safeBottom=h*.84-Math.min(w*.028,h*.035)*6-gh,y0=legacy?naturalY:Math.max(safeTop,Math.min(safeBottom,naturalY+(o.position-.5)*h*.35));
  const text:TextRenderer=textRenderer??((s,x,y,fontSize,fill)=>`<text x="${x}" y="${y}" font-size="${fontSize}" fill="${fill}" text-anchor="middle" font-family="Wallpaper Mono,monospace">${esc(s)}</text>`);
  const cells=calendar.days.map((day,i)=> {
    const col=o.layout==='weekly'?Math.floor((i+offset)/7):i%cols,row=o.layout==='weekly'?(i+offset)%7:Math.floor(i/cols);
    const x=x0+col*step+(step-size)/2,y=y0+row*step+(step-size)/2;
    const fill=day.future?'none':day.level?accent:(legacy?(light?'#e3e7eb':'#21262d'):zero),opacity=day.level?[0,.28,.48,.72,1][day.level]:(legacy?1:.2);
    const label=`${day.date}: ${day.future?'data futura':day.count+(day.count===1?' contribuição':' contribuições')}`;
    const geometry=o.shape==='circle'?`<circle cx="${x+size/2}" cy="${y+size/2}" r="${size/2}"`:`<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${o.shape==='rounded'?size*.25:0}"`;
    return `${geometry} fill="${fill}" opacity="${opacity}" ${day.future?`stroke="${legacy?(light?'#e3e7eb':'#21262d'):zero}" stroke-width="${Math.max(1,size*.05)}"`:''} tabindex="0" role="img" aria-label="${esc(label)}"><title>${esc(label)}</title></${o.shape==='circle'?'circle':'rect'}>`;
  }).join('');
  const font=Math.min(w*.028,h*.035),bottom=y0+gh+font*2;
  const label=calendar.period==='last-year'?'contribuições · últimos 12 meses':`contribuições · ${calendar.period}`;
  const avatarSize=font*1.5, identityY=bottom+font*3, nameSize=font*.75;
  const identityWidth=(calendar.username.length+1)*nameSize*.6+avatarSize+font*.4, avatarX=(w-identityWidth)/2;
  const avatar=o.avatar?`<defs><clipPath id="${prefix}-avatar"><circle cx="${avatarX+avatarSize/2}" cy="${identityY-avatarSize*.35}" r="${avatarSize/2}"/></clipPath></defs>${calendar.avatarData&&/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(calendar.avatarData)?`<image href="${calendar.avatarData}" x="${avatarX}" y="${identityY-avatarSize*.85}" width="${avatarSize}" height="${avatarSize}" clip-path="url(#${prefix}-avatar)"/>`:`<circle cx="${avatarX+avatarSize/2}" cy="${identityY-avatarSize*.35}" r="${avatarSize/2}" fill="${ink}"/>${text(calendar.username[0].toUpperCase(),avatarX+avatarSize/2,identityY-avatarSize*.1,font*.8,bg)}`}`:'';
  const gradient=bg!==end?`<defs><linearGradient id="${prefix}-bg" x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate(${o.angle-135} .5 .5)"><stop stop-color="${bg}"/><stop offset="1" stop-color="${end}"/></linearGradient></defs>`:'';
  const pattern=o.texture==='dots'?'<circle cx="8" cy="8" r="1.5"/>':o.texture==='paper'?'<path d="M2 3h3m9 4h1M7 12h2m5 3h3" stroke-width=".7" fill="none"/>':'<path d="M-10 25Q15-10 45 20T100 15M-10 35Q15 0 45 30T100 25M-10 45Q15 10 45 40T100 35" stroke-width="1" fill="none"/>';
  const texture=o.texture!=='none'?`<defs><pattern id="${prefix}-texture" width="${o.texture==='topo'?90:20}" height="${o.texture==='topo'?60:20}" patternUnits="userSpaceOnUse"><g fill="${ink}" stroke="${ink}">${pattern}</g></pattern></defs><rect width="${w}" height="${h}" fill="url(#${prefix}-texture)" opacity="${o.intensity}"/>`:'';
  const footerBackdrop=legacy?'':`<rect x="${w*.12}" y="${bottom-font*1.8}" width="${w*.76}" height="${font*5.5}" rx="${font*.7}" fill="${ink==='#182027'?'#f3f5f8':'#101820'}" opacity=".78"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="group" aria-label="Calendário de contribuições de ${esc(calendar.username)}">${gradient}<rect width="${w}" height="${h}" fill="${bg!==end?`url(#${prefix}-bg)`:bg}"/>${texture}${cells}${(o.bg&&o.end&&Math.abs(luminance(bg)-luminance(end))>.35)?footerBackdrop:''}${text(calendar.total.toLocaleString('pt-BR'),w/2,bottom,font*1.65,legacy?(light?'#24292f':accent):ink)}${text(label,w/2,bottom+font*1.5,font*.8,legacy?(light?'#24292f':'#e6edf3'):ink)}${avatar}${text('@'+calendar.username,o.avatar?w/2+(avatarSize+font*.4)/2:w/2,identityY,nameSize,legacy?(light?'#24292f':'#e6edf3'):ink)}</svg>`;
}
