import type { Ponto } from "./types";

const RAIO_TERRA_M = 6371000;
const paraRad = (graus: number) => (graus * Math.PI) / 180;

// Distância em linha reta sobre a esfera (haversine), em metros.
export function distanciaM(a: Ponto, b: Ponto): number {
  const dLat = paraRad(b.lat - a.lat);
  const dLng = paraRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(paraRad(a.lat)) * Math.cos(paraRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * RAIO_TERRA_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Ordem das paradas por vizinho mais próximo a partir da origem. A distância e
// o tempo de verdade vêm de `trajeto` (rota pelas ruas); aqui só se decide a ordem.
export function ordenarRota(
  origem: Ponto,
  paradas: { id: string; ponto: Ponto }[],
): { ordem: string[]; distanciaM: number } {
  const restantes = [...paradas];
  const ordem: string[] = [];
  let atual = origem;
  let total = 0;

  while (restantes.length > 0) {
    let melhor = 0;
    let melhorDist = distanciaM(atual, restantes[0].ponto);
    for (let i = 1; i < restantes.length; i++) {
      const d = distanciaM(atual, restantes[i].ponto);
      // Estritamente menor: empate fica com o menor índice de entrada.
      if (d < melhorDist) {
        melhor = i;
        melhorDist = d;
      }
    }
    const [escolhida] = restantes.splice(melhor, 1);
    ordem.push(escolhida.id);
    total += melhorDist;
    atual = escolhida.ponto;
  }

  return { ordem, distanciaM: total };
}
