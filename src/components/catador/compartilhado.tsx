"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { DEMO } from "@/data/seed";
import { numero } from "@/lib/format";
import { useEstado } from "@/lib/store";
import type { Catador } from "@/lib/types";

// Catador do perfil de demonstração; undefined se sumiu do estado.
export function useCatador(): Catador | undefined {
  const estado = useEstado();
  return estado.catadores.find((c) => c.id === DEMO.catador);
}

export function SemCatador() {
  return (
    <EmptyState
      icone="pessoas"
      titulo="Não encontramos o cadastro de catador de exemplo"
      texto="Use o botão de reiniciar dados de exemplo, no topo da tela, para voltar ao começo."
    />
  );
}

// "3 paradas, ~420 m, ~25 min (estimativa)". Metros e minutos vêm do trajeto
// pelas ruas, mas continuam sendo estimativa; a distância é arredondada para a dezena.
export function resumoDaRota(
  paradas: number,
  distanciaM: number,
  minutos: number,
): string {
  const metros = Math.round(distanciaM / 10) * 10;
  return `${paradas} ${paradas === 1 ? "parada" : "paradas"}, ~${numero(metros)} m, ~${numero(minutos)} min (estimativa)`;
}
