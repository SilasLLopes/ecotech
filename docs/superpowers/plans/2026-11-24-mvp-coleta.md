# MVP de coleta sob demanda: plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Protótipo navegável do EcoTech (cidadão/comerciante, catador, Prefeitura), sem login, com dados de exemplo de Quixadá e fluxo funcional de ponta a ponta.

**Architecture:** Next.js App Router com uma rota raiz por perfil (`/cidadao`, `/comerciante`, `/catador`, `/prefeitura`); o perfil vem da URL, então duas abas podem mostrar perfis diferentes. Todo o estado do protótipo é um objeto único, alterado por um reducer puro e testado (`src/lib/coleta.ts`), guardado em `localStorage` e lido por `useSyncExternalStore` (`src/lib/store.ts`). Telas são componentes de cliente finos sobre esse estado; páginas (`page.tsx`) são wrappers de servidor.

**Tech Stack:** Next.js 16.4.6 (`cacheComponents`), React 19.3, Tailwind 4.3.3 (tokens em `@theme`), TypeScript. Testes com `node --test` (Node 24 remove tipos nativamente), sem dependência nova.

**Spec:** `docs/superpowers/specs/2026-11-24-mvp-coleta-design.md`. Decisões: `docs/process/decisions.md` (C-06 a C-12). Marca: `DESIGN.md`, `docs/design/components.md`.

## Global Constraints

- Ler o guia do Next em `node_modules/next/dist/docs/01-app/` antes de escrever código que o toque (`AGENTS.md`). Sem `middleware.ts`; `PageProps`/`LayoutProps` são globais.
- `cacheComponents` ligado: **nunca** chamar `Date.now()`, `new Date()` ou `Math.random()` durante a renderização. Só em handlers de evento. Horários de exemplo são strings fixas no seed.
- Tokens, nunca hex solto: `bg-primary-strong`, `text-graphite`, `bg-mint-surface`... Sem `#000`. Texto pequeno verde e botão com texto branco usam `primary-strong`. Estado nunca só por cor.
- Logo só de `public/brand/` (via componente `Logo`). Nome sempre **EcoTech**. Sentence case, pt-BR, números com `Intl("pt-BR")`.
- Todo dado do seed é de exemplo e aparece marcado ("Dados de exemplo") nas telas. Valores de pontos são de exemplo (D-04 aberto).
- 360px sem rolagem horizontal; alvos ≥44px; campos ≥16px; foco visível (`outline-tech-blue`); `prefers-reduced-motion` respeitado; elementos semânticos (nada de `div` clicável).
- Sem dependência nova. Ícones: SVG inline próprio (traço 1,75, arredondado), sem biblioteca.
- Módulos de `src/lib/*.ts` testados com `node --test` só podem usar sintaxe apagável (sem `enum`, sem parameter properties) e **só `import type`** entre si (sem alias `@/`, sem extensão `.ts` em imports de valor).
- Commits pequenos em português, com o rodapé `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Pronto = `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build` verdes + checklist de `docs/process/workflow.md` §6.

## Review Focus

Entradas que o spec implica e nenhuma tarefa de tela exercita sozinha, mais provável primeiro:

1. `localStorage` corrompido, vazio ou de versão antiga: o app deve abrir com os dados de exemplo, nunca quebrar (testes na Tarefa 2).
2. Coleta concluída duas vezes (duplo clique, duas abas): pontos creditados uma só vez (Tarefa 2).
3. Resgate sem saldo, sem estoque ou duplo clique: nada muda e o saldo nunca fica negativo (Tarefa 2).
4. Catador tenta aceitar pedido que outro aceitou ou que o cidadão cancelou em outra aba: pedido ignorado e aviso na tela (Tarefa 2; UI na Tarefa 8).
5. Nada selecionado / listas vazias (sem pedidos, sem benefícios, rota vazia): estados vazios honestos, sem erro (Tarefas 2, 7, 8, 9).

---

## File Structure

```
src/lib/types.ts            tipos do domínio (só tipos)
src/lib/coleta.ts           pontosDoPedido, reducer, parseEstado (puro, testado)
src/lib/route.ts            ordenarRota, distanciaM (puro, testado)
src/lib/format.ts           pontos(n), hora(date) com Intl pt-BR
src/lib/store.ts            "use client": useEstado(), useDispatch(), reiniciar()
src/lib/nav.ts              itens de navegação por perfil
src/data/seed.ts            ESTADO_INICIAL, DEMO (ids dos perfis de demonstração), MAPA (bairros)
src/components/brand/logo.tsx
src/components/ui/          button, card, chip, stepper, empty-state, icon, aviso-exemplo
src/components/shell/       perfil-menu, bottom-nav, side-nav, app-shell
src/components/mapa/mapa-quixada.tsx
src/components/cidadao/     inicio, coletar, recompensas
src/components/catador/     pedidos-proximos, rota
src/components/prefeitura/  painel, rodizio, beneficios, eventos
src/components/comerciante/ eventos-anuncios
src/app/                    page.tsx (seletor), cidadao/, comerciante/, catador/, prefeitura/ (cada um com layout.tsx e páginas)
```

---

### Task 1: Fundação de marca no código

**Files:**
- Modify: `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`, `package.json`
- Create: `src/components/brand/logo.tsx`
- Delete: `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg`, `src/app/favicon.ico`
- Create: `src/app/icon.svg` (cópia de `public/brand/favicon.svg`)

**Interfaces:**
- Produces: tokens Tailwind do `DESIGN.md` (`bg-primary-strong`, `shadow-card`, `rounded-lg`...); `Logo({ variante: "horizontal"|"vertical"|"simbolo", fundo?: "claro"|"escuro"|"mono-branco"|"mono-grafite", altura: number, className?: string })`.

- [ ] **Step 1: Commit dos docs do brainstorm**: `git add docs PRODUCT.md && git commit -m "docs: registra decisões do MVP de coleta e o design"`.
- [ ] **Step 2: Substituir `globals.css`** pelo bloco `@theme` do `DESIGN.md` (seção Implementation), sem o `@media (prefers-color-scheme: dark)`; acrescentar `@media (prefers-reduced-motion: reduce)` zerando transições e animações.
- [ ] **Step 3: `layout.tsx`**: trocar Geist por `Inter` (`next/font/google`, `variable: "--font-inter"`, `subsets: ["latin"]`), `lang="pt-BR"`, `metadata.title = { default: "EcoTech", template: "%s | EcoTech" }`, descrição com a assinatura "Pequenas atitudes. Grandes transformações.". `body` com `bg-mint-surface text-graphite`.
- [ ] **Step 4: `Logo`** com `next/image` apontando para o arquivo certo de `public/brand/` (`logo-horizontal.svg`, `logo-horizontal-on-dark.svg`, `logo-horizontal-mono-white.svg`, `logo-vertical*.svg`, `symbol*.svg`); `alt="EcoTech"`; largura derivada da proporção do `viewBox` de cada SVG (ler o arquivo).
- [ ] **Step 5: `page.tsx`** vira provisório: `<main>` com `Logo` vertical e a assinatura. Remover os assets do template listados acima; `src/app/icon.svg` substitui o favicon.
- [ ] **Step 6: `package.json`**: adicionar `"test": "node --test src/lib/*.test.ts"`. Em `tsconfig.json` ligar `"erasableSyntaxOnly": true`.
- [ ] **Step 7: Verificar**: `npm run lint && npx tsc --noEmit && npm run build`. Esperado: 3 comandos sem erro. `npm run dev` e abrir `/`: logo EcoTech, fundo menta, fonte Inter.
- [ ] **Step 8: Commit** `feat: aplica tokens da marca, Inter e Logo`.

---

### Task 2: Domínio puro (tipos, regras, reducer, rota) com testes

**Files:**
- Create: `src/lib/types.ts`, `src/lib/coleta.ts`, `src/lib/route.ts`
- Test: `src/lib/coleta.test.ts`, `src/lib/route.test.ts`

**Interfaces:**
- Produces (`types.ts`, exatamente):
  - `Ponto = { x: number; y: number }`; `MaterialId = "pet"|"papelao"|"latas"|"vidro"|"oleo"|"eletronicos"`
  - `Material = { id: MaterialId; nome: string; unidade: "kg"|"L"|"un"; pontosBase: number }`
  - `ItemPedido = { materialId: MaterialId; quantidade: number }`; `StatusPedido = "aguardando"|"aceito"|"coletado"|"cancelado"`
  - `Pedido = { id; solicitanteId; itens: ItemPedido[]; endereco; bairro; ponto: Ponto; janela: string; status: StatusPedido; catadorId?: string; pontos?: number; criadoEm: string }`
  - `Meta = { id; periodo: "diaria"|"mensal"; titulo; alvo: number; bonus: number; progresso: number; concluida: boolean }`
  - `Solicitante = { id; nome; tipo: "cidadao"|"comerciante"; bairro; endereco: string; ponto: Ponto; saldo: number; metas: Meta[] }`
  - `Catador = { id; nome; associadoEm: string; coletas: number; origem: Ponto }`
  - `Beneficio = { id; comercio: string; titulo; custo: number; estoque: number; ativo: boolean }`; `Resgate = { id; solicitanteId; beneficioId; codigo; em }`
  - `Lancamento = { id; solicitanteId; descricao; pontos: number; em: string }` (pontos negativo no resgate)
  - `Evento = { id; titulo; data: string; local; descricao }`; `Anuncio = { id; solicitanteId; eventoId; titulo; oferta; status: "em-analise"|"aprovado"|"recusado" }`
  - `Destaque = { materialId: MaterialId; multiplicador: number }`
  - `Estado = { versao: 1; destaque; materiais: Material[]; solicitantes; catadores; pedidos; beneficios; resgates; extrato: Lancamento[]; eventos; anuncios }`
  - `Acao` (união discriminada por `type`): `solicitar {pedido: Pedido}` · `aceitar {ids: string[]; catadorId}` · `coletar {id; catadorId; lancamentoId; em}` (o lançamento de bônus de meta usa o id derivado `${lancamentoId}-${meta.id}`) · `cancelar {id}` · `resgatar {id; solicitanteId; beneficioId; codigo; em}` · `definir-destaque {materialId; multiplicador}` · `criar-beneficio {beneficio: Beneficio}` · `alternar-beneficio {id}` · `criar-evento {evento: Evento}` · `criar-anuncio {anuncio: Anuncio}` · `decidir-anuncio {id; aprovado: boolean}`. Ids, horários e códigos vêm prontos na ação (reducer puro).
- Produces (`coleta.ts`): `pontosDoPedido(itens: ItemPedido[], materiais: Material[], destaque: Destaque): number` · `reduzir(estado: Estado, acao: Acao): Estado` · `parseEstado(raw: string | null): Estado | null` · `MULTIPLICADOR_MAX = 1.5`.
- Produces (`route.ts`): `distanciaM(a: Ponto, b: Ponto): number` (1 unidade do mapa = 10 m) · `ordenarRota(origem: Ponto, paradas: { id: string; ponto: Ponto }[]): { ordem: string[]; distanciaM: number; minutos: number }`.

- [ ] **Step 1: Escrever `route.test.ts` (falhando)**, com `node:test` e `node:assert/strict`. Casos: `ordenarRota` com origem (0,0) e paradas A(10,0), B(30,0), C(20,0) dá `ordem` `["A","C","B"]` e `distanciaM` 300; lista vazia dá `{ ordem: [], distanciaM: 0, minutos: 0 }`; uma parada dá ordem `["A"]`; empate de distância resolve pela ordem de entrada; a lista de entrada não é mutada; `minutos = round(distanciaM/60 + 4 * paradas)` (60 m/min de carrinho, 4 min por parada, valores de exemplo).
- [ ] **Step 2: Rodar** `npm test`. Esperado: FAIL (módulo inexistente).
- [ ] **Step 3: Implementar `route.ts`** (vizinho mais próximo; desempate pelo menor índice de entrada). Rodar `npm test`. Esperado: PASS.
- [ ] **Step 4: Escrever `coleta.test.ts` (falhando)** usando um `Estado` mínimo montado no próprio teste (função `base()` local). Casos, com os valores:
  - `pontosDoPedido`: 2 kg de `pet` (pontosBase 8) com destaque `pet ×1.25` = 20; 1 kg de `vidro` (3) sem destaque = 3; itens vazios = 0; arredonda com `Math.round`.
  - `solicitar`: adiciona pedido `aguardando`; ignora pedido com `itens` vazio ou com `quantidade <= 0` (estado idêntico, `===`).
  - `aceitar`: muda só pedidos `aguardando` para `aceito` com `catadorId`; `ids` com pedido já `aceito` ou `cancelado` não mudam; id inexistente é ignorado.
  - `coletar`: pedido `aceito` do mesmo `catadorId` vira `coletado`, grava `pontos`, soma ao `saldo` do solicitante, cria um `Lancamento` positivo, incrementa `coletas` do catador, avança `progresso` das metas e, ao atingir `alvo` pela primeira vez, marca `concluida` e soma `bonus` ao saldo (mais um lançamento). **Segunda `coletar` do mesmo id devolve o mesmo estado (`===`)**; `catadorId` diferente também.
  - `cancelar`: só `aguardando` vira `cancelado`; `aceito` permanece.
  - `resgatar`: com saldo ≥ custo e estoque > 0 e benefício `ativo`: saldo diminui, estoque diminui 1, cria `Resgate` e `Lancamento` negativo. Saldo insuficiente, estoque 0, benefício inativo e id de resgate repetido: estado idêntico (`===`).
  - `definir-destaque`: multiplicador limitado a `[1, MULTIPLICADOR_MAX]` e arredondado a 2 casas; material desconhecido ignorado.
  - `alternar-beneficio`, `criar-beneficio`, `criar-evento`, `criar-anuncio` (nasce `em-analise`), `decidir-anuncio` (`aprovado`/`recusado`): efeito simples; id inexistente ignorado.
  - `parseEstado`: `null`, `""`, `"{"`, `"[]"`, `{"versao":0}` e objeto sem `pedidos` array devolvem `null`; um `Estado` serializado volta igual.
- [ ] **Step 5: Rodar** `npm test`. Esperado: FAIL.
- [ ] **Step 6: Implementar `types.ts` e `coleta.ts`** até passar. Reducer sempre devolve o **mesmo objeto** quando a ação não muda nada (isso evita notificações inúteis no store). Rodar `npm test && npx tsc --noEmit`. Esperado: PASS e sem erros.
- [ ] **Step 7: Commit** `feat(lib): regras de pontos, reducer e rota com testes`.

---

### Task 3: Dados de exemplo, formatação e store do navegador

**Files:**
- Create: `src/data/seed.ts`, `src/lib/format.ts`, `src/lib/store.ts`

**Interfaces:**
- Consumes: `Estado`, `Acao`, `reduzir`, `parseEstado` (Tarefa 2).
- Produces: `ESTADO_INICIAL: Estado`; `DEMO = { cidadao: "s-ana", comerciante: "s-mercadinho", catador: "c-joao" }`; `COLETAS_POR_SEMANA: { semana: string; coletas: number }[]` (8 semanas, série de exemplo fora do `Estado`); `CALENDARIO_ROTACAO: { semana: string; materialId: MaterialId }[]` (4 semanas de sugestão de exemplo); `MAPA: { largura: 400; altura: 300; bairros: { id; nome; poligono: string; rotulo: Ponto }[] }`; `format.ts`: `pontos(n: number): string` (ex. `"1.250 pts"`), `numero(n: number): string`, `hora(d: Date): string` (ex. `"Hoje, 09:40"`); `store.ts` (`"use client"`): `useEstado(): Estado`, `useDispatch(): (acao: Acao) => void`, `reiniciar(): void`, `novoId(prefixo: string): string`.

- [ ] **Step 1: `seed.ts`** com dados de exemplo de Quixadá (CE), todos fictícios, e comentário no topo "dados de exemplo": 6 materiais (PET 8/kg, papelão 4/kg, latas 12/kg, vidro 3/kg, óleo 10/L, eletrônicos pequenos 20/un); destaque `pet ×1.25`; 3 solicitantes (Ana, cidadã, saldo 140, metas: diária "1 coleta hoje" alvo 1 bônus 5; mensal "5 coletas no mês" alvo 5 bônus 40; Mercadinho Bom Preço, comerciante; Carlos, cidadão); 4 catadores associados (João com `origem` no Centro); 8 a 10 pedidos espalhados em 5 bairros (Centro, Campo Velho, Planalto Universitário, Alto São Francisco, Combate), 5 `aguardando`, 1 `aceito`, o resto `coletado` com pontos coerentes com `pontosDoPedido`; 5 benefícios de 4 comércios fictícios (custos 60 a 200, estoques 3 a 20); 3 eventos futuros com títulos fictícios; 2 anúncios (um aprovado, um em análise); extrato coerente com o saldo da Ana. Nomes de ruas e pessoas inventados; `MAPA` com 5 polígonos SVG simples (`viewBox 0 0 400 300`) e coordenadas dos pedidos dentro dos bairros.
- [ ] **Step 2: `format.ts`** com `Intl.NumberFormat("pt-BR")` e `Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" })`.
- [ ] **Step 3: `store.ts`** com `useSyncExternalStore`: `getServerSnapshot` devolve `ESTADO_INICIAL`; `getSnapshot` lê `localStorage["ecotech-mvp-v1"]` e **reutiliza o último objeto enquanto o texto bruto for igual** (referência estável, senão o React entra em laço), caindo em `parseEstado` e, se `null`, em `ESTADO_INICIAL`; `subscribe` escuta o evento `storage` além dos assinantes locais; `useDispatch` aplica `reduzir` ao estado atual, grava e notifica só se o objeto mudou; `localStorage` sempre dentro de `try/catch` (modo privado) com cópia em memória como reserva; `novoId` usa `crypto.randomUUID()` só dentro de handlers.
- [ ] **Step 4: Verificar** `npx tsc --noEmit && npm run lint`. Esperado: sem erros. Conferir no seed: soma dos lançamentos da Ana = saldo dela.
- [ ] **Step 5: Commit** `feat: dados de exemplo de Quixadá e store do protótipo`.

---

### Task 4: Átomos de UI e ícones

**Files:**
- Create: `src/components/ui/icon.tsx`, `button.tsx`, `card.tsx`, `chip.tsx`, `stepper.tsx`, `empty-state.tsx`, `aviso-exemplo.tsx`

**Interfaces:**
- Produces: `Icon({ nome: IconeNome; className?: string })` com `IconeNome = "folha"|"pino"|"trofeu"|"pessoas"|"casa"|"rota"|"check"|"mais"|"menos"|"presente"|"calendario"|"megafone"|"grafico"|"caminhao"|"relogio"|"x"|"seta"`, `aria-hidden`; `Button({ variante: "primario"|"secundario"|"terciario"|"perigo"; fullWidth?; ...props de button })` e `ButtonLink` (mesmas variantes, sobre `next/link`); `Card({ as?; className?; children })`; `Chip({ tom: "ok"|"aviso"|"erro"|"neutro"; icone?: IconeNome; children })`; `Stepper({ rotulo: string; valor: number; unidade: string; onChange(valor: number): void; passo?: number; min?: 0 })` (botões −/+ de 44px, `aria-live="polite"` no valor); `EmptyState({ icone; titulo; texto; acao?: ReactNode })`; `AvisoExemplo()` faixa discreta "Protótipo com dados de exemplo".

- [ ] **Step 1: Implementar** seguindo as receitas de `docs/design/components.md` (classes, estados, foco). Desabilitado = `bg-mint-wash text-text-muted`. Ícones de traço 1,75, `currentColor`.
- [ ] **Step 2: Verificar** `npx tsc --noEmit && npm run lint`. Esperado: sem erros.
- [ ] **Step 3: Commit** `feat(ui): botão, cartão, chip, stepper, estado vazio e ícones`.

---

### Task 5: Shell, seletor de perfil e rotas raiz

**Files:**
- Create: `src/lib/nav.ts`, `src/components/shell/app-shell.tsx`, `perfil-menu.tsx`, `bottom-nav.tsx`, `side-nav.tsx`
- Create: `src/app/{cidadao,comerciante,catador,prefeitura}/layout.tsx` e `page.tsx` provisórios
- Modify: `src/app/page.tsx` (seletor)

**Interfaces:**
- Produces: `type Perfil = "cidadao"|"comerciante"|"catador"|"prefeitura"`; `NAV: Record<Perfil, { href: string; rotulo: string; icone: IconeNome }[]>` (cidadão: Início `/cidadao`, Coletar `/cidadao/coletar`, Recompensas `/cidadao/recompensas`; comerciante: Início `/comerciante`, Coletar, Recompensas, Eventos `/comerciante/eventos`; catador: Pedidos `/catador`, Rota `/catador/rota`; prefeitura: Painel `/prefeitura`, Rodízio `/prefeitura/rodizio`, Benefícios `/prefeitura/beneficios`, Eventos `/prefeitura/eventos`); `AppShell({ perfil, children })`.

- [ ] **Step 1: `app-shell.tsx`**: barra superior (logo horizontal, `PerfilMenu` e botão "Reiniciar dados de exemplo" que chama `reiniciar()` com confirmação) + `AvisoExemplo`; navegação inferior fixa nos três perfis móveis e na Prefeitura abaixo de `lg`; na Prefeitura em `lg+`, barra lateral de 240px (receita "Barra lateral do painel"). `aria-current="page"` via `usePathname`. Conteúdo com `max-w-md` centralizado para cidadão/comerciante/catador no desktop e largura total na Prefeitura.
- [ ] **Step 2: `perfil-menu.tsx`**: `<details>` com os 4 perfis como `Link`s (nome do perfil atual no `<summary>`), sem JS extra.
- [ ] **Step 3: `src/app/page.tsx`**: seletor com 4 cartões clicáveis (cada um um `Link` para a raiz do perfil, com ícone, nome e uma frase: "Marque material para coleta e junte pontos", "Faça a coleta pela melhor rota", "Gerencie o rodízio e os benefícios"). Logo vertical e assinatura no topo. Cada `layout.tsx` de perfil envolve `children` em `AppShell`; as `page.tsx` ficam provisórias com `<h1>` do perfil.
- [ ] **Step 4: Verificar** `npm run build`. Esperado: rotas `/`, `/cidadao`, `/comerciante`, `/catador`, `/prefeitura` listadas. Em `npm run dev`, 360px: sem rolagem horizontal, navegação inferior visível, menu de perfil troca de perfil, foco visível por teclado.
- [ ] **Step 5: Commit** `feat(shell): seletor de perfil, navegação e layouts por perfil`.

---

### Task 6: Mapa esquemático de Quixadá

**Files:**
- Create: `src/components/mapa/mapa-quixada.tsx`

**Interfaces:**
- Consumes: `MAPA`, `Pedido`, `Ponto`.
- Produces: `MapaQuixada({ pedidos: Pedido[]; selecionados?: string[]; rota?: { origem: Ponto; ordem: string[] }; onSelecionar?(id: string): void; rotulo: string })`.

- [ ] **Step 1: Implementar** SVG responsivo (`viewBox` do `MAPA`, `role="img"` com `aria-label={rotulo}` e `<title>`): bairros em `mint-wash` com borda `border-soft` e rótulo; pinos hexagonais `primary-strong` (selecionado maior, com contorno branco); origem do catador em `tech-blue`; rota como `<polyline>` `tech-blue` tracejada com número de ordem em cada parada. Pinos clicáveis são `<button>`/`<g role="button" tabindex=0>` com foco visível e área ≥44px, ou, preferencialmente, a seleção acontece pela lista (o mapa nunca é o único caminho) e o pino apenas reflete e dispara `onSelecionar`. Legenda "Mapa esquemático, não representa o trajeto real".
- [ ] **Step 2: Verificar** `npx tsc --noEmit && npm run lint`. Esperado: sem erros (o uso visual é verificado na Tarefa 8).
- [ ] **Step 3: Commit** `feat(mapa): mapa esquemático com pinos e rota`.

---

### Task 7: Cidadão e comerciante: início, coletar, recompensas

**Files:**
- Create: `src/components/cidadao/inicio.tsx`, `coletar.tsx`, `recompensas.tsx`
- Modify/Create: `src/app/cidadao/page.tsx`, `coletar/page.tsx`, `recompensas/page.tsx` e as três equivalentes em `src/app/comerciante/`

**Interfaces:**
- Consumes: `useEstado`, `useDispatch`, `novoId`, `pontosDoPedido`, `DEMO`, `Button`, `Card`, `Chip`, `Stepper`, `EmptyState`, `Icon`, `format`.
- Produces: `Inicio({ perfil: "cidadao"|"comerciante" })`, `Coletar({ perfil })`, `Recompensas({ perfil })`; o solicitante ativo é `DEMO[perfil]`.

- [ ] **Step 1: `Inicio`**: cartão de recompensa (gradiente da marca, saldo em `tabular-nums`, "Dados de exemplo"); botão primário grande "Tenho material para ser reciclado" (link para `coletar`); cartão "Item da semana" (material em destaque e multiplicador vindo de `estado.destaque`, texto "Esta semana a Prefeitura valoriza um pouco mais: garrafa PET"); metas diária e mensal com barra de progresso e texto "1 de 5"; acompanhamento do pedido ativo (aguardando / aceito pelo catador / coletado) com `Chip` e botão "Cancelar" só em `aguardando`; últimas atividades do extrato; estado vazio sem pedidos.
- [ ] **Step 2: `Coletar`**: lista dos 6 materiais, cada um com `Stepper` (quantidade e unidade) e a pontuação estimada ao lado (marcada como estimativa, com selo "Em destaque" no item da semana); endereço do solicitante preenchido do seed e janela de retirada em três opções (`manhã`, `tarde`, `noite`); botão "Pedir coleta" desabilitado enquanto nada for marcado, com texto explicando por quê; ao enviar, `dispatch({ type: "solicitar", pedido })` com `novoId("p")`, `hora(new Date())` no handler, e confirmação com resumo e link "Acompanhar na tela inicial".
- [ ] **Step 3: `Recompensas`**: cartão de saldo no topo; grade de benefícios ativos (comércio, título, custo, estoque restante) com "Resgatar"; sem saldo suficiente o botão fica desabilitado e o texto diz quanto falta, sem culpa; resgate confirma e mostra o **código do cupom** (`novoId`-derivado, maiúsculas, 6 caracteres) na lista "Meus cupons"; estados vazios (sem benefícios, sem cupons).
- [ ] **Step 4: Páginas finas** que renderizam o componente com o `perfil` certo e `metadata.title`. No comerciante, o texto do `Inicio` fala em "seu comércio".
- [ ] **Step 5: Verificar** `npm run lint && npx tsc --noEmit && npm run build`. No `npm run dev`, 360px: pedir coleta com 2 kg de PET mostra estimativa `20 pts`, o pedido aparece em "aguardando"; resgatar com saldo insuficiente fica bloqueado; recarregar a página mantém o estado; "Reiniciar dados de exemplo" volta ao seed.
- [ ] **Step 6: Commit** `feat(cidadao): início, pedido de coleta e recompensas`.

---

### Task 8: Catador: pedidos próximos e rota

**Files:**
- Create: `src/components/catador/pedidos-proximos.tsx`, `rota.tsx`
- Modify: `src/app/catador/page.tsx`; Create: `src/app/catador/rota/page.tsx`

**Interfaces:**
- Consumes: `MapaQuixada`, `ordenarRota`, `useEstado`, `useDispatch`, `DEMO.catador`.
- Produces: `PedidosProximos()`, `Rota()`.

- [ ] **Step 1: `PedidosProximos`**: mapa com pedidos `aguardando` + lista (bairro, endereço, itens, janela, pontos estimados, distância da origem); selecionar pedidos por checkbox na lista (reflete no mapa); resumo fixo no rodapé: "N paradas, ~X m, ~Y min (estimativa)" calculado com `ordenarRota`; botão "Aceitar e ver rota" dispara `aceitar` com os ids selecionados e navega para `/catador/rota` (`useRouter`). Se algum id não foi aceito (já tomado/cancelado em outra aba), mostrar `role="status"` "Alguns pedidos não estão mais disponíveis" e não navegar vazio. Estado vazio "Nenhum pedido por perto agora".
- [ ] **Step 2: `Rota`**: pedidos `aceito` do catador, ordenados por `ordenarRota`; mapa com a polilinha e paradas numeradas; lista de paradas com endereço, itens e botão "Coletado" na **primeira parada pendente** (as demais mostram "Depois da parada N"); ao concluir, `dispatch({ type: "coletar", ... })` e a parada some com confirmação "+N pts para <nome>"; ao zerar, estado final "Rota concluída" com total de paradas e pontos distribuídos e link para voltar aos pedidos. Estado vazio sem rota ativa com link "Ver pedidos próximos".
- [ ] **Step 3: Verificar** `npm run lint && npx tsc --noEmit && npm run build`. Fluxo manual com **duas abas**: aba A `/cidadao/coletar` pede coleta; aba B `/catador` mostra o pedido novo sem recarregar; B seleciona 3 pedidos, aceita, vê a rota numerada, marca coletado; aba A `/cidadao` mostra status "coletado" e saldo aumentado. Cancelar na aba A um pedido selecionado em B antes de aceitar mostra o aviso. 360px sem rolagem horizontal.
- [ ] **Step 4: Commit** `feat(catador): pedidos próximos, aceite e rota ordenada`.

---

### Task 9: Prefeitura: painel, rodízio, benefícios e eventos

**Files:**
- Create: `src/components/prefeitura/painel.tsx`, `rodizio.tsx`, `beneficios.tsx`, `eventos.tsx`
- Modify/Create: `src/app/prefeitura/page.tsx`, `rodizio/page.tsx`, `beneficios/page.tsx`, `eventos/page.tsx`

**Interfaces:**
- Consumes: `useEstado`, `useDispatch`, `MULTIPLICADOR_MAX`, `pontosDoPedido`, átomos.
- Produces: `Painel()`, `Rodizio()`, `Beneficios()`, `Eventos()`.

- [ ] **Step 1: `Painel`**: KPIs derivados do estado (coletas concluídas, quilos/litros coletados, pontos distribuídos, cupons resgatados, pedidos aguardando) em cartões de indicador; gráfico de barras SVG "Coletas por semana" a partir de uma série fixa do seed marcada como exemplo, com tabela equivalente (`<table>` com `scope`); tabela "Catadores associados" (nome, associado desde, coletas) e nota "Só catadores associados pela Prefeitura acessam o app" (C-10); tabela de pedidos recentes.
- [ ] **Step 2: `Rodizio`**: seletor do item da semana (rádios, um por material) e controle do multiplicador (passos de 0,05 entre 1,00 e `MULTIPLICADOR_MAX`), texto fixo "A diferença é pequena de propósito, para não estimular consumo exagerado"; pré-visualização "1 kg de PET = N pts com destaque"; botão "Publicar item da semana" (`definir-destaque`); lista das 4 próximas semanas como **sugestão de calendário de exemplo** (somente leitura).
- [ ] **Step 3: `Beneficios`**: tabela de benefícios (comércio, título, custo, estoque, ativo) com alternar ativo/inativo e formulário "Novo benefício" (comércio, título, custo >0, estoque >0, validação por campo com `aria-describedby`); estado vazio.
- [ ] **Step 4: `Eventos`**: lista de eventos com formulário "Novo evento" (título, data, local, descrição) e, por evento, os anúncios recebidos com "Aprovar"/"Recusar" (`decidir-anuncio`) e `Chip` de status.
- [ ] **Step 5: Verificar** `npm run lint && npx tsc --noEmit && npm run build`. Manual em 1280px e 360px (tabelas empilham no mobile): publicar PET 1.30 muda a estimativa na aba do cidadão; pôr multiplicador 2 é impossível; criar benefício novo aparece em `/cidadao/recompensas`; desativar some de lá.
- [ ] **Step 6: Commit** `feat(prefeitura): painel, rodízio, benefícios e eventos`.

---

### Task 10: Comerciante: eventos e anúncios

**Files:**
- Create: `src/components/comerciante/eventos-anuncios.tsx`, `src/app/comerciante/eventos/page.tsx`

**Interfaces:**
- Consumes: `useEstado`, `useDispatch`, `DEMO.comerciante`, átomos.
- Produces: `EventosAnuncios()`.

- [ ] **Step 1: Implementar**: lista de eventos da Prefeitura abertos para patrocínio, cada um com "Anunciar neste evento" que abre um formulário (título do anúncio e oferta ao cidadão, obrigatórios, com erro por campo) e dispara `criar-anuncio` (nasce `em-analise`); seção "Meus anúncios" com `Chip` de status (em análise / aprovado / recusado) atualizado quando a Prefeitura decide em outra aba; estado vazio.
- [ ] **Step 2: Verificar** `npm run lint && npx tsc --noEmit && npm run build`. Manual com duas abas: comerciante envia, Prefeitura aprova em `/prefeitura/eventos`, o chip muda no comerciante sem recarregar.
- [ ] **Step 3: Commit** `feat(comerciante): eventos patrocinados e anúncios`.

---

### Task 11: Documentação e verificação final

**Files:**
- Modify: `docs/design/screens.md`, `docs/design/components.md`, `docs/process/roadmap.md`, `docs/process/decisions.md`, `AGENTS.md` (só fora do bloco `nextjs-agent-rules`: comandos, adicionar `npm test`)

- [ ] **Step 1: `screens.md`**: nova seção "MVP de coleta" descrevendo as telas implementadas por perfil (rotas, estados) e marcando o "Mapa de pontos de coleta" (§7) como substituído por pedidos e rota. `components.md`: documentar `PerfilMenu`, navegação inferior, `Stepper`, `MapaQuixada`, parada de rota.
- [ ] **Step 2: `roadmap.md`**: registrar o MVP como Fase "Protótipo" concluída e reordenar as fases reais (backend/autenticação/regras reais) como próximas. `decisions.md`: D-08 recebe nota "MVP usa SVG inline próprio"; D-15 nota "`node --test` para `src/lib`"; registrar que o perfil vem da URL (não de `localStorage`) como decisão C-13.
- [ ] **Step 3: Verificação completa**: `npm run lint && npx tsc --noEmit && npm test && npm run build`. Esperado: tudo verde. Percorrer a checklist de UI de `workflow.md` §6 nas 4 áreas em 360px e 1280px: nenhum hex solto (`grep -rnE "#[0-9a-fA-F]{3,6}" src --include=*.tsx` só pode achar SVGs de mapa/gráfico justificados por token ou comentário), contraste do texto verde, foco por teclado, `prefers-reduced-motion`.
- [ ] **Step 4: Commit** `docs: documenta o MVP de coleta e atualiza decisões`.

---

## Self-review

- **Cobertura do spec:** quatro perfis com seletor (Tarefa 5); fluxo ponta a ponta (7 → 8 → 7); rota por vizinho mais próximo rotulada como estimativa (2, 8); rodízio e item da semana (9, 7); metas diária e mensal (2, 3, 7); catador só associado (tabela e nota na Prefeitura, 9; sem cadastro no app); comerciante com eventos e anúncios (10, 9); dados de exemplo marcados (3, 4); mapa SVG (6); mobile 360 (todas as verificações). **Desvio do spec:** o perfil ativo vem da URL em vez de `localStorage`, para que duas abas mostrem perfis diferentes; registrado como C-13 na Tarefa 11.
- **Consistência de tipos:** `Acao`, `Estado`, `reduzir`, `parseEstado`, `ordenarRota`, `novoId`, `DEMO` e `NAV` têm uma só definição e os mesmos nomes nas tarefas que os usam.
- **Proporção:** o plano descreve decisões e assinaturas; o código fica para quem implementa.
