# Identidade local e movimento com função: plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline; o responsável pediu para não criar mais agentes). Steps use checkbox (`- [ ]`) syntax.

**Goal:** Dar identidade de lugar e movimento com função ao protótipo, sem mudar a marca: silhueta dos monólitos, glifos de materiais, composições específicas por tela e uma cadeia de animações que mostra o gesto virando rastro.

**Architecture:** Tokens de movimento no `@theme`; componentes próprios pequenos (`Contador`, `Revelar`, `Explosao`, `Monolitos`); lógica pura nova em `src/lib` com testes; telas recompostas sobre os dados e o mapa já existentes.

**Tech Stack:** o do MVP (Next 16, React 19.3 com `ViewTransition`, Tailwind 4), sem dependência nova.

**Spec:** `docs/superpowers/specs/2026-11-24-identidade-movimento-design.md`. Design: `DESIGN.md`, `docs/design/components.md`.

## Global Constraints

- Marca fixa: paleta, Inter, logotipo de `public/brand/`, hexágono. Tokens, nunca hex solto em componente (exceção: arquivos de ilustração SVG e o estilo do mapa, com o token de origem em comentário). Texto pequeno verde e botão com texto branco usam `primary-strong`.
- Movimento: 150–250 ms nas respostas, 400–800 ms no momento principal, teto de 1,2 s (rota do mapa até 1,8 s); curva `--ease-eco` (ease-out exponencial); sem bounce, sem laço decorativo; nada bloqueia clique; `prefers-reduced-motion` troca por estado final imediato ou fade, mantendo o feedback.
- Nada de `Date.now()`/`new Date()`/`Math.random()` na renderização (`cacheComponents`); animação disparada por efeito comparando valor anterior, nunca na primeira renderização.
- `useId()` em todo id/ARIA; cleanup em `useLayoutEffect` (rotas escondidas ficam montadas: cancelar animações no cleanup); regiões vivas sempre montadas; foco para a confirmação depois de ações; `Icon` com `tamanho`; sem override de padding em `Card`/`Button` por `className`.
- Recusar (craft floor): cartões iguais de ícone + título + texto como estrutura; "hero-metric"; eyebrow acima de título; `border-left` colorido; gradiente de texto; emoji ou glifo Unicode no lugar de ícone; vidro como enfeite; modal sem necessidade.
- 360px sem rolagem horizontal; alvos de 44px; contraste AA; WCAG 2.2.
- Lógica nova pura em `src/lib` com TDD (`npm test`); resto verificado em Chromium real (WebGL por swiftshader quando houver mapa), com a rede externa bloqueada.
- Commits em português com `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Pronto = lint, tsc, testes e build verdes + verificação em navegador.

## Review Focus

1. Movimento reduzido: nenhuma animação de percurso; estado final correto em contador, tracker, ticket e gráfico (Tarefas 1, 3, 5).
2. Primeira renderização e telas escondidas (Activity): contador e explosão não disparam ao montar nem ao voltar à tela; animações são canceladas no cleanup (Tarefa 1, 3).
3. Contraste e legibilidade sobre as ilustrações e o cartão de saldo (Tarefa 2).
4. Nada quebra a 360px (silhueta, gaveta do catador, faixa de indicadores) (Tarefas 2, 4, 5).
5. A transição entre telas não esconde conteúdo nem prende o foco, e é removida se der erro com `cacheComponents` (Tarefa 1).

---

### Task 1: Fundação de movimento e superfícies do navegador

**Files:** `src/app/globals.css`, `src/lib/movimento.ts` (+ teste), `src/components/ui/contador.tsx`, `revelar.tsx`, `explosao.tsx`, `DESIGN.md` (Motion), `src/components/shell/app-shell.tsx` (transição e etiqueta "Dados de exemplo").

- [ ] **Step 1 (TDD):** `src/lib/movimento.ts` com `interpolar(de: number, para: number, t: number): number` (t limitado a 0–1, ease suave) e `rotuloDelta(delta: number): string` (`+40 pts`, `-120 pts`, vazio para 0). Testes: extremos, monotonia, delta positivo/negativo/zero, arredondamento.
- [ ] **Step 2:** Tokens no `@theme` (`--duration-fast: 160ms`, `--duration-base: 260ms`, `--duration-slow: 640ms`, `--ease-eco` já existe) e utilitários/keyframes: `entrar` (subida de 12 px + opacidade), `pulso-selo`, `preencher-linha`, `crescer-barra`, `bater-hexagono`. `@media (prefers-reduced-motion)`: manter o bloco global e, onde o estado final importa, `animation: none` com o estado final aplicado.
- [ ] **Step 3:** `Contador({ valor, sufixo?, className? })` client: anima de `valor` anterior para o novo em ~700 ms por `requestAnimationFrame` usando `interpolar`; não anima na montagem; reduzido ou fora da tela (aba escondida) mostra o valor final; cleanup cancela o quadro; `aria-live` fora dele (o contador é `aria-hidden` e há texto `sr-only` com o valor final). `Revelar({ children, indice?, as? })`: entrada em sequência com atraso `min(indice, 6) * 60ms` por variável CSS, só na primeira vez que o elemento monta. `Explosao({ disparo: number })`: 6 hexágonos que se espalham e somem em 700 ms quando `disparo` muda (não na montagem), `aria-hidden`, `pointer-events: none`.
- [ ] **Step 4:** Superfícies: `::selection` (fundo `primary-soft`, texto grafite), `accent-color: var(--color-primary-strong)`, `caret-color`, barra de rolagem fina (`scrollbar-color`/`scrollbar-width`) nos tokens, `text-wrap: balance` em `h1–h3`, `font-variant-numeric: tabular-nums` onde há números.
- [ ] **Step 5:** `AppShell`: troca a faixa larga "Protótipo com dados de exemplo" por uma etiqueta discreta no cabeçalho (ícone + "Dados de exemplo", sempre visível e com o mesmo texto para leitor de tela). Experimento de transição: envolver o conteúdo (`children`) em `<ViewTransition>` do React com `default="auto"`/crossfade curto; verificar em build e navegador que navegar entre perfis e telas não gera erro de console nem esconde conteúdo; se gerar, **remover** e ledgerar. `DESIGN.md` > Motion reescrito conforme o spec.
- [ ] **Step 6: Verificar:** `npm test` (testes novos RED→GREEN), lint, tsc, build; Chromium: reduzido e normal, console limpo; commit `feat(movimento): tokens, contador, entrada em sequência e superfícies do navegador`.

### Task 2: Identidade local (monólitos, glifos de materiais, abertura, vazios e 404)

**Files:** `src/components/brand/monolitos.tsx`, `src/components/ui/icon.tsx` (+6 glifos: `garrafa`, `caixa`, `lata`, `vidro`, `gota`, `chip`), `src/app/page.tsx`, `src/app/not-found.tsx`, `src/components/ui/empty-state.tsx`, `src/components/cidadao/compartilhado.tsx` (cartão de saldo).

- [ ] **Step 1:** `Monolitos({ className, tom })`: SVG decorativo (`aria-hidden`) com a silhueta de monólitos de Quixadá desenhada à mão em curvas simples, em duas camadas (fundo e frente), usando `currentColor`/tokens (`primary` a 12–25% sobre fundos claros, `primary-soft` sobre escuros). Ajuste fino por capturas.
- [ ] **Step 2:** Seis glifos novos no `Icon` (mesmo traço de 1,75, grade 24): garrafa PET, caixa de papelão, lata, garrafa de vidro, gota de óleo, chip. Cada material usa o seu em Coletar, nas listas e no mapa de status quando couber.
- [ ] **Step 3:** Abertura `/`: composição própria — apresentação com a silhueta e a assinatura, e os **quatro perfis como painéis com prévia viva** dos dados de exemplo (Ana: saldo; Comerciante: benefícios abertos; Catador: pedidos aguardando e distância; Prefeitura: coletas concluídas), cada painel com disposição própria (não quatro cartões iguais), tudo marcado como exemplo. Entrada em sequência (`Revelar`). Cartão de saldo: silhueta no canto no lugar da curva de folha.
- [ ] **Step 4:** Estados vazios e 404 com a silhueta no lugar do ícone-em-círculo (mantendo texto e ação); 404 com o texto de voz local.
- [ ] **Step 5: Verificar:** lint, tsc, build; capturas a 360 e 1280 de `/`, `/cidadao`, 404; contraste do texto sobre a silhueta e sobre o cartão (calcular razão com os tokens); commit `feat(identidade): monólitos de Quixadá, glifos de materiais e abertura`.

### Task 3: Cidadão e comerciante

**Files:** `src/components/cidadao/inicio.tsx`, `coletar.tsx`, `recompensas.tsx`, `compartilhado.tsx`, `src/components/mapa/mapa-acompanhamento.tsx`.

- [ ] **Step 1: Início.** Saldo com `Contador`; quando o saldo sobe (efeito comparando o saldo anterior), mostra `rotuloDelta` ("+40 pts") flutuando por 1 s e dispara `Explosao`. "Suas coletas" vira uma linha do tempo vertical (aguardando → aceito → a caminho/coletado) com a linha que se preenche quando a etapa muda e o catador no mapa; metas com barra animada (sem anel nem sparkline). Textos de voz local.
- [ ] **Step 2: Coletar.** Materiais como peças táteis com o glifo do material: tocar em "+" marca a peça (fundo `primary-soft`, leve pulso), a estimativa de pontos usa `Contador`, o item da semana ganha um selo hexagonal; confirmação com o "visto" que se desenha.
- [ ] **Step 3: Recompensas.** Catálogo com itens mais editoriais (glifo por categoria), resgate com **ticket** que entra com perfuração e carimbo e mostra o código, e `Explosao` curta; comerciante com a variante "protocolo" e o chip de status.
- [ ] **Step 4: Verificar:** Chromium com a história cidadão → catador → saldo (o contador sobe e a explosão dispara uma vez; recarregar a tela não dispara de novo), reduzido e normal, 360px, auditoria ARIA/ids (script do projeto); lint/tsc/testes/build; commit `feat(cidadao): saldo vivo, linha do tempo do pedido, materiais táteis e ticket de cupom`.

### Task 4: Catador

**Files:** `src/components/catador/pedidos-proximos.tsx`, `rota.tsx`, `src/components/mapa/mapa-quixada.tsx` (variante de altura), `src/components/shell/app-shell.tsx` (largura do conteúdo se preciso).

- [ ] **Step 1:** Mapa em primeiro plano: grudado no topo (`sticky`) abaixo do cabeçalho, sem moldura de cartão, com altura de ~42vh no celular; a lista de pedidos sobe sobre ele como uma gaveta com canto arredondado. Barra de resumo e botão continuam acima da navegação inferior. Cuidar para o resumo não cobrir o último item e para o foco do teclado não ficar atrás.
- [ ] **Step 2:** Pedido como "corrida": glifo do material, endereço em destaque, distância e pontos, seleção com resposta tátil (pulso) e o pino correspondente reagindo; na rota, paradas como linha do tempo com a parada atual em destaque e "Coletado" com confirmação (o pontos "voando" para o cidadão não existe aqui; o catador vê "+N pts para <nome>" com `Revelar`). Vazios com a silhueta.
- [ ] **Step 3: Verificar:** Chromium 360px com rede bloqueada: mapa grudado, lista rolando sobre ele, seleção, rota, coleta; sem rolagem horizontal; ARIA; reduzido; commit `feat(catador): mapa em primeiro plano, gaveta de pedidos e rota como linha do tempo`.

### Task 5: Prefeitura

**Files:** `src/components/prefeitura/painel.tsx`, `rodizio.tsx`, `src/components/prefeitura/tabela.tsx` (ajustes).

- [ ] **Step 1: Painel.** Composição própria: o mapa da cidade grande à esquerda e, à direita, o ranking de bairros com barras horizontais que crescem (pedidos por bairro, com texto e números, nunca só barra); indicadores numa **faixa corrida** (uma linha divisória, números grandes com `Contador`, sem cinco cartões), gráfico semanal com barras que crescem na entrada e tabela equivalente mantida. Catadores e pedidos recentes continuam em tabelas.
- [ ] **Step 2: Rodízio.** Mostrar o item da semana como destaque visual (glifo do material, multiplicador grande com `Contador`), pré-visualização em pontos que atualiza com transição, calendário sugerido como linha do tempo de semanas.
- [ ] **Step 3: Verificar:** Chromium 1280 e 360 (faixa empilha sem rolagem horizontal), reduzido, ARIA; commit `feat(prefeitura): painel com mapa e ranking de bairros, faixa de indicadores e rodízio em destaque`.

### Task 6: Voz, documentação e verificação final

**Files:** textos em `src/components/**`, `src/lib/nav.ts` (frases dos perfis), `DESIGN.md`, `docs/design/components.md`, `docs/design/screens.md`, `docs/process/decisions.md`.

- [ ] **Step 1: Voz.** Revisar todos os textos de interface: curtos, concretos, locais (Quixadá, "sertão" só onde for natural), sem jargão e sem culpa; o termo "Protótipo com dados de exemplo" permanece no texto acessível. Conferir vocabulário fixo (ponto de coleta, pontos, recompensa/benefício, catador).
- [ ] **Step 2: Docs.** `DESIGN.md` (Motion novo, monólitos como motivo, glifos de materiais, superfícies do navegador), `components.md` (`Contador`, `Revelar`, `Explosao`, `Monolitos`, ticket, gaveta, faixa de indicadores, linha do tempo), `screens.md` (as telas recompostas), `decisions.md` (C-19: identidade local e movimento com função; DESIGN.md > Motion atualizado a pedido do responsável).
- [ ] **Step 3: Verificação completa:** lint, tsc, testes, build; Chromium sem WebGL e com WebGL, rede bloqueada, 16 rotas × 360/1280: sem rolagem horizontal, console limpo, auditoria ARIA/ids sem falha, capturas das telas-chave vistas (home, início, coletar, recompensas, catador com mapa, rota, painel); `prefers-reduced-motion` em todas as animações novas; contraste dos textos sobre ilustrações; história ponta a ponta com três páginas. Autorrevisão final do diff (sem agente) registrada no ledger.
- [ ] **Step 4:** commit `docs: registra a identidade local e o movimento com função`.

---

## Self-review

- **Cobertura do spec:** monólitos, glifos, composições por tela, cadeia de movimento (contador, explosão, linha do tempo, ticket, barras, gaveta), superfícies do navegador, voz e etiqueta de exemplo (Tarefas 1–6).
- **Consistência:** `Contador`, `Revelar`, `Explosao` (Tarefa 1) e `Monolitos` e glifos (Tarefa 2) são consumidos nas Tarefas 3 a 5 com os mesmos nomes.
- **Risco aceito:** a transição de rotas é experimental (Tarefa 1, Step 5) e sai se quebrar.
