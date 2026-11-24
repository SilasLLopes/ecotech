import type { Ponto } from "./types";

// 1 unidade do mapa = 10 m (valor de exemplo do mapa ilustrativo).
const METROS_POR_UNIDADE = 10;
// Valores de exemplo: carrinho a 60 m/min e 4 min por parada.
const METROS_POR_MINUTO = 60;
const MINUTOS_POR_PARADA = 4;

export function distanciaM(a: Ponto, b: Ponto): number {
  return Math.hypot(a.x - b.x, a.y - b.y) * METROS_POR_UNIDADE;
}

export function ordenarRota(
  origem: Ponto,
  paradas: { id: string; ponto: Ponto }[],
): { ordem: string[]; distanciaM: number; minutos: number } {
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

  const minutos = Math.round(
    total / METROS_POR_MINUTO + MINUTOS_POR_PARADA * paradas.length,
  );
  return { ordem, distanciaM: total, minutos };
}
