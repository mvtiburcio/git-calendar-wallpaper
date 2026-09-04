import {HttpError} from './calendar.js';
export const repository='mvtiburcio/git-calendar-wallpaper';
export type Activity={stars:number;forks:number;commits:{sha:string;message:string;date:string;author:string}[];contributors:{login:string;avatar:string;contributions:number}[];fetchedAt:string};
export async function fetchActivity():Promise<Activity>{
  const signal=AbortSignal.timeout(8000);
  const get=async(path:string)=>{const r=await fetch(`https://api.github.com/repos/${repository}${path}`,{signal,headers:{Accept:'application/vnd.github+json','User-Agent':'git-calendar-wallpaper'}});if(!r.ok)throw new HttpError(502,r.status===403||r.status===429?'GitHub limitou as consultas. Tente novamente mais tarde.':'Atividade do GitHub indisponível.');return r.status===204?[]:r.json();};
  try{const repo=await get('');if(typeof repo.default_branch!=='string')throw Error();const [commits,contributors]=await Promise.all([get('/commits?per_page=5&sha='+encodeURIComponent(repo.default_branch)),get('/contributors?per_page=8')]);
    const count=(v:unknown)=>{if(!Number.isSafeInteger(v)||Number(v)<0)throw Error();return Number(v);};
    const str=(v:unknown)=>{if(typeof v!=='string'||!v)throw Error();return v;};
    if(!Array.isArray(commits)||!Array.isArray(contributors))throw Error();
    return {stars:count(repo.stargazers_count),forks:count(repo.forks_count),commits:commits.slice(0,5).map(c=>{const sha=str(c.sha),date=str(c.commit?.author?.date);if(!/^[a-f0-9]{40,64}$/.test(sha)||!Number.isFinite(Date.parse(date)))throw Error();return {sha,date,message:str(c.commit?.message).split('\n')[0].slice(0,200),author:typeof c.author?.login==='string'?c.author.login:'Colaborador'};}),contributors:contributors.slice(0,8).map(c=>{const login=str(c.login);if(!/^[\w-]+$/.test(login))throw Error();return {login,avatar:`https://github.com/${encodeURIComponent(login)}.png?size=64`,contributions:count(c.contributions)};}),fetchedAt:new Date().toISOString()};
  }catch(e){if(e instanceof HttpError)throw e;throw new HttpError(502,'Não foi possível consultar a atividade do GitHub.');}
}
