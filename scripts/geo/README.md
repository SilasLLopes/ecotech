# Preparo geográfico (rodar à mão, uma vez)

Estes scripts geram os arquivos do mapa offline do protótipo. **Nada aqui roda dentro do app**: os resultados são commitados e o app não faz nenhuma chamada de rede para mapa, fontes, ícones ou rotas.

Regras para qualquer script que consulte serviço público: no máximo 1 pedido por segundo, `User-Agent` genérico (`ecotech-prototype-geo-script`) e nenhum dado pessoal (e-mail, nome) em pedido, cabeçalho ou arquivo.

## 1. Tiles, fontes e ícones: `fetch-tiles.sh`

```bash
scripts/geo/fetch-tiles.sh [AAAAMMDD]
```

Baixa o binário `pmtiles` (go-pmtiles v1.31.2, Linux x86_64) para um diretório temporário **fora do repositório**, extrai Quixadá de um build diário do Protomaps e baixa os glyphs e sprites do estilo.

| Item | Valor |
|---|---|
| Build do Protomaps | `20261124` (`https://build.protomaps.com/20261124.pmtiles`, planetiler 0.10.2) |
| Retângulo (min lng, min lat, max lng, max lat) | `-39.16,-5.09,-38.86,-4.85` (cobre a mancha urbana e os cinco bairros, com folga) |
| Zoom | 0 a 15 (o build do Protomaps não passa de 15; acima disso o MapLibre amplia o tile) |
| Tiles / tamanho | 903 tiles, `public/map/quixada.pmtiles`, 1,6 MB |

Fontes (`public/map/glyphs/<fonte>/<faixa>.pbf`): `Noto Sans Regular`, `Noto Sans Medium`, `Noto Sans Italic`, que são as que o `@protomaps/basemaps` usa por padrão (`text-font`). Só as faixas Unicode 0-1023 e 7680-8959 (latim, acentos do português e pontuação geral), 2,3 MB no total. Modelo de URL do estilo: `/map/glyphs/{fontstack}/{range}.pbf`.

Sprites (`public/map/sprites/v4/light{,@2x}.{json,png}`): sprite v4 do tema claro, 56 KB. Referência no estilo: `/map/sprites/v4/light` (o MapLibre acrescenta `.json`, `.png`, `@2x`).

Origem e licenças:

- Dados do mapa: © OpenStreetMap contributors, licença ODbL, empacotados pelo Protomaps (`https://protomaps.com`). A atribuição aparece no mapa.
- Fontes Noto Sans em PBF: `https://github.com/protomaps/basemaps-assets` (SIL Open Font License; cópia em `public/map/glyphs/OFL.txt`).
- Sprites: mesmo repositório, derivados de `tangrams/icons` (licença MIT).

## 2. Pontos de exemplo: `build-pontos.mjs`

```bash
node scripts/geo/build-pontos.mjs   # grava src/data/pontos-geo.json
```

1. Acha o ponto de referência de cada bairro no Nominatim (Campo Velho, Alto São Francisco, Planalto Universitário, Combate). "Centro" não é um bairro mapeado no OpenStreetMap (a área é dividida em Sitiá Oeste, Baviera etc.); o script usa uma posição fixa no centro da cidade.
2. Varia a posição em torno da referência, encaixa na rua mais próxima com o `nearest` do serviço de rotas a pé e confere o nome da rua por geocodificação reversa (Nominatim). Só aceita posição sobre rua com nome, com o nome do `nearest` igual ao da geocodificação reversa, a mais de 200 m dos outros pontos, em rua diferente dos outros pontos e, nos bairros mapeados, dentro do bairro segundo o OpenStreetMap.
3. Só grava o arquivo se todos os pontos forem válidos.

Formato: lista de `{ chave, bairro, lng, lat, rua }`. As chaves ligam o seed aos pontos: `s-ana`, `s-mercadinho` e `s-carlos` são os solicitantes (os pedidos do mesmo solicitante usam o mesmo ponto, como hoje), `p-006`, `p-008`, `p-009`, `p-010` são os pedidos com endereço próprio e `c-joao`, `c-francisca`, `c-raimundo`, `c-luciana` são as origens dos catadores. Só a posição e o **nome da rua** vêm do OpenStreetMap; número da casa, pessoas e estabelecimentos continuam fictícios.

## 3. Rotas a pé: `build-rotas.mjs`

```bash
node scripts/geo/build-rotas.mjs   # lê pontos-geo.json, grava src/data/rotas.json
```

Para todo par ordenado de pontos distintos pede o trajeto a pé, com geometria completa, e grava `src/data/rotas.json`:

```
{ pontos: Record<chave, { lng, lat }>,
  trechos: Record<"A>B", { d: metros, s: segundos, g: [lng, lat][] com 5 casas }> }
```

Serviço: instância `routed-foot` do OSRM mantida pela FOSSGIS em `https://routing.openstreetmap.de/routed-foot/route/v1/foot/…` (a página `https://routing.openstreetmap.de/` lista os modos `driving`, `bike` e `foot`, cada um com a sua instância e o seu perfil). **Não usar** `router.project-osrm.org`: o servidor demo do OSRM ignora o perfil e devolve rota de carro.

Verificação de que é perfil a pé (mesmo par de pontos no Centro, ~1,3 km):

| Instância | Duração | Velocidade média |
|---|---|---|
| `routed-foot` | 1074 s | 4,5 km/h |
| `routed-bike` | 343 s | 14,2 km/h |
| `routed-car` | 137 s | 43,4 km/h |

Nos 110 trechos gerados a velocidade média fica entre 4,42 e 4,51 km/h. Espera de 1,1 s entre pedidos; cada pedido tenta até 3 vezes e depois o script aborta com erro, sem gravar arquivo incompleto.

Dados de rota: © OpenStreetMap contributors (ODbL).

## 4. Histórico de exemplo do mapa de calor: `build-historico.mjs`

```bash
node scripts/geo/build-historico.mjs   # grava src/data/historico.json
```

Gera ~100 doações fictícias em torno dos pontos de `pontos-geo.json`, com um perfil por bairro (quem mais dá e o quê, parcela de comércios). Não usa rede nem dado pessoal e é determinístico (mesma semente, mesmo arquivo). Alimenta o mapa de calor da Prefeitura (`/prefeitura/mapa`).
