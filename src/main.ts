import './style.css';
import {options,render} from '../lib/render';
import type {Calendar} from '../lib/calendar';
document.querySelector('#app')!.innerHTML=`
<header><a class="brand" href="/">▦ <span>git calendar<span class="muted"> / wallpaper</span></span></a><a href="https://github.com/mvtiburcio/git-calendar-wallpaper" target="_blank" rel="noopener">Código aberto ↗</a></header>
<main><section class="intro"><p class="eyebrow">DO SEU PERFIL PARA SUA TELA</p><h1>Seu ritmo. <br>Pixel por pixel.</h1><p>Contribuições reais do GitHub. Um wallpaper que acompanha você.</p></section><div class="workspace"><form id="settings"><div class="section-title">Configure seu calendário</div>
<label>Username do GitHub<input name="username" value="mvtiburcio" required maxlength="39" autocomplete="off" spellcheck="false"></label>
<label>Período<select name="period"><option value="last-year">Últimos 12 meses</option>${Array.from({length:new Date().getUTCFullYear()-2007},(_,i)=>new Date().getUTCFullYear()-i).map(y=>`<option>${y}</option>`).join('')}</select></label>
<label>Tamanho<select id="preset"><option value="1290,2796">Celular · 1290 × 2796</option><option value="1920,1080">Full HD · 1920 × 1080</option><option value="3840,2160">4K · 3840 × 2160</option><option value="custom">Personalizado</option></select></label>
<div class="pair"><label>Largura<input name="width" type="number" min="320" max="4096" value="1290" required></label><label>Altura<input name="height" type="number" min="320" max="4096" value="2796" required></label></div>
<div class="pair"><label>Tema<select name="background"><option value="github">GitHub escuro</option><option value="light">Claro</option><option value="oled">OLED</option></select></label><label>Cor<input name="color" type="color" value="#39d353"></label></div>
<div class="pair"><label>Células<select name="shape"><option value="rounded">Arredondadas</option><option value="square">Quadradas</option><option value="circle">Circulares</option></select></label><label>Layout<select name="layout"><option value="mosaic">Mosaico</option><option value="weekly">Semanal</option></select></label></div>
<button class="primary" type="submit">Atualizar calendário <span>↗</span></button><p class="hint">Sem login. Contribuições privadas só aparecem quando você habilita sua contagem pública no GitHub.</p></form>
<section class="preview-panel" aria-label="Prévia do wallpaper"><div class="preview-heading"><span>SEU WALLPAPER</span><span id="dimensions">1290 × 2796</span></div><div id="preview" aria-busy="true"></div><p id="status" role="status" aria-live="polite">Consultando GitHub…</p><div class="actions"><button id="png" disabled>Baixar PNG</button><button id="svg" disabled>Baixar SVG</button><button id="copy" disabled>Copiar URL</button></div></section></div></main><footer><span>Seu trabalho, sem filtros. Sem marca-d’água.</span><a href="https://github.com/mvtiburcio/git-calendar-wallpaper#atualização-no-iphone">Atualização no iPhone ↗</a></footer>`;
const form=document.querySelector<HTMLFormElement>('#settings')!,preview=document.querySelector<HTMLDivElement>('#preview')!,status=document.querySelector<HTMLParagraphElement>('#status')!;
let calendar:Calendar|undefined,controller:AbortController|undefined;
const buttons=[...document.querySelectorAll<HTMLButtonElement>('.actions button')];
function parameters(){return new URLSearchParams([...new FormData(form).entries()].map(([k,v])=>[k,String(v)]));}
function ready(value:boolean){buttons.forEach(b=>b.disabled=!value);}
function draw(){
  ready(false);if(!calendar)return;
  try{const p=parameters(),o=options(p);if(p.get('username')!==calendar.username||p.get('period')!==calendar.period){status.textContent='Clique em Atualizar calendário para buscar os novos dados.';return;}
  preview.innerHTML=render(calendar,o);document.querySelector('#dimensions')!.textContent=`${o.width} × ${o.height}`;
  status.textContent=`${calendar.total.toLocaleString('pt-BR')} contribuições · ${calendar.days[0].date} a ${calendar.days.at(-1)!.date}. Cache de até 1 hora.`;ready(true);
  }catch(e){status.textContent=(e as Error).message;}
}
async function update(){
  if(!form.reportValidity())return;controller?.abort();const current=new AbortController();controller=current;ready(false);preview.setAttribute('aria-busy','true');status.textContent='Consultando GitHub…';
  const p=parameters();try{options(p);const response=await fetch('/api/contributions?'+new URLSearchParams({username:p.get('username')!,period:p.get('period')!}),{signal:current.signal});const data=await response.json();if(!response.ok)throw new Error(data.error);calendar=data;draw();}catch(e){if(!current.signal.aborted){calendar=undefined;preview.innerHTML='';status.textContent=(e as Error).message;}}finally{if(controller===current)preview.setAttribute('aria-busy','false');}
}
form.addEventListener('submit',e=>{e.preventDefault();void update();});
form.addEventListener('input',()=>{if(controller){controller.abort();preview.setAttribute('aria-busy','false');}draw();});
document.querySelector('#preset')!.addEventListener('change',e=>{const value=(e.target as HTMLSelectElement).value;if(value==='custom')return;const [w,h]=value.split(',');(form.elements.namedItem('width') as HTMLInputElement).value=w;(form.elements.namedItem('height') as HTMLInputElement).value=h;(form.elements.namedItem('layout') as HTMLSelectElement).value=+h>+w?'mosaic':'weekly';draw();});
for(const name of ['width','height'])(form.elements.namedItem(name) as HTMLInputElement).addEventListener('input',()=>{(document.querySelector('#preset') as HTMLSelectElement).value='custom';});
function url(format='png'){const p=parameters();p.set('format',format);return location.origin+'/graph?'+p;}
for(const format of ['png','svg'])document.querySelector('#'+format)!.addEventListener('click',async()=>{ready(false);status.textContent='Preparando download…';try{const response=await fetch(url(format));if(!response.ok)throw new Error((await response.json()).error);const href=URL.createObjectURL(await response.blob()),a=document.createElement('a');a.href=href;a.download=`${calendar!.username}-calendar.${format}`;a.click();setTimeout(()=>URL.revokeObjectURL(href),10000);draw();}catch(e){status.textContent=(e as Error).message;ready(true);}});
document.querySelector('#copy')!.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(url());status.textContent='URL copiada. A imagem acompanha as atualizações do calendário.';}catch{status.textContent='Não foi possível copiar. Verifique a permissão da área de transferência.';}});
void update();
preview.addEventListener('focusin',e=>{const label=(e.target as Element).getAttribute('aria-label');if(label)status.textContent=label;});
preview.addEventListener('pointerover',e=>{const label=(e.target as Element).getAttribute('aria-label');if(label)status.textContent=label;});
