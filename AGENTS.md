<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# EcoTech: instruções para agentes

Plataforma web de reciclagem inteligente. **Assinatura: "Pequenas atitudes. Grandes transformações."** Idioma da interface e dos documentos: português do Brasil.

## Leia primeiro (nesta ordem)

1. `PRODUCT.md`: o que é o produto, para quem, o que ainda **não** está decidido.
2. `docs/process/decisions.md`: decisões fechadas e itens **[ABERTO]**. Não decida sozinho o que está aberto.
3. `DESIGN.md`: identidade visual (cores, tipografia, formas, tokens Tailwind). **Normativo.**
4. `docs/process/workflow.md`: fluxo, estrutura de pastas, definição de pronto, quando parar e perguntar.
5. Conforme a tarefa: `docs/brand/brand-guidelines.md` (logo, voz, imagem), `docs/design/components.md`, `docs/design/screens.md`, `docs/process/roadmap.md`.

Referência visual aprovada: `docs/brand/identity-board.png`. Logotipos e ícones: `public/brand/*.svg` (recriados do board; não redesenhe, não digite o wordmark em texto).

## Regras que nunca mudam

- Paleta: Verde Principal `#16A36A`, Verde Escuro `#126B4A`, Verde Claro `#A7E8C2`, Azul Tecnológico `#2478C8`, Grafite `#202B28`, Branco `#FFFFFF`. Fonte: **Inter**. Use **tokens** (`bg-primary-strong`), nunca hex solto num componente. Sem `#000`.
- **Texto pequeno verde ou botão com texto branco usa `primary-strong` (#126B4A)**, não `primary`: `#16A36A` com branco dá só 3,24:1 (reprova AA).
- Logotipo: só os arquivos de `public/brand/`, versão certa para o fundo, sem recolorir, distorcer ou aplicar efeitos.
- Nome sempre **EcoTech**. Sentence case nos textos. Tom positivo, concreto, sem culpa nem jargão.
- Nunca invente métricas, parceiros, depoimentos ou regras de pontos. Números do board são ilustrativos. Dados mock devem ser claramente de exemplo.
- Acessibilidade WCAG 2.2 AA e mobile (360px) desde o primeiro commit da tela.

## Comandos

```bash
npm run dev          # desenvolvimento (next dev)
npm run lint         # eslint
npx tsc --noEmit     # checagem de tipos
npm test             # node --test em src/lib (reducer, rota, formatação, invariantes do seed)
npm run build        # build de produção (valida cacheComponents)
```

Só há testes unitários de `src/lib` (`node --test`, sem dependência nova); testes de interface e e2e seguem em aberto (decisão D-15).

## Pegadinhas do Next 16 neste repositório

`cacheComponents` e `partialPrefetching` estão ligados; `middleware` virou `proxy`; `PageProps`/`LayoutProps` são helpers globais; Tailwind 4 usa `@theme` em CSS, sem `tailwind.config`. Detalhes e links para os guias empacotados em `docs/process/workflow.md` §2. Não edite o bloco entre `BEGIN:nextjs-agent-rules` e `END:nextjs-agent-rules`.

## Antes de dizer "pronto"

Rode lint, tipos e build, e percorra a checklist de `docs/process/workflow.md` §6. Se mudou token, componente, tela ou decisão, atualize o documento correspondente no mesmo commit.
