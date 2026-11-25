"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { formatarEm, numero } from "@/lib/format";
import { PERFIS } from "@/lib/nav";
import { obterEstado, useDispatch, useEstado } from "@/lib/store";
import type { Estado, Material, Meta, Pedido } from "@/lib/types";
import {
  CartaoSaldo,
  descreverItens,
  SemSolicitante,
  useSolicitante,
  type PerfilMovel,
} from "./compartilhado";

// Pedidos ativos (aguardando ou aceitos) de quem pediu, o mais recente primeiro
// (o último do array é o mais novo).
function pedidosAtivos(estado: Estado, solicitanteId: string): Pedido[] {
  return estado.pedidos
    .filter(
      (p) =>
        p.solicitanteId === solicitanteId &&
        (p.status === "aguardando" || p.status === "aceito"),
    )
    .reverse();
}

function nomeNaFrase(m: Material | undefined): string {
  if (!m) return "um material";
  return m.id === "pet" ? "garrafa PET" : m.nome.toLowerCase();
}

const ETAPAS = [
  { chave: "aguardando", rotulo: "Aguardando catador" },
  { chave: "aceito", rotulo: "Aceito pelo catador" },
] as const;

type Aviso = { ok: boolean; texto: string };

export function Inicio({ perfil }: { perfil: PerfilMovel }) {
  const estado = useEstado();
  const uid = useId();
  const dispatch = useDispatch();
  const solicitante = useSolicitante(perfil);
  const raiz = PERFIS[perfil].raiz;
  const comercio = perfil === "comerciante";
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const avisoRef = useRef<HTMLParagraphElement>(null);

  // Com cacheComponents o Next mantém esta tela viva (escondida) ao navegar; a
  // limpeza roda quando ela é escondida, então a volta não traz o aviso antigo.
  useLayoutEffect(
    () => () => {
      setAviso(null);
    },
    [],
  );

  // O pedido cancelado some da lista e leva o foco junto: leva o foco ao aviso
  // (que também é anunciado pela região viva abaixo).
  useEffect(() => {
    if (!aviso) return;
    const el = avisoRef.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: "center" });
  }, [aviso]);

  if (!solicitante) return <SemSolicitante />;

  const saudacao = comercio
    ? `Olá, ${solicitante.nome}`
    : `Olá, ${solicitante.nome.split(" ")[0]}`;
  const materialDestaque = estado.materiais.find(
    (m) => m.id === estado.destaque.materialId,
  );
  const acrescimo = Math.round((estado.destaque.multiplicador - 1) * 100);
  const ativos = pedidosAtivos(estado, solicitante.id);
  const atividades = estado.extrato
    .filter((l) => l.solicitanteId === solicitante.id)
    .slice(-5)
    .reverse();

  function cancelar(pedido: Pedido) {
    dispatch({ type: "cancelar", id: pedido.id });
    // O reducer recusa se o catador aceitou antes (por exemplo, em outra aba).
    const depois = obterEstado().pedidos.find((p) => p.id === pedido.id);
    setAviso(
      depois?.status === "cancelado"
        ? { ok: true, texto: "Pedido cancelado. Você pode marcar material de novo quando quiser." }
        : {
            ok: false,
            texto: "Não foi possível cancelar: o pedido já foi aceito por um catador.",
          },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-graphite">{saudacao}</h1>
        <p className="mt-1 text-base text-text-muted">
          {comercio
            ? "Avise quando seu comércio tiver material para reciclar e junte pontos."
            : "Avise quando tiver material para reciclar e junte pontos."}
        </p>
      </div>

      <CartaoSaldo saldo={solicitante.saldo} comercio={comercio} />

      <ButtonLink
        href={`${raiz}/coletar`}
        variante="primario"
        grande
        fullWidth
      >
        <Icon nome="folha" />
        Tenho material para ser reciclado
      </ButtonLink>

      <Card as="section" aria-labelledby={`${uid}-item-semana`} className="flex flex-col gap-2">
        <h2 id={`${uid}-item-semana`} className="text-xl font-semibold text-graphite">
          Item da semana
        </h2>
        <p>
          <Chip tom="ok" icone="trofeu">
            Em destaque
          </Chip>
        </p>
        <p className="text-base text-graphite">
          Esta semana a Prefeitura valoriza um pouco mais:{" "}
          <strong className="font-semibold">{nomeNaFrase(materialDestaque)}</strong>
        </p>
        <p className="text-sm text-text-muted">
          {acrescimo > 0
            ? `Pontos ${numero(acrescimo)}% maiores neste material. A diferença é pequena de propósito: o importante é reciclar, não consumir mais. Valores de exemplo.`
            : "Sem acréscimo neste material agora. Valores de exemplo."}
        </p>
      </Card>

      {solicitante.metas.length > 0 && (
        <Card as="section" aria-labelledby={`${uid}-metas`} className="flex flex-col gap-4">
          <h2 id={`${uid}-metas`} className="text-xl font-semibold text-graphite">
            Suas metas
          </h2>
          <ul className="flex flex-col gap-4">
            {solicitante.metas.map((meta) => (
              <li key={meta.id}>
                <MetaLinha meta={meta} />
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Região viva sempre montada: leitores de tela só anunciam texto que
          entra depois de montada. */}
      <div role="status" className="sr-only">
        {aviso?.texto}
      </div>
      {aviso && (
        <p
          ref={avisoRef}
          tabIndex={-1}
          className={`flex scroll-mt-20 items-center gap-2 rounded-lg p-4 text-base font-semibold focus:outline-3 focus:outline-offset-2 focus:outline-tech-blue ${
            aviso.ok ? "bg-mint-wash text-primary-strong" : "bg-danger/10 text-danger"
          }`}
        >
          <Icon nome={aviso.ok ? "check" : "x"} />
          {aviso.texto}
        </p>
      )}

      {ativos.length > 0 ? (
        <section aria-labelledby={`${uid}-coletas`} className="flex flex-col gap-4">
          <h2 id={`${uid}-coletas`} className="text-xl font-semibold text-graphite">
            Suas coletas
          </h2>
          <ul className="flex flex-col gap-4">
            {ativos.map((ativo) => {
              const catador = ativo.catadorId
                ? estado.catadores.find((c) => c.id === ativo.catadorId)
                : undefined;
              const atual = ETAPAS.findIndex((e) => e.chave === ativo.status);
              const rotuloPedido = `Pedido de ${formatarEm(ativo.criadoEm)}`;
              return (
                <li key={ativo.id}>
                  <Card className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3
                        id={`${uid}-pedido-${ativo.id}`}
                        className="text-lg font-semibold text-graphite"
                      >
                        {rotuloPedido}
                      </h3>
                      {ativo.status === "aguardando" ? (
                        <Chip tom="aviso" icone="relogio">
                          Aguardando
                        </Chip>
                      ) : (
                        <Chip tom="ok" icone="caminhao">
                          Aceito pelo catador
                        </Chip>
                      )}
                    </div>
                    <ol
                      className="flex flex-col gap-2"
                      aria-labelledby={`${uid}-pedido-${ativo.id}`}
                    >
                      {ETAPAS.map((etapa, i) => {
                        const estadoEtapa =
                          i < atual ? "feita" : i === atual ? "atual" : "proxima";
                        return (
                          <li
                            key={etapa.chave}
                            aria-current={estadoEtapa === "atual" ? "step" : undefined}
                            className={`flex items-center gap-2 text-base ${
                              estadoEtapa === "proxima"
                                ? "text-text-muted"
                                : "font-semibold text-graphite"
                            }`}
                          >
                            <span
                              className={`inline-flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                estadoEtapa === "proxima"
                                  ? "border border-border-soft text-text-muted"
                                  : "bg-primary-strong text-white"
                              }`}
                            >
                              {estadoEtapa === "feita" ? (
                                <Icon nome="check" tamanho="sm" />
                              ) : (
                                i + 1
                              )}
                            </span>
                            {etapa.rotulo}
                            {estadoEtapa === "atual" && (
                              <span className="text-sm font-normal text-text-muted">
                                (agora)
                              </span>
                            )}
                            {etapa.chave === "aceito" &&
                              catador &&
                              estadoEtapa !== "proxima" && (
                                <span className="text-sm font-normal text-text-muted">
                                  : {catador.nome}
                                </span>
                              )}
                          </li>
                        );
                      })}
                    </ol>
                    <p className="text-sm text-text-muted">
                      {descreverItens(estado, ativo)}. Retirada: {ativo.janela}.
                    </p>
                    {ativo.status === "aguardando" && (
                      <Button
                        variante="secundario"
                        aria-label={`Cancelar ${rotuloPedido.toLowerCase()}`}
                        onClick={() => cancelar(ativo)}
                      >
                        Cancelar pedido
                      </Button>
                    )}
                  </Card>
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        <Card>
          <EmptyState
            icone="caminhao"
            titulo="Nenhuma coleta em andamento"
            texto={
              comercio
                ? "Quando seu comércio tiver material, marque aqui e acompanhe a coleta."
                : "Quando você marcar material, o pedido aparece aqui para você acompanhar."
            }
            acao={
              <ButtonLink href={`${raiz}/coletar`} variante="secundario">
                Marcar material
              </ButtonLink>
            }
          />
        </Card>
      )}

      <Card as="section" aria-labelledby={`${uid}-atividades`} className="flex flex-col gap-3">
        <h2 id={`${uid}-atividades`} className="text-xl font-semibold text-graphite">
          Últimas atividades
        </h2>
        {atividades.length === 0 ? (
          <p className="text-base text-text-muted">
            Suas coletas e resgates vão aparecer aqui.
          </p>
        ) : (
          <ul className="divide-y divide-border-soft">
            {atividades.map((l) => (
              <li
                key={l.id}
                className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="text-base text-graphite">{l.descricao}</p>
                  <p className="text-sm text-text-muted">{formatarEm(l.em)}</p>
                </div>
                <p
                  className={`shrink-0 text-base font-semibold tabular-nums ${
                    l.pontos >= 0 ? "text-primary-strong" : "text-graphite"
                  }`}
                >
                  {l.pontos >= 0 ? "+" : "−"}
                  {numero(Math.abs(l.pontos))} pts
                </p>
              </li>
            ))}
          </ul>
        )}
        <ButtonLink
          href={comercio ? `${raiz}/beneficios` : `${raiz}/recompensas`}
          variante="terciario"
          className="self-start"
        >
          {comercio ? "Ver benefícios" : "Ver recompensas"}
          <Icon nome="seta" />
        </ButtonLink>
      </Card>
    </div>
  );
}

function MetaLinha({ meta }: { meta: Meta }) {
  const feito = Math.min(meta.progresso, meta.alvo);
  const pct = meta.alvo > 0 ? Math.round((feito / meta.alvo) * 100) : 0;
  const rotulo = meta.periodo === "diaria" ? "Meta do dia" : "Meta do mês";
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-base font-medium text-graphite">
          {rotulo}: {meta.titulo}
        </p>
        <p className="shrink-0 text-base font-semibold tabular-nums text-graphite">
          {numero(feito)} de {numero(meta.alvo)}
        </p>
      </div>
      <div
        role="progressbar"
        aria-label={`${rotulo}: ${meta.titulo}`}
        aria-valuemin={0}
        aria-valuemax={meta.alvo}
        aria-valuenow={feito}
        aria-valuetext={`${feito} de ${meta.alvo}`}
        className="h-2.5 overflow-hidden rounded-full bg-mint-wash"
      >
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-sm text-text-muted">
        {meta.concluida ? (
          <span className="inline-flex items-center gap-1 font-semibold text-primary-strong">
            <Icon nome="check" tamanho="sm" />
            Concluída: bônus de {numero(meta.bonus)} pts recebido
          </span>
        ) : (
          `Bônus de ${numero(meta.bonus)} pts ao concluir (valor de exemplo)`
        )}
      </p>
    </div>
  );
}
