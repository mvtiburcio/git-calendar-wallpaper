import type { IncomingMessage,ServerResponse } from 'node:http';
import { HttpError } from './calendar.js';
export const params=(req:IncomingMessage)=>new URL(req.url!,'http://localhost').searchParams;
export function fail(res:ServerResponse,error:unknown){res.statusCode=error instanceof HttpError?error.status:502;res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify({error:error instanceof Error?error.message:'Falha ao gerar imagem.'}));}
export function cache(res:ServerResponse){res.setHeader('Cache-Control','public, max-age=0, s-maxage=3600');res.setHeader('X-Content-Type-Options','nosniff');}
