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
| Perigo | `bg-danger text-white` (6,6:1), só para ações destrutivas, com confirmação. **Ainda não implementada** em `ui/button.tsx` (nenhuma tela do MVP usa); criar junto com a primeira ação destrutiva |

Tamanho: o botão tem altura mínima de 44px (`min-h-11 text-sm`; a receita da tabela escreve `h-11`, e no código vale `min-h-11` para o texto poder crescer sem estourar). A prop `grande` (`min-h-14 text-base`) é só para a ação principal da tela, como "Tenho material para ser reciclado"; no máximo um por tela.

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

Origem: board "Juntos por uma cidade mais verde". `rounded-xl` (ou largura total), fotografia de cidade com árvores ao fundo, **overlay grafite** (≥55%) à esquerda para garantir contraste, título Display branco com última expressão em `primary-soft`, curva de folha `primary` cortando o canto direito. Texto nunca direto sobre áreas claras da foto. Imagem via `next/image` com `alt` descritivo (ou `alt=""` se decorativa), `loading="eager"` ou `fetchPriority="high"` se acima da dobra (`priority` é obsoleta no Next 16).

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

---

# Componentes do MVP de coleta

Implementados em `src/components/`. Descrevem o que existe no código; o que está acima continua valendo como receita. Os átomos ficam em `ui/`; as composições, na pasta da área.

## Ícone (`ui/icon.tsx`)

SVG inline próprio, grade 24×24, traço 1,75, pontas arredondadas, `currentColor`, `aria-hidden` (decorativo; o texto vizinho ou o `aria-label` do controle dá o nome). Sem biblioteca (D-08 segue aberto; o MVP usa SVG próprio).

- `nome`: um de `IconeNome` (folha, pino, trofeu, pessoas, casa, rota, check, mais, menos, presente, calendario, megafone, grafico, caminhao, relogio, x, seta, reiniciar, chevron).
- `tamanho`: `sm` (16px), `md` (20px, padrão), `lg` (24px), `xl` (28px). O tamanho é uma prop e **não** vem de `className`: duas classes `size-*` no mesmo elemento brigam por ordem de CSS (não de classe) no Tailwind 4, e o padrão se perdia. `className` serve só para cor, margem e rotação.

## Átomos do MVP

- **`Button` / `ButtonLink`** (`ui/button.tsx`): variantes `primario`, `secundario`, `terciario`; props `fullWidth` e `grande` (ver "Botão"). Desabilitado usa `bg-mint-wash text-text-muted`.
- **`Card`** (`ui/card.tsx`): receita de "Cartão"; `as` troca o elemento (`section`, `li`, `Link`) e repassa `id`, `href`, `aria-*`.
- **`Chip`** (`ui/chip.tsx`): `tom` `ok | aviso | erro | neutro`, `icone` opcional; sempre com texto.
- **`EmptyState`** (`ui/empty-state.tsx`): ícone, título, frase e ação opcional.
- **`Campo`** (`ui/campo.tsx`): rótulo visível, `type` texto ou data, multilinha, erro com ícone ligado por `aria-describedby`. Recebe um `id` que deve vir de `useId()`.
- **`Logo`** (`brand/logo.tsx`): `variante`, `fundo`, `altura` e `eager` (carrega já, sem esperar a rolagem; só no logo acima da dobra). Usa `next/image` com `loading="eager"`, não `priority` (obsoleta no Next 16).
- **`AvisoExemplo`** (`ui/aviso-exemplo.tsx`): faixa "Protótipo com dados de exemplo" no topo de toda tela.

## Stepper (`ui/stepper.tsx`)

Controle de quantidade: `role="group"` rotulado, botão Diminuir, valor com unidade em região `aria-live="polite"`, botão Aumentar. Alvos de 44px. No mínimo o Diminuir usa `aria-disabled` (e não `disabled`) para **manter o foco**; o clique é ignorado. Props: `rotulo`, `valor`, `unidade`, `onChange`, `passo` (padrão 1), `min`. O rótulo vem de `useId()`.

## Cabeçalho do app e seletor de perfil (`shell/`)

- **`AppShell`**: cabeçalho fixo (logo que leva a `/`, `PerfilMenu`, `ReiniciarDados`), `AvisoExemplo`, `<main id="conteudo-<perfil>" tabIndex={-1}>` com skip link, e a navegação do perfil. O `id` por perfil existe porque, com `cacheComponents`, mais de um layout pode estar montado ao mesmo tempo.
- **`PerfilMenu`**: `<details>`/`<summary>` com o perfil atual e a lista "Trocar de perfil" (links para a raiz de cada perfil, `aria-current="page"` no atual). Fecha com Esc (devolvendo o foco ao `summary`), clique ou foco fora, escolha de um item e mudança de rota. O perfil ativo vem da URL.
- **`ReiniciarDados`**: botão que abre uma confirmação ("Apagar o que você fez no protótipo e voltar aos dados de exemplo?") com Cancelar e Reiniciar; Esc, clique fora e foco fora fecham (assim o menu de perfil e a confirmação nunca ficam abertos juntos). O foco entra em Cancelar ao abrir.

## Navegação inferior (`shell/bottom-nav.tsx`) e barra lateral (`shell/side-nav.tsx`)

- **Inferior**: `<nav aria-label="Principal">` fixa na base, coluna `max-w-md`, um item por rota do perfil (`NAV` em `src/lib/nav.ts`: 2 a 4 itens). Cada item tem ícone + rótulo completo (`text-xs leading-tight`, sem truncar; "Recompensas" cabe em 360px com 4 itens), altura mínima de 64px, `aria-current="page"` e faixa superior de 3px no ativo (não só cor). A raiz do perfil só fica ativa na rota exata (`itemAtivo`). Respeita a área segura do aparelho.
- **Lateral**: só a Prefeitura, a partir de `lg` (nela, a inferior some a partir de `lg`). `<nav aria-label="Painel">`, 240px, ativo com `bg-primary-strong text-white` (receita "Barra lateral do painel").

## Mapa (`mapa/mapa-quixada.tsx`)

Mapa vetorial real de Quixadá (MapLibre GL JS), que **funciona sem internet**: tiles PMTiles, fontes e ícones do estilo ficam em `public/map/` e o worker do MapLibre é copiado para lá por `scripts/sync-maplibre-worker.mjs` (`predev` e `prebuild`). O estilo (`estilo-quixada.ts`) é o tema claro do Protomaps repintado com a paleta da marca: terra e quadras em tons de menta, vegetação em verde suave, água em azul tecnológico claro, vias brancas com contorno `border-soft`, rótulos em grafite, bairros em `primary-strong`; sem pontos de interesse. As cores do estilo são constantes nomeadas com o token de origem em comentário (um estilo de mapa é JSON e não lê variáveis CSS). Atribuição "© OpenStreetMap contributors · Protomaps" sempre visível.

- **Mapa de calor** (`calor={{ pontos, maximo }}`): camada `heatmap` do MapLibre abaixo dos rótulos, com a rampa `RAMPA_CALOR` (primary-soft → primary → primary-strong → graphite); o peso de cada ponto vem de `src/lib/calor.ts`. A legenda é uma sequência de quadrados (não um degradê: o degradê único é do cartão de saldo) e a lista de "Pontos mais quentes" é a alternativa em texto.
- Props: `pedidos`, `selecionados`, `rota` (`origem`, `ordem` de ids e `passando`, pontos por onde a linha passa sem mostrar pino), `posicaoCatador`, `porStatus`, `onSelecionar`, `rotulo`, `altura` (`baixa`, `media`, `alta`). Carrega a biblioteca sob demanda; esqueleto "Carregando o mapa" enquanto isso.
- Pino (`marcadores.ts`, classes `.pino-mapa` em `globals.css`): hexágono `primary-strong` com folha; selecionado maior (escala 1,28) com marca de confirmação; com `onSelecionar` é um `<button>` de 44px com `aria-pressed` e nome "Pedido em <endereço>, <bairro>"; sem ele é só imagem. **Entra com uma queda curta**, escalonada (até 8 pinos). Na rota, o pino mostra o número da parada. Com `porStatus`: aguardando é cheio, aceito é contornado com caminhão, coletado é um ponto menor com marca de confirmação (o nome do pino diz a situação; nunca só cor).
- Rota: linha `tech-blue` com contorno branco, calculada pelas ruas (`trajeto`), que **se desenha** do começo ao fim (até 1,8 s). Marcador do catador (caminhão em `tech-blue`, com onda suave): quando a posição muda, **desliza pelo trecho de ruas** (entre 0,8 s e 2,2 s). Origem sem catador: casa em `tech-blue`.
- Movimento reduzido: a rota aparece inteira, o marcador salta e o enquadramento é instantâneo.
- Sem WebGL ou com erro no estilo ou nos tiles: aviso em região viva ("O mapa não pôde ser carregado. A lista abaixo traz as mesmas informações.") e a lista da tela segue sendo o caminho principal; o mapa nunca é o único meio de agir. Zoom por botões em português e gestos cooperativos (dois dedos) para não prender a rolagem da página.
- Ciclo de vida: o mapa, os marcadores e as animações são criados e desfeitos em efeitos; com `cacheComponents` as telas escondidas ficam montadas, então o cleanup libera o WebGL e a volta recria tudo (sem instâncias a mais).

## Acompanhamento do pedido (`mapa/mapa-acompanhamento.tsx`)

Mapa baixo no cartão de cada coleta do cidadão: o pino do endereço e, com catador, o marcador dele, a rota pelas ruas até o endereço (passando pelas paradas anteriores **sem mostrar os endereços de outras pessoas**) e o chip "Chega em ~N min" com "É a próxima parada" ou "N paradas antes da sua" e a distância (estimativa). Sem catador: "Assim que um catador aceitar, o caminho até você aparece aqui." A previsão vem de `acompanhar` (`src/lib/acompanhamento.ts`).

## Movimento e identidade (`ui/contador.tsx`, `revelar.tsx`, `explosao.tsx`, `brand/monolitos.tsx`)

- **`Contador({ valor, formatar? })`**: número que conta até o novo valor em ~700 ms. Não anima na montagem, nem ao voltar a uma tela escondida, nem na troca do seed pelo estado salvo na hidratação (`useHidratado`); movimento reduzido mostra o valor final na hora. O texto visível é `aria-hidden` e há o valor final em `sr-only`.
- **`Revelar({ indice, as })`**: entrada em sequência (subida de 12 px e opacidade, 60 ms por posição, no máximo 6). Só toca ao montar.
- **`Explosao({ disparo })`**: seis hexágonos que se espalham em 760 ms quando `disparo` sobe; só em ganho real de pontos. Oculta com movimento reduzido.
- **Saldo vivo** (`CartaoSaldo`): além do contador, mostra "+N pts" que sobe e some quando o saldo muda diante do usuário, e a explosão se foi ganho.
- **Linha do tempo do pedido** (`cidadao/inicio.tsx`): etapas verticais com o fio que se preenche (`.linha-tempo__fio`) quando a etapa avança e pulso no selo da etapa atual.
- **Peça de material** (`Stepper` com `icone`): o selo com o glifo do material se enche e dá um pulso quando há quantidade; no celular o seletor desce para uma segunda linha, para o nome não ficar espremido.
- **Ticket do cupom** (`cidadao/recompensas.tsx`): canhoto com picote, entra com uma leve inclinação; código (cidadão) ou protocolo (comerciante) no canhoto.
- **Gaveta** (`catador/pedidos-proximos.tsx`, `rota.tsx`): mapa de borda a borda grudado sob o cabeçalho (`altura="cheia"`) e a lista sobe sobre ele com canto arredondado e sombra; paradas da rota como linha do tempo com a próxima em destaque.
- **Faixa de indicadores** (`prefeitura/painel.tsx`): uma moldura com divisórias de 1 px, número grande com `Contador` e o que ele mede; sem cartões nem ícones em círculo. **Pedidos por bairro**: ranking com barras que crescem, sempre com o número e a divisão em texto.
- **`Monolitos`**: ver `DESIGN.md` (motivo de marca). Esmaecimento lateral com `.silhueta-suave` quando recortada num quadro.
- Tudo respeita `prefers-reduced-motion`: a animação termina na hora e o estado final aparece.

## Parada de rota (`catador/rota.tsx`)

Item de `<ol>` dentro de um `Card`: círculo `tech-blue` com o número (decorativo; o `h3` traz "Parada N:" em `sr-only`), endereço como título, bairro e solicitante, itens, janela de retirada, chip "cerca de N pts" (estimativa) e, só na primeira, chip "Próxima parada" e o botão "Coletado" (com `aria-label` que diz qual parada). As demais mostram "Depois da parada N". Ao coletar, a região viva da tela anuncia "+N pts para <solicitante>", a posição do catador passa a ser a parada coletada (guardada no estado) e a rota das restantes é recalculada a partir dela.

## Regras de implementação que o MVP aprendeu

- Telas continuam montadas (escondidas) ao navegar, por causa de `cacheComponents`. Use `useId()` para todo `id`, `aria-labelledby`, `aria-describedby`, `htmlFor`; nunca ids estáticos. Regiões vivas (`role="status"`) ficam sempre montadas e só o texto muda. Ver `workflow.md` §2.
