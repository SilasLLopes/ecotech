"use client";

import { useEffect, useRef, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import { Stepper } from "@/components/ui/stepper";
import { hora, numero, pontos } from "@/lib/format";
import { PERFIS } from "@/lib/nav";
import { pontosDoPedido } from "@/lib/coleta";
import { novoId, useDispatch, useEstado } from "@/lib/store";
import type { ItemPedido, MaterialId, Pedido } from "@/lib/types";
import { SemSolicitante, useSolicitante, type PerfilMovel } from "./compartilhado";

const JANELAS = ["Manhã", "Tarde", "Noite"] as const;
type Janela = (typeof JANELAS)[number];

export function Coletar({ perfil }: { perfil: PerfilMovel }) {
  const estado = useEstado();
  const dispatch = useDispatch();
  const solicitante = useSolicitante(perfil);
  const raiz = PERFIS[perfil].raiz;
  const comercio = perfil === "comerciante";

  const [quantidades, setQuantidades] = useState<Partial<Record<MaterialId, number>>>({});
  const [janela, setJanela] = useState<Janela>("Manhã");
  const [enviado, setEnviado] = useState<{ pedido: Pedido; estimativa: number } | null>(
    null,
  );
  const enviando = useRef(false);
  const tituloConfirmacao = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (enviado) tituloConfirmacao.current?.focus();
  }, [enviado]);

  if (!solicitante) return <SemSolicitante />;

  const itens: ItemPedido[] = estado.materiais
    .filter((m) => (quantidades[m.id] ?? 0) > 0)
    .map((m) => ({ materialId: m.id, quantidade: quantidades[m.id] ?? 0 }));
  const estimativa = pontosDoPedido(itens, estado.materiais, estado.destaque);
  const vazio = itens.length === 0;

  function pedir() {
    if (!solicitante || vazio || enviando.current) return;
    enviando.current = true;
    const pedido: Pedido = {
      id: novoId("p"),
      solicitanteId: solicitante.id,
      itens,
      endereco: solicitante.endereco,
      bairro: solicitante.bairro,
      ponto: solicitante.ponto,
      janela,
      status: "aguardando",
      criadoEm: hora(new Date()),
    };
    dispatch({ type: "solicitar", pedido });
    setEnviado({ pedido, estimativa });
  }

  function novoPedido() {
    enviando.current = false;
    setQuantidades({});
    setEnviado(null);
  }

  if (enviado) {
    const { pedido } = enviado;
    return (
      <div className="flex flex-col gap-6">
        <Card as="section" aria-labelledby="confirmacao" className="flex flex-col gap-4">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-mint-wash text-primary-strong">
            <Icon nome="check" className="size-7" />
          </span>
          <h1
            id="confirmacao"
            ref={tituloConfirmacao}
            tabIndex={-1}
            className="text-2xl font-bold text-graphite focus:outline-none"
          >
            Pedido enviado!
          </h1>
          <p className="text-base text-text-muted">
            Um catador associado vai ver o seu pedido e pode aceitar a coleta.
          </p>
          <ul className="flex flex-col gap-1 text-base text-graphite">
            {pedido.itens.map((i) => {
              const m = estado.materiais.find((x) => x.id === i.materialId);
              return (
                <li key={i.materialId} className="flex justify-between gap-3">
                  <span>{m?.nome ?? "Material"}</span>
                  <span className="tabular-nums">
                    {numero(i.quantidade)} {m?.unidade}
                  </span>
                </li>
              );
            })}
          </ul>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-t border-border-soft pt-4 text-base">
            <dt className="text-text-muted">Retirada</dt>
            <dd className="text-graphite">{pedido.janela}</dd>
            <dt className="text-text-muted">Endereço</dt>
            <dd className="text-graphite">
              {pedido.endereco}, {pedido.bairro}
            </dd>
            <dt className="text-text-muted">Pontos</dt>
            <dd className="text-graphite">
              estimativa de {pontos(enviado.estimativa)}, confirmados na coleta
            </dd>
          </dl>
          <ButtonLink href={raiz} variante="primario" fullWidth>
            Acompanhar na tela inicial
          </ButtonLink>
          <Button variante="secundario" fullWidth onClick={novoPedido}>
            Fazer outro pedido
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-graphite">Pedir coleta</h1>
        <p className="mt-1 text-base text-text-muted">
          {comercio
            ? "Marque o material do seu comércio e escolha quando o catador pode retirar."
            : "Marque o que você tem para reciclar e escolha quando o catador pode retirar."}
        </p>
      </div>

      <Card as="section" aria-labelledby="materiais" className="flex flex-col gap-4">
        <h2 id="materiais" className="text-xl font-semibold text-graphite">
          O que você tem
        </h2>
        <ul className="divide-y divide-border-soft">
          {estado.materiais.map((m) => {
            const quantidade = quantidades[m.id] ?? 0;
            const destaque = m.id === estado.destaque.materialId;
            const porUnidade = pontosDoPedido(
              [{ materialId: m.id, quantidade: 1 }],
              estado.materiais,
              estado.destaque,
            );
            const estimativaItem = pontosDoPedido(
              [{ materialId: m.id, quantidade }],
              estado.materiais,
              estado.destaque,
            );
            return (
              <li key={m.id} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
                <Stepper
                  rotulo={m.nome}
                  valor={quantidade}
                  unidade={m.unidade}
                  onChange={(valor) =>
                    setQuantidades((atual) => ({ ...atual, [m.id]: valor }))
                  }
                />
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
                    {destaque && <Chip tom="ok" icone="trofeu">Em destaque</Chip>}
                    <span>
                      cerca de {pontos(porUnidade)} por {m.unidade}
                    </span>
                  </p>
                  {quantidade > 0 && (
                    <p className="text-sm font-semibold tabular-nums text-graphite">
                      estimativa: {pontos(estimativaItem)}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card as="section" aria-labelledby="endereco" className="flex flex-col gap-2">
        <h2 id="endereco" className="text-xl font-semibold text-graphite">
          Endereço da retirada
        </h2>
        <p className="flex items-start gap-2 text-base text-graphite">
          <Icon nome="pino" className="mt-0.5 size-5 text-primary-strong" />
          <span>
            {solicitante.endereco}
            <br />
            <span className="text-text-muted">{solicitante.bairro}, Quixadá</span>
          </span>
        </p>
        <p className="text-sm text-text-muted">
          Endereço de exemplo, preenchido pelo protótipo.
        </p>
      </Card>

      <Card as="section" className="flex flex-col gap-3">
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-xl font-semibold text-graphite">
            Janela de retirada
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {JANELAS.map((j) => {
              const marcada = janela === j;
              return (
                <label
                  key={j}
                  className={`flex min-h-11 cursor-pointer items-center justify-center gap-1 rounded-md border-[1.5px] px-2 text-base font-semibold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-tech-blue ${
                    marcada
                      ? "border-primary-strong bg-mint-wash text-primary-strong"
                      : "border-border-soft bg-white text-graphite"
                  }`}
                >
                  <input
                    type="radio"
                    name="janela"
                    value={j}
                    checked={marcada}
                    onChange={() => setJanela(j)}
                    className="sr-only"
                  />
                  {marcada && <Icon nome="check" className="size-4" />}
                  {j}
                </label>
              );
            })}
          </div>
        </fieldset>
      </Card>

      <div className="flex flex-col gap-3">
        <p aria-live="polite" className="text-base text-graphite">
          Estimativa:{" "}
          <strong className="font-bold tabular-nums">{pontos(estimativa)}</strong>
          <span className="text-text-muted">
            {" "}
            (os pontos finais saem na coleta; valores de exemplo)
          </span>
        </p>
        <Button
          variante="primario"
          grande
          fullWidth
          disabled={vazio}
          aria-describedby={vazio ? "motivo-pedir" : undefined}
          onClick={pedir}
        >
          Pedir coleta
        </Button>
        {vazio && (
          <p id="motivo-pedir" className="text-sm text-text-muted">
            Marque a quantidade de pelo menos um material para pedir a coleta.
          </p>
        )}
      </div>
    </div>
  );
}
