"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { CALENDARIO_ROTACAO } from "@/data/seed";
import { MULTIPLICADOR_MAX, pontosDoPedido } from "@/lib/coleta";
import { numero } from "@/lib/format";
import { useDispatch, useEstado } from "@/lib/store";
import type { Material, MaterialId } from "@/lib/types";

const PASSO = 0.05;
// Em passos inteiros para não acumular erro de ponto flutuante (0,05 x 10).
const MAX_PASSOS = Math.round((MULTIPLICADOR_MAX - 1) / PASSO);

const doPasso = (passos: number) => Math.round((1 + passos * PASSO) * 100) / 100;
const paraPasso = (m: number) =>
  Math.min(MAX_PASSOS, Math.max(0, Math.round((m - 1) / PASSO)));
const fator = (m: number) => `×${m.toFixed(2).replace(".", ",")}`;

type Rascunho = { materialId: MaterialId; passos: number };

const BOTAO_PASSO =
  "inline-flex size-11 items-center justify-center rounded-md border-[1.5px] border-primary-strong bg-white text-primary-strong transition-colors duration-200 hover:bg-mint-wash motion-reduce:transition-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-tech-blue aria-disabled:cursor-not-allowed aria-disabled:border-transparent aria-disabled:bg-mint-wash aria-disabled:text-text-muted";

export function Rodizio() {
  const estado = useEstado();
  const dispatch = useDispatch();
  // null = sem edição: a tela mostra o que está publicado (e acompanha
  // mudanças feitas em outra aba).
  const [rascunho, setRascunho] = useState<Rascunho | null>(null);
  const [confirmacao, setConfirmacao] = useState<string | null>(null);
  const confirmacaoRef = useRef<HTMLParagraphElement>(null);

  // Com cacheComponents o Next mantém esta tela viva (escondida) ao navegar
  // para outra rota; a limpeza do efeito roda quando ela é escondida, então a
  // próxima visita começa do que está publicado, sem confirmação antiga.
  useEffect(
    () => () => {
      setRascunho(null);
      setConfirmacao(null);
    },
    [],
  );

  // Depois de publicar, o foco vai para a confirmação (também anunciada pela
  // região viva).
  useEffect(() => {
    if (!confirmacao) return;
    const el = confirmacaoRef.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: "center" });
  }, [confirmacao]);

  const publicado = estado.destaque;
  const materialId = rascunho?.materialId ?? publicado.materialId;
  const passos = rascunho?.passos ?? paraPasso(publicado.multiplicador);
  const multiplicador = doPasso(passos);
  const material = estado.materiais.find((m) => m.id === materialId);
  const materialPublicado = estado.materiais.find((m) => m.id === publicado.materialId);

  const pontos = (m: Material | undefined, mult: number) =>
    m
      ? pontosDoPedido([{ materialId: m.id, quantidade: 1 }], estado.materiais, {
          materialId: m.id,
          multiplicador: mult,
        })
      : 0;

  function mudarPassos(proximo: number) {
    setConfirmacao(null);
    setRascunho({ materialId, passos: Math.min(MAX_PASSOS, Math.max(0, proximo)) });
  }

  function escolherMaterial(id: MaterialId) {
    setConfirmacao(null);
    setRascunho({ materialId: id, passos });
  }

  function publicar() {
    if (!material) return;
    dispatch({ type: "definir-destaque", materialId, multiplicador });
    setRascunho(null);
    setConfirmacao(
      `Publicado: ${material.nome} com ${fator(multiplicador)} nesta semana. Quem for pedir coleta já vê a nova estimativa.`,
    );
  }

  return (
    <div className="flex w-full max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-graphite">Rodízio da semana</h1>
        <p className="mt-1 text-base text-text-muted">
          Escolha o material em destaque e quanto ele rende a mais. Valores de exemplo.
        </p>
      </div>

      <Card className="flex items-center gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-mint-wash text-primary-strong">
          <Icon nome="relogio" />
        </span>
        <p className="text-base text-graphite">
          Em destaque agora:{" "}
          <strong className="font-semibold">
            {materialPublicado?.nome ?? "material removido"}{" "}
            {fator(publicado.multiplicador)}
          </strong>
        </p>
      </Card>

      <Card className="flex flex-col gap-6">
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-lg font-semibold text-graphite">
            Item da semana
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {estado.materiais.map((m) => {
              const marcado = m.id === materialId;
              return (
                <label
                  key={m.id}
                  className={`relative flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border-[1.5px] px-4 py-2 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-tech-blue ${
                    marcado
                      ? "border-primary-strong bg-mint-wash"
                      : "border-border-soft bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="item-da-semana"
                    value={m.id}
                    checked={marcado}
                    onChange={() => escolherMaterial(m.id)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`inline-flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-primary-strong ${
                      marcado ? "bg-primary-strong" : "bg-white"
                    }`}
                  >
                    {marcado && <span className="size-2 rounded-full bg-white" />}
                  </span>
                  <span className="text-base font-semibold text-graphite">{m.nome}</span>
                  <span className="ml-auto shrink-0 whitespace-nowrap text-sm text-text-muted">
                    {numero(m.pontosBase)} pts por {m.unidade}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div role="group" aria-labelledby="rotulo-mult" className="flex flex-col gap-3">
          <p id="rotulo-mult" className="text-lg font-semibold text-graphite">
            Multiplicador do destaque
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className={BOTAO_PASSO}
              aria-label="Diminuir multiplicador"
              aria-disabled={passos <= 0 || undefined}
              onClick={() => passos > 0 && mudarPassos(passos - 1)}
            >
              <Icon nome="menos" />
            </button>
            <output
              aria-live="polite"
              className="min-w-20 text-center text-2xl font-extrabold tabular-nums text-graphite"
            >
              {fator(multiplicador)}
            </output>
            <button
              type="button"
              className={BOTAO_PASSO}
              aria-label="Aumentar multiplicador"
              aria-disabled={passos >= MAX_PASSOS || undefined}
              onClick={() => passos < MAX_PASSOS && mudarPassos(passos + 1)}
            >
              <Icon nome="mais" />
            </button>
          </div>
          <p className="text-sm text-text-muted">
            De ×1,00 a {fator(MULTIPLICADOR_MAX)}, em passos de 0,05.
            {passos >= MAX_PASSOS && " Este é o limite."}
          </p>
          <p className="flex items-start gap-2 rounded-lg bg-mint-wash p-3 text-base text-graphite">
            <Icon nome="megafone" className="mt-0.5 size-5 text-primary-strong" />
            A diferença é pequena de propósito, para não estimular consumo exagerado
          </p>
        </div>

        {material && (
          <p className="text-lg text-graphite" aria-live="polite">
            1 {material.unidade} de {material.nome} ={" "}
            <strong className="font-bold text-primary-strong">
              {numero(pontos(material, multiplicador))} pts com destaque
            </strong>
            <span className="block text-sm text-text-muted">
              Sem destaque: {numero(pontos(material, 1))} pts. Os pontos são
              arredondados.
            </span>
          </p>
        )}

        <div>
          <Button variante="primario" grande onClick={publicar} disabled={!material}>
            Publicar item da semana
          </Button>
        </div>

        {/* Região viva sempre montada: leitores de tela só anunciam texto que
            entra depois de montada. */}
        <div role="status" className="sr-only">
          {confirmacao}
        </div>
        {confirmacao && (
          <p
            ref={confirmacaoRef}
            tabIndex={-1}
            className="flex scroll-mt-20 items-start gap-2 rounded-lg bg-mint-wash p-4 text-base font-semibold text-primary-strong focus:outline-3 focus:outline-offset-2 focus:outline-tech-blue"
          >
            <Icon nome="check" className="mt-0.5" />
            {confirmacao}
          </p>
        )}
      </Card>

      <section aria-labelledby="calendario" className="flex flex-col gap-3">
        <h2 id="calendario" className="text-xl font-semibold text-graphite">
          Sugestão de calendário (exemplo)
        </h2>
        <p className="text-sm text-text-muted">
          Só para leitura. Mostra como o rodízio poderia seguir nas próximas semanas.
        </p>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CALENDARIO_ROTACAO.map((s) => (
            <li key={s.semana}>
              <Card className="flex h-full flex-col gap-1">
                <p className="text-sm text-text-muted">Semana de {s.semana}</p>
                <p className="text-lg font-semibold text-graphite">
                  {estado.materiais.find((m) => m.id === s.materialId)?.nome ?? "Material"}
                </p>
              </Card>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
