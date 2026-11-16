# Site institucional Growth77

Documento de continuidade do projeto. Leia inteiro antes de mexer em qualquer coisa.

## Como trabalhar neste projeto

- Responder sempre em português do Brasil.
- Antes de mudanças grandes ou ambíguas, explicar o que entendeu e esperar confirmação. O cliente prefere confirmar a direção antes de ver código.
- Mudar só o que foi pedido. Não "aproveitar" para alterar cenas ou seções que já foram aprovadas (ver "Decisões aprovadas").
- Commit e push somente quando o usuário pedir ("dá push", "pode enviar"). Cada push na `main` publica sozinho.
- Testar sempre em várias larguras, não só 1440. Lista mínima: 1920x969, 1680x939, 1536x730, 1440x789, 1366x657, 1280x609, 1180x820, 1024x768, 820x1180, 768x1024, 430x932, 390x844, 375x667, 360x740. As alturas já descontam a barra do navegador de notebook, que é onde mais aparecem problemas.
- Medir com código (rolagem lateral, texto quebrando, botão cortado, elementos fora da tela), não só olhar o print.
- Usar o navegador interno do Claude para testar, não o navegador pessoal do usuário.
- Código sem comentários, sem emojis, sem texto interno na interface (nada de "Preview", "a confirmar" visível etc., exceto os marcadores de pendência listados abaixo).
- Acessibilidade e contraste sempre conferidos quando uma seção muda de cor.
- Números exibidos nas animações (Meta, GA4, cards) sempre positivos.

## Publicação

- Repositório: `FrosttyS18/growth-site`, branch `main`.
- Hospedagem: Cloudflare Pages, projeto `growth-site`, ligado ao GitHub. Sem comando de build, diretório de saída `/` (raiz).
- Link provisório: https://growth-site-8yf.pages.dev
- Cada push na `main` gera deploy automático em cerca de um minuto.

## Rodar localmente

Site estático em HTML, CSS e JS puros, sem framework e sem build.

```bash
python -m http.server 5177
```

Abrir `http://localhost:5177`. O navegador costuma segurar CSS/JS em cache: recarregar forçado ao testar.

O repositório usa `core.autocrlf true`; os avisos de LF/CRLF no `git add` são esperados.

## Estrutura

- `index.html`: todas as seções e a página de portfólio (`#/portfolio`).
- `css/styles.css`: estilos; tokens de design no `:root`.
- `js/dados.js`: `LOGO` (letras do logo) e `PECAS` (lista do portfólio).
- `js/main.js`: menu, header, esteira de logos, diagrama do Quem somos, rodapé, portfólio e rotas `#/`.
- `js/hero.js`: animação do hero ("hero canvas").
- `js/orbita.js`: galáxia de peças.
- `js/dna.js`: parallax do DNA.
- `js/depoimentos.js`: carrossel de depoimentos em vídeo.
- `assets/marca`: letras do logo.
- `assets/clientes`: logos dos clientes.
- `assets/portfolio`: 120 peças do portfólio (webp, mp4, jpg).
- `assets/galeria/iox-90-meta-ads.webp`: peça usada na cena "Criativo".
- `assets/galeria/look/`: modelos e produtos recortados (fundo transparente) da landing page One Drop, gerados no ChatGPT.
- `assets/galeria/clickplanos-home.webp`: não é mais usado; pode ser removido.

## Direção visual

- Mistura do visual do manychat.com com as cores da Growth77.
- Fontes: Archivo para títulos (largura 115 a 125, peso 800 a 900) e Inter para rótulos, menu e botões em caixa alta. A JetBrains Mono foi substituída pela Inter a pedido do cliente.
- Cores: verde `#57c033` (hover `#6bd148`; verde para texto sobre branco `#2c7414`), ink `#0f0f0f`, creme `#f4f3ea`, branco.
- Botões em pílula. Header flutuante em pílula que fica branco com blur ao rolar.

## Seções (em ordem)

1. **Hero** (escuro): animação do time construindo, ver detalhes abaixo.
2. **"Do primeiro clique até a venda"** (branco): galáxia em espiral com as peças do portfólio, no estilo do getartcraft.com. Espiral circular e centralizada no texto, inclusive no celular (6 braços no desktop, 3 no celular). O rótulo "Flywheel SO-G77" foi removido.
3. **Quem somos**: seção toda preta, diagrama do Flywheel SO-G77 direto sobre o fundo (sem card branco), botão verde. No celular as tags do diagrama são distribuídas pela largura real para não se sobrepor.
4. **Clientes** (escuro): esteira de logos.
5. **"Growth e estratégia são o nosso DNA"**: parallax com hélice em canvas, título com duas linhas deslizando em direções opostas (sem sombra no texto), fundo escuro atrás do texto. No celular a hélice fica quase vertical. Os cards dos 6 tipos de growth sobem por cima como uma folha branca.
6. **Depoimentos**: cópia do formato da seção de depoimentos da inlead.marketing (painel escuro com texto à esquerda e carrossel de vídeos 6:10 vazando à direita, card ativo maior que o painel, controles voltar/pausar/som e setas). Apenas 2 vídeos, sem cópias para loop. O painel escuro termina junto com o vídeo ativo. No celular o texto fica em cima e o vídeo centralizado saindo do painel, só com o botão de som.
7. **"E aí, bora colocar seu funil para vender?"**: CTA final.
8. **Rodapé**: igual ao do site original (pedido do cliente). No celular o logo gigante foi removido.

Não existe mais CTA fixo no rodapé do celular (removido a pedido).

## Hero canvas (js/hero.js)

Animação de 10 cursores nomeados (Wesley, Ivan, Thainan, Leo, Design, Copy, Creator, Meta, Priscilla, Fabrizio) construindo em 5 cenas, dentro de uma "prancheta":

1. **Logo**: cada pessoa desenha uma letra de GROWTH77, o Wesley deixa o 77 verde e o Copy digita FIRST ACQUISITION AGENCY. Aprovada, não mudar.
2. **Landing page**: editor de páginas (camadas, propriedades, seletor de cor, breakpoints) montando a landing page da marca fictícia **One Drop** (lookbook de streetwear com modelos e produtos recortados). Não pode ser o site da própria Growth nem cópia das landing pages antigas de clientes. No desktop o time monta a versão desktop e o Wesley clica no ícone de celular, reorganizando a página. No celular a cena aparece rapidamente como desktop, vira celular e o time constrói a versão mobile.
3. **Criativo**: peça "Precisa de direção." do Fundo IOX 90 (Grupo IOX), com painel de propriedades e exportar.
4. **Meta Ads**: réplica do Gerenciador de Anúncios atual (árvore campanha/conjunto/anúncio, local da conversão, menu de meta de desempenho, orçamento, localização com sugestão, régua de idade, medidor de público, estimativas, Publicar e status "Em veiculação"). Ícones reais nas barras.
5. **GA4**: Administrador > Exibição de dados > Eventos, painel "Criar evento" com condição `event_name` é igual a `form_submit`, toggle "Marcar como evento principal" e estrela na tabela. O `generate_lead` conta até 512 leads ao ser criado. Sem logos do Meta ou do Google.

Papéis do time (seguir sempre):

- Landing page e criativo: Wesley e Design desenham e clicam; Thainan e Ivan cuidam dos textos.
- Meta Ads e GA4: Leo cuida dos botões, menus e régua; Copy, Thainan e Ivan digitam; Meta desenha medidor e estimativas.
- Cursores sem tarefa ficam dentro da prancheta, perto de quem do próprio time está trabalhando (`TIMES` em `hero.js`), para parecer trabalho em conjunto.

Como funciona:

- `ROTEIRO` define cada cena: `dur` em ms e `tarefas` no formato `[tempo, cursor, ação, alvo, a, b]`. Ações: `desenhar`, `mostrar`, `digitar`, `clicar`, `escolher` (abre menu e escolhe opção), `arrastar` (régua). Os alvos são elementos com `data-k`; camadas do editor usam `data-cam`.
- Cada cursor tem uma fila própria: tarefas do mesmo cursor rodam em sequência.
- Palco base 960x600, prancheta 880x520. Em telas largas e baixas (área do canvas com proporção acima de 2,05) a prancheta vira `is-larga` (1140 de largura) e as cenas são redistribuídas por CSS (`.is-larga ...`).
- Acima de 768px o enquadramento é colado na prancheta; a faixa de etapas e o time (`.hud`) e o header (`.site-header .wrap`) ganham exatamente a largura do canvas (`alinharHud`, `alinharTopo`). Se os nomes das etapas não cabem, só o nome da etapa ativa aparece (`is-curta`); se o menu não cabe, o header entra em modo mais justo (`is-justo`).
- No celular (até 768px) a faixa fica em cima e a prancheta vira formato celular (`is-celular`) na cena da landing page.
- O canvas fica invisível até a animação montar (`.palco.is-pronto`), para não piscar branco ao carregar.
- Etapas clicáveis; respeita `prefers-reduced-motion`. Não há botão de pausar (removido a pedido).

## Decisões já reprovadas pelo cliente (não repetir)

- Etapas e time numa coluna lateral do hero. O certo é a faixa em cima, compacta e alinhada ao canvas.
- Botão do hero fora do centro ou escondido. Ele fica centralizado embaixo do canvas.
- Landing page do hero como wireframe, como cópia do site da Growth, como landing page antiga de cliente ou com ilustração feita só em CSS (versão "conta de luz").
- Espiral da galáxia achatada/oval no celular.
- Fotos com fundo e sombras nos recortes: usar sempre PNG/WebP com fundo transparente.

## Pendências

- Vídeos reais dos 2 depoimentos. O cliente vai dizer quais. Para ligar um vídeo, preencher `data-video="caminho/do/video.mp4"` no `article.depo-slide` e trocar a capa (`.depo-poster`). As capas atuais (Grupo IOX e ClickPlanos) são provisórias.
- Headline visível no hero (hoje o H1 é só para leitores de tela); aguardando copy do cliente.
- Razão social e CNPJ no rodapé (marcador `.confirmar`).
- URLs das redes sociais no rodapé (hoje `href="#"`).
- Link da política de privacidade.
- Casa 373 não tem peça no portfólio.
- Domínio definitivo no Cloudflare (hoje só o link `pages.dev`).
