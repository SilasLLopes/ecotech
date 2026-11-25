import { distanciaM } from "./route.ts";

export type Coord = [number, number]; // [lng, lat]

const dist = (a: Coord, b: Coord) => distanciaM({ lng: a[0], lat: a[1] }, { lng: b[0], lat: b[1] });

// Curva de entrada e saída suaves (0 → 1), para animar percursos.
export function easeSuave(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

// Ponto `fracao` (0 a 1) do comprimento da linha, e o índice do trecho onde cai.
function localizar(coords: Coord[], fracao: number): { indice: number; ponto: Coord } {
  const f = Math.min(1, Math.max(0, fracao));
  if (coords.length < 2) return { indice: 0, ponto: coords[0] ?? [0, 0] };
  const trechos = coords.slice(1).map((c, i) => dist(coords[i], c));
  const total = trechos.reduce((s, d) => s + d, 0);
  if (total === 0 || f >= 1) return { indice: coords.length - 1, ponto: coords[coords.length - 1] };
  let alvo = f * total;
  for (let i = 0; i < trechos.length; i++) {
    if (alvo <= trechos[i]) {
      const t = trechos[i] === 0 ? 0 : alvo / trechos[i];
      const a = coords[i];
      const b = coords[i + 1];
      return { indice: i, ponto: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t] };
    }
    alvo -= trechos[i];
  }
  return { indice: coords.length - 1, ponto: coords[coords.length - 1] };
}

export function pontoNaFracao(coords: Coord[], fracao: number): Coord {
  return localizar(coords, fracao).ponto;
}

// Começo da linha até `fracao` do comprimento, com o ponto exato no fim.
// Sempre devolve uma cópia.
export function ateFracao(coords: Coord[], fracao: number): Coord[] {
  if (coords.length === 0) return [];
  if (coords.length === 1) return [[...coords[0]]];
  if (fracao >= 1) return coords.map((c) => [...c] as Coord);
  const { indice, ponto } = localizar(coords, fracao);
  const inicio = coords.slice(0, indice + 1).map((c) => [...c] as Coord);
  const ultimo = inicio[inicio.length - 1];
  if (ultimo[0] === ponto[0] && ultimo[1] === ponto[1]) return inicio;
  return [...inicio, ponto];
}
