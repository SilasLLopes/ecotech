"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { Monolitos } from "@/components/brand/monolitos";
import { Contador } from "@/components/ui/contador";
import { Explosao } from "@/components/ui/explosao";
import { EmptyState } from "@/components/ui/empty-state";
import { DEMO } from "@/data/seed";
import { numero } from "@/lib/format";
import { useHidratado } from "@/lib/hidratacao";
import { rotuloDelta } from "@/lib/movimento";
import { useEstado } from "@/lib/store";
import type { Estado, Pedido, Solicitante } from "@/lib/types";

export type PerfilMovel = "cidadao" | "comerciante";

// Solicitante do perfil de demonstração; undefined se sumiu do estado.
export function useSolicitante(perfil: PerfilMovel): Solicitante | undefined {
  const estado = useEstado();
  return estado.solicitantes.find((s) => s.id === DEMO[perfil]);
}

export function SemSolicitante() {
  return (
    <EmptyState
      icone="pessoas"
      titulo="Não encontramos o cadastro de exemplo"
      texto="Use o botão de reiniciar dados de exemplo, no topo da tela, para voltar ao começo."
    />
  );
}

// "4 kg de PET, 3 kg de Latas". Material desconhecido não quebra a tela.
export function descreverItens(estado: Estado, pedido: Pedido): string {
  return pedido.itens
    .map((i) => {
      const m = estado.materiais.find((x) => x.id === i.materialId);
      return `${numero(i.quantidade)} ${m?.unidade ?? "un"} de ${m?.nome ?? "material"}`;
    })
    .join(", ");
}

// Nome de quem pediu a coleta; rótulo genérico se o cadastro sumiu do estado.
export function nomeDoSolicitante(estado: Estado, pedido: Pedido): string {
  return (
    estado.solicitantes.find((s) => s.id === pedido.solicitanteId)?.nome ??
    "Solicitante sem cadastro"
  );
}

export function CartaoSaldo({
  saldo,
  comercio,
}: {
  saldo: number;
  comercio: boolean;
}) {
  const vazio = saldo <= 0;
  const [delta, setDelta] = useState<{ valor: number; id: number } | null>(null);
  const [disparo, setDisparo] = useState(0);
  const anterior = useRef(saldo);
  const sincronizado = useRef(false);
  const hidratado = useHidratado();
  const hidratadoAntes = useRef(false);

  // Ao esconder a tela, a volta só sincroniza o saldo: uma mudança que ninguém
  // viu não dispara delta nem explosão.
  useLayoutEffect(
    () => () => {
      sincronizado.current = false;
    },
    [],
  );

  // Quando o saldo muda diante do usuário: "+N pts" sobe e some; se foi ganho,
  // uma explosão de hexágonos acompanha. Nunca na primeira renderização.
  useEffect(() => {
    // A troca do seed pelo estado salvo (hidratação) não é um ganho de pontos.
    const real = hidratadoAntes.current && hidratado;
    hidratadoAntes.current = hidratado;
    if (!sincronizado.current || !real) {
      sincronizado.current = true;
      anterior.current = saldo;
      return;
    }
    const variacao = saldo - anterior.current;
    anterior.current = saldo;
    if (variacao === 0) return;
    setDelta((d) => ({ valor: variacao, id: (d?.id ?? 0) + 1 }));
    if (variacao > 0) setDisparo((n) => n + 1);
    const fim = setTimeout(() => setDelta(null), 1300);
    return () => clearTimeout(fim);
  }, [saldo, hidratado]);

  return (
    <section
      aria-label="Seu saldo de pontos"
      className="relative min-h-48 overflow-hidden rounded-xl bg-reward p-6 text-white shadow-raised"
    >
      <Monolitos className="absolute inset-x-0 bottom-0 h-24 text-primary-soft opacity-20" />
      <div className="relative flex min-h-36 flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-3">
          <Logo variante="horizontal" fundo="mono-branco" altura={28} />
          <span className="text-xs text-white/85">Dados de exemplo</span>
        </div>
        <p className="max-w-60 text-base text-white/85">
          {vazio
            ? comercio
              ? "Você ainda não tem pontos. Peça a primeira coleta do seu comércio."
              : "Você ainda não tem pontos. Faça seu primeiro descarte."
            : "Você faz a diferença!"}
        </p>
        <p className="relative flex items-baseline gap-2">
          <Contador valor={saldo} className="text-4xl font-extrabold" />
          <span className="text-lg font-semibold text-primary-soft">pts</span>
          <span className="sr-only">de saldo</span>
          {delta && (
            <span
              key={delta.id}
              aria-hidden="true"
              className="delta-pontos absolute right-0 top-1/2 -mt-4 rounded-full bg-primary-soft px-2 py-0.5 text-sm font-bold text-graphite"
            >
              {rotuloDelta(delta.valor)}
            </span>
          )}
          <span className="absolute left-12 top-1/2">
            <Explosao disparo={disparo} />
          </span>
        </p>
      </div>
    </section>
  );
}
