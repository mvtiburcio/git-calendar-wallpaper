import type { Calendar } from './calendar.js';
export type Options = { width:number; height:number; background:string; color:string; shape:string; layout:string; format:string };
export const defaults = {width:1290,height:2796,background:'github',color:'green',shape:'rounded',layout:'mosaic',format:'png'};
export function options(params: URLSearchParams): Options {
  const o = {...defaults,...Object.fromEntries(params)};
  const width=Number(o.width),height=Number(o.height);
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<320||height<320||width>4096||height>4096||width*height>9000000) throw new Error('Dimensões: 320–4096 px por lado, até 9 milhões de pixels.');
  if(!['github','light','oled'].includes(o.background)||!['square','rounded','circle'].includes(o.shape)||!['mosaic','weekly'].includes(o.layout)||!['png','svg'].includes(o.format)) throw new Error('Configuração de imagem inválida.');
  if(o.color!=='green'&&!/^#[a-f\d]{6}$/i.test(o.color)) throw new Error('Cor inválida. Use green ou hexadecimal.');
  return {width,height,background:o.background,color:o.color,shape:o.shape,layout:o.layout,format:o.format};
}
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]!));
export type TextRenderer = (text:string,x:number,y:number,size:number,fill:string)=>string;
export function render(calendar:Calendar,o:Options,textRenderer?:TextRenderer) {
  const {width:w,height:h}=o, light=o.background==='light', bg=light?'#f6f8fa':o.background==='oled'?'#000000':'#0d1117', zero=light?'#e3e7eb':'#21262d', ink=light?'#24292f':'#e6edf3', accent=o.color==='green'?'#39d353':o.color;
  const portrait=h>w, inset=w*.08, maxW=w-inset*2, maxH=h*(portrait?.47:.55);
  const offset=o.layout==='weekly'?new Date(calendar.days[0].date+'T00:00:00Z').getUTCDay():0;
  const cols=o.layout==='weekly'?Math.ceil((calendar.days.length+offset)/7):Math.max(10,Math.round(Math.sqrt(calendar.days.length*maxW/maxH)));
  const rows=o.layout==='weekly'?7:Math.ceil(calendar.days.length/cols);
  const step=Math.min(maxW/cols,maxH/rows),size=step*.76,gw=cols*step,gh=rows*step,x0=(w-gw)/2,y0=(h-gh)/2-(portrait?0:h*.03);
  const text:TextRenderer=textRenderer??((s,x,y,fontSize,fill)=>`<text x="${x}" y="${y}" font-size="${fontSize}" fill="${fill}" text-anchor="middle" font-family="Wallpaper Mono,monospace">${esc(s)}</text>`);
  const cells=calendar.days.map((day,i)=> {
    const col=o.layout==='weekly'?Math.floor((i+offset)/7):i%cols,row=o.layout==='weekly'?(i+offset)%7:Math.floor(i/cols);
    const x=x0+col*step+(step-size)/2,y=y0+row*step+(step-size)/2;
    const fill=day.future?'none':day.level?accent:zero,opacity=day.level?[0,.28,.48,.72,1][day.level]:1;
    const label=`${day.date}: ${day.future?'data futura':day.count+' contribuições'}`;
    const geometry=o.shape==='circle'?`<circle cx="${x+size/2}" cy="${y+size/2}" r="${size/2}"`:`<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${o.shape==='rounded'?size*.25:0}"`;
    return `${geometry} fill="${fill}" opacity="${opacity}" ${day.future?`stroke="${zero}" stroke-width="${Math.max(1,size*.05)}"`:''} tabindex="0" role="img" aria-label="${esc(label)}"><title>${esc(label)}</title></${o.shape==='circle'?'circle':'rect'}>`;
  }).join('');
  const font=Math.min(w*.028,h*.035),bottom=y0+gh+font*2;
  const label=calendar.period==='last-year'?'contribuições · últimos 12 meses':`contribuições · ${calendar.period}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Calendário de contribuições de ${esc(calendar.username)}"><rect width="${w}" height="${h}" fill="${bg}"/>${cells}${text(calendar.total.toLocaleString('pt-BR'),w/2,bottom,font*1.65,accent)}${text(label,w/2,bottom+font*1.5,font*.8,ink)}${text('@'+calendar.username,w/2,bottom+font*3,font*.75,ink)}</svg>`;
}
