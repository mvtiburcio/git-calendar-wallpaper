import {test} from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {render,options} from '../lib/render.js';
import {themes} from '../lib/themes.js';
import {fetchAvatar} from '../lib/avatar.js';
import {LatestRequest,shortcutPrompt} from '../src/setup.js';
import type {Calendar} from '../lib/calendar.js';
const data:Calendar={username:'test',period:'2026',total:365,days:Array.from({length:365},(_,i)=>({date:new Date(Date.UTC(2026,0,i+1)).toISOString().slice(0,10),count:1,level:i%5,future:false})),fetchedAt:''};
test('12 temas renderizam SVG/PNG em três presets e mantêm contagens',async()=>{for(const t of themes)for(const [width,height] of [[1290,2796],[1920,1080],[3840,2160]]){const o=options(new URLSearchParams({theme:t.id,avatar:'1',width:String(width),height:String(height),layout:width>height?'weekly':'mosaic'}));const svg=render(data,o);assert.equal((svg.match(/<title>/g)??[]).length,365);assert.ok(!svg.includes('NaN'));assert.ok(svg.includes('-avatar'));const png=await sharp(Buffer.from(svg)).png().toBuffer();const meta=await sharp(png).metadata();assert.equal(meta.width,width);assert.equal(meta.height,height);assert.ok(png.length<4400000);}});
test('parâmetros legados e novos limites',()=>{const old=options(new URLSearchParams());assert.equal(old.avatar,false);assert.equal(old.theme,undefined);assert.equal(old.scale,1);assert.ok(!render(data,old).includes('<image'));for(const q of ['avatar=yes','bg=javascript:alert(1)','scale=10','position=-1','intensity=1','angle=Infinity','theme=missing','texture=nope'])assert.throws(()=>options(new URLSearchParams(q)));});
test('avatar incorporado e fallback seguro',async()=>{const png=await sharp({create:{width:2,height:2,channels:3,background:'red'}}).png().toBuffer();const original=globalThis.fetch;try{globalThis.fetch=async()=>new Response(png,{headers:{'content-type':'image/png'}});const avatar=await fetchAvatar('test');assert.match(avatar!,/^data:image\/png;base64,/);const svg=render({...data,avatarData:avatar},options(new URLSearchParams('avatar=1')));assert.ok(svg.includes('<image href="data:'));assert.ok(!svg.includes('href="http'));globalThis.fetch=async()=>new Response(null,{status:302,headers:{location:'http://127.0.0.1/private'}});assert.equal(await fetchAvatar('test'),null);globalThis.fetch=async()=>new Response('',{headers:{'content-type':'image/png','content-length':'9999999'}});assert.equal(await fetchAvatar('test'),null);globalThis.fetch=async()=>{throw new Error('offline');};assert.equal(await fetchAvatar('test'),null);assert.ok(!render({...data,avatarData:'javascript:bad'},options(new URLSearchParams('avatar=1'))).includes('<image'));}finally{globalThis.fetch=original;}});
test('resposta antiga e cancelamento nunca substituem pedido atual',()=>{const requests=new LatestRequest(),first=requests.start(),second=requests.start();assert.equal(first.current(),false);assert.equal(first.signal.aborted,true);assert.equal(second.current(),true);requests.cancel();assert.equal(second.current(),false);});
test('instrução usa URL literal, horário e tela com segurança de falha',()=>{const url='https://example.com/graph?theme=aurora&avatar=1';const prompt=shortcutPrompt(url,'06:00','lock');assert.ok(prompt.includes(url));assert.match(prompt,/06:00/);assert.match(prompt,/tela bloqueada/);assert.match(prompt,/sem mudar o wallpaper/);assert.throws(()=>shortcutPrompt(url,'99:00','lock'));});

test('SVGs na mesma página não compartilham gradientes diferentes',()=>{const a=render(data,options(new URLSearchParams('theme=aurora'))),b=render(data,options(new URLSearchParams('theme=sunset')));const id=(s:string)=>s.match(/linearGradient id="([^"]+)"/)![1];assert.notEqual(id(a),id(b));assert.ok(a.includes(`url(#${id(a)})`));assert.ok(b.includes(`url(#${id(b)})`));});

test('avatar mantém respiro abaixo do período nos três presets',()=>{
  for(const [width,height] of [[1290,2796],[1920,1080],[3840,2160]]){
    const o=options(new URLSearchParams({avatar:'1',width:String(width),height:String(height)}));
    const svg=render({...data,avatarData:'data:image/png;base64,AAAA'},o);
    const avatarY=Number(svg.match(/<image[^>]* y="([^"]+)"/)![1]);
    const periodY=Number(svg.match(/<text[^>]* y="([^"]+)"[^>]*>contribuições/)![1]);
    const font=Math.min(width*.028,height*.035);
    assert.ok(avatarY-periodY>=font,`Respiro insuficiente em ${width} × ${height}`);
  }
});
