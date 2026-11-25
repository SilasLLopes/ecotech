"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { MapaQuixada } from "@/components/mapa/mapa-quixada";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { ICONE_DO_MATERIAL, Icon } from "@/components/ui/icon";
import { Revelar } from "@/components/ui/revelar";
import { pontosDoPedido } from "@/lib/coleta";
import { formatarEm, numero } from "@/lib/format";
import { ROTAS } from "@/data/rotas";
import { distanciaM, ordenarRota } from "@/lib/route";
import { minutosDoTrajeto, trajeto } from "@/lib/trajeto";
import { obterEstado, useDispatch, useEstado } from "@/lib/store";
import {
  descreverItens,
  nomeDoSolicitante,
} from "@/components/cidadao/compartilhado";
import { resumoDaRota, SemCatador, useCatador } from "./compartilhado";

const AVISO_INDISPONIVEL =
  "Alguns pedidos não estão mais disponíveis. Eles saíram da sua seleção.";

export function PedidosProximos() {
  const estado = useEstado();
  const uid = useId();
  const dispatch = useDispatch();
  const router = useRouter();
  const catador = useCatador();
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);

  // Com cacheComponents o Next mantém esta tela viva (escondida) ao navegar
  // para a rota; a limpeza do efeito roda quando ela é escondida, então o aviso
  // antigo não reaparece na volta.
  useEffect(() => () => setAviso(null), []);

  const disponiveis = estado.pedidos.filter((p) => p.status === "aguardando");

  // Outra aba pode ter aceitado ou cancelado pedidos que estão selecionados
  // aqui. O store avisa pelo evento `storage`; ao notar, tira da seleção e
  // avisa. (Ajuste de estado durante a renderização, permitido pelo React.)
  const idsDisponiveis = new Set(disponiveis.map((p) => p.id));
  const validos = selecionados.filter((id) => idsDisponiveis.has(id));
  if (validos.length !== selecionados.length) {
    setSelecionados(validos);
    setAviso(AVISO_INDISPONIVEL);
  }

  if (!catador) return <SemCatador />;

  const origem = catador.posicao;
  const porDistancia = disponiveis
    .map((pedido) => ({ pedido, dist: distanciaM(origem, pedido.ponto) }))
    .sort((a, b) => a.dist - b.dist);
  const escolhidos = disponiveis.filter((p) => validos.includes(p.id));
  const rota = ordenarRota(
    origem,
    escolhidos.map((p) => ({ id: p.id, ponto: p.ponto })),
  );
  const percurso = trajeto(
    [origem, ...rota.ordem.flatMap((id) => escolhidos.find((p) => p.id === id)?.ponto ?? [])],
    ROTAS,
  );
  const minutos = minutosDoTrajeto(percurso.segundos, escolhidos.length);
  const temSelecao = escolhidos.length > 0;

  function alternar(id: string) {
    setAviso(null);
    setSelecionados((atual) =>
      atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id],
    );
  }

  function aceitar() {
    if (!catador || selecionados.length === 0) return;
    // Relê o estado do armazenamento: outra aba pode ter mudado algo desde a
    // última renderização. Se algum pedido sumiu, não aceita nada ainda:
    // mostra o aviso com a seleção já corrigida e deixa a pessoa confirmar.
    const livres = new Set(
      obterEstado()
        .pedidos.filter((p) => p.status === "aguardando")
        .map((p) => p.id),
    );
    const ids = selecionados.filter((id) => livres.has(id));
    if (ids.length === 0 || ids.length < selecionados.length) {
      setSelecionados(ids);
      setAviso(AVISO_INDISPONIVEL);
      return;
    }
    dispatch({ type: "aceitar", ids, catadorId: catador.id });
    const aceitos = obterEstado().pedidos.filter(
      (p) =>
        ids.includes(p.id) && p.status === "aceito" && p.catadorId === catador.id,
    );
    setSelecionados([]);
    if (aceitos.length === 0) {
      setAviso(AVISO_INDISPONIVEL);
      return;
    }
    setAviso(null);
    router.push("/catador/rota");
  }

  return (
    <div className="flex flex-col pb-44">
      <div className="pb-4">
        <h1 className="text-2xl font-bold text-graphite">Pedidos perto de você</h1>
        <p className="mt-1 text-sm text-text-muted">
          Marque os que cabem no seu percurso; a rota pelas ruas se desenha no
          mapa. Pedidos e distâncias de exemplo.
        </p>
      </div>

      {porDistancia.length === 0 ? (
        <Card>
          <EmptyState
            icone="pino"
            titulo="Nenhum pedido por perto agora"
            texto="Quando alguém pedir coleta, o pedido aparece aqui sem precisar recarregar a tela."
          />
        </Card>
      ) : (
        <>
          {/* Mapa de borda a borda, grudado sob o cabeçalho; a lista sobe sobre
              ele como uma gaveta. */}
          <div className="sticky top-16 z-10 -mx-4">
            <MapaQuixada
              pedidos={disponiveis}
              selecionados={validos}
              rota={temSelecao ? { origem, ordem: rota.ordem } : undefined}
              posicaoCatador={catador.posicao}
              altura="alta"
              onSelecionar={alternar}
              rotulo={`Mapa com ${disponiveis.length} ${
                disponiveis.length === 1 ? "pedido aguardando" : "pedidos aguardando"
              } coleta`}
            />
          </div>

          <section
            aria-labelledby={`${uid}-lista-pedidos`}
            className="relative z-20 -mx-4 -mt-5 flex flex-col gap-4 rounded-t-2xl bg-mint-surface px-4 pt-5 shadow-[0_-10px_28px_rgb(32_43_40/0.14)]"
          >
            <span aria-hidden="true" className="mx-auto -mt-2 h-1 w-10 rounded-full bg-border-soft" />
            <h2 id={`${uid}-lista-pedidos`} className="text-xl font-semibold text-graphite">
              Aguardando coleta ({numero(disponiveis.length)})
            </h2>
            <ul className="flex flex-col gap-3">
              {porDistancia.map(({ pedido, dist }, indice) => {
                const marcado = validos.includes(pedido.id);
                const pts = pontosDoPedido(
                  pedido.itens,
                  estado.materiais,
                  estado.destaque,
                );
                const metros = Math.round(dist / 10) * 10;
                return (
                  <Revelar as="li" key={pedido.id} indice={indice}>
                    <label
                      className={`relative flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border-[1.5px] p-4 shadow-card has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-tech-blue ${
                        marcado
                          ? "border-primary-strong bg-white ring-4 ring-primary-soft/60"
                          : "border-border-soft bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={marcado}
                        onChange={() => alternar(pedido.id)}
                        aria-labelledby={`${uid}-end-${pedido.id} ${uid}-bai-${pedido.id}`}
                        aria-describedby={`${uid}-det-${pedido.id}`}
                        className="absolute inset-0 size-full cursor-pointer opacity-0 scroll-mb-48"
                      />
                      <span
                        key={String(marcado)}
                        aria-hidden="true"
                        className={`mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-md border-[1.5px] border-primary-strong ${
                          marcado ? "pulso-selo bg-primary-strong text-white" : "bg-white"
                        }`}
                      >
                        {marcado && <Icon nome="check" tamanho="sm" />}
                      </span>
                      <span className="flex min-w-0 flex-col gap-1">
                        <span id={`${uid}-bai-${pedido.id}`} className="text-sm text-text-muted">
                          {pedido.bairro}
                        </span>
                        <span
                          id={`${uid}-end-${pedido.id}`}
                          className="text-base font-semibold text-graphite"
                        >
                          {pedido.endereco}
                        </span>
                        <span id={`${uid}-det-${pedido.id}`} className="flex flex-col gap-1">
                          <span className="flex items-center gap-2 text-base text-graphite">
                            <span aria-hidden="true" className="flex gap-1 text-primary-strong">
                              {pedido.itens.map((i) => (
                                <Icon key={i.materialId} nome={ICONE_DO_MATERIAL[i.materialId]} tamanho="sm" />
                              ))}
                            </span>
                            {descreverItens(estado, pedido)}
                          </span>
                          <span className="text-sm text-text-muted">
                            Retirada: {pedido.janela}. {nomeDoSolicitante(estado, pedido)},
                            pedido de {formatarEm(pedido.criadoEm)}.
                          </span>
                          <span className="mt-1 flex flex-wrap gap-2">
                            <Chip tom="ok" icone="trofeu">
                              cerca de {numero(pts)} pts
                            </Chip>
                            <Chip tom="neutro" icone="pino">
                              ~{numero(metros)} m de você
                            </Chip>
                          </span>
                        </span>
                      </span>
                    </label>
                  </Revelar>
                );
              })}
            </ul>
          </section>
        </>
      )}

      {/* Barra fixa acima da navegação inferior (65px + área segura). A região
          viva fica sempre montada: leitores de tela só anunciam texto que
          entra depois de montada. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(4.0625rem+env(safe-area-inset-bottom))] z-30 mx-auto max-w-md">
        <div role="status">
          {aviso && (
            <p className="pointer-events-auto mx-3 mb-2 flex items-start gap-2 rounded-lg border border-warning bg-white p-3 text-sm font-semibold text-graphite shadow-raised">
              <Icon nome="megafone" className="mt-0.5 text-warning" />
              {aviso}
            </p>
          )}
        </div>
        {porDistancia.length > 0 && (
          <div className="pointer-events-auto flex flex-col gap-2 border-t border-border-soft bg-white px-4 py-3 shadow-raised">
            <p id={`${uid}-resumo-rota`} aria-live="polite" className="text-base font-semibold text-graphite">
              {temSelecao
                ? resumoDaRota(escolhidos.length, percurso.distanciaM, minutos)
                : "Selecione pedidos para montar a rota"}
            </p>
            <Button
              variante="primario"
              fullWidth
              disabled={!temSelecao}
              aria-describedby={`${uid}-resumo-rota`}
              onClick={aceitar}
            >
              Aceitar e ver rota
              <Icon nome="seta" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
