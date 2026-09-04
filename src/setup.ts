export const devices = [
  {name:'iPhone 16 / iPhone 15',width:1179,height:2556,source:'https://www.apple.com/cz/iphone-16/specs/'},
  {name:'iPhone 16 Plus / iPhone 15 Plus',width:1290,height:2796,source:'https://www.apple.com/cz/iphone-16/specs/'},
  {name:'iPhone 16 Pro',width:1206,height:2622,source:'https://support.apple.com/en-us/121031'},
  {name:'iPhone 16 Pro Max',width:1320,height:2868,source:'https://support.apple.com/en-us/121032'},
];
export function shortcutPrompt(url:string,time:string,target:string){
  if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw new Error('Escolha um horário válido.');
  const screen=target==='both'?'nas telas bloqueada e inicial':target==='home'?'na tela inicial':'na tela bloqueada';
  return `Crie um atalho chamado “Meu Git Calendar”. Baixe a imagem PNG desta URL com uma requisição GET: ${url}\nUse a imagem recebida como papel de parede ${screen}, preservando a proporção, sem recortar o calendário e sem mostrar a prévia quando essa opção estiver disponível. Se a resposta não for uma imagem válida ou houver falha na conexão, encerre sem mudar o wallpaper atual. Configure uma automação pessoal para executar esse atalho diariamente às ${time}, com execução imediata quando permitida. Se precisar que eu configure a automação separadamente ou conceda permissões, explique apenas o passo que falta. Não gere outra imagem e não altere a URL.`;
}
// One active request: editing the profile invalidates even responses that ignore abort.
export class LatestRequest {
  private sequence=0;
  private controller?:AbortController;
  cancel(){this.sequence++;this.controller?.abort();}
  start(){this.cancel();const version=this.sequence;this.controller=new AbortController();return {signal:this.controller.signal,current:()=>version===this.sequence};}
}
