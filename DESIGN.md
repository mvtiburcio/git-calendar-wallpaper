# Design

## Scene
Pessoa personalizando a tela bloqueada no sofá, com o telefone na mão e luz ambiente baixa. Interface escura e silenciosa mantém a atenção nas cores do próprio wallpaper.

## Visual system
Estratégia restrained: neutros em OKLCH levemente azulados, ação em azul claro, verde reservado ao tema GitHub. Sistema de fontes nativo para a interface, JetBrains Mono para dados do wallpaper. Sem gradientes no texto.

## Layout
Home com texto curto e mockup de celular como assinatura. Assistente inline com quatro etapas e preview sticky no desktop. No celular o preview fica compacto acima dos controles, ampliável sem modal. Largura máxima 1120 px, espaçamentos de 8/12/16/24/32/48 px. Sem margens negativas.

## Components
Botões com 44 px mínimos, seleção com borda e indicador além da cor. Temas apresentados como miniaturas reais. Campos agrupados por decisão, controles avançados em details. Erros perto do campo e estados de progresso anunciados.

## Motion
Entrada de etapa e troca de preview em 200 ms, transform/opacity, ease-out quart. Sem loops, bounce ou mudança animada de layout. Reduced motion desativa animações e smooth scrolling.

## Wallpaper
Doze temas em sólidos, gradientes e texturas SVG. Avatar circular junto do username. Mockup acrescenta relógio somente na interface, nunca no download. Escala e posição limitadas à área segura; links antigos preservam o render anterior por default.
