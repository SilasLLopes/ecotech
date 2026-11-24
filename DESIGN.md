---
name: EcoTech
description: "Pequenas atitudes. Grandes transformações." Sistema visual da plataforma de reciclagem inteligente EcoTech.
colors:
  primary: "#16A36A"
  primary-strong: "#126B4A"
  primary-strong-hover: "#0F5A3E"
  primary-soft: "#A7E8C2"
  tech-blue: "#2478C8"
  graphite: "#202B28"
  white: "#FFFFFF"
  # Derivadas (não estão no board; ver "Cores derivadas" abaixo)
  mint-surface: "#F3FAF6"
  mint-wash: "#E6F6EC"
  border-soft: "#DCE8E1"
  text-muted: "#5B6B65"
  danger: "#B42318"
  warning: "#B54708"
  vivid: "#2CC56F"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 4rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.01em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  2xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary-strong}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.primary-strong-hover}"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.primary-strong}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
    height: "44px"
  card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.lg}"
    padding: "24px"
  card-reward:
    backgroundColor: "{colors.primary-strong}"
    textColor: "{colors.white}"
    rounded: "{rounded.lg}"
    padding: "24px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
    height: "44px"
  chip-status:
    backgroundColor: "{colors.mint-wash}"
    textColor: "{colors.primary-strong}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
---

# Design System: EcoTech

> Origem: `docs/brand/identity-board.png` (direção visual aprovada). Onde o board é ambíguo ou entra em conflito com acessibilidade, a decisão está marcada como **Adaptação** e listada em `docs/process/decisions.md` para a equipe confirmar. Os tokens do frontmatter são normativos; o texto explica como aplicar.

## Overview

**Creative North Star: "A Rede Viva"**

EcoTech é uma folha ligada a uma rede. O sistema visual vive dessa tensão: o orgânico (verde, folha, curvas de vegetação, fotografia de cidade arborizada) conversa com o preciso (hexágono, nós de circuito, grade limpa, azul tecnológico). Nenhum dos dois domina: a natureza dá calor e propósito, a tecnologia dá clareza e confiança.

A interface é clara, arejada e legível. Fundo branco ou menta muito suave, texto em grafite, verde como cor de ação e de marca, azul como acento raro que sinaliza "conexão" (dados, mapa, link técnico). Superfícies escuras (grafite) existem para a marca em fundos escuros e para cartões de destaque, não como tema padrão. O tom é positivo e concreto: celebra o gesto pequeno, mostra o ganho, nunca culpa.

**Key Characteristics:**
- Verde dominante, azul só como acento de conexão.
- Formas hexagonais e curvas de folha como motivos; cantos arredondados generosos (12 a 24px).
- Tipografia Inter, pesos 600 a 800 em títulos, tracking levemente negativo.
- Profundidade suave: sombras difusas com leve tom verde-grafite, nunca pretas duras.
- Fotografia real de cidade com árvores; sem stock genérico de "pessoa sorrindo com planta".

## Colors

Paleta de seis cores do board, mais derivadas funcionais. O verde tem três papéis distintos (marca, ação, atmosfera) e cada um usa um tom diferente.

### Primary
- **Verde Principal** (`#16A36A`, token `primary`): cor da marca ("Eco" no logotipo), ícones, gráficos, barras de progresso, preenchimentos grandes, destaques sobre fundo escuro. **Contraste com branco: 3,24:1.** Não serve para texto pequeno sobre branco nem como fundo de botão com texto branco pequeno.
- **Verde Escuro** (`#126B4A`, token `primary-strong`): **cor de ação com texto**. Fundo de botão primário (texto branco 6,51:1), links e texto verde sobre branco (6,51:1), estados selecionados, cartão de recompensa.
- **Verde Claro** (`#A7E8C2`, token `primary-soft`): realces sobre fundos escuros (ex.: "mais verde" no título do banner), bordas e preenchimentos suaves. Texto sobre fundo grafite: 10,41:1. Nunca como texto sobre branco (1,40:1).

### Secondary
- **Azul Tecnológico** (`#2478C8`, token `tech-blue`): acento de "conexão": nós do circuito do logotipo, pontos de dado em gráficos, ícones de mapa/tecnologia, links informativos. Texto azul sobre branco: 4,57:1 (passa AA por pouco; sobre `mint-surface` cai para 4,31:1, então só em texto grande ali).

### Neutral
- **Grafite** (`#202B28`, token `graphite`): texto principal (14,61:1 sobre branco), fundos escuros, "Tech" no logotipo. Substitui o preto puro. Nunca use `#000`.
- **Branco** (`#FFFFFF`, token `white`): fundo base, cartões, texto sobre superfícies escuras.

### Cores derivadas (não estão no board)

Criadas para o produto funcionar. Equipe pode substituir; ver `docs/process/decisions.md` D-07.

- `mint-surface` `#F3FAF6`: fundo de seções alternadas e do app (atrás de cartões brancos).
- `mint-wash` `#E6F6EC`: fundo de chips, itens selecionados, "Nosso Propósito".
- `border-soft` `#DCE8E1`: bordas e divisores.
- `text-muted` `#5B6B65`: texto secundário (5,62:1 sobre branco, 5,30:1 sobre menta).
- `danger` `#B42318` (6,57:1) e `warning` `#B54708` (5,43:1): erros e avisos. Sucesso usa `primary-strong`. Nunca comunicar estado só por cor: sempre ícone ou texto junto.
- `vivid` `#2CC56F`: **exclusivo do degradê do logotipo e do ícone do app**. Não usar em interface.

### Named Rules
**A Regra do Verde Honesto.** Texto pequeno sobre branco que precisa ser verde usa `primary-strong`, nunca `primary`. Botão com texto branco usa `primary-strong`. `primary` pode preencher áreas sem texto pequeno, ou carregar texto grafite (4,51:1) ou texto grande e em negrito (≥24px, ou ≥18,66px bold).
**A Regra do Azul Raro.** Azul ocupa no máximo ~5% de uma tela. Se parecer um segundo tema, tem azul demais.
**A Regra do Degradê Único.** Há um degradê de marca: `#2CC56F → #16A36A → #126B4A` (135°), usado no símbolo e no ícone do app. Superfícies de destaque usam `linear-gradient(135deg, #126B4A, #202B28)`. Sem outros degradês, sem roxo-azul, sem neon.

## Typography

**Fonte única:** Inter (com `system-ui, sans-serif` como fallback). Carregar via `next/font/google` (ver `docs/process/workflow.md`), nunca por `<link>` externo. A Inter usada no wordmark é Bold (700).

**Character:** moderna, limpa e legível, com a firmeza de um logotipo em negrito. Peso e tamanho constroem a hierarquia, não a troca de família.

### Hierarchy
- **Display** (800, `clamp(2.5rem, 6vw, 4rem)`, 1.05): manchete do banner e da landing. Uma por página. Pode destacar a última expressão em `primary-soft` sobre fundo escuro ("Juntos por uma cidade **mais verde**").
- **Headline** (700, `clamp(1.75rem, 3.5vw, 2.5rem)`, 1.15): títulos de seção.
- **Title** (600, 1.25rem, 1.3): títulos de cartão, de painel, de modal.
- **Body** (400, 1rem, 1.6): texto corrido. Largura máxima 65 a 72ch. Mínimo 16px em campos de formulário (evita zoom no iOS).
- **Label** (600, 0.875rem, +0.01em): botões, abas, chips, cabeçalhos de tabela. Mínimo de 14px; 12px só para legendas não essenciais com `text-muted` ou grafite.
- **Número em destaque** (800, `tabular-nums`): pontos, saldos, KPIs ("12.480", "+200 pts"). Sempre `font-variant-numeric: tabular-nums`.

### Named Rules
**A Regra da Família Única.** Uma só família. Se um agente sentir falta de uma fonte "de personalidade", a resposta é peso e tamanho.
**A Regra do Português Primeiro.** Texto da interface em pt-BR, com acentos corretos, sentence case ("Criar conta", não "Criar Conta"). Números no padrão brasileiro (`12.480`, `R$ 1,50`), via `Intl`.

## Layout

Mobile-first: a maior parte dos cidadãos usará o celular. Base de 4px; escala de espaço 4, 8, 16, 24, 40, 64. Conteúdo de marketing em container de até 1200px com gutter de 16px (mobile) a 32px (desktop); o app usa o shell: barra superior fixa com logo horizontal à esquerda, navegação (Início, Mapa, Recompensas) e avatar à direita; no painel admin, barra lateral com logo, itens (Dashboard, Mapa, Usuários, Recompensas, Relatórios) e área de conteúdo em `mint-surface`.

Ritmo vertical generoso entre seções (64px+ no desktop); densidade média nos cartões; densidade maior só em tabelas do painel. Breakpoints padrão do Tailwind (`sm 640`, `md 768`, `lg 1024`, `xl 1280`). Alvos de toque ≥ 44×44px. Nada de rolagem horizontal na página.

Cartões em grade de 1 coluna (mobile), 2 (md) e 3 a 4 (lg+). Não aninhe cartões dentro de cartões. Não repita a mesma grade de três cartões iguais com ícone + título + texto em toda seção: alterne escala e composição.

## Elevation & Depth

Híbrido: superfícies brancas sobre `mint-surface`, separadas por borda suave e sombra difusa. Sem sombras duras ou pretas; a sombra usa grafite em baixa opacidade.

### Shadow Vocabulary
- **Card** (`box-shadow: 0 1px 2px rgb(32 43 40 / 0.06), 0 8px 24px rgb(32 43 40 / 0.08)`): cartões em repouso.
- **Raised** (`box-shadow: 0 12px 32px rgb(18 107 74 / 0.18)`): cartão de recompensa, hover de cartão clicável, ícone do app.
- **Focus** (`outline: 3px solid #2478C8; outline-offset: 2px`): foco de teclado. Visível em todo elemento interativo, sobre qualquer fundo.

### Named Rules
**A Regra do Repouso Plano.** Em repouso, o elevado é só o cartão. Sombra maior aparece como resposta a estado (hover, foco, arraste), não como decoração.

## Shapes

Cantos arredondados: `sm 8` (chips pequenos, tags), `md 12` (botões, campos), `lg 16` (cartões), `xl 24` (banners, modais, cartão de recompensa), `full` (avatar, chip de status, ícone de pino). Ícone do app: quadrado com raio ≈ 22,5% do lado.

**Motivos de marca**, usados com moderação e nunca sobre texto:
- **Hexágono** (do símbolo): máscara para avatares de parceiro, selo de nível/conquista, pino do mapa. Cantos levemente arredondados.
- **Curva de folha** (a "onda" do banner): formas grandes, translúcidas (`primary` a 10 a 25%), cortando o canto de banners, cartões de destaque e materiais institucionais. Uma por superfície.
- **Nó de circuito** (linha + círculo vazado, em `tech-blue`): divisores curtos, marcadores de passo e indicadores de "conectado". Pequeno e raro.

Ícones: traço (outline) de 1,75 a 2px, cantos arredondados, estilo consistente (sugestão: Lucide, **[ABERTO]** D-08). Ícones de propósito do board: folha (reciclagem), pino (locais de coleta), troféu (recompensas), pessoas (cidade).

## Components

Detalhamento completo, estados e acessibilidade: `docs/design/components.md`. Resumo:

- **Botão primário:** fundo `primary-strong`, texto branco, `md`, 44px de altura, label 600. Hover `primary-strong-hover`. Foco: contorno azul. Desabilitado: `mint-wash` com texto `text-muted` (nunca opacidade sobre o verde).
- **Botão secundário:** fundo branco, borda `primary-strong` 1,5px, texto `primary-strong`.
- **Cartão:** branco, `lg`, sombra Card, padding 24px, borda `border-soft` 1px.
- **Cartão de recompensa:** degradê `#126B4A → #202B28`, texto branco, `xl`, curva de folha `primary` a ~25% no canto inferior direito, saldo em número destacado (+200 pts).
- **Campo de formulário:** branco, borda `border-soft` 1,5px, `md`, 44px; foco com contorno azul; erro com borda `danger` + ícone + mensagem em texto.
- **Chip de status:** `mint-wash` com texto `primary-strong`; variantes de aviso/erro com `warning`/`danger` e ícone.
- **Cabeçalho da plataforma:** branco, logo horizontal, navegação com item ativo em `primary-strong` e sublinhado de 2px; avatar redondo.

## Do's and Don'ts

### Do
- Use `primary-strong` para qualquer elemento verde que carregue texto pequeno.
- Use o logotipo somente pelos arquivos de `public/brand/` e conforme `docs/brand/brand-guidelines.md`.
- Combine imagem de cidade com árvores e curvas de folha para criar atmosfera em banners.
- Mostre sempre o "porquê" de um número (de onde vêm os pontos, o que dá para resgatar).
- Teste cada tela em 360px de largura e com navegação só por teclado.
- Respeite `prefers-reduced-motion`.

### Don't
- Não use `#000`, cinza neutro frio nem roxo/azul-neon. O neutro é o grafite esverdeado.
- Não use `primary` (`#16A36A`) como texto pequeno sobre branco nem fundo de botão com texto branco pequeno.
- Não recolora, distorça, gire, aplique sombra, contorno ou efeito no logotipo.
- Não crie um segundo degradê, nem use `vivid` fora do logotipo e do ícone do app.
- Não use ícones coloridos em vários tons: ícones são `primary-strong`, grafite ou branco (azul só para conexão/mapa).
- Não use emoji como ícone de interface nem ilustrações de stock genéricas.
- Não invente métricas, parceiros ou depoimentos para preencher a tela; use estados vazios honestos.
- Não use `border-left` colorido de 4px como acento de cartão, nem texto com `background-clip: text` em degradê.

## Motion

Curto, útil e suave: 150 a 250ms, `cubic-bezier(0.2, 0.7, 0.2, 1)`; entrada de cartões com leve subida (8px) e opacidade; contadores de pontos podem animar o número. Sem bounce, sem animação decorativa contínua. Com `prefers-reduced-motion: reduce`, trocar movimento por troca imediata ou fade.

## Implementation (Tailwind 4)

Tokens prontos para `src/app/globals.css` (já aplicados em `globals.css`). Esta é a **fonte única** dos tokens no código; não duplique valores em componentes.

```css
@import "tailwindcss";

@theme {
  --color-primary: #16a36a;
  --color-primary-strong: #126b4a;
  --color-primary-strong-hover: #0f5a3e;
  --color-primary-soft: #a7e8c2;
  --color-tech-blue: #2478c8;
  --color-graphite: #202b28;
  --color-mint-surface: #f3faf6;
  --color-mint-wash: #e6f6ec;
  --color-border-soft: #dce8e1;
  --color-text-muted: #5b6b65;
  --color-danger: #b42318;
  --color-warning: #b54708;

  --font-sans: var(--font-inter), system-ui, sans-serif;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;

  --shadow-card: 0 1px 2px rgb(32 43 40 / 0.06), 0 8px 24px rgb(32 43 40 / 0.08);
  --shadow-raised: 0 12px 32px rgb(18 107 74 / 0.18);

  /* Único degradê de superfície de destaque (Regra do Degradê Único): cartão de recompensa. Uso: bg-reward. */
  --background-image-reward: linear-gradient(
    135deg,
    var(--color-primary-strong),
    var(--color-graphite)
  );

  --ease-eco: cubic-bezier(0.2, 0.7, 0.2, 1);
}

:root {
  --background: var(--color-mint-surface);
  --foreground: var(--color-graphite);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
}
```

O fundo do app vem da variável `--background` (que aponta para `mint-surface`) porque uma regra `body { background }` fora de camada vence qualquer utilitário do Tailwind; por isso `bg-*` no `body` ou no `<html>` não funciona. Para trocar o fundo, mude a variável.

Uso: `bg-primary-strong text-white`, `text-graphite`, `bg-mint-surface`, `bg-reward` (cartão de recompensa), `rounded-lg shadow-card`. O bloco já está em `src/app/globals.css` e a fonte Inter já está em `src/app/layout.tsx`; ao mudar um token, atualize os dois lugares no mesmo commit.

Modo escuro do produto: **[ABERTO]** (D-06). Até decisão, somente tema claro: remover o `@media (prefers-color-scheme: dark)` do template ao aplicar os tokens.
