import { layers, namedFlavor, type Flavor } from "@protomaps/basemaps";
import type { StyleSpecification } from "maplibre-gl";

// Estilo do mapa de Quixadá: o tema claro do Protomaps repintado com a paleta
// da marca (DESIGN.md). Os valores abaixo são o único lugar onde cores em hex
// aparecem fora de tokens, porque o estilo do mapa é um documento JSON do
// MapLibre e não lê variáveis CSS. Cada cor diz de qual token deriva.
const MENTA_SUPERFICIE = "#F3FAF6"; // mint-surface
const TERRA = "#EEF5F0"; // mint-surface um tom mais escuro
const VERDE_PARQUE = "#D5EDDD"; // entre mint-wash e primary-soft
const VERDE_PARQUE_FORTE = "#B9E4CB"; // primary-soft, dessaturado
const VERDE_MATA = "#C9E9D5";
const AGUA = "#CBE2F5"; // tech-blue bem claro
const PREDIOS = "#DFE9E3"; // border-soft
const VIA = "#FFFFFF"; // white
const VIA_CONTORNO = "#D3E2D9"; // border-soft mais escuro
const ROTULO = "#5B6B65"; // text-muted
const ROTULO_FORTE = "#202B28"; // graphite
const ROTULO_BAIRRO = "#126B4A"; // primary-strong

const FLAVOR_QUIXADA: Flavor = {
  ...namedFlavor("light"),
  background: MENTA_SUPERFICIE,
  earth: TERRA,
  park_a: VERDE_PARQUE,
  park_b: VERDE_PARQUE_FORTE,
  wood_a: VERDE_MATA,
  wood_b: VERDE_PARQUE_FORTE,
  scrub_a: "#E1F0E6",
  scrub_b: "#C6E8D3",
  hospital: "#E8EFEA",
  school: "#E8EFEA",
  industrial: "#E4EBE7",
  pedestrian: "#F7FBF9",
  water: AGUA,
  buildings: PREDIOS,
  minor_a: VIA,
  minor_b: VIA,
  minor_casing: VIA_CONTORNO,
  minor_service: "#F7FBF9",
  minor_service_casing: VIA_CONTORNO,
  other: "#F7FBF9",
  link: VIA,
  link_casing: VIA_CONTORNO,
  major: VIA,
  major_casing_early: VIA_CONTORNO,
  major_casing_late: VIA_CONTORNO,
  highway: VIA,
  highway_casing_early: VIA_CONTORNO,
  highway_casing_late: VIA_CONTORNO,
  roads_label_minor: ROTULO,
  roads_label_minor_halo: VIA,
  roads_label_major: ROTULO_FORTE,
  roads_label_major_halo: VIA,
  subplace_label: ROTULO_BAIRRO,
  subplace_label_halo: MENTA_SUPERFICIE,
  city_label: ROTULO_FORTE,
  city_label_halo: MENTA_SUPERFICIE,
  address_label: ROTULO,
  address_label_halo: VIA,
  landcover: {
    grassland: "#E6F4EA",
    barren: "#F3F1E8",
    urban_area: "#EBF2EE",
    farmland: "#E9F4E4",
    glacier: "#FFFFFF",
    scrub: "#E3F0E1",
    forest: "#CDEBD7",
  },
};

// Camadas que só poluem o mapa de coleta: pontos de interesse e brasões de rodovia.
const CAMADAS_OCULTAS = new Set(["pois", "roads_shields"]);

// Cores da linha da rota (também fora do estilo, nas camadas adicionadas pelo componente).
export const COR_ROTA = "#2478C8"; // tech-blue: a conexão entre as paradas
export const COR_ROTA_CONTORNO = "#FFFFFF"; // white

export const ATRIBUICAO =
  '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a> · <a href="https://protomaps.com" target="_blank" rel="noreferrer">Protomaps</a>';

// `origem` é a origem do site (window.location.origin): glyphs, ícones e tiles
// ficam em /map/, dentro do próprio projeto, e funcionam sem internet.
export function estiloQuixada(origem: string): StyleSpecification {
  return {
    version: 8,
    glyphs: `${origem}/map/glyphs/{fontstack}/{range}.pbf`,
    sprite: `${origem}/map/sprites/v4/light`,
    sources: {
      protomaps: {
        type: "vector",
        url: `pmtiles://${origem}/map/quixada.pmtiles`,
        attribution: ATRIBUICAO,
        maxzoom: 15,
      },
    },
    layers: layers("protomaps", FLAVOR_QUIXADA, { lang: "pt" }).filter(
      (camada) => !CAMADAS_OCULTAS.has(camada.id),
    ),
  };
}
