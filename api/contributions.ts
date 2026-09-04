import type { IncomingMessage,ServerResponse } from 'node:http';
import {fetchCalendar} from '../lib/calendar.js';
import {params,fail,cache} from '../lib/http.js';
export default async function handler(req:IncomingMessage,res:ServerResponse){
  if(req.method!=='GET'){res.statusCode=405;res.end();return;}
  try {const p=params(req),data=await fetchCalendar(p.get('username')??'mvtiburcio',p.get('period')??'last-year');cache(res);res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(data));}catch(e){fail(res,e);}
}
