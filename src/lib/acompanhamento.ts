import { ordenarRota } from "./route.ts";
import { minutosDoTrajeto, trajeto } from "./trajeto.ts";
import type { Catador, Estado, Ponto, Rotas } from "./types";

export type Acompanhamento = {
  catador: Catador;
  // Paradas do catador antes desta, na ordem da rota dele.
  antes: number;
  // Pontos dessas paradas anteriores (a rota passa por eles; o app não mostra
  // o endereço de outras pessoas).
  passando: Ponto[];
  minutos: number;
  distanciaM: number;
  // false quando algum trecho da rota é linha reta estimada.
  exato: boolean;
};

// Previsão de chegada do catador a um pedido aceito: a rota dele (vizinho mais
// próximo a partir da posição atual) até esta parada.
export function acompanhar(
  estado: Estado,
  pedidoId: string,
  rotas: Rotas,
): Acompanhamento | null {
  const pedido = estado.pedidos.find((p) => p.id === pedidoId);
  if (!pedido || pedido.status !== "aceito" || !pedido.catadorId) return null;
  const catador = estado.catadores.find((c) => c.id === pedido.catadorId);
  if (!catador) return null;

  const aceitos = estado.pedidos.filter(
    (p) => p.status === "aceito" && p.catadorId === catador.id,
  );
  const { ordem } = ordenarRota(
    catador.posicao,
    aceitos.map((p) => ({ id: p.id, ponto: p.ponto })),
  );
  const indice = ordem.indexOf(pedido.id);
  const ate = ordem
    .slice(0, indice + 1)
    .flatMap((id) => aceitos.find((p) => p.id === id)?.ponto ?? []);
  const percurso = trajeto([catador.posicao, ...ate], rotas);
  return {
    catador,
    antes: indice,
    passando: ate.slice(0, indice),
    minutos: minutosDoTrajeto(percurso.segundos, indice + 1),
    distanciaM: percurso.distanciaM,
    exato: percurso.exato,
  };
}
