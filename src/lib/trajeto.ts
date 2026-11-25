import { distanciaM } from "./route.ts";
import type { Ponto, Rotas } from "./types";

// A pé, em metros por segundo (≈ 5 km/h), para trechos sem rota guardada.
const METROS_POR_SEGUNDO = 1.4;

// Chave estável de um ponto: 5 casas decimais (≈ 1 m).
export function chavePonto(p: Ponto): string {
  return `${p.lng.toFixed(5)},${p.lat.toFixed(5)}`;
}

export type Trajeto = {
  coords: [number, number][];
  distanciaM: number;
  segundos: number;
  // false quando algum trecho não tinha rota guardada e virou linha reta.
  exato: boolean;
};

// Concatena os trechos de rota guardados entre pontos consecutivos. Um trecho
// ausente (ponto desconhecido ou par sem rota) vira linha reta estimada.
export function trajeto(pontos: Ponto[], rotas: Rotas): Trajeto {
  if (pontos.length === 0) {
    return { coords: [], distanciaM: 0, segundos: 0, exato: true };
  }
  const idPorChave = new Map(
    Object.entries(rotas.pontos).map(([id, p]) => [chavePonto(p), id]),
  );
  const coords: [number, number][] = [[pontos[0].lng, pontos[0].lat]];
  let metros = 0;
  let segundos = 0;
  let exato = true;

  for (let i = 1; i < pontos.length; i++) {
    const a = pontos[i - 1];
    const b = pontos[i];
    const idA = idPorChave.get(chavePonto(a));
    const idB = idPorChave.get(chavePonto(b));
    const trecho = idA && idB ? rotas.trechos[`${idA}>${idB}`] : undefined;
    if (trecho) {
      metros += trecho.d;
      segundos += trecho.s;
      // O primeiro vértice do trecho é o fim do anterior: não se repete.
      coords.push(...trecho.g.slice(1));
    } else {
      const reta = distanciaM(a, b);
      metros += reta;
      segundos += reta / METROS_POR_SEGUNDO;
      exato = false;
      coords.push([b.lng, b.lat]);
    }
  }
  return { coords, distanciaM: metros, segundos, exato };
}

// Tempo de manuseio em cada parada, em minutos (valor de exemplo).
const MINUTOS_POR_PARADA = 4;

// Minutos de uma rota: o tempo a pé do trajeto mais o manuseio de cada parada.
export function minutosDoTrajeto(segundos: number, paradas: number): number {
  return Math.round(segundos / 60 + MINUTOS_POR_PARADA * paradas);
}
