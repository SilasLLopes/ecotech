# Mapa real de Quixadá, rotas pelas ruas e trajeto animado: design

Data: 2026-11-24. Aprovado pelo responsável do projeto em conversa ("aplique tudo", depois de receber as opções e a recomendação). Tamanho: projeto. Resolve o item **D-03** (provedor de mapa) para o protótipo.

## Intenção

O mapa esquemático do MVP (caixas coloridas com pinos) parece um placeholder diante dos avaliadores. O mapa passa a ser o centro do produto: um mapa real de Quixadá, com as ruas, pinos hexagonais da marca, rota desenhada pelas ruas e o catador se movendo no trajeto. Tudo funciona **sem internet** durante a apresentação.

## Metas

- Mapa vetorial real de Quixadá, reestilizado com as cores da marca, que funciona offline: os tiles, as fontes e os ícones do estilo ficam dentro do projeto.
- Coordenadas reais (latitude e longitude) nos pontos de exemplo, com os pinos sobre ruas de verdade e o endereço usando o **nome real da rua** naquele ponto, com número e pessoa fictícios.
- Rota pelas ruas entre as paradas, calculada **antes**, uma vez, e guardada no projeto (distância e tempo vêm do cálculo pelas ruas, não de uma fórmula).
- Movimento com função: pinos que "caem" ao aparecer, rota que se desenha, marcador do catador que percorre o trecho até a próxima parada depois de cada coleta.
- O cidadão acompanha o catador no mapa quando o pedido é aceito (posição e tempo estimado) e a Prefeitura vê o mapa da cidade no painel.
- Acessibilidade: a lista continua sendo o caminho principal; o mapa é reforço visual com rótulo, controles por teclado e alternativa quando o navegador não tem WebGL.

## Não metas

- Roteamento em tempo real, trânsito, GPS do aparelho, pedido de localização do usuário (LGPD, D-14), busca por endereço.
- Servidor de tiles ou de rotas próprio em produção. Para o produto real continua aberto (D-19 e o provedor de produção).
- Limites oficiais de bairro. Os bairros viram nomes e pontos de referência, sem polígonos inventados.
- Mapa de outras cidades.

## Antimetas

- Depender de internet ou de serviço de terceiros na hora da apresentação.
- Chamar o servidor público de rotas em uso normal do app (ele é só para demonstração, no máximo 1 pedido por segundo): as rotas são geradas por script uma vez e commitadas.
- Pino fora de rua, endereço que contradiz o rótulo da rua no mapa, ou dado pessoal real. Pessoas, números de casa e estabelecimentos continuam fictícios.
- Esquecer a atribuição de dados: "© OpenStreetMap contributors" e a fonte dos tiles aparecem no mapa.

## Restrições

As do MVP continuam: Next 16 com `cacheComponents` (sem `Date`/`Math.random` na renderização), `useId()`, cleanup em `useLayoutEffect`, tokens sem hex fora do estilo do mapa, pt-BR, 360px, reducer puro e testes em `src/lib`. Dependências novas permitidas e travadas em versão exata, com registro em `decisions.md`: `maplibre-gl`, `pmtiles`, `@protomaps/basemaps`. As versões instaladas são mais novas do que o conhecimento do executor: **ler a documentação e os tipos do pacote instalado antes de usar a API**.

## Abordagens

1. **MapLibre + tiles Protomaps hospedados no projeto, rotas pré-calculadas (escolhida).** Offline, sem chave, sem limite de uso, licença limpa (OpenStreetMap e Protomaps, ODbL). Custo: alguns MB no repositório e um script de preparação.
2. MapLibre + OpenFreeMap online, rotas pré-calculadas. Mais rápido, mas o mapa some se a internet cair na apresentação.
3. Leaflet com tiles raster do OpenStreetMap: o servidor público proíbe uso pesado e produção; sem vetor, sem estilo da marca. Descartada.

## Decisões do responsável

- Aplicar tudo na ordem A (catálogos), B (este mapa), C (identidade e movimento). Sem resposta sobre internet garantida, seguir a recomendação: mapa offline.

## Decisões do assistente (corrigir se discordar)

- `Ponto` passa de `{x, y}` (unidades do SVG) para `{ lng, lat }`. As distâncias passam a ser em metros reais (haversine), e a ordem das paradas continua por vizinho mais próximo, agora sobre essa distância.
- Rota pelas ruas: um script de uma vez só consulta o servidor público de rotas do projeto OpenStreetMap (perfil a pé, que é o do carrinho do catador) e grava `src/data/rotas.json` com a geometria, a distância e a duração entre todos os pares de pontos de exemplo, nos dois sentidos. Em tempo de execução só se concatenam trechos já guardados; se algum par faltar, o app traça linha reta e marca como estimativa. Como todo pedido nasce de um endereço do seed, na prática todos os pares existem.
- O tempo do trajeto é a duração a pé do cálculo mais 4 minutos por parada (o mesmo tempo de manuseio do MVP).
- Os polígonos de bairro saem. Fica uma lista de bairros com nome e ponto de referência. A invariante "ponto dentro do bairro" do teste do seed vira "ponto dentro da área urbana de Quixadá".
- `Catador.posicao: Ponto` entra no estado; `coletar` move o catador para o ponto da parada. É isso que anima o marcador e dá a posição ao cidadão que acompanha. Estado sobe para `versao: 3` (dados salvos antigos são descartados).
- O mapa é um componente de cliente carregado sob demanda (`next/dynamic`, sem SSR), para o mapa não pesar nas outras telas. Sem WebGL ou com erro nos tiles, aparece um aviso curto e a lista segue funcionando.
- Os pinos são marcadores de DOM com botões reais, para teclado, foco, tamanho de 44px e animação em CSS.
- Com `prefers-reduced-motion`, a rota aparece inteira e o marcador salta para a nova posição, sem animação de percurso.

## O que fica para quem planejar

Bounding box exata dos tiles e nível máximo de zoom, tamanho final dos arquivos, ajustes finos do estilo da marca, durações e curvas, pontos exatos escolhidos sobre ruas reais, textos de aviso.
