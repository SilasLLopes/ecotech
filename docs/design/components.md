# Componentes de interface

Receitas para agentes implementarem a UI **sem inventar estilo**. Tokens e regras: [`/DESIGN.md`](../../DESIGN.md). Classes usam os tokens do `@theme` (`bg-primary-strong`, `text-graphite`, `rounded-lg`, `shadow-card`...). Se um token faltar, adicione-o em `globals.css` e em `DESIGN.md`, não use valor solto.

Convenções: componentes em `src/components/ui/` (átomos) e `src/components/<área>/` (composições). Componente de servidor por padrão; `"use client"` só quando houver estado/efeito/evento. Não instale biblioteca de UI sem decisão registrada em [`decisions.md`](../process/decisions.md).

Regras transversais, valem para **todo** componente interativo:
- Alvo de toque ≥ 44×44px. Foco visível: `focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-tech-blue`.
- Elemento semântico certo (`button` para ação, `a`/`Link` para navegação). Nunca `div` clicável.
- Estado nunca só por cor: ícone ou texto junto.
- Movimento ≤ 250ms, respeitando `motion-reduce:`.
- Todos os textos em pt-BR.

## Botão

| Variante | Receita |
|---|---|
| Primário | `inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary-strong px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-strong-hover` |
| Secundário | `... border-[1.5px] border-primary-strong bg-white text-primary-strong hover:bg-mint-wash` |
| Terciário (link-botão) | `text-primary-strong font-semibold underline-offset-4 hover:underline` |
| Sobre fundo escuro | fundo `primary-soft`, texto `graphite` (10,4:1) ou botão branco com texto `primary-strong` |
| Perigo | `bg-danger text-white` (6,6:1), só para ações destrutivas, com confirmação |

Estados: `disabled` → `bg-mint-wash text-text-muted cursor-not-allowed` (não usar opacidade sobre o verde). Carregando → spinner + texto "Entrando..." e `aria-busy`; botão não some nem muda de largura. Um primário por região; largura total no mobile em formulários.

> Adaptação (D-11): o board mostra botões verdes brilhantes (≈`primary`) com texto branco, que dão 3,24:1. Aqui o fundo é `primary-strong`. Se a equipe quiser o verde mais vivo, o texto deve ser grafite ou ≥24px/negrito.

## Link

Texto `text-primary-strong underline-offset-4 hover:underline`. Link de navegação de menu: sem sublinhado em repouso; ativo com `aria-current="page"`, `text-primary-strong` e sublinhado de 2px. Link azul (`text-tech-blue`) só para referência técnica/informativa em fundo branco.

## Cartão

`rounded-lg border border-border-soft bg-white p-6 shadow-card`. Cartão clicável: o cartão inteiro é um `Link` (ou botão), com `hover:shadow-raised hover:-translate-y-0.5 transition motion-reduce:transform-none` e foco visível. Sem cartão dentro de cartão. Título `text-xl font-semibold`, texto `text-text-muted`.

## Cartão de recompensa

Representa o saldo do cidadão. Origem: board "Cartão de Recompensas".

- Fundo `bg-reward` (token em `globals.css`: `--background-image-reward`, o degradê `primary-strong → graphite` a 135°; sem hex solto no componente), `rounded-xl`, `p-6`, `text-white`, `shadow-raised`, proporção ≈ 1.6:1.
- Topo: logo horizontal **mono branca** (altura ~28px).
- Meio: frase curta ("Você faz a diferença!") em `text-white/85`.
- Base: saldo em número destacado: `text-4xl font-extrabold tabular-nums` + "pts" em `primary-soft`.
- Curva de folha: SVG decorativo `aria-hidden`, `primary` a ~25%, ancorada no canto inferior direito, atrás do conteúdo.
- Dado real: o saldo vem do dado do usuário; "+200 pts" do board é ilustração. Sem saldo: estado vazio ("Você ainda não tem pontos. Faça seu primeiro descarte.").

## Campo de formulário

`<label>` visível acima + `<input>`: `h-11 w-full rounded-md border-[1.5px] border-border-soft bg-white px-4 text-base text-graphite placeholder:text-text-muted`. Foco: contorno azul. Erro: `border-danger`, ícone, mensagem abaixo ligada por `aria-describedby`, `aria-invalid="true"`. Ajuda em `text-sm text-text-muted`. `autocomplete` correto (`email`, `current-password`). Senha com botão de mostrar/ocultar. Tamanho de texto ≥16px. Placeholder nunca substitui o label.

## Chip / selo de status

`inline-flex items-center gap-1 rounded-full bg-mint-wash px-3 py-1 text-sm font-semibold text-primary-strong`. Variantes: aviso (`text-warning bg-warning/10`), erro (`text-danger`, `bg-danger/10`), neutro (`bg-mint-surface text-text-muted`). Sempre com ícone ou texto que diga o estado ("Aberto agora", "Pendente").

## Avatar

Círculo (`rounded-full`) 32 a 40px, foto ou iniciais sobre `mint-wash` com texto `primary-strong`. Para parceiros: máscara hexagonal opcional (`clip-path`) com logo do parceiro. `alt` com o nome.

## Cabeçalho da plataforma (navbar)

Origem: board "Cabeçalho da Plataforma". `sticky top-0 z-40 h-16 border-b border-border-soft bg-white/95 backdrop-blur`. Esquerda: logo horizontal (altura 32px, link para `/`). Centro/direita: Início · Mapa · Recompensas; avatar (menu de conta). Mobile: logo + botão de menu (`aria-expanded`), navegação em painel. Item ativo conforme "Link". Navegação em `<nav aria-label="Principal">`.

## Banner (hero com fotografia)

Origem: board "Juntos por uma cidade mais verde". `rounded-xl` (ou largura total), fotografia de cidade com árvores ao fundo, **overlay grafite** (≥55%) à esquerda para garantir contraste, título Display branco com última expressão em `primary-soft`, curva de folha `primary` cortando o canto direito. Texto nunca direto sobre áreas claras da foto. Imagem via `next/image` com `alt` descritivo (ou `alt=""` se decorativa), `priority` se acima da dobra.

## Cartão de indicador (KPI) do painel

Origem: board "Painel Administrativo". Cartão branco com ícone em `primary-strong` (círculo `mint-wash`), rótulo `text-sm text-text-muted`, valor `text-3xl font-extrabold tabular-nums`, variação com seta + texto ("+8% vs. mês passado", nunca só cor). Linha de tendência em `primary` (2px) com área `primary/10`; eixo e grade em `border-soft`. Gráficos: série principal `primary`, secundária `tech-blue`, **sempre rotuladas e com alternativa em tabela** para leitores de tela.

## Barra lateral do painel

Fundo branco (ou `mint-surface`), largura 240px (colapsa em ícones no `lg-`, gaveta no mobile). Topo: logo horizontal. Itens: Dashboard, Mapa, Usuários, Recompensas, Relatórios, cada um com ícone + texto. Ativo: `bg-primary-strong text-white rounded-md` (a variante do board com fundo verde sólido, texto branco). `<nav aria-label="Painel">`, ativo com `aria-current="page"`.

## Estado vazio / erro / carregamento

- **Vazio:** ícone de traço (folha ou pino), título curto, uma frase que explica o próximo passo, um botão. Sem ilustração genérica; sem número inventado.
- **Erro:** `role="alert"`, ícone, o que houve + o que fazer + botão "Tentar de novo".
- **Carregando:** esqueleto na forma do conteúdo (`animate-pulse motion-reduce:animate-none`, fundo `mint-wash`), nunca spinner de tela inteira para conteúdo parcial. Em Next, use `loading.tsx`/`Suspense` conforme os guias de Cache Components.

## Pino do mapa

Hexágono (do símbolo) em `primary-strong` com ícone branco; selecionado: maior, com contorno branco e `shadow-raised`; agrupamento: círculo `tech-blue` com contagem em branco (4,6:1). Cada ponto tem alternativa em lista (o mapa nunca é o único caminho). Provedor de mapa: **[ABERTO]** D-03.
