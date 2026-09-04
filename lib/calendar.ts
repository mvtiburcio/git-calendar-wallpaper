import { load } from 'cheerio';
export type Day = { date: string; count: number; level: number; future: boolean };
export type Calendar = { username: string; period: string; total: number; days: Day[]; fetchedAt: string };
export class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
export function validate(username: string, period: string) {
  if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username) || username.includes('--')) throw new HttpError(400, 'Username inválido.');
  if (period !== 'last-year' && (!/^\d{4}$/.test(period) || +period < 2008 || +period > new Date().getUTCFullYear())) throw new HttpError(400, 'Período inválido.');
}
export function parseCalendar(html: string, username: string, period: string, today = new Date().toISOString().slice(0,10)): Calendar {
  const $ = load(html), counts = new Map<string, number>(), days: Day[] = [];
  $('tool-tip[for]').each((_, el) => {
    const text = $(el).text().trim(), match = text.match(/^(No|[\d,]+) contributions? on /);
    if (match) counts.set($(el).attr('for')!, match[1] === 'No' ? 0 : Number(match[1].replaceAll(',', '')));
  });
  const seen = new Set<string>();
  $('[data-date][data-level]').each((_, el) => {
    const date = $(el).attr('data-date')!, count = counts.get($(el).attr('id')!), level = Number($(el).attr('data-level'));
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || seen.has(date) || count === undefined || !Number.isInteger(level) || level < 0 || level > 4) throw new HttpError(502, 'O formato do calendário do GitHub mudou. Tente novamente mais tarde.');
    seen.add(date);
    if (period === 'last-year' || date.startsWith(period + '-')) days.push({date, count, level, future: date > today});
  });
  if (!seen.size || !days.length) throw new HttpError(502, 'Calendário público indisponível ou formato do GitHub não reconhecido.');
  if (period !== 'last-year') {
    for (let time = Date.UTC(+period,0,1); time < Date.UTC(+period+1,0,1); time += 86400000) {
      const date = new Date(time).toISOString().slice(0,10);
      if (!seen.has(date)) {
        if (date <= today) throw new HttpError(502, 'O GitHub retornou um calendário incompleto.');
        days.push({date,count:0,level:0,future:true});
      }
    }
  }
  days.sort((a,b)=>a.date.localeCompare(b.date));
  return {username, period, total:days.reduce((sum,d)=>sum+d.count,0), days, fetchedAt:new Date().toISOString()};
}
export async function fetchCalendar(username: string, period: string) {
  validate(username,period);
  const url = new URL(`https://github.com/users/${username}/contributions`);
  if(period !== 'last-year') { url.searchParams.set('from',`${period}-01-01`); url.searchParams.set('to',`${period}-12-31`); }
  let response: Response;
  try { response = await fetch(url, {headers:{'Accept-Language':'en-US','User-Agent':'git-calendar-wallpaper'},signal:AbortSignal.timeout(15000),redirect:'error'}); }
  catch { throw new HttpError(502,'Não foi possível consultar o GitHub. Tente novamente.'); }
  if(response.status === 404) throw new HttpError(404,'Usuário não encontrado.');
  if(!response.ok) throw new HttpError(502,'GitHub temporariamente indisponível. Tente novamente.');
  return parseCalendar(await response.text(),username,period);
}
