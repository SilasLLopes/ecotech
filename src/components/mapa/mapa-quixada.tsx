"use client";

import type { Pedido, Ponto } from "@/lib/types";

// PROVISÓRIO: o mapa real (MapLibre) entra na próxima etapa. Até lá este
// componente mantém a mesma API e só mostra um quadro com o rótulo.
type MapaQuixadaProps = {
  pedidos: Pedido[];
  selecionados?: string[];
  rota?: { origem: Ponto; ordem: string[] };
  posicaoCatador?: Ponto;
  onSelecionar?: (id: string) => void;
  rotulo: string;
  altura?: "baixa" | "media" | "alta";
};

export function MapaQuixada({ pedidos, rotulo }: MapaQuixadaProps) {
  return (
    <div
      role="img"
      aria-label={rotulo}
      className="flex min-h-48 items-center justify-center rounded-lg bg-mint-wash p-4 text-center text-sm text-text-muted"
    >
      Mapa de Quixadá com {pedidos.length} {pedidos.length === 1 ? "ponto" : "pontos"}
    </div>
  );
}
