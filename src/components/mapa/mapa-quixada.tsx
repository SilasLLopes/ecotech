"use client";

import { MAPA } from "@/data/seed";
import type { Pedido, Ponto } from "@/lib/types";

// Mapa esquemático de Quixadá (dados de exemplo). A seleção acontece na lista:
// o pino reflete `selecionados` e dispara `onSelecionar`. Todas as medidas do
// SVG estão em unidades do viewBox (400 x 300). Com o SVG a ~328px de largura
// a escala é ~0,82, então textos de 13 unidades ficam com ~10,7px.

type MapaQuixadaProps = {
  pedidos: Pedido[];
  selecionados?: string[];
  rota?: { origem: Ponto; ordem: string[] };
  onSelecionar?: (id: string) => void;
  rotulo: string;
};

const RAIO_PINO = 13;
const RAIO_PINO_SELECIONADO = 17;
// Distância mínima entre centros de pinos (em unidades do viewBox).
const DISTANCIA_MINIMA = 30;

type PinoPosicionado = { pedido: Pedido; x: number; y: number };

function hexagono(raio: number): string {
  const l = raio * 0.866;
  const m = raio / 2;
  return `0,${-raio} ${l},${-m} ${l},${m} 0,${raio} ${-l},${m} ${-l},${-m}`;
}

// Afasta pinos que ficariam sobrepostos (inclusive pedidos no mesmo ponto):
// o primeiro fica no ponto real e os seguintes procuram o lugar livre mais
// próximo, primeiro na horizontal e depois acima/abaixo. É um mapa esquemático.
function posicionar(pedidos: Pedido[]): PinoPosicionado[] {
  const colocados: PinoPosicionado[] = [];
  const passos = [0, 1, -1, 2, -2, 3, -3];
  for (const pedido of pedidos) {
    let escolhido: Ponto | null = null;
    procura: for (const linha of [0, 1, -1]) {
      for (const coluna of passos) {
        const x = Math.min(
          MAPA.largura - RAIO_PINO_SELECIONADO,
          Math.max(RAIO_PINO_SELECIONADO, pedido.ponto.x + coluna * DISTANCIA_MINIMA),
        );
        const y = pedido.ponto.y + linha * DISTANCIA_MINIMA;
        const livre = colocados.every(
          (c) => Math.hypot(c.x - x, c.y - y) >= DISTANCIA_MINIMA,
        );
        if (livre) {
          escolhido = { x, y };
          break procura;
        }
      }
    }
    colocados.push({ pedido, ...(escolhido ?? pedido.ponto) });
  }
  return colocados;
}

// Quebra nomes longos em duas linhas, no espaço mais próximo do meio.
function linhasDoRotulo(nome: string): string[] {
  if (nome.length <= 12 || !nome.includes(" ")) return [nome];
  const meio = nome.length / 2;
  let melhor = -1;
  for (let i = 0; i < nome.length; i++) {
    if (nome[i] === " " && (melhor < 0 || Math.abs(i - meio) < Math.abs(melhor - meio))) {
      melhor = i;
    }
  }
  return [nome.slice(0, melhor), nome.slice(melhor + 1)];
}

function nomeDoPino(pedido: Pedido, selecionado: boolean, parada?: number): string {
  const partes = [`Pedido em ${pedido.endereco}, ${pedido.bairro}`];
  if (parada) partes.push(`parada ${parada} da rota`);
  partes.push(selecionado ? "selecionado" : "não selecionado");
  return partes.join(", ");
}

export function MapaQuixada({
  pedidos,
  selecionados = [],
  rota,
  onSelecionar,
  rotulo,
}: MapaQuixadaProps) {
  const pinos = posicionar(pedidos);
  const porId = new Map(pinos.map((p) => [p.pedido.id, p]));

  const paradas: PinoPosicionado[] = [];
  if (rota) {
    for (const id of rota.ordem) {
      const pino = porId.get(id);
      if (pino) paradas.push(pino);
    }
  }
  const numeroDaParada = new Map(paradas.map((p, i) => [p.pedido.id, i + 1]));
  const trajeto = rota
    ? [rota.origem, ...paradas].map((p) => `${p.x},${p.y}`).join(" ")
    : "";

  return (
    <figure className="m-0">
      <div className="relative">
        <svg
          viewBox={`0 0 ${MAPA.largura} ${MAPA.altura}`}
          role="img"
          aria-label={rotulo}
          className="block h-auto w-full rounded-lg bg-mint-surface font-sans"
        >
          <title>{rotulo}</title>

          {MAPA.bairros.map((bairro) => (
            <polygon
              key={bairro.id}
              points={bairro.poligono}
              strokeWidth={1.5}
              strokeLinejoin="round"
              className="fill-mint-wash stroke-border-soft"
            />
          ))}

          {rota ? (
            <>
              <polyline
                points={trajeto}
                fill="none"
                strokeWidth={6}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="stroke-white"
              />
              <polyline
                points={trajeto}
                fill="none"
                strokeWidth={2.5}
                strokeDasharray="7 5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="stroke-tech-blue"
              />
            </>
          ) : null}

          {MAPA.bairros.map((bairro) => {
            const linhas = linhasDoRotulo(bairro.nome);
            return (
              <text
                key={bairro.id}
                x={bairro.rotulo.x}
                y={bairro.rotulo.y}
                textAnchor="middle"
                fontSize={13}
                fontWeight={600}
                strokeWidth={4}
                strokeLinejoin="round"
                className="fill-graphite stroke-mint-wash [paint-order:stroke]"
              >
                {linhas.map((linha, n) => (
                  <tspan
                    key={linha}
                    x={bairro.rotulo.x}
                    dy={n === 0 ? -(linhas.length - 1) * 15 : 15}
                  >
                    {linha}
                  </tspan>
                ))}
              </text>
            );
          })}

          {pinos.map(({ pedido, x, y }) => {
            const selecionado = selecionados.includes(pedido.id);
            const raio = selecionado ? RAIO_PINO_SELECIONADO : RAIO_PINO;
            const parada = numeroDaParada.get(pedido.id);
            return (
              <g key={pedido.id} transform={`translate(${x} ${y})`}>
                <polygon
                  points={hexagono(raio)}
                  strokeLinejoin="round"
                  strokeWidth={selecionado ? 3 : 1.5}
                  className={
                    selecionado
                      ? "fill-primary-strong stroke-white [filter:drop-shadow(0_5px_5px_color-mix(in_srgb,var(--color-primary-strong)_40%,transparent))]"
                      : "fill-primary-strong stroke-primary-strong"
                  }
                />
                <g
                  transform={`scale(${selecionado ? 0.72 : 0.56}) translate(-12 -12)`}
                  fill="none"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="stroke-white"
                >
                  {selecionado ? (
                    <path d="m5 12.5 4.5 4.5L19 7.5" />
                  ) : (
                    <>
                      <path d="M5 19c0-9 5-14 14-14 0 9-5 14-14 14Z" />
                      <path d="M5 19c3-4 6-7 10-9" />
                    </>
                  )}
                </g>
                {parada ? (
                  <g transform={`translate(${raio - 2} ${-raio + 2})`}>
                    <circle r={9} strokeWidth={1.5} className="fill-tech-blue stroke-white" />
                    <text
                      textAnchor="middle"
                      dy={4.5}
                      fontSize={12.5}
                      fontWeight={700}
                      className="fill-white"
                    >
                      {parada}
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}

          {rota ? (
            <g transform={`translate(${rota.origem.x} ${rota.origem.y})`}>
              <circle r={12} strokeWidth={2} className="fill-tech-blue stroke-white" />
              <g
                transform="scale(0.55) translate(-12 -12)"
                fill="none"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="stroke-white"
              >
                <path d="M4 11 12 4l8 7" />
                <path d="M6 10v9h12v-9" />
              </g>
              <text
                y={28}
                textAnchor="middle"
                fontSize={13}
                fontWeight={600}
                strokeWidth={4}
                strokeLinejoin="round"
                className="fill-tech-blue stroke-white [paint-order:stroke]"
              >
                Origem
              </text>
            </g>
          ) : null}
        </svg>

        {onSelecionar
          ? pinos.map(({ pedido, x, y }) => {
              const selecionado = selecionados.includes(pedido.id);
              return (
                <button
                  key={pedido.id}
                  type="button"
                  onClick={() => onSelecionar(pedido.id)}
                  aria-label={nomeDoPino(pedido, selecionado, numeroDaParada.get(pedido.id))}
                  style={{
                    left: `${(x / MAPA.largura) * 100}%`,
                    top: `${(y / MAPA.altura) * 100}%`,
                  }}
                  className="absolute size-11 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-transparent outline-offset-0 focus-visible:outline-3 focus-visible:outline-tech-blue"
                />
              );
            })
          : null}
      </div>
      <figcaption className="mt-2 text-sm text-text-muted">
        Mapa esquemático, não representa o trajeto real
      </figcaption>
    </figure>
  );
}
