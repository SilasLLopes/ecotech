"use client";

import { useId, useMemo, useState } from "react";
import { MapaQuixada } from "@/components/mapa/mapa-quixada";
import { RAMPA_CALOR } from "@/components/mapa/estilo-quixada";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ICONE_DO_MATERIAL, Icon } from "@/components/ui/icon";
import { Revelar } from "@/components/ui/revelar";
import { HISTORICO_DOACOES, REFERENCIAS_DE_RUA } from "@/data/historico";
import {
  celulasQuentes,
  distanciaAoCatador,
  doacoesDoEstado,
  localMaisProximo,
  misturaDeMateriais,
  pontosDeCalor,
  porBairro,
  type FiltroCalor,
} from "@/lib/calor";
import { numero } from "@/lib/format";
import { useEstado } from "@/lib/store";
import type { Material } from "@/lib/types";

// Acima desta distância ao catador mais perto, o ponto quente é marcado como
// "longe" (valor de exemplo, para a Prefeitura decidir onde reforçar).
const LONGE_M = 1200;
const FOCO =
  "has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-tech-blue";

const pct = (parte: number) => `${Math.round(parte * 100)}%`;
const km = (m: number) => `${numero(Math.round(m / 10) * 10)} m`;

function rotuloValor(peso: number, filtro: FiltroCalor, material: Material | undefined) {
  if (filtro.materialId === "todos") {
    return `${numero(peso)} ${peso === 1 ? "doação" : "doações"}`;
  }
  return `${numero(peso)} ${material?.unidade ?? ""} de ${material?.nome ?? "material"}`;
}

export function MapaDeCalor() {
  const estado = useEstado();
  const uid = useId();
  const [filtro, setFiltro] = useState<FiltroCalor>({ materialId: "todos", soColetados: false });

  // Histórico de exemplo + pedidos do app: um pedido novo esquenta o mapa na hora.
  const doacoes = useMemo(
    () => [...HISTORICO_DOACOES, ...doacoesDoEstado(estado)],
    [estado],
  );
  const pontos = useMemo(() => pontosDeCalor(doacoes, filtro), [doacoes, filtro]);
  const maximo = useMemo(() => {
    const maior = celulasQuentes(pontos, 120)[0]?.peso ?? 1;
    return Math.max(1, maior);
  }, [pontos]);
  const calor = useMemo(() => ({ pontos, maximo }), [pontos, maximo]);
  const quentes = useMemo(() => celulasQuentes(pontos, 250).slice(0, 5), [pontos]);
  const bairros = useMemo(() => porBairro(doacoes, filtro.soColetados), [doacoes, filtro.soColetados]);
  const mistura = useMemo(
    () => misturaDeMateriais(doacoes, filtro.soColetados),
    [doacoes, filtro.soColetados],
  );
  const material = estado.materiais.find((m) => m.id === filtro.materialId);
  const doTipoComercio = useMemo(() => {
    const validas = doacoes.filter((x) => (filtro.soColetados ? x.status === "coletado" : true));
    return validas.length === 0
      ? 0
      : validas.filter((x) => x.tipo === "comerciante").length / validas.length;
  }, [doacoes, filtro.soColetados]);

  const lista = quentes.map((c) => {
    const local = localMaisProximo(c, REFERENCIAS_DE_RUA);
    return { ...c, local, catador: distanciaAoCatador(c, estado.catadores) };
  });
  const maisQuente = lista[0];
  const topBairro = bairros[0];
  const maxMistura = Math.max(1, ...mistura.map((m) => m.doacoes));
  const maxBairro = Math.max(1, ...bairros.map((b) => b.doacoes));

  return (
    <div className="flex w-full max-w-6xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-graphite">Mapa de calor</h1>
        <p className="mt-1 text-base text-text-muted">
          De onde vêm os recicláveis da cidade. Histórico de exemplo somado aos pedidos do
          app: um pedido novo esquenta o mapa na hora.
        </p>
      </div>

      <Card className="flex flex-col gap-4">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-base font-semibold text-graphite">Material</legend>
          <div className="flex flex-wrap gap-2">
            {[{ id: "todos" as const, nome: "Todos" }, ...estado.materiais].map((m) => {
              const marcado = filtro.materialId === m.id;
              return (
                <label
                  key={m.id}
                  className={`relative flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-[1.5px] px-4 text-base font-semibold transition-colors duration-200 motion-reduce:transition-none ${FOCO} ${
                    marcado
                      ? "border-primary-strong bg-primary-strong text-white"
                      : "border-border-soft bg-white text-graphite hover:bg-mint-wash"
                  }`}
                >
                  <input
                    type="radio"
                    name={`${uid}-material`}
                    value={m.id}
                    checked={marcado}
                    onChange={() => setFiltro((f) => ({ ...f, materialId: m.id }))}
                    className="sr-only"
                  />
                  {m.id !== "todos" && (
                    <span aria-hidden="true">
                      <Icon nome={ICONE_DO_MATERIAL[m.id]} tamanho="sm" />
                    </span>
                  )}
                  {m.nome}
                </label>
              );
            })}
          </div>
        </fieldset>
        <label className={`flex min-h-11 w-fit cursor-pointer items-center gap-3 text-base text-graphite ${FOCO}`}>
          <input
            type="checkbox"
            checked={filtro.soColetados}
            onChange={(e) => setFiltro((f) => ({ ...f, soColetados: e.target.checked }))}
            className="size-5 accent-primary-strong"
          />
          Só o que já foi coletado
        </label>
        <p className="text-sm text-text-muted" aria-live="polite">
          {filtro.materialId === "todos"
            ? "A cor mostra quantas doações (um item de um pedido) saem de cada quadra."
            : `A cor mostra quantos ${material?.unidade ?? ""} de ${material?.nome ?? "material"} saem de cada quadra.`}{" "}
          Quadras de ~250 m, dados agregados.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-3">
          <MapaQuixada
            pedidos={[]}
            calor={calor}
            rotulo="Mapa de calor das doações de recicláveis por quadra"
            altura="preencher"
          />
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-muted">
            <span className="font-semibold text-graphite">Menos</span>
            <span aria-hidden="true" className="flex">
              {RAMPA_CALOR.map((cor) => (
                <span key={cor} className="h-3 w-8 first:rounded-l-full last:rounded-r-full" style={{ background: cor }} />
              ))}
            </span>
            <span className="font-semibold text-graphite">Mais</span>
            <span>doações por quadra</span>
          </p>
        </div>

        <section aria-labelledby={`${uid}-quentes`} className="flex flex-col gap-3">
          <h2 id={`${uid}-quentes`} className="text-xl font-semibold text-graphite">
            Pontos mais quentes
          </h2>
          {lista.length === 0 ? (
            <Card>
              <EmptyState
                icone="pino"
                titulo="Nada para mostrar"
                texto="Com esse filtro não há doações. Escolha outro material ou desmarque “só o que já foi coletado”."
              />
            </Card>
          ) : (
            <ol className="flex flex-col gap-3">
              {lista.map((c, i) => (
                <Revelar as="li" key={`${c.lng}-${c.lat}`} indice={i}>
                  <div className="flex gap-3 rounded-lg border border-border-soft bg-white p-4 shadow-card">
                    <span
                      aria-hidden="true"
                      className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-graphite text-base font-bold text-white"
                    >
                      {i + 1}
                    </span>
                    <div className="flex min-w-0 flex-col gap-1">
                      <h3 className="text-base font-semibold text-graphite">
                        <span className="sr-only">{i + 1}º ponto mais quente: </span>
                        Perto da {c.local.rua}
                      </h3>
                      <p className="text-sm text-text-muted">{c.local.bairro}</p>
                      <p className="text-base font-bold text-graphite">
                        {rotuloValor(c.peso, filtro, material)}
                      </p>
                      <p className="flex items-center gap-1.5 text-sm text-text-muted">
                        <Icon nome="caminhao" tamanho="sm" />
                        {Number.isFinite(c.catador)
                          ? `Catador mais perto: ~${km(c.catador)}`
                          : "Sem catador associado"}
                        {c.catador > LONGE_M && (
                          <span className="font-semibold text-warning"> · longe</span>
                        )}
                      </p>
                    </div>
                  </div>
                </Revelar>
              ))}
            </ol>
          )}
        </section>
      </div>

      <section aria-labelledby={`${uid}-leitura`} className="flex flex-col gap-3">
        <h2 id={`${uid}-leitura`} className="text-xl font-semibold text-graphite">
          O que isto mostra
        </h2>
        <ul className="grid gap-3 md:grid-cols-3">
          <li className="rounded-lg bg-mint-wash p-4 text-base text-graphite">
            {topBairro ? (
              <>
                <strong className="font-bold">{topBairro.bairro}</strong> concentra{" "}
                <strong className="font-bold">{pct(topBairro.parte)}</strong> das doações.
              </>
            ) : (
              "Sem doações neste filtro."
            )}
          </li>
          <li className="rounded-lg bg-mint-wash p-4 text-base text-graphite">
            Comércios respondem por <strong className="font-bold">{pct(doTipoComercio)}</strong>{" "}
            das doações, e o resto vem de moradores.
          </li>
          <li className="rounded-lg bg-mint-wash p-4 text-base text-graphite">
            {maisQuente && Number.isFinite(maisQuente.catador) ? (
              maisQuente.catador > LONGE_M ? (
                <>
                  O ponto mais quente está a <strong className="font-bold">~{km(maisQuente.catador)}</strong>{" "}
                  do catador mais perto: vale reforçar a cobertura ali.
                </>
              ) : (
                <>
                  O ponto mais quente tem um catador a{" "}
                  <strong className="font-bold">~{km(maisQuente.catador)}</strong>.
                </>
              )
            ) : (
              "Sem catador associado para comparar."
            )}
          </li>
        </ul>
        <p className="text-sm text-text-muted">
          Leituras calculadas dos dados de exemplo; não são metas nem regras (D-04 e D-19 seguem abertos).
        </p>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby={`${uid}-bairros`} className="flex flex-col gap-3">
          <h2 id={`${uid}-bairros`} className="text-xl font-semibold text-graphite">
            Doações por bairro
          </h2>
          <ol className="flex flex-col gap-4 rounded-xl border border-border-soft bg-white p-5 shadow-card">
            {bairros.map((b, i) => (
              <li key={b.bairro} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-semibold text-graphite">{b.bairro}</span>
                  <span className="text-base font-bold tabular-nums text-graphite">
                    {numero(b.doacoes)} · {pct(b.parte)}
                  </span>
                </div>
                <div aria-hidden="true" className="h-2.5 overflow-hidden rounded-full bg-mint-wash">
                  <div
                    className="cresce-x h-full rounded-full bg-primary"
                    style={{ width: `${(b.doacoes / maxBairro) * 100}%`, "--i": i } as React.CSSProperties}
                  />
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby={`${uid}-mistura`} className="flex flex-col gap-3">
          <h2 id={`${uid}-mistura`} className="text-xl font-semibold text-graphite">
            Mistura de materiais
          </h2>
          <ol className="flex flex-col gap-4 rounded-xl border border-border-soft bg-white p-5 shadow-card">
            {mistura.map((m, i) => {
              const info = estado.materiais.find((x) => x.id === m.materialId);
              return (
                <li key={m.materialId} className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="flex items-center gap-2 font-semibold text-graphite">
                      <span aria-hidden="true" className="text-primary-strong">
                        <Icon nome={ICONE_DO_MATERIAL[m.materialId]} tamanho="sm" />
                      </span>
                      {info?.nome ?? m.materialId}
                    </span>
                    <span className="text-sm tabular-nums text-text-muted">
                      {numero(m.doacoes)} doações · {numero(m.quantidade)} {info?.unidade}
                    </span>
                  </div>
                  <div aria-hidden="true" className="h-2.5 overflow-hidden rounded-full bg-mint-wash">
                    <div
                      className="cresce-x h-full rounded-full bg-primary-strong"
                      style={{ width: `${(m.doacoes / maxMistura) * 100}%`, "--i": i } as React.CSSProperties}
                    />
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </div>
  );
}
