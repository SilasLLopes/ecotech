# Fluxo de desenvolvimento (para pessoas e agentes de IA)

Como começar, trabalhar e entregar no EcoTech. Complementa [`/AGENTS.md`](../../AGENTS.md).

## 1. Antes de qualquer tarefa

1. Leia [`/PRODUCT.md`](../../PRODUCT.md) (o que é o produto, para quem) e [`decisions.md`](./decisions.md) (o que está decidido e o que não está).
2. Se a tarefa tem interface: leia [`/DESIGN.md`](../../DESIGN.md) e o documento específico da tabela abaixo.
3. Se a tarefa toca no Next.js: leia o guia correspondente em `node_modules/next/dist/docs/01-app/` **antes** de escrever código (a versão instalada tem mudanças que seu treinamento pode não conhecer).
4. Olhe o que já existe em `src/` e reuse antes de criar.

| Tarefa | Leia |
|---|---|
| Logo, ícone, favicon, imagem, texto/tom | `docs/brand/brand-guidelines.md` |
| Cor, tipografia, espaçamento, sombra, motion | `DESIGN.md` |
| Botão, campo, cartão, navbar, tabela, estados | `docs/design/components.md` |
| Montar uma tela | `docs/design/screens.md` |
| Estrutura de rotas, dados em cache | `node_modules/next/dist/docs/01-app/01-getting-started/` (`02-project-structure`, `03-layouts-and-pages`, `08-caching`) |
| Login/permissões | `docs/process/decisions.md` (D-02) + `01-app/02-guides/authentication.md` |
| Fontes e imagens | `01-getting-started/13-fonts.md`, `12-images.md` |
| Ícones/metadata | `01-getting-started/14-metadata-and-og-images.md` |
| O que fazer em seguida | `docs/process/roadmap.md` |

## 2. Fatos do projeto que agentes costumam errar

Confirmados no repositório e nos docs empacotados do Next 16.4.6:

- **App Router em `src/app/`**; alias `@/*` → `./src/*`.
- `next.config.ts` liga **`cacheComponents`** e **`partialPrefetching`**. Dados dinâmicos precisam do tratamento descrito em `01-getting-started/08-caching.md` (`"use cache"`, `Suspense`). Não use o modelo antigo de cache sem ler esse guia.
- O arquivo `middleware` foi **renomeado para `proxy`**: se um dia for preciso, a convenção é `src/proxy.ts` (hoje não existe nenhum). Não crie `middleware.ts`.
- Helpers de tipo globais `PageProps<'/rota'>` e `LayoutProps<'/rota'>` (já usados em `layout.tsx`); não precisam de import.
- Tailwind 4 pelo `@tailwindcss/turbopack` com CSS em `src/app/globals.css` (tokens via `@theme`, **sem** `tailwind.config.js`).
- Fonte: **Inter** via `next/font/google` em `src/app/layout.tsx`, expondo `--font-inter` (ver `DESIGN.md` > Implementation). `lang` do `<html>` é `pt-BR`.
- Os placeholders do template já foram trocados pela marca EcoTech: `src/app/page.tsx` é a entrada, `public/` só tem `brand/`, o favicon é `src/app/icon.svg` e a metadata é a do EcoTech. Há `src/app/not-found.tsx` em pt-BR.
- **Com `cacheComponents`, rotas anteriores continuam montadas e escondidas** (`Activity`): navegar de uma tela para outra não desmonta a anterior. Consequências que já custaram bugs reais neste projeto:
  - (a) **Nunca** use `id`, `aria-labelledby`, `aria-describedby`, `aria-controls` ou `htmlFor` estáticos: duas telas montadas gerariam ids duplicados e referências quebradas. Use `useId()` por instância (e ids por perfil para o alvo do skip link, ex.: `conteudo-<perfil>`).
  - (b) Estado transitório (mensagens, erros, valores de formulário, travas) precisa ser **zerado na limpeza do efeito** (`useLayoutEffect(() => () => reset(), [])`, como em `preserving-ui-state.md`; zere também refs e travas, não só `useState`), senão reaparece quando a tela volta a ser mostrada.
  - Região viva (`role="status"`, `aria-live`) fica sempre montada; só o texto entra e sai, senão leitor de tela não anuncia.
- **`Icon` recebe `tamanho` (`sm | md | lg | xl`), não `size-*` em `className`.** Antes, passar `className` trocava a classe padrão e o ícone podia perder o tamanho (SVG sem tamanho estoura a largura em 360px); duas `size-*` no mesmo elemento brigam por ordem de CSS, não de classe. Corrigido: o tamanho é uma prop.
- **Render determinístico:** não chame `Date.now()`, `new Date()` ou `Math.random()` durante a renderização (quebra `cacheComponents`); só em handlers de evento. Horários de exemplo são strings fixas no seed.
- **Módulos de `src/lib/*.ts` testados com `node --test`** só usam sintaxe apagável (sem `enum`, sem parameter properties) e sem o alias `@/`. Imports de **valor** entre módulos de `src/lib` levam a extensão `.ts` (`import { distanciaM } from "./route.ts"`; o `tsconfig` liga `allowImportingTsExtensions`), e `import type` não precisa dela.
- O fundo do app vem da variável `--background` (não de utilitário `bg-*`): ver `DESIGN.md` > Implementation.
- **Animação de "o valor mudou"** (contador de pontos, "+N pts", explosão): só dispara quando a mudança acontece **diante do usuário**. Três falsos disparos já apareceram e têm guarda: a troca do seed pelo estado salvo na hidratação (`useHidratado` em `src/lib/hidratacao.ts`), a volta a uma tela escondida por `Activity` (flag zerada em `useLayoutEffect` com cleanup) e a primeira renderização. Teste sempre recarregar a página e navegar para outra tela e voltar: nenhuma animação pode tocar.
- **Mapa (MapLibre) no projeto:** o app não chama serviço de terceiros em tempo de execução. Tiles (`public/map/quixada.pmtiles`), fontes, ícones e o worker do MapLibre são locais; regenerar tiles, pontos e rotas está em `scripts/geo/README.md` (rodam à mão, 1 pedido por segundo e sem dado pessoal). O `package.json` copia o worker do pacote para `public/map/` em `predev` e `prebuild`; o lint ignora `public/map/`. As versões de `maplibre-gl`, `pmtiles` e `@protomaps/basemaps` são exatas e **mais novas que o conhecimento de muitos agentes**: leia o README e os tipos do pacote instalado antes de usar a API. O CSS do `.maplibregl-map` é `position: relative`: o contêiner do mapa precisa de altura vinda do pai (`h-full`), não de `absolute inset-0`. Sob `Activity`, o cleanup do efeito de criação remove o mapa (libera o WebGL) e a volta recria; confira com um teste em navegador que a contagem de `canvas` não cresce.
- `next dev` reescreve o bloco `nextjs-agent-rules` do `AGENTS.md`. Não edite entre os marcadores `BEGIN`/`END`.

## 3. Estrutura de pastas (proposta; confirme ao criar a primeira feature)

```
src/
  app/                  rotas (App Router), layouts, loading/error
  components/
    ui/                 átomos (Button, Field, Card, Chip, Avatar)
    brand/              Logo, curva de folha, hexágono
    <área>/             composições (navbar, reward-card, admin/...)
  lib/                  utilitários puros, formatação (Intl pt-BR), contratos de dados
  data/                 dados mock tipados (enquanto D-01 estiver aberto)
public/brand/           logotipos e ícones (não editar à mão; ver guia de marca)
docs/                   marca, design, processo
```

Regras: um componente por arquivo, nome em `kebab-case.tsx`, export nomeado em PascalCase; sem `index.ts` barrel por padrão; sem pasta nova sem motivo.

## 4. Como implementar

- **Menor sistema completo.** Reuse o que existe, estenda o componente responsável, use a plataforma (HTML, CSS, `next/*`) antes de uma biblioteca nova. Dependência nova só com justificativa e registro em `decisions.md`.
- **Tokens, não valores.** Nunca escreva `#16A36A` num componente: use `bg-primary` etc. Se faltar token, crie em `globals.css` + `DESIGN.md`.
- **Dados.** Enquanto D-01/D-04 estiverem abertos, use `src/data/` com tipos TypeScript e **dados claramente de exemplo**. Nunca apresente número mock como métrica real; nunca invente parceiros, depoimentos ou metas.
- **Segredos.** Nada de chaves no código. `.env*` fora do git; ver `01-app/02-guides/environment-variables.md`.
- **Entrada do usuário.** Valide no servidor (Server Actions / route handlers). Ver `data-security.md` e `forms.md` em `01-app/02-guides/`.
- **Acessibilidade e responsividade** não são acabamento: entram desde o primeiro commit da tela.
- **Texto.** Português do Brasil, tom do guia de marca.

## 5. Git

- Branch: `feat/<área>-<assunto>`, `fix/...`, `docs/...`, `chore/...`.
- Commits pequenos, imperativo, em português ou inglês de forma consistente: `feat(login): adiciona formulário de entrada`. Um assunto por commit.
- Não commitar: `.env*`, `.next/`, `node_modules/`, arquivos gerados temporários.
- PR: o que mudou e por quê, capturas de tela (mobile 360px + desktop) quando houver UI, decisões em aberto tocadas.

## 6. Definição de pronto

**Qualquer código**
- [ ] `npm run lint` sem erros
- [ ] `npx tsc --noEmit` sem erros
- [ ] `npm test` passa (módulos de `src/lib`)
- [ ] `npm run build` passa (importante com `cacheComponents`)
- [ ] Nada de `console.log`, código morto ou TODO sem dono
- [ ] Docs atualizados se mudou comportamento, token ou decisão

**Qualquer UI**
- [ ] Usa só tokens e componentes do `DESIGN.md`/`components.md`; nenhum hex solto
- [ ] Verde com texto pequeno usa `primary-strong` (Regra do Verde Honesto); sem `#000`
- [ ] Logotipo vindo de `public/brand/`, versão certa para o fundo, sem distorção
- [ ] 360px sem rolagem horizontal; alvos ≥44px; textos de campo ≥16px
- [ ] Teclado: ordem lógica, foco visível, sem armadilha; elementos semânticos
- [ ] Contraste AA verificado (texto ≥4,5:1; texto grande e ícones ≥3:1)
- [ ] Estado nunca só por cor; vazio, carregando e erro existem
- [ ] `prefers-reduced-motion` respeitado
- [ ] Textos em pt-BR, sentence case, vocabulário fixo, sem número inventado
- [ ] Conferido contra o board (`docs/brand/identity-board.png`): a tela parece da mesma família?

## 7. Quando parar e perguntar

- A tarefa depende de um item **[ABERTO]** em `decisions.md`.
- O board e `DESIGN.md` se contradizem, ou a marca teria de ser alterada (logotipo, paleta, fonte).
- Seria preciso instalar dependência pesada, mudar de arquitetura ou tocar em dados pessoais/localização (LGPD, D-14).
- A tela pede conteúdo factual (métricas, parceiros, regras de pontos) que não existe.

## 8. Mantendo os documentos vivos

Quem muda um token, componente, tela ou decisão atualiza o documento correspondente **no mesmo commit**. Quando o código passar a ser a fonte (tokens em `globals.css`, componentes em `src/components`), regenere `DESIGN.md` a partir do código em vez de deixá-lo divergir.
