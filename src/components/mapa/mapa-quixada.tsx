"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import type {
  GeoJSONSource,
  LngLatBoundsLike,
  Map as MapaMapLibre,
  Marker,
} from "maplibre-gl";
import { ROTAS } from "@/data/rotas";
import { ateFracao, easeSuave, pontoNaFracao, type Coord } from "@/lib/percurso";
import { trajeto } from "@/lib/trajeto";
import type { Pedido, Ponto } from "@/lib/types";
import { atualizarPino, criarMarcadorCatador, criarPino } from "./marcadores";
import { COR_ROTA, COR_ROTA_CONTORNO, estiloQuixada } from "./estilo-quixada";

// Mapa real de Quixadá (MapLibre + tiles do OpenStreetMap hospedados em /map/),
// que funciona sem internet. É reforço visual: a lista da tela continua sendo o
// caminho principal. Os pinos refletem `selecionados` e, com `onSelecionar`,
// viram botões. Com `rota`, a linha pelas ruas se desenha e as paradas são
// numeradas; com `posicaoCatador`, o marcador do catador percorre o trecho.

type Props = {
  pedidos: Pedido[];
  selecionados?: string[];
  // `passando`: pontos por onde a rota passa antes das paradas de `ordem`,
  // sem mostrar pino (por exemplo, paradas de outras pessoas).
  rota?: { origem: Ponto; ordem: string[]; passando?: Ponto[] };
  posicaoCatador?: Ponto;
  // Mapa da cidade: o pino mostra a situação do pedido (só leitura).
  porStatus?: boolean;
  onSelecionar?: (id: string) => void;
  rotulo: string;
  altura?: "baixa" | "media" | "alta" | "cheia";
};

type Biblioteca = typeof import("maplibre-gl");

const CENTRO: [number, number] = [-39.0125, -4.968];
// Retângulo dos tiles hospedados (scripts/geo/README.md).
const LIMITES: LngLatBoundsLike = [
  [-39.16, -5.09],
  [-38.86, -4.85],
];
// "cheia": mapa de borda a borda do app do catador (sem moldura), ~44% da altura da tela.
const ALTURAS = {
  baixa: "h-56",
  media: "h-72 sm:h-80",
  alta: "h-96",
  cheia: "h-[44vh] min-h-64 max-h-[26rem]",
} as const;

const TEXTOS_PT = {
  "NavigationControl.ZoomIn": "Aproximar o mapa",
  "NavigationControl.ZoomOut": "Afastar o mapa",
  "NavigationControl.ResetBearing": "Apontar o mapa para o norte",
  "AttributionControl.ToggleAttribution": "Mostrar créditos do mapa",
  "AttributionControl.MapFeedback": "Sugerir melhoria no mapa",
  "CooperativeGesturesHandler.WindowsHelpText": "Use Ctrl + rolagem para aproximar o mapa",
  "CooperativeGesturesHandler.MacHelpText": "Use ⌘ + rolagem para aproximar o mapa",
  "CooperativeGesturesHandler.MobileHelpText": "Use dois dedos para mover o mapa",
};

const ROTULO_STATUS = {
  aguardando: "aguardando coleta",
  aceito: "aceito por um catador",
  coletado: "coletado",
  cancelado: "cancelado",
} as const;

const reduzirMovimento = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Registra uma vez por página: o protocolo pmtiles:// (tiles do arquivo local) e
// o worker do MapLibre, servido de /map/ (copiado por scripts/sync-maplibre-worker.mjs).
let preparado = false;
async function prepararBiblioteca(ml: Biblioteca) {
  if (preparado) return;
  const { Protocol } = await import("pmtiles");
  ml.addProtocol("pmtiles", new Protocol().tile);
  ml.setWorkerUrl(`${window.location.origin}/map/maplibre-gl-worker.mjs`);
  preparado = true;
}

const FONTE_ROTA = "rota";
const LINHA_COM_CONTORNO = "rota-contorno";
const LINHA_ROTA = "rota-linha";

function geojson(coords: Coord[]) {
  return {
    type: "Feature" as const,
    properties: {},
    geometry: { type: "LineString" as const, coordinates: coords },
  };
}

type PinoRegistrado = { marker: Marker; el: HTMLElement; chave: string };

export function MapaQuixada({
  pedidos,
  selecionados = [],
  rota,
  posicaoCatador,
  porStatus = false,
  onSelecionar,
  rotulo,
  altura = "media",
}: Props) {
  const container = useRef<HTMLDivElement>(null);
  const [mapa, setMapa] = useState<MapaMapLibre | null>(null);
  const [lib, setLib] = useState<Biblioteca | null>(null);
  const [falhou, setFalhou] = useState(false);

  const aoSelecionar = useRef(onSelecionar);
  const pinos = useRef(new Map<string, PinoRegistrado>());
  const origemMarker = useRef<Marker | null>(null);
  const catadorMarker = useRef<{ marker: Marker; em: Ponto } | null>(null);
  const animacaoRota = useRef<number | null>(null);
  const animacaoCatador = useRef<number | null>(null);
  const chaveRota = useRef<string | null>(null);
  const chaveEnquadramento = useRef<string | null>(null);

  useEffect(() => {
    aoSelecionar.current = onSelecionar;
  }, [onSelecionar]);

  // Cria e destrói o mapa. Com cacheComponents a tela escondida fica montada e
  // só os efeitos são desfeitos: este cleanup libera o WebGL, os marcadores e as
  // animações, e a volta recria tudo do zero (sem vazamento).
  useEffect(() => {
    let cancelado = false;
    let instancia: MapaMapLibre | null = null;
    const pinosAtuais = pinos.current;

    (async () => {
      try {
        const ml = await import("maplibre-gl");
        await prepararBiblioteca(ml);
        if (cancelado || !container.current) return;
        const novo = new ml.Map({
          container: container.current,
          style: estiloQuixada(window.location.origin),
          center: CENTRO,
          zoom: 13,
          minZoom: 11,
          maxZoom: 18,
          maxBounds: LIMITES,
          attributionControl: { compact: true },
          cooperativeGestures: true,
          locale: TEXTOS_PT,
          pitchWithRotate: false,
          dragRotate: false,
        });
        instancia = novo;
        novo.addControl(new ml.NavigationControl({ showCompass: false }), "top-right");
        let pronto = false;
        novo.on("load", () => {
          if (cancelado) return;
          pronto = true;
          setLib(ml);
          setMapa(novo);
        });
        // Falha antes de o mapa ficar pronto (estilo, tiles ou WebGL): avisa e
        // deixa a lista cuidar do resto.
        novo.on("error", () => {
          if (!cancelado && !pronto) setFalhou(true);
        });
      } catch {
        if (!cancelado) setFalhou(true);
      }
    })();

    return () => {
      cancelado = true;
      if (animacaoRota.current !== null) cancelAnimationFrame(animacaoRota.current);
      if (animacaoCatador.current !== null) cancelAnimationFrame(animacaoCatador.current);
      animacaoRota.current = null;
      animacaoCatador.current = null;
      pinosAtuais.clear();
      origemMarker.current = null;
      catadorMarker.current = null;
      chaveRota.current = null;
      chaveEnquadramento.current = null;
      instancia?.remove();
      setMapa(null);
      setLib(null);
      setFalhou(false);
    };
  }, []);

  // Pinos dos pedidos: criados, atualizados (seleção, número da parada) e
  // removidos conforme as props mudam.
  useEffect(() => {
    if (!mapa || !lib) return;
    const interativo = Boolean(onSelecionar);
    const ordem = rota?.ordem ?? [];
    const visiveis = new Set(pedidos.map((p) => p.id));

    for (const [id, pino] of pinos.current) {
      if (!visiveis.has(id)) {
        pino.marker.remove();
        pinos.current.delete(id);
      }
    }
    // Pedidos no mesmo endereço ganham um pequeno deslocamento em diagonal.
    const vistos = new Map<string, number>();
    pedidos.forEach((pedido, indice) => {
      const chave = `${pedido.ponto.lng.toFixed(5)},${pedido.ponto.lat.toFixed(5)}`;
      const n = vistos.get(chave) ?? 0;
      vistos.set(chave, n + 1);
      let pino = pinos.current.get(pedido.id);
      if (!pino || pino.chave !== `${chave}|${interativo}`) {
        pino?.marker.remove();
        const el = criarPino(
          `Pedido em ${pedido.endereco}, ${pedido.bairro}`,
          indice,
          interativo ? () => aoSelecionar.current?.(pedido.id) : null,
        );
        const marker = new lib.Marker({ element: el, anchor: "center" })
          .setLngLat([pedido.ponto.lng, pedido.ponto.lat])
          .addTo(mapa);
        pino = { marker, el, chave: `${chave}|${interativo}` };
        pinos.current.set(pedido.id, pino);
      }
      pino.marker.setOffset([n * 12, -n * 12]);
      const posicao = ordem.indexOf(pedido.id);
      if (porStatus) {
        pino.el.setAttribute(
          "aria-label",
          `Pedido em ${pedido.endereco}, ${pedido.bairro}: ${ROTULO_STATUS[pedido.status]}`,
        );
      }
      atualizarPino(
        pino.el,
        {
          selecionado: selecionados.includes(pedido.id),
          numero: posicao >= 0 ? posicao + 1 : undefined,
          status: porStatus && pedido.status !== "cancelado" ? pedido.status : undefined,
        },
        interativo,
      );
    });
  }, [mapa, lib, pedidos, selecionados, rota, onSelecionar, porStatus]);

  // Linha da rota pelas ruas: se desenha do começo ao fim quando a rota muda.
  useEffect(() => {
    if (!mapa || !lib) return;
    if (!mapa.getSource(FONTE_ROTA)) {
      mapa.addSource(FONTE_ROTA, { type: "geojson", data: geojson([]) });
      mapa.addLayer({
        id: LINHA_COM_CONTORNO,
        type: "line",
        source: FONTE_ROTA,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": COR_ROTA_CONTORNO, "line-width": 9, "line-opacity": 0.95 },
      });
      mapa.addLayer({
        id: LINHA_ROTA,
        type: "line",
        source: FONTE_ROTA,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": COR_ROTA, "line-width": 5 },
      });
    }
    const fonte = mapa.getSource(FONTE_ROTA) as GeoJSONSource;
    const alvos = rota
      ? [
          ...(rota.passando ?? []),
          ...rota.ordem.flatMap((id) => pedidos.find((p) => p.id === id)?.ponto ?? []),
        ]
      : [];
    const chave = rota
      ? `${rota.origem.lng},${rota.origem.lat}|${rota.ordem.join(",")}|${(rota.passando ?? [])
          .map((p) => `${p.lng},${p.lat}`)
          .join(";")}`
      : null;
    if (chave === chaveRota.current) return;
    chaveRota.current = chave;
    if (animacaoRota.current !== null) cancelAnimationFrame(animacaoRota.current);
    animacaoRota.current = null;

    if (!rota || alvos.length === 0) {
      fonte.setData(geojson([]));
      return;
    }
    const { coords } = trajeto([rota.origem, ...alvos], ROTAS);
    if (reduzirMovimento() || coords.length < 2) {
      fonte.setData(geojson(coords));
      return;
    }
    // Até 1,8 s no total, proporcional ao tamanho da rota.
    const duracao = Math.min(1800, 500 + coords.length * 12);
    const inicio = performance.now();
    const quadro = (agora: number) => {
      const t = Math.min(1, (agora - inicio) / duracao);
      fonte.setData(geojson(ateFracao(coords, easeSuave(t))));
      animacaoRota.current = t < 1 ? requestAnimationFrame(quadro) : null;
    };
    animacaoRota.current = requestAnimationFrame(quadro);
  }, [mapa, lib, pedidos, rota]);

  // Origem da rota (só quando não há marcador do catador para ocupar o lugar).
  useEffect(() => {
    if (!mapa || !lib) return;
    origemMarker.current?.remove();
    origemMarker.current = null;
    if (!rota || posicaoCatador) return;
    origemMarker.current = new lib.Marker({
      element: criarMarcadorCatador("origem", "Ponto de partida da rota"),
      anchor: "center",
    })
      .setLngLat([rota.origem.lng, rota.origem.lat])
      .addTo(mapa);
  }, [mapa, lib, rota, posicaoCatador]);

  // Marcador do catador: aparece onde está e desliza pelas ruas quando muda.
  useEffect(() => {
    if (!mapa || !lib) return;
    if (!posicaoCatador) {
      catadorMarker.current?.marker.remove();
      catadorMarker.current = null;
      return;
    }
    const atual = catadorMarker.current;
    if (!atual) {
      const marker = new lib.Marker({
        element: criarMarcadorCatador("catador", "Posição do catador"),
        anchor: "center",
      })
        .setLngLat([posicaoCatador.lng, posicaoCatador.lat])
        .addTo(mapa);
      catadorMarker.current = { marker, em: posicaoCatador };
      return;
    }
    if (atual.em.lng === posicaoCatador.lng && atual.em.lat === posicaoCatador.lat) return;
    if (animacaoCatador.current !== null) cancelAnimationFrame(animacaoCatador.current);
    const { coords, distanciaM } = trajeto([atual.em, posicaoCatador], ROTAS);
    atual.em = posicaoCatador;
    if (reduzirMovimento() || coords.length < 2) {
      atual.marker.setLngLat([posicaoCatador.lng, posicaoCatador.lat]);
      return;
    }
    // Entre 0,8 s e 2,2 s, proporcional à distância.
    const duracao = Math.min(2200, Math.max(800, distanciaM * 1.6));
    const inicio = performance.now();
    const quadro = (agora: number) => {
      const t = Math.min(1, (agora - inicio) / duracao);
      atual.marker.setLngLat(pontoNaFracao(coords, easeSuave(t)));
      animacaoCatador.current = t < 1 ? requestAnimationFrame(quadro) : null;
    };
    animacaoCatador.current = requestAnimationFrame(quadro);
  }, [mapa, lib, posicaoCatador]);

  // Enquadramento: só quando muda o conjunto de pontos (não a cada seleção).
  useEffect(() => {
    if (!mapa || !lib) return;
    const chave = `${pedidos.map((p) => p.id).join(",")}|${rota?.ordem.join(",") ?? ""}`;
    if (chave === chaveEnquadramento.current) return;
    chaveEnquadramento.current = chave;
    const pontos: Ponto[] = [
      ...pedidos.map((p) => p.ponto),
      ...(rota ? [rota.origem] : []),
      ...(posicaoCatador ? [posicaoCatador] : []),
    ];
    if (pontos.length === 0) {
      mapa.jumpTo({ center: CENTRO, zoom: 13 });
      return;
    }
    const limites = new lib.LngLatBounds();
    for (const p of pontos) limites.extend([p.lng, p.lat]);
    mapa.fitBounds(limites, {
      padding: { top: 56, bottom: 48, left: 44, right: 56 },
      maxZoom: 16,
      duration: reduzirMovimento() ? 0 : 700,
    });
  }, [mapa, lib, pedidos, rota, posicaoCatador]);

  return (
    <div
      className={`relative w-full overflow-hidden bg-mint-wash ${
        altura === "cheia" ? "" : "rounded-lg border border-border-soft"
      } ${ALTURAS[altura]}`}
    >
      <div ref={container} role="region" aria-label={rotulo} className="h-full w-full" />
      {!mapa && !falhou && (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex animate-pulse items-center justify-center bg-mint-wash text-sm text-text-muted motion-reduce:animate-none"
        >
          Carregando o mapa de Quixadá
        </div>
      )}
      {falhou && (
        <p
          role="status"
          className="absolute inset-0 flex items-center justify-center bg-mint-wash p-4 text-center text-sm text-graphite"
        >
          O mapa não pôde ser carregado. A lista abaixo traz as mesmas informações.
        </p>
      )}
    </div>
  );
}
