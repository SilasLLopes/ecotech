"use client";

import { Chip } from "@/components/ui/chip";
import { ROTAS } from "@/data/rotas";
import { acompanhar } from "@/lib/acompanhamento";
import { numero } from "@/lib/format";
import type { Estado, Pedido } from "@/lib/types";
import { MapaQuixada } from "./mapa-quixada";

// Acompanhamento de um pedido na tela do cidadão: o pino do endereço dele e,
// quando um catador aceitou, o catador, a rota pelas ruas até aqui e a previsão
// de chegada. A rota pode passar por paradas de outras pessoas: o mapa não
// mostra esses endereços, só o caminho.
export function MapaAcompanhamento({ estado, pedido }: { estado: Estado; pedido: Pedido }) {
  const info = pedido.status === "aceito" ? acompanhar(estado, pedido.id, ROTAS) : null;
  const metros = info ? Math.round(info.distanciaM / 10) * 10 : 0;
  return (
    <div className="flex flex-col gap-3">
      <MapaQuixada
        pedidos={[pedido]}
        rota={
          info
            ? { origem: info.catador.posicao, ordem: [pedido.id], passando: info.passando }
            : undefined
        }
        posicaoCatador={info?.catador.posicao}
        rotulo={
          info
            ? `Mapa com o caminho de ${info.catador.nome} até o seu endereço`
            : "Mapa com o seu endereço"
        }
        altura="baixa"
      />
      {info ? (
        <p className="flex flex-wrap items-center gap-2 text-base text-graphite">
          <Chip tom="ok" icone="caminhao">
            Chega em ~{numero(info.minutos)} min
          </Chip>
          <span className="text-sm text-text-muted">
            {info.antes === 0
              ? "É a próxima parada"
              : info.antes === 1
                ? "Uma parada antes da sua"
                : `${info.antes} paradas antes da sua`}
            , ~{numero(metros)} m (estimativa)
          </span>
        </p>
      ) : (
        <p className="text-sm text-text-muted">
          Assim que um catador aceitar, o caminho até você aparece aqui.
        </p>
      )}
    </div>
  );
}
