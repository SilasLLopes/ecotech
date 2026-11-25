# Catálogos por público e eventos como agenda: plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Separar o catálogo de recompensas por público (cidadão x comerciante), trocar os anúncios por uma agenda de eventos da cidade e deixar o comerciante solicitar benefícios institucionais que a Prefeitura concede.

**Architecture:** `Beneficio.publico` e `Resgate.status` entram no estado (versão 2) e no reducer puro, que passa a impedir o cruzamento de públicos e ganha `conceder-resgate`; `anuncios` sai. As telas filtram por público; recompensas e a tela de benefícios da Prefeitura são estendidas, a agenda de eventos é um componente só de leitura usado pelos dois públicos móveis.

**Tech Stack:** o mesmo do MVP (Next.js 16.4.6 com `cacheComponents`, React 19.3, Tailwind 4, TypeScript, `node --test` em `src/lib`).

**Spec:** `docs/superpowers/specs/2026-11-24-catalogos-por-publico-design.md` (aprovado). Contexto: `docs/superpowers/specs/2026-11-24-mvp-coleta-design.md`, `docs/process/decisions.md`, `docs/process/workflow.md` §2 (armadilhas de `cacheComponents`).

## Global Constraints

- Tudo do plano anterior continua valendo: tokens sem hex; texto pt-BR em sentence case; sem `Date`/`Math.random` na renderização (só em handlers); reducer puro que devolve o **mesmo objeto** quando nada muda; sem dependência nova; commits em português com o rodapé `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Todo `id`, `aria-*` e `htmlFor` usa `useId()` (rotas escondidas ficam montadas). Estado transitório (mensagens, erros, valores de formulário, travas) volta ao zero em `useLayoutEffect` com cleanup, como em `src/components/catador/rota.tsx`.
- `Icon` usa a prop `tamanho`, nunca `className` de tamanho. Nenhum override de padding em `Card`/`Button` por `className`.
- Módulos de `src/lib` testados: sintaxe apagável e `import type` entre si. Os testes rodam com `npm test` (glob `src/lib/*.test.ts`).
- Dados de exemplo ficam marcados como exemplo; nenhum valor legal, percentual de imposto ou parceiro real. O item de redução de taxa tem "condições a definir" no título.
- Vocabulário: "recompensa" e "cupom" são do cidadão; para o comerciante o termo é "benefício" e o resultado de resgatar é uma "solicitação" com "protocolo".
- 360px sem rolagem horizontal, alvos de 44px, foco visível, tabelas com versão empilhada (padrão do projeto).
- Pronto = `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build` verdes, mais verificação real em Chromium sem interface, como no MVP.

## Review Focus

1. Cruzamento de públicos: cidadão resgatando item de comerciante (e o inverso), por ação direta no reducer ou por tela desatualizada em outra aba: nada muda, saldo intacto (Tarefa 1; UI na 2).
2. `localStorage` antigo (versão 1 com `anuncios`) ou sem o campo `publico`: o app abre com o exemplo, sem quebrar (Tarefa 1).
3. Duplo clique em "Solicitar" e conceder duas vezes (duas abas da Prefeitura): uma solicitação, pontos descontados uma vez, `concedido` só uma vez (Tarefas 1, 2 e 3).
4. Listas vazias: comerciante sem solicitações, Prefeitura sem solicitações pendentes, agenda sem eventos, catálogo de um público sem itens ativos: estados vazios honestos (Tarefas 2, 3 e 4).
5. Rotas antigas e vestígios: `/comerciante/recompensas` removida sem links soltos; nenhum texto ou código de "anúncio" restante (Tarefas 2, 4 e 5).

---

## Estrutura de arquivos

```
src/lib/types.ts                              Beneficio.publico, Resgate.status, sem Anuncio, Estado.versao 2, Acao nova
src/lib/coleta.ts                             resgatar com público e status; conceder-resgate; parseEstado v2
src/lib/coleta.test.ts, src/lib/seed.test.ts  atualizados
src/data/seed.ts                              catálogos por público, eventos da cidade, sem anúncios
src/lib/nav.ts                                aba Benefícios do comerciante, aba Eventos do cidadão, frase do comerciante
src/components/cidadao/recompensas.tsx        vira tela de recompensas (cidadão) e benefícios (comerciante)
src/components/prefeitura/beneficios.tsx      coluna/campo Público + solicitações dos comerciantes
src/components/prefeitura/eventos.tsx         só cadastro e lista de eventos
src/components/prefeitura/painel.tsx          KPI de cupons só do cidadão + pendentes dos comerciantes
src/components/eventos/agenda.tsx             agenda só leitura (novo)
src/app/cidadao/eventos/page.tsx              novo
src/app/comerciante/{beneficios,eventos}/     beneficios renomeada de recompensas; eventos usa a agenda
src/components/comerciante/eventos-anuncios.tsx  removido
docs/                                         screens, decisions, PRODUCT, plano antigo intocado
```

---

### Task 1: Domínio e dados de exemplo

**Files:**
- Modify: `src/lib/types.ts`, `src/lib/coleta.ts`, `src/data/seed.ts`, `src/components/prefeitura/eventos.tsx` (só tirar os anúncios), `src/app/comerciante/eventos/page.tsx` (provisória)
- Delete: `src/components/comerciante/eventos-anuncios.tsx`
- Test: `src/lib/coleta.test.ts`, `src/lib/seed.test.ts`

**Interfaces:**
- Produces (`types.ts`): `Publico = "cidadao" | "comerciante"`; `Beneficio` ganha `publico: Publico`; `StatusResgate = "emitido" | "solicitado" | "concedido"`; `Resgate` ganha `status: StatusResgate`; `Anuncio` e `Estado.anuncios` deixam de existir; `Estado.versao: 2`; `Acao` perde `criar-anuncio` e `decidir-anuncio` e ganha `{ type: "conceder-resgate"; id: string }`. `Solicitante.tipo` já é `"cidadao" | "comerciante"` e é o que se compara com `Beneficio.publico`.
- Produces (`coleta.ts`): `resgatar` só funciona se `solicitante.tipo === beneficio.publico` (além das regras atuais), grava `status: "emitido"` para público `cidadao` e `"solicitado"` para `comerciante`, e o texto do extrato do comerciante é `Solicitação: ${titulo}`; `conceder-resgate` muda só `solicitado` para `concedido`; `parseEstado` exige `versao === 2`, as coleções sem `anuncios`, e cada benefício com `publico` válido e cada resgate com `status` válido (senão devolve `null`).
- Produces (`seed.ts`): `ESTADO_INICIAL` válido para a versão 2, com os catálogos abaixo.

- [ ] **Step 1: Atualizar os testes (falhando).** Em `coleta.test.ts`: remover os casos de anúncio (`criar-anuncio`, `decidir-anuncio` e as linhas de `anuncios` no `base()` e no teste de congelamento) e acrescentar os casos abaixo, usando os valores do próprio teste.
  - `resgatar` cidadão com item `publico: "cidadao"` (custo 40, saldo 100): saldo 60, `status: "emitido"`, lançamento `-40`.
  - `resgatar` comerciante (`tipo: "comerciante"`) com item `publico: "comerciante"`: `status: "solicitado"`, extrato com descrição que começa por `Solicitação:`.
  - Cruzamento: cidadão tentando item de comerciante e comerciante tentando item de cidadão devolvem o **mesmo** estado (`===`), com saldo e estoque intactos.
  - `conceder-resgate`: `solicitado` vira `concedido`; segunda chamada, id inexistente e resgate `emitido` devolvem `===`.
  - Congelamento profundo: acrescentar uma ação `conceder-resgate` à lista de ações exercitadas.
  - `parseEstado`: um estado serializado com `versao: 1`, outro com `anuncios`, outro com benefício sem `publico`, outro com `publico: "x"` e outro com resgate de `status: "x"` devolvem `null`; o estado v2 válido volta igual.
  Em `seed.test.ts`: remover a verificação de `anuncios`; exigir que todo benefício tenha `publico` válido, que haja ao menos 1 benefício ativo de cada público, que benefícios de comerciante tenham `comercio === "Prefeitura de Quixadá"`, que todo resgate do seed (se houver) aponte para benefício e solicitante de público compatível, e que o saldo de cada solicitante continue igual à soma do extrato.
- [ ] **Step 2: Rodar `npm test`.** Esperado: FAIL (tipos e ações novas ainda não existem).
- [ ] **Step 3: Implementar tipos e reducer** (`types.ts` e `coleta.ts`) até os testes passarem, sem mudar a semântica das outras ações. `Estado.versao` passa a `2` e a lista de coleções validadas em `parseEstado` perde `anuncios`.
- [ ] **Step 4: Atualizar o seed** (`seed.ts`):
  - Benefícios do **cidadão** (`publico: "cidadao"`): 7 a 9 itens de estabelecimentos fictícios cobrindo as categorias do spec (supermercado, restaurante, roupas, papelaria, cinema/eventos, crédito de transporte, academia, kit de jardinagem e mudas, vale-compras), custos entre 60 e 200, estoques entre 3 e 20. Usar nomes que não sejam de comércios reais.
  - Benefícios do **comerciante** (`publico: "comerciante"`, `comercio: "Prefeitura de Quixadá"`): "Publicidade em campanhas municipais" (300), "Certificado de Comércio Sustentável" (200), "Selo de estabelecimento parceiro" (120), "Cupons promocionais para atrair clientes" (80), "Destaque no ranking de comerciantes" (150), "Redução de taxa municipal (condições a definir)" (400); `estoque` são as vagas, entre 5 e 20. **Sem** destaque no catálogo de parceiros e **sem** participação em feiras.
  - `eventos`: 3 a 4 eventos da cidade de exemplo (feira, mutirão, semana do meio ambiente, campanha), com título, data, local e descrição de agenda pública; sem texto de patrocínio.
  - Remover `anuncios`; `resgates: []`; `versao: 2`.
  - Atualizar o comentário do topo do arquivo (modelo novo) e manter as invariantes: pontos dos coletados, saldo = extrato, ids únicos, referências válidas, pontos dentro dos bairros.
- [ ] **Step 5: Tirar os anúncios das telas, para o build seguir verde.** Apagar `src/components/comerciante/eventos-anuncios.tsx`; deixar `src/app/comerciante/eventos/page.tsx` provisória (um `<h1>` "Eventos" e um parágrafo, com `metadata.title`), porque a Tarefa 4 a substitui pela agenda; em `src/components/prefeitura/eventos.tsx` remover a seção de anúncios, as ações de aprovar/recusar e os textos de patrocínio, mantendo o cadastro e a lista de eventos.
- [ ] **Step 6: Verificar:** `npm run lint && npx tsc --noEmit && npm test && npm run build`. Esperado: tudo verde (nenhuma referência a `anuncios` ou `Anuncio` sobra em `src/`: `grep -rniE "anuncio" src` sem resultado).
- [ ] **Step 7: Commit** `feat(lib): catálogo por público, solicitações concedidas e estado versão 2`.

---

### Task 2: Recompensas do cidadão e benefícios do comerciante

**Files:**
- Modify: `src/components/cidadao/recompensas.tsx`, `src/lib/nav.ts`, `src/app/cidadao/recompensas/page.tsx`
- Move: `src/app/comerciante/recompensas/` → `src/app/comerciante/beneficios/` (a página passa a usar `Recompensas({ perfil: "comerciante" })`, com `metadata.title` "Benefícios")
- Modify: textos do `Inicio` do comerciante se citarem "recompensas" (`src/components/cidadao/inicio.tsx`)

**Interfaces:**
- Consumes: `Beneficio.publico`, `Resgate.status`, `resgatar`, `useSolicitante`, `novoId`, `obterEstado`.
- Produces: `NAV.comerciante` com a aba `{ href: "/comerciante/beneficios", rotulo: "Benefícios", icone: "presente" }` no lugar de Recompensas; `PERFIS.comerciante.frase = "Marque o material do comércio e conquiste benefícios da Prefeitura"`.

- [ ] **Step 1: Catálogo filtrado por público.** `Recompensas` lista só benefícios ativos com `publico === solicitante.tipo`. Para o comerciante: título "Benefícios do programa", botão "Solicitar" no lugar de "Resgatar", rótulo "vagas" no lugar de "restam", cartão de saldo igual ao do cidadão. Para o cidadão nada muda além do filtro.
- [ ] **Step 2: Resultado diferente por público.** Cidadão: cupom com código, lista "Meus cupons" (só resgates com `status: "emitido"` do próprio solicitante). Comerciante: protocolo (mesmo código de 6 caracteres), lista "Minhas solicitações" com `Chip` de status (Solicitado com ícone de relógio, Concedido com ícone de check; texto e ícone, nunca só cor) e texto do que significa ("A Prefeitura confirma a concessão"). A lista do comerciante só mostra resgates dele com status `solicitado` ou `concedido`; o status muda sozinho quando a Prefeitura concede em outra aba.
- [ ] **Step 3: Segurança de cruzamento na tela.** Antes de despachar, checar com `obterEstado()` que o benefício ainda está ativo e é do público do solicitante; a mensagem de falha continua a mesma. Manter a guarda de duplo clique, a mensagem em região viva sempre montada, o foco na confirmação e o zero do estado transitório em `useLayoutEffect` que já existem.
- [ ] **Step 4: Navegação.** Em `nav.ts`: trocar a aba do comerciante e a frase do perfil como na seção Interfaces; mover a pasta de rota e ajustar `metadata`. Procurar por `/comerciante/recompensas` em todo o `src` e trocar (`grep -rn "comerciante/recompensas" src` sem resultado no fim); o cartão "Início" do comerciante não deve prometer "recompensas".
- [ ] **Step 5: Verificar:** `npm run lint && npx tsc --noEmit && npm run build`. Em Chromium a 360px: cidadão vê só itens de cidadão e comerciante só os institucionais; comerciante solicita "Selo de estabelecimento parceiro", saldo cai 120, aparece "Solicitado" com protocolo; "Cupons promocionais" também; clique duplo solicita uma vez; estados vazios sem itens ativos.
- [ ] **Step 6: Commit** `feat(beneficios): catálogo por público e solicitações do comerciante`.

---

### Task 3: Prefeitura: benefícios por público e solicitações

**Files:**
- Modify: `src/components/prefeitura/beneficios.tsx`, `src/components/prefeitura/painel.tsx`

**Interfaces:**
- Consumes: `criar-beneficio`, `alternar-beneficio`, `conceder-resgate`, `Beneficio.publico`, `Resgate.status`, `Tabela`, `Campo`.
- Produces: tela `/prefeitura/beneficios` com a tabela de benefícios (coluna **Público**), formulário "Novo benefício" com a escolha de público e a seção **Solicitações dos comerciantes**.

- [ ] **Step 1: Tabela e formulário.** Acrescentar a coluna "Público" (texto "Cidadão" ou "Comerciante", versão empilhada incluída). No formulário, um grupo de rádios "Público" (padrão Cidadão); ao escolher Comerciante, o campo "Comércio" some e o benefício nasce com `comercio: "Prefeitura de Quixadá"`, e o rótulo de estoque vira "Vagas". Validação como hoje (custo e estoque inteiros > 0, textos obrigatórios e aparados). Manter a nota "Todos os campos são obrigatórios" onde couber.
- [ ] **Step 2: Solicitações dos comerciantes.** Nova seção abaixo da tabela com a lista de resgates `solicitado` ou `concedido` cujo benefício é de público `comerciante`: protocolo, comerciante (nome via `solicitanteId`, com texto genérico se faltar), benefício, data (`formatarEm`), `Chip` de status e, nos `solicitado`, o botão "Marcar como concedido" (`conceder-resgate`) com região viva sempre montada, foco no aviso e proteção de segunda concessão (uma só; a segunda é ignorada pelo reducer). Estado vazio "Nenhuma solicitação por enquanto". Pendentes primeiro.
- [ ] **Step 3: Painel.** O KPI "Cupons resgatados" conta só resgates `emitido`; no texto de apoio do cartão, acrescentar "N solicitações de comerciantes aguardam a Prefeitura" (0 vira "nenhuma solicitação pendente").
- [ ] **Step 4: Verificar:** `npm run lint && npx tsc --noEmit && npm run build`. Em Chromium (360 e 1280px, duas páginas no mesmo contexto): comerciante solicita em A, B em `/prefeitura/beneficios` mostra a solicitação sem recarregar; "Marcar como concedido" em B muda o chip em A para "Concedido" sem recarregar; criar benefício de comerciante aparece só no catálogo do comerciante, e de cidadão só no do cidadão; desativar some do catálogo; sem rolagem horizontal; auditoria de ids/ARIA sem falhas.
- [ ] **Step 5: Commit** `feat(prefeitura): benefícios por público e solicitações dos comerciantes`.

---

### Task 4: Eventos como agenda da cidade

**Files:**
- Create: `src/components/eventos/agenda.tsx`, `src/app/cidadao/eventos/page.tsx`
- Modify: `src/app/comerciante/eventos/page.tsx` (troca a página provisória pela agenda), `src/lib/nav.ts`

**Interfaces:**
- Consumes: `Estado.eventos`, `formatarEm` (ou formatação de data de `src/lib/format.ts`), `EmptyState`.
- Produces: `Agenda()` (somente leitura) usada em `/cidadao/eventos` e `/comerciante/eventos`; `NAV.cidadao` ganha `{ href: "/cidadao/eventos", rotulo: "Eventos", icone: "calendario" }` (4 itens).

- [ ] **Step 1: `Agenda`.** Lista de eventos (título, data, local, descrição) em ordem de cadastro com os mais novos primeiro, como cartões (`h1` da página "Agenda da cidade", `h2` por evento), texto fixo "A Prefeitura divulga cada evento no próprio local. O app só mostra a agenda." e `AvisoExemplo` do shell; estado vazio "Nenhum evento marcado por enquanto". Sem botões de ação.
- [ ] **Step 2: Páginas.** `src/app/cidadao/eventos/page.tsx` e `src/app/comerciante/eventos/page.tsx` finas, com `metadata.title` "Eventos". A nav do cidadão ganha a aba; conferir que o menu inferior de 4 itens cabe a 360px sem truncar "Recompensas".
- [ ] **Step 3: Tela de eventos da Prefeitura.** A Tarefa 1 já tirou os anúncios; conferir que só restam o formulário "Novo evento" e a lista, sem texto de patrocínio ou anúncio, e que o foco e o aviso continuam como estão.
- [ ] **Step 4: Verificar:** `npm run lint && npx tsc --noEmit && npm test && npm run build`. Em Chromium a 360px: criar evento na Prefeitura aparece nas duas agendas sem recarregar; agenda vazia mostra o estado vazio (usar "Reiniciar" com estado sem eventos não é possível, então checar o componente com a lista forçada vazia por um script descartável fora do repositório); sem rolagem horizontal; auditoria de ids/ARIA.
- [ ] **Step 5: Commit** `feat(eventos): agenda da cidade somente leitura e fim dos anúncios`.

---

### Task 5: Documentação e verificação final

**Files:**
- Modify: `docs/design/screens.md`, `docs/process/decisions.md`, `PRODUCT.md`, `docs/design/components.md` (só se citar anúncios ou o catálogo único)

- [ ] **Step 1: `decisions.md`.** Registrar como decididos: **C-14** catálogos por público (itens do cidadão e do comerciante como no spec; o comerciante não resgata cupons do cidadão); **C-15** eventos são eventos da cidade divulgados no próprio evento e o app só mostra a agenda, sem anúncios; **C-16** solicitação do comerciante com protocolo, concedida pela Prefeitura, sem recusa nem devolução de pontos por enquanto. Abrir **D-20** (regras reais dos benefícios do comerciante: base legal e fiscal da redução de taxa, critérios de selo e certificado, quem concede) e **D-21** (recusa de solicitação e devolução de pontos). Atualizar a linha das limitações conhecidas sobre eventos e a da frase do comerciante (agora corrigida).
- [ ] **Step 2: `screens.md` e `PRODUCT.md`.** Atualizar a seção "MVP de coleta" (rotas e estados do comerciante, nova aba de eventos do cidadão, agenda, solicitações na Prefeitura) e trocar tudo o que fala em anúncios por agenda; `PRODUCT.md` ganha uma linha na atualização de 2026-11-24 sobre os dois catálogos. `grep -rniE "anúncio|anuncio" src docs --include=*.{ts,tsx,md}` não pode achar nada fora de `docs/superpowers/` (documentos históricos ficam como estão).
- [ ] **Step 3: Verificação completa:** `npm run lint && npx tsc --noEmit && npm test && npm run build`; depois, no build de produção em Chromium sem interface, as 15 rotas (14 do MVP menos `/comerciante/recompensas` mais `/cidadao/eventos` e `/comerciante/beneficios`) a 360 e 1280px: sem rolagem horizontal, sem erro de console, auditoria de ids e referências ARIA sem falhas; e uma história de ponta a ponta com duas ou três páginas no mesmo contexto (comerciante coleta e ganha pontos, solicita o selo; Prefeitura concede; comerciante vê "Concedido"; cidadão resgata um cupom de cidadão; Prefeitura cria um evento e ele aparece nas duas agendas; um benefício criado como comerciante não aparece para o cidadão).
- [ ] **Step 4: Commit** `docs: registra catálogos por público e agenda de eventos`.

---

## Self-review

- **Cobertura do spec:** `publico` e status (Tarefa 1); catálogos de cidadão e comerciante com os itens certos e sem os dois itens retirados (1, 2); solicitação com protocolo e concessão pela Prefeitura (1, 2, 3); agenda só leitura para cidadão e comerciante (4); fim dos anúncios (1, 4); aba Benefícios, aba Eventos do cidadão, frase corrigida (2, 4); decisões e itens abertos registrados (5); redução de taxa "a definir" (1).
- **Consistência:** `Publico`, `StatusResgate`, `conceder-resgate`, `Beneficio.publico`, `Resgate.status` têm uma definição (Tarefa 1) e os mesmos nomes nas Tarefas 2 e 3; a rota `/comerciante/beneficios` é criada na Tarefa 2 e citada nas 3 e 5; `/cidadao/eventos` e `Agenda` na Tarefa 4 e na 5.
- **Build verde por tarefa:** a Tarefa 1 já remove os anúncios das telas (apaga a tela do comerciante e a seção da Prefeitura, deixando uma página provisória de eventos), então cada tarefa fecha com `lint`, `tsc`, `npm test` e `build` verdes.
- **Proporção:** o plano fixa decisões, assinaturas e valores do spec; o código fica para quem implementa.
