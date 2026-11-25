#!/usr/bin/env bash
# Preparo único (à mão) dos arquivos do mapa offline. Roda uma vez; o resultado é commitado.
#   1. extrai Quixadá de um build diário do Protomaps para public/map/quixada.pmtiles;
#   2. baixa fontes (glyphs PBF) e sprites do estilo para public/map/glyphs e public/map/sprites.
# O binário `pmtiles` e qualquer arquivo temporário ficam FORA do repositório (mktemp -d).
# Nada aqui roda em tempo de execução do app.
#
# Uso: scripts/geo/fetch-tiles.sh [AAAAMMDD]   (sem argumento: o build mais recente que existir)
set -euo pipefail

PMTILES_VERSION="1.31.2"
BBOX="-39.16,-5.09,-38.86,-4.85"   # min_lon,min_lat,max_lon,max_lat
MAXZOOM=15                          # o build do Protomaps vai até o zoom 15; acima disso o MapLibre amplia
ASSETS="https://protomaps.github.io/basemaps-assets"
UA="ecotech-prototype-geo-script"

raiz="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
saida="$raiz/public/map"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

# --- 1. binário pmtiles (fora do repositório) -------------------------------
curl -fsSL -A "$UA" \
  "https://github.com/protomaps/go-pmtiles/releases/download/v${PMTILES_VERSION}/go-pmtiles_${PMTILES_VERSION}_Linux_x86_64.tar.gz" \
  | tar -xz -C "$tmp" pmtiles

# --- 2. build mais recente ---------------------------------------------------
data="${1:-}"
if [ -z "$data" ]; then
  for i in 0 1 2 3 4 5 6 7 8 9 10; do
    d="$(date -d "-$i day" +%Y%m%d)"
    if curl -fsI -A "$UA" "https://build.protomaps.com/$d.pmtiles" >/dev/null 2>&1; then data="$d"; break; fi
  done
fi
[ -n "$data" ] || { echo "Nenhum build diário encontrado." >&2; exit 1; }
echo "Build do Protomaps: $data | bbox: $BBOX | zoom máximo: $MAXZOOM"

mkdir -p "$saida"
"$tmp/pmtiles" extract "https://build.protomaps.com/$data.pmtiles" "$tmp/quixada.pmtiles" \
  --bbox="$BBOX" --maxzoom="$MAXZOOM"
mv "$tmp/quixada.pmtiles" "$saida/quixada.pmtiles"
ls -l "$saida/quixada.pmtiles"

# --- 3. fontes (PBF) e sprites do estilo -------------------------------------
# Fontes que o @protomaps/basemaps usa por padrão. Só as faixas de caracteres do
# alfabeto latino e da pontuação geral (0-1023 e 7680-8959): bastam para o português.
fontes=("Noto Sans Regular" "Noto Sans Medium" "Noto Sans Italic")
faixas=(0-255 256-511 512-767 768-1023 7680-7935 7936-8191 8192-8447 8448-8703 8704-8959)
for fonte in "${fontes[@]}"; do
  mkdir -p "$saida/glyphs/$fonte"
  for faixa in "${faixas[@]}"; do
    curl -fsSL -A "$UA" -o "$saida/glyphs/$fonte/$faixa.pbf" \
      "$ASSETS/fonts/${fonte// /%20}/$faixa.pbf"
  done
done
curl -fsSL -A "$UA" -o "$saida/glyphs/OFL.txt" "$ASSETS/fonts/OFL.txt"

# Sprites v4 (tema claro, 1x e 2x). O MapLibre pede sprite.json e sprite.png (e @2x).
mkdir -p "$saida/sprites/v4"
for arq in light.json light.png "light@2x.json" "light@2x.png"; do
  curl -fsSL -A "$UA" -o "$saida/sprites/v4/$arq" "$ASSETS/sprites/v4/$arq"
done

du -sh "$saida" "$saida"/*
