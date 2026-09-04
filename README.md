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
GET /api/contributions?username=mvtiburcio&period=last-year
GET /graph?username=mvtiburcio&background=github&color=green&shape=rounded&height=2796&width=1290
```

`/api/contributions` retorna `username`, `period`, `total`, `fetchedAt` e `days`, cada dia com `date`, `count`, `level` (0–4) e `future`.

Parâmetros de `/graph`:

| Parâmetro | Valores | Default |
| --- | --- | --- |
| username | Username público do GitHub | mvtiburcio |
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

1. Abra o site publicado, escolha o formato do seu aparelho e clique em **Copiar URL**.
2. No app **Atalhos**, crie um atalho com a ação **URL** e cole o link.
3. Adicione **Obter Conteúdo de URL**, usando GET.
4. Adicione **Definir Foto do Papel de Parede** (o nome pode variar conforme o idioma/versão do iOS), usando a imagem retornada. Escolha a tela bloqueada e/ou inicial.
5. Desative a prévia de confirmação na ação, quando disponível, e execute manualmente uma vez para conceder as permissões.
6. Em **Automação**, crie uma automação pessoal por **Hora do Dia**, diária, para executar esse atalho. Escolha execução imediata quando disponível.

O site atualiza a imagem da URL, mas não altera o wallpaper sozinho. A automação depende do aparelho e da conexão. Não adicione parâmetros aleatórios: a atualização respeita o cache de uma hora. Em falha de rede, mantenha o wallpaper anterior.

## Licença

Código MIT. JetBrains Mono: SIL Open Font License, incluída em `public/fonts/OFL.txt`. Projeto independente, sem vínculo com GitHub ou The Git Calendar.
