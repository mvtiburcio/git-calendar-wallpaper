export const themes = [
  {id:'github',name:'GitHub',group:'Sólidos',bg:'#0d1117',end:'#0d1117',accent:'#39d353',texture:'none'},
  {id:'oled',name:'OLED',group:'Sólidos',bg:'#000000',end:'#000000',accent:'#b8efcc',texture:'none'},
  {id:'snow',name:'Neve',group:'Sólidos',bg:'#f3f5f8',end:'#f3f5f8',accent:'#29735a',texture:'none'},
  {id:'ocean',name:'Oceano',group:'Sólidos',bg:'#0b2438',end:'#0b2438',accent:'#6dd5f5',texture:'none'},
  {id:'lavender',name:'Lavanda',group:'Sólidos',bg:'#27203c',end:'#27203c',accent:'#c4a2fc',texture:'none'},
  {id:'sand',name:'Areia',group:'Sólidos',bg:'#e9dfcb',end:'#e9dfcb',accent:'#82612c',texture:'none'},
  {id:'aurora',name:'Aurora',group:'Gradientes',bg:'#102d37',end:'#382246',accent:'#b6eed6',texture:'none'},
  {id:'sunset',name:'Pôr do sol',group:'Gradientes',bg:'#502a43',end:'#b16b46',accent:'#ffe0ab',texture:'none'},
  {id:'twilight',name:'Crepúsculo',group:'Gradientes',bg:'#142647',end:'#544069',accent:'#c4d3ff',texture:'none'},
  {id:'paper',name:'Papel',group:'Texturas',bg:'#eee7d7',end:'#eee7d7',accent:'#6d7049',texture:'paper'},
  {id:'dots',name:'Pontilhado',group:'Texturas',bg:'#18252a',end:'#18252a',accent:'#90d9d2',texture:'dots'},
  {id:'topo',name:'Topográfico',group:'Texturas',bg:'#202d27',end:'#202d27',accent:'#c3dc98',texture:'topo'},
] as const;
export function luminance(hex:string){const rgb=hex.slice(1).match(/../g)!.map(v=>{const c=parseInt(v,16)/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;});return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;}
