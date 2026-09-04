import type {IncomingMessage,ServerResponse} from 'node:http';
import {fetchActivity} from '../lib/activity.js';
import {fail} from '../lib/http.js';
export default async function handler(req:IncomingMessage,res:ServerResponse){if(req.method!=='GET'){res.statusCode=405;res.end();return;}try{const data=await fetchActivity();res.setHeader('Cache-Control','public, max-age=0, s-maxage=300');res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('X-Content-Type-Options','nosniff');res.end(JSON.stringify(data));}catch(e){fail(res,e);}}
