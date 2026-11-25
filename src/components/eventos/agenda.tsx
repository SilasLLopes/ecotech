"use client";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { dataBR } from "@/lib/format";
import { useEstado } from "@/lib/store";

// Agenda da cidade, somente leitura. Quem cadastra os eventos é a Prefeitura
// (/prefeitura/eventos); ela os divulga no próprio local, o app só os lista.
// Ordem por data do evento, o mais próximo primeiro.
export function Agenda() {
  const estado = useEstado();
  const eventos = estado.eventos.slice().sort((a, b) => a.data.localeCompare(b.data));

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-graphite">Agenda da cidade</h1>
        <p className="mt-1 text-base text-text-muted">
          A Prefeitura divulga cada evento no próprio local. O app só mostra a
          agenda.
        </p>
      </div>

      {eventos.length === 0 ? (
        <Card>
          <EmptyState
            icone="calendario"
            titulo="Nenhum evento marcado por enquanto"
            texto="Quando a Prefeitura cadastrar um evento da cidade, ele aparece aqui."
          />
        </Card>
      ) : (
        <ul className="flex flex-col gap-4">
          {eventos.map((ev) => (
            <li key={ev.id}>
              <Card as="article" className="flex flex-col gap-3">
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-primary-strong">
                    <Icon nome="calendario" tamanho="sm" />
                    <time dateTime={ev.data}>{dataBR(ev.data)}</time>
                  </p>
                  <h2 className="text-lg font-semibold text-graphite">{ev.titulo}</h2>
                  <p className="flex items-center gap-2 text-sm text-text-muted">
                    <Icon nome="pino" tamanho="sm" />
                    {ev.local}
                  </p>
                </div>
                <p className="text-base text-graphite">{ev.descricao}</p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
