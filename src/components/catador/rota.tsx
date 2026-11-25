"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MapaQuixada } from "@/components/mapa/mapa-quixada";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { pontosDoPedido } from "@/lib/coleta";
import { hora, numero } from "@/lib/format";
import { ROTAS } from "@/data/rotas";
import { ordenarRota } from "@/lib/route";
import { minutosDoTrajeto, trajeto } from "@/lib/trajeto";
import { novoId, obterEstado, useDispatch, useEstado } from "@/lib/store";
import type { Pedido } from "@/lib/types";
import {
  descreverItens,
  nomeDoSolicitante,
} from "@/components/cidadao/compartilhado";
import { resumoDaRota, SemCatador, useCatador } from "./compartilhado";

type Feedback = { ok: boolean; texto: string };

export function Rota() {
  const estado = useEstado();
  const uid = useId();
  const dispatch = useDispatch();
  const catador = useCatador();
  // Paradas concluídas nesta visita. A posição do catador vem do estado: a
  // rota das paradas restantes parte da última parada coletada, então a ordem
  // não muda depois de cada "Coletado", nem ao recarregar.
  const [concluidas, setConcluidas] = useState<{ id: string; pontos: number }[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const confirmacao = useRef<HTMLParagraphElement>(null);

  // Com cacheComponents o Next mantém esta tela viva (escondida) ao navegar
  // para outra rota; a limpeza do efeito roda quando ela é escondida, então a
  // visita seguinte começa do zero (sem "Rota concluída" ou aviso antigos).
  useEffect(
    () => () => {
      setConcluidas([]);
      setFeedback(null);
    },
    [],
  );

  // A parada coletada some da lista e leva o foco junto: leva o foco à
  // confirmação (que também é anunciada pela região viva abaixo).
  useEffect(() => {
    if (!feedback) return;
    const el = confirmacao.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: "center" });
  }, [feedback]);

  if (!catador) return <SemCatador />;

  const aceitos = estado.pedidos.filter(
    (p) => p.status === "aceito" && p.catadorId === catador.id,
  );
  const origem = catador.posicao;
  const rota = ordenarRota(
    origem,
    aceitos.map((p) => ({ id: p.id, ponto: p.ponto })),
  );
  const paradas = rota.ordem
    .map((id) => aceitos.find((p) => p.id === id))
    .filter((p): p is Pedido => Boolean(p));
  const percurso = trajeto([origem, ...paradas.map((p) => p.ponto)], ROTAS);
  const minutos = minutosDoTrajeto(percurso.segundos, paradas.length);

  function coletar(pedido: Pedido) {
    if (!catador) return;
    // Estado fresco: evita duplo envio e confere o que outra aba mudou.
    const antes = obterEstado().pedidos.find((p) => p.id === pedido.id);
    if (!antes || antes.status === "coletado") return;
    if (antes.status !== "aceito" || antes.catadorId !== catador.id) {
      setFeedback({ ok: false, texto: "Esta parada não está mais na sua rota." });
      return;
    }
    dispatch({
      type: "coletar",
      id: pedido.id,
      catadorId: catador.id,
      lancamentoId: novoId("l"),
      em: hora(new Date()),
    });
    // O reducer recusa, por exemplo, se o cadastro de quem pediu sumiu.
    const depois = obterEstado();
    const coletado = depois.pedidos.find((p) => p.id === pedido.id);
    if (coletado?.status !== "coletado") {
      setFeedback({
        ok: false,
        texto:
          "Não foi possível concluir esta parada: não encontramos o cadastro de quem pediu a coleta.",
      });
      return;
    }
    const pts = coletado.pontos ?? 0;
    setConcluidas((atual) => [...atual, { id: pedido.id, pontos: pts }]);
    setFeedback({
      ok: true,
      texto: `+${numero(pts)} pts para ${nomeDoSolicitante(depois, coletado)}`,
    });
  }

  const totalPontos = concluidas.reduce((soma, c) => soma + c.pontos, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-graphite">Sua rota</h1>
        <p className="mt-1 text-base text-text-muted">
          {paradas.length > 0
            ? "Siga a ordem numerada e marque cada parada como coletada. Mapa e distâncias de exemplo."
            : concluidas.length > 0
              ? "Todas as paradas desta rota foram coletadas."
              : "As paradas que você aceitar aparecem aqui, na melhor ordem."}
        </p>
      </div>

      {/* Região viva sempre montada: leitores de tela só anunciam texto que
          entra depois de montada. */}
      <div role="status" className="sr-only">
        {feedback?.texto}
      </div>
      {feedback && (
        <p
          ref={confirmacao}
          tabIndex={-1}
          className={`flex scroll-mt-20 items-center gap-2 rounded-lg p-4 text-base font-semibold focus:outline-3 focus:outline-offset-2 focus:outline-tech-blue ${
            feedback.ok ? "bg-mint-wash text-primary-strong" : "bg-danger/10 text-danger"
          }`}
        >
          <Icon nome={feedback.ok ? "check" : "x"} />
          {feedback.texto}
        </p>
      )}

      {paradas.length === 0 ? (
        <Card>
          {concluidas.length > 0 ? (
            <EmptyState
              icone="check"
              titulo="Rota concluída"
              texto={`${numero(concluidas.length)} ${
                concluidas.length === 1 ? "parada coletada" : "paradas coletadas"
              } e ${numero(totalPontos)} pts distribuídos (pontos de exemplo). Obrigado por fazer a cidade mais limpa.`}
              acao={
                <ButtonLink href="/catador" variante="primario">
                  Ver pedidos próximos
                </ButtonLink>
              }
            />
          ) : (
            <EmptyState
              icone="rota"
              titulo="Nenhuma rota ativa"
              texto="Escolha pedidos na lista e aceite para montar sua rota."
              acao={
                <ButtonLink href="/catador" variante="primario">
                  Ver pedidos próximos
                </ButtonLink>
              }
            />
          )}
        </Card>
      ) : (
        <>
          <Card className="flex flex-col gap-3">
            <MapaQuixada
              pedidos={paradas}
              rota={{ origem, ordem: rota.ordem }}
              rotulo={`Mapa da rota com ${paradas.length} ${
                paradas.length === 1 ? "parada" : "paradas"
              } numeradas`}
            />
            <p className="text-base font-semibold text-graphite">
              {resumoDaRota(paradas.length, percurso.distanciaM, minutos)}
            </p>
          </Card>

          <section aria-labelledby={`${uid}-paradas`} className="flex flex-col gap-4">
            <h2 id={`${uid}-paradas`} className="text-xl font-semibold text-graphite">
              Paradas
            </h2>
            <ol className="flex flex-col gap-3">
              {paradas.map((pedido, i) => {
                const pts = pontosDoPedido(
                  pedido.itens,
                  estado.materiais,
                  estado.destaque,
                );
                const proxima = i === 0;
                return (
                  <li key={pedido.id}>
                    <Card className="flex flex-col gap-3">
                      <div className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-tech-blue text-base font-bold text-white"
                        >
                          {i + 1}
                        </span>
                        <div className="flex min-w-0 flex-col gap-1">
                          <h3 className="text-lg font-semibold text-graphite">
                            <span className="sr-only">Parada {i + 1}: </span>
                            {pedido.endereco}
                          </h3>
                          <p className="text-sm text-text-muted">
                            {pedido.bairro}. {nomeDoSolicitante(estado, pedido)}
                          </p>
                          <p className="text-base text-graphite">
                            {descreverItens(estado, pedido)}
                          </p>
                          <p className="text-sm text-text-muted">
                            Retirada: {pedido.janela}
                          </p>
                          <p className="mt-1 flex flex-wrap gap-2">
                            <Chip tom="ok" icone="trofeu">
                              cerca de {numero(pts)} pts
                            </Chip>
                            {proxima && (
                              <Chip tom="ok" icone="caminhao">
                                Próxima parada
                              </Chip>
                            )}
                          </p>
                        </div>
                      </div>
                      {proxima ? (
                        <Button
                          variante="primario"
                          fullWidth
                          aria-label={`Coletado: parada ${i + 1}, ${pedido.endereco}`}
                          onClick={() => coletar(pedido)}
                        >
                          <Icon nome="check" />
                          Coletado
                        </Button>
                      ) : (
                        <p className="text-sm font-medium text-text-muted">
                          Depois da parada {i}
                        </p>
                      )}
                    </Card>
                  </li>
                );
              })}
            </ol>
          </section>
        </>
      )}
    </div>
  );
}
