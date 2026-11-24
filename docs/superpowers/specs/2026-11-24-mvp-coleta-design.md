# MVP de coleta sob demanda: design

Data: 2026-11-24. Aprovado pelo responsável do projeto em conversa (brainstorm). Tamanho: projeto pequeno, uma entrega.

## Intenção

O EcoTech vira um app de coleta sob demanda, no estilo iFood/99. O cidadão (ou comerciante) avisa que tem material reciclável, o catador é notificado, junta vários pedidos numa rota eficiente e coleta. Cada coleta gera pontos, que o cidadão troca por benefícios promocionais em comércios da cidade. A Prefeitura é a dona da plataforma: guia o rodízio semanal de valores e os benefícios.

O responsável quer **ver como cada tela fica e funciona** antes de construir o produto real. Este MVP é um protótipo navegável, não um produto.

## Metas

- Quatro perfis navegáveis por um seletor no topo, sem login nem cadastro.
- Fluxo funcional de ponta a ponta: cidadão marca material → catador vê o pedido → seleciona pedidos e vê a rota → conclui a coleta → pontos entram no saldo do cidadão → cidadão resgata um cupom.
- Dados fictícios, porém realistas (Quixadá, CE), claramente marcados como exemplo.
- Telas fiéis a `DESIGN.md`, `components.md` e ao board; mobile (360px) para cidadão, comerciante e catador; desktop para a Prefeitura.

## Não metas

- Autenticação, cadastro, backend, banco, notificações push reais, mapa com tiles reais, GPS real, pagamentos.
- Regras de pontos definitivas, antifraude, LGPD operacional.
- Testes automatizados e CI (D-15 segue aberto), PWA.

## Antimetas

- Parecer produto real com números reais: nenhum dado mock pode ser apresentado como métrica real.
- Premiar consumo: a diferença de pontos entre materiais no rodízio é pequena de propósito (C-09).
- Hex solto, logotipo redesenhado ou fora de `public/brand/`.

## Restrições

- Next.js 16.4.6 com `cacheComponents` e `partialPrefetching`; ler os guias em `node_modules/next/dist/docs/` antes de codar. Tailwind 4 com `@theme`; tokens do `DESIGN.md`.
- Sem dependência nova sem justificativa registrada em `decisions.md`.
- WCAG 2.2 AA, 360px, alvos de 44px, estados vazio/carregando/erro (definição de pronto em `workflow.md` §6).
- Português do Brasil, sentence case, tom do guia de marca.

## Abordagens consideradas

1. **Protótipo no navegador (escolhida):** estado em React + localStorage, perfis por seletor, mapa SVG esquemático. Mais rápido, sem rede, sem dependência. O estado compartilhado entre abas permite demonstrar cidadão e catador conversando.
2. Backend real com autenticação: contradiz "sem cadastro" e fixa decisões abertas (D-01, D-02).
3. Mapa real (Leaflet/OSM): exige dependência, rede e decisão D-03; não muda o que o responsável precisa ver agora.

## Decisões do responsável

- Cidade: Quixadá (CE).
- Perfis: cidadão/comerciante, catador, Prefeitura (dona). Comerciante ganha eventos patrocinados e anúncios.
- Cidadão: início com saldo de pontos e botão "Tenho material para ser reciclado", que abre a lista de itens específicos.
- Pontuação: por coleta concluída, com item da semana indicado pela Prefeitura valendo mais (rodízio semanal), mais bônus por metas mensais e diárias.
- Catador só existe se associado pela Prefeitura (no MVP o seletor mostra catadores já "associados").

## Decisões do assistente (corrigir se discordar)

- Seletor de perfil no topo, persistido em localStorage.
- Estado compartilhado: contexto React + `localStorage` + evento `storage` para sincronizar abas.
- Mapa: SVG esquemático de Quixadá com bairros fictícios, pinos hexagonais e rota como polilinha.
- Rota: ordenação por vizinho mais próximo sobre coordenadas do SVG; distância e tempo estimados e rotulados como estimativa.
- Valores de pontos de exemplo, em `src/data/`, marcados no código e na tela como exemplo.
- Perfil "comerciante" reutiliza as telas do cidadão e acrescenta eventos e anúncios.

## O que fica para quem planejar

Estrutura exata de pastas e rotas, modelagem dos tipos, quais materiais e cupons de exemplo, layout fino de cada tela, e a ordem de entrega. Seguir `workflow.md`.
