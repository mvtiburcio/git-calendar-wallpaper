# Git Calendar Wallpaper

Wallpapers com as contribuições reais do seu calendário público do GitHub. Sem login, token pessoal, banco de dados, analytics ou marca-d’água.

## Executar localmente

Node.js 22.12+ e npm:

```sh
npm ci
npm run dev
```

Abra http://127.0.0.1:5173. O servidor de desenvolvimento inclui as duas APIs; `vite preview` serve somente os arquivos estáticos.

```sh
npm test
npm run build
```

## Personalização

- Celular 1290 × 2796, Full HD 1920 × 1080, 4K 3840 × 2160 e dimensões personalizadas.
- Temas GitHub escuro, claro e OLED; cor hexadecimal.
- Células quadradas, arredondadas ou circulares; mosaico cronológico ou calendário semanal.
- Últimos 12 meses (intervalo completo retornado pelo GitHub, que pode incluir uma semana parcial adicional) ou ano selecionado.
- PNG e SVG. Preview com datas e contagens por foco/hover; fonte JetBrains Mono incluída sob OFL. No download, textos viram paths para preservar aparência sem fontes externas.

## API

```text
GET /api/contributions?username=seu-username&period=last-year
GET /graph?username=seu-username&background=github&color=green&shape=rounded&height=2796&width=1290
```

Nas duas rotas, `username` é obrigatório. Ausente ou vazio retorna HTTP 400; não há perfil padrão. Substitua `seu-username` nos exemplos pelo perfil desejado.

`/api/contributions` retorna `username`, `period`, `total`, `fetchedAt` e `days`, cada dia com `date`, `count`, `level` (0–4) e `future`.

Parâmetros de `/graph`:

| Parâmetro | Valores | Default |
| --- | --- | --- |
| username | Username público do GitHub | Obrigatório, sem padrão |
| period | last-year ou ano entre 2008 e o atual | last-year |
| background | github, light, oled | github |
| color | green ou hexadecimal #RRGGBB | green |
| shape | square, rounded, circle | rounded |
| layout | mosaic, weekly | mosaic |
| width / height | Inteiros de 320 a 4096; até 9 milhões de pixels | 1290 / 2796 |
| format | png, svg | png |

Codifique `#` como `%23` em URLs. Erros usam JSON com `error`: 400 para parâmetros inválidos, 404 para usuário inexistente, 502 para fonte indisponível/estrutura inesperada, 413 para imagem acima de 4,4 MB. Apenas GET.

Respostas de sucesso têm cache de até uma hora na CDN. Alterar cor ou tamanho não muda o significado dos dados. Requisições separadas do preview e do download podem refletir instantes diferentes se houver atividade nova entre elas.

## Fonte e privacidade

O servidor consulta exclusivamente `https://github.com/users/{username}/contributions`, com idioma inglês. Associa cada célula ao tooltip pelo ID, preserva datas e níveis e soma os valores do período. Não usa a API de eventos recentes nem chama contribuições de commits.

**Contribuições privadas:** no GitHub, habilite **Include private contributions on my profile**. Somente as contagens disponibilizadas publicamente entram; nomes de repositórios privados não são coletados. Nenhum token é necessário.

Essa fonte HTML não é uma API estável. Se o GitHub mudar a estrutura ou bloquear requisições, o serviço falha explicitamente: não substitui erro por zero. Datas futuras são vazadas, não dias sem contribuições. O ano atual usa a data UTC do servidor, sem deslocar as datas fornecidas pelo GitHub.

## Publicar na Vercel

Importe o repositório na Vercel como projeto Vite ou execute:

```sh
vercel login
vercel --prod
```

Build e rotas estão em `vercel.json`. Nenhuma variável secreta é necessária. Use Node.js 22.x no projeto. As funções incluem a fonte local para renderização. Use a URL de produção estável ao copiar links para automações.

## Atualização no iPhone

Na etapa **Usar wallpaper**, escolha horário e tela e clique em **Copiar instrução pronta**.

1. Copie a instrução personalizada.
2. Abra Atalhos e cole no recurso de criação por descrição com Apple Intelligence, se disponível.
3. Revise o atalho e a automação, execute uma vez e conceda as permissões necessárias.

A instrução inclui a URL PNG exata, GET, tela escolhida, horário diário (06:00 por padrão), preservação da imagem e encerramento sem alterar o wallpaper se houver falha. O site não instala automações. Se a IA não conseguir configurar a automação, a instrução pede que explique o passo restante.

O recurso depende de aparelho, idioma e versão do sistema. A [Apple descreve criação por linguagem natural](https://developer.apple.com/apple-intelligence/) e a [apresenta no WWDC26](https://developer.apple.com/videos/play/wwdc2026/310/). Não confundir com a ação “Usar modelo”, que não é por si só criação de atalhos por descrição. A execução real deve ser testada no aparelho.

### Meu iPhone não tem esse recurso

1. Crie um atalho com a URL obtida em **Copiar URL da imagem**.
2. Adicione **Obter Conteúdo de URL** (GET), seguido de **Definir Foto do Papel de Parede**, usando a imagem recebida.
3. Escolha a tela, desative a prévia quando disponível e execute uma vez para testar e autorizar.
4. Em **Automação**, configure execução diária por Hora do Dia e selecione esse atalho. Use execução imediata quando disponível.

Os nomes variam entre versões. Em erro de rede, mantenha a imagem anterior. A URL respeita cache de uma hora; não acrescente parâmetros aleatórios.

## Personalização avançada (v2)

A interface segue Perfil → Tela → Estilo → Usar wallpaper. Doze temas em três categorias: GitHub/OLED/Neve/Oceano/Lavanda/Areia (sólidos), Aurora/Pôr do sol/Crepúsculo (gradientes), Papel/Pontilhado/Topográfico (texturas). Os temas preenchem controles editáveis, sem bloquear personalização.

Parâmetros adicionais de `/graph`:

| Parâmetro | Valores / limites | Default sem parâmetro |
| --- | --- | --- |
| theme | github, oled, snow, ocean, lavender, sand, aurora, sunset, twilight, paper, dots, topo | aparência legada |
| bg / end | #RRGGBB; cores inicial/final | tema ou fundo legado |
| angle | 0–360 graus | 135 |
| texture | none, paper, dots, topo | tema ou none |
| intensity | 0–0.35 | 0.12 |
| avatar | 0 ou 1 | 0 (links antigos); interface usa 1 |
| scale | 0.6–1.15 | 1 |
| position | 0–1, limitada à área segura | 0.5 |

Cores e textura explícitas prevalecem sobre o tema. Parâmetros de temas não alteram contagens. Sem os parâmetros novos, links antigos preservam aparência. A API de contribuições acrescenta `avatarData` (PNG em data URI ou null), sem remover campos anteriores.

Avatares: apenas HTTPS em github.com e avatars.githubusercontent.com, até 500 KB de entrada, timeout de 5 s, limite de 4 milhões de pixels, normalização para PNG 128 × 128 e incorporação no SVG/PNG. Em falha, a inicial do username substitui a foto. Não há upload ou URL arbitrária.

Texturas são SVG determinístico. Prévia e download compartilham renderizador; o relógio pertence somente ao mockup. Transições usam transform/opacity por 200 ms e respeitam reduced motion.

### Modelos de iPhone

Resoluções verificadas em fontes Apple; outros modelos podem usar dimensões personalizadas:
- [iPhone 16 e 16 Plus](https://www.apple.com/cz/iphone-16/specs/): 1179 × 2556 e 1290 × 2796.
- [iPhone 15](https://support.apple.com/en-us/111831) e [15 Plus](https://support.apple.com/en-us/111830): 1179 × 2556 e 1290 × 2796.
- [iPhone 16 Pro](https://support.apple.com/en-us/121031): 1206 × 2622.
- [iPhone 16 Pro Max](https://support.apple.com/en-us/121032): 1320 × 2868.

## Licença

Código MIT. JetBrains Mono: SIL Open Font License, incluída em `public/fonts/OFL.txt`. Projeto independente, sem vínculo com GitHub ou The Git Calendar.

## Landing e atividade pública
A home apresenta os 12 temas, recursos e FAQ. `GET /api/project-activity` consulta apenas `mvtiburcio/git-calendar-wallpaper` pela API pública do GitHub, sem token: stars, forks, cinco commits da branch principal e até oito contribuidores (não o total). Cache CDN de cinco minutos. O monitor consulta quando visível e pausa com a página oculta; não é um feed instantâneo. Falhas mantêm a última consulta no navegador com aviso de dados desatualizados; sem consulta anterior, mostram indisponibilidade. A API pública pode sofrer rate limit; nenhum erro é tratado como contagem zero.
