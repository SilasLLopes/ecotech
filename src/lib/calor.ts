import { distanciaM } from "./route.ts";
import type { Catador, Estado, MaterialId, Ponto, StatusPedido } from "./types";

// Uma doação de material para reciclagem: de um pedido do app ou do histórico de
// exemplo (src/data/historico.json). É a unidade do mapa de calor.
export type Doacao = {
  lng: number;
  lat: number;
  bairro: string;
  materialId: MaterialId;
  quantidade: number;
  tipo: "cidadao" | "comerciante";
};
export type DoacaoComStatus = Doacao & { status: StatusPedido };

export type FiltroCalor = { materialId: MaterialId | "todos"; soColetados: boolean };
export type PontoCalor = { lng: number; lat: number; peso: number };
export type Celula = PontoCalor & { doacoes: number };

// Cada item de cada pedido não cancelado vira uma doação (o tipo vem de quem pediu).
export function doacoesDoEstado(estado: Estado): DoacaoComStatus[] {
  const tipos = new Map(estado.solicitantes.map((s) => [s.id, s.tipo]));
  return estado.pedidos
    .filter((p) => p.status !== "cancelado")
    .flatMap((p) =>
      p.itens.map((i) => ({
        lng: p.ponto.lng,
        lat: p.ponto.lat,
        bairro: p.bairro,
        materialId: i.materialId,
        quantidade: i.quantidade,
        tipo: tipos.get(p.solicitanteId) ?? "cidadao",
        status: p.status,
      })),
    );
}

// Peso de cada ponto no calor. "todos": uma unidade por doação (materiais têm
// unidades diferentes e não se somam). Um material: a quantidade dele.
export function pontosDeCalor(doacoes: DoacaoComStatus[], filtro: FiltroCalor): PontoCalor[] {
  return doacoes
    .filter((x) => (filtro.soColetados ? x.status === "coletado" : true))
    .filter((x) => filtro.materialId === "todos" || x.materialId === filtro.materialId)
    .map((x) => ({
      lng: x.lng,
      lat: x.lat,
      peso: filtro.materialId === "todos" ? 1 : x.quantidade,
    }));
}

const M_POR_GRAU = 111320;

// Agrupa em quadras de `tamanhoM` metros; o centro de cada uma é o centroide
// ponderado. Do mais quente para o mais frio.
export function celulasQuentes(pontos: PontoCalor[], tamanhoM = 250): Celula[] {
  const celulas = new Map<string, { soma: number; lng: number; lat: number; n: number }>();
  for (const p of pontos) {
    const passoLat = tamanhoM / M_POR_GRAU;
    const passoLng = tamanhoM / (M_POR_GRAU * Math.cos((p.lat * Math.PI) / 180));
    const chave = `${Math.floor(p.lat / passoLat)}:${Math.floor(p.lng / passoLng)}`;
    const c = celulas.get(chave) ?? { soma: 0, lng: 0, lat: 0, n: 0 };
    c.soma += p.peso;
    c.lng += p.lng * p.peso;
    c.lat += p.lat * p.peso;
    c.n += 1;
    celulas.set(chave, c);
  }
  return [...celulas.values()]
    .map((c) => ({ lng: c.lng / c.soma, lat: c.lat / c.soma, peso: c.soma, doacoes: c.n }))
    .sort((a, b) => b.peso - a.peso);
}

// A rua e o bairro de referência mais perto de um ponto (para dar nome ao local).
export function localMaisProximo(
  p: Ponto,
  referencias: { rua: string; bairro: string; lng: number; lat: number }[],
): { rua: string; bairro: string; distanciaM: number } {
  let melhor = { rua: "", bairro: "", distanciaM: Infinity };
  for (const r of referencias) {
    const m = distanciaM(p, r);
    if (m < melhor.distanciaM) melhor = { rua: r.rua, bairro: r.bairro, distanciaM: m };
  }
  return melhor;
}

// Distância ao catador mais perto (Infinity sem catadores).
export function distanciaAoCatador(p: Ponto, catadores: Catador[]): number {
  return catadores.reduce((menor, c) => Math.min(menor, distanciaM(p, c.posicao)), Infinity);
}

export type FatiaMaterial = { materialId: MaterialId; doacoes: number; quantidade: number };

export function misturaDeMateriais(doacoes: DoacaoComStatus[], soColetados: boolean): FatiaMaterial[] {
  const por = new Map<MaterialId, FatiaMaterial>();
  for (const x of doacoes) {
    if (soColetados && x.status !== "coletado") continue;
    const f = por.get(x.materialId) ?? { materialId: x.materialId, doacoes: 0, quantidade: 0 };
    f.doacoes += 1;
    f.quantidade += x.quantidade;
    por.set(x.materialId, f);
  }
  return [...por.values()].sort((a, b) => b.doacoes - a.doacoes || b.quantidade - a.quantidade);
}

export type FatiaBairro = { bairro: string; doacoes: number; parte: number };

export function porBairro(doacoes: DoacaoComStatus[], soColetados: boolean): FatiaBairro[] {
  const por = new Map<string, number>();
  let total = 0;
  for (const x of doacoes) {
    if (soColetados && x.status !== "coletado") continue;
    por.set(x.bairro, (por.get(x.bairro) ?? 0) + 1);
    total += 1;
  }
  return [...por.entries()]
    .map(([bairro, doacoes]) => ({ bairro, doacoes, parte: total === 0 ? 0 : doacoes / total }))
    .sort((a, b) => b.doacoes - a.doacoes);
}
