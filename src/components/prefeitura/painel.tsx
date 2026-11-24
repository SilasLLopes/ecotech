"use client";

import { useId } from "react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Chip, type TomChip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon, type IconeNome } from "@/components/ui/icon";
import { COLETAS_POR_SEMANA } from "@/data/seed";
import { dataBR, numero } from "@/lib/format";
import { useEstado } from "@/lib/store";
import type { Estado, Pedido, StatusPedido } from "@/lib/types";
import {
  descreverItens,
  formatarEm,
  nomeDoSolicitante,
} from "@/components/cidadao/compartilhado";
import { Tabela, type Coluna } from "./tabela";

const STATUS: Record<StatusPedido, { rotulo: string; tom: TomChip; icone: IconeNome }> = {
  aguardando: { rotulo: "Aguardando", tom: "aviso", icone: "relogio" },
  aceito: { rotulo: "Aceito", tom: "neutro", icone: "caminhao" },
  coletado: { rotulo: "Coletado", tom: "ok", icone: "check" },
  cancelado: { rotulo: "Cancelado", tom: "erro", icone: "x" },
};

// Indicadores calculados do estado. Quantidades ficam separadas por unidade:
// kg, L e itens não se somam.
function indicadores(estado: Estado) {
  const coletados = estado.pedidos.filter((p) => p.status === "coletado");
  const total = { kg: 0, L: 0, un: 0 };
  for (const pedido of coletados) {
    for (const item of pedido.itens) {
      const unidade = estado.materiais.find((m) => m.id === item.materialId)?.unidade;
      if (unidade) total[unidade] += item.quantidade;
    }
  }
  return {
    coletas: coletados.length,
    total,
    pontos: coletados.reduce((soma, p) => soma + (p.pontos ?? 0), 0),
    cupons: estado.resgates.length,
    aguardando: estado.pedidos.filter((p) => p.status === "aguardando").length,
  };
}

function Indicador({
  icone,
  rotulo,
  valor,
  detalhe,
}: {
  icone: IconeNome;
  rotulo: string;
  valor: string;
  detalhe?: string;
}) {
  return (
    <Card as="li" className="flex flex-col gap-3">
      <span className="inline-flex size-10 items-center justify-center rounded-full bg-mint-wash text-primary-strong">
        <Icon nome={icone} />
      </span>
      <div>
        <p className="text-sm text-text-muted">{rotulo}</p>
        <p className="text-3xl font-extrabold tabular-nums text-graphite">{valor}</p>
        {detalhe && <p className="mt-1 text-sm text-text-muted">{detalhe}</p>}
      </div>
    </Card>
  );
}

// Gráfico de barras da série de exemplo. A tabela equivalente fica logo abaixo.
function GraficoColetas() {
  const largura = 320;
  const altura = 186;
  const esquerda = 28;
  const direita = 312;
  const topo = 16;
  const base = 164;
  const maximo = Math.max(...COLETAS_POR_SEMANA.map((s) => s.coletas));
  const escala = Math.max(10, Math.ceil(maximo / 10) * 10);
  const grades = [0, 1, 2, 3, 4].map((i) => (escala * i) / 4);
  const faixa = (direita - esquerda) / COLETAS_POR_SEMANA.length;
  const larguraBarra = 22;
  const y = (v: number) => base - (v / escala) * (base - topo);
  const primeira = COLETAS_POR_SEMANA[0];
  const ultima = COLETAS_POR_SEMANA[COLETAS_POR_SEMANA.length - 1];
  const resumo = `Gráfico de barras, dados de exemplo: coletas por semana, de ${primeira.coletas} na semana de ${primeira.semana} a ${ultima.coletas} na semana de ${ultima.semana}. Os valores estão na tabela abaixo.`;
  return (
    <svg
      viewBox={`0 0 ${largura} ${altura}`}
      role="img"
      aria-label={resumo}
      className="h-auto w-full max-w-lg"
    >
      {grades.map((g) => (
        <g key={g}>
          <line
            x1={esquerda}
            x2={direita}
            y1={y(g)}
            y2={y(g)}
            strokeWidth={1}
            className="stroke-border-soft"
          />
          <text x={esquerda - 6} y={y(g) + 4} textAnchor="end" fontSize={11} className="fill-text-muted">
            {g}
          </text>
        </g>
      ))}
      {COLETAS_POR_SEMANA.map((s, i) => {
        const x = esquerda + faixa * i + (faixa - larguraBarra) / 2;
        const centro = x + larguraBarra / 2;
        return (
          <g key={s.semana}>
            <rect
              x={x}
              y={y(s.coletas)}
              width={larguraBarra}
              height={base - y(s.coletas)}
              rx={3}
              className="fill-primary"
            />
            <text
              x={centro}
              y={y(s.coletas) - 4}
              textAnchor="middle"
              fontSize={11}
              fontWeight={700}
              className="fill-graphite"
            >
              {s.coletas}
            </text>
            <text x={centro} y={base + 16} textAnchor="middle" fontSize={11} className="fill-text-muted">
              {s.semana}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const COLUNAS_SEMANA: Coluna<(typeof COLETAS_POR_SEMANA)[number]>[] = [
  { id: "semana", rotulo: "Semana de", celula: (s) => s.semana },
  { id: "coletas", rotulo: "Coletas", numerica: true, celula: (s) => numero(s.coletas) },
];

function Secao({
  id,
  titulo,
  children,
}: {
  id: string;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <h2 id={id} className="text-xl font-semibold text-graphite">
        {titulo}
      </h2>
      {children}
    </section>
  );
}

export function Painel() {
  const estado = useEstado();
  const uid = useId();
  const k = indicadores(estado);
  const recentes = estado.pedidos.slice().reverse().slice(0, 6);
  const colunasCatadores: Coluna<Estado["catadores"][number]>[] = [
    { id: "nome", rotulo: "Catador", celula: (c) => c.nome },
    { id: "desde", rotulo: "Associado desde", celula: (c) => dataBR(c.associadoEm) },
    { id: "coletas", rotulo: "Coletas", numerica: true, celula: (c) => numero(c.coletas) },
  ];
  const colunasPedidos: Coluna<Pedido>[] = [
    { id: "quem", rotulo: "Solicitante", celula: (p) => nomeDoSolicitante(estado, p) },
    { id: "itens", rotulo: "Material", celula: (p) => descreverItens(estado, p) },
    { id: "bairro", rotulo: "Bairro", celula: (p) => p.bairro },
    {
      id: "status",
      rotulo: "Situação",
      celula: (p) => {
        const s = STATUS[p.status];
        return (
          <Chip tom={s.tom} icone={s.icone}>
            {s.rotulo}
          </Chip>
        );
      },
    },
    { id: "em", rotulo: "Pedido em", celula: (p) => formatarEm(p.criadoEm) },
  ];
  const extras = [
    k.total.L > 0 ? `${numero(k.total.L)} L` : null,
    k.total.un > 0 ? `${numero(k.total.un)} ${k.total.un === 1 ? "item" : "itens"}` : null,
  ].filter(Boolean);

  return (
    <div className="flex w-full max-w-6xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-graphite">Painel da Prefeitura</h1>
        <p className="mt-1 text-base text-text-muted">
          Visão geral da coleta na cidade. Dados de exemplo.
        </p>
      </div>

      <section aria-labelledby={`${uid}-indicadores`}>
        <h2 id={`${uid}-indicadores`} className="sr-only">
          Indicadores
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Indicador icone="caminhao" rotulo="Coletas concluídas" valor={numero(k.coletas)} />
          <Indicador
            icone="folha"
            rotulo="Material coletado"
            valor={`${numero(k.total.kg)} kg`}
            detalhe={extras.length > 0 ? `Mais ${extras.join(" e ")}` : undefined}
          />
          <Indicador icone="trofeu" rotulo="Pontos distribuídos" valor={numero(k.pontos)} />
          <Indicador icone="presente" rotulo="Cupons resgatados" valor={numero(k.cupons)} />
          <Indicador icone="relogio" rotulo="Aguardando coleta" valor={numero(k.aguardando)} />
        </ul>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <Secao id={`${uid}-grafico`} titulo="Coletas por semana (exemplo)">
          <Card className="flex flex-col gap-4">
            <p className="text-sm text-text-muted">
              Série de exemplo, não vem das coletas do app.
            </p>
            <GraficoColetas />
            <details className="group">
              <summary className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md text-sm font-semibold text-primary-strong focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-tech-blue">
                <Icon nome="chevron" className="size-4 -rotate-90 group-open:rotate-0" />
                Ver os valores em tabela
              </summary>
              <div className="mt-3">
                <Tabela
                  legenda="Coletas por semana (exemplo)"
                  colunas={COLUNAS_SEMANA}
                  linhas={COLETAS_POR_SEMANA}
                  chave={(s) => s.semana}
                  titulo="semana"
                />
              </div>
            </details>
          </Card>
        </Secao>

        <Secao id={`${uid}-catadores`} titulo="Catadores associados">
          <p className="flex items-start gap-2 rounded-lg bg-mint-wash p-3 text-sm text-graphite">
            <Icon nome="pessoas" className="mt-0.5 size-4 text-primary-strong" />
            Só catadores associados pela Prefeitura acessam o app.
          </p>
          {estado.catadores.length === 0 ? (
            <Card>
              <EmptyState
                icone="pessoas"
                titulo="Nenhum catador associado"
                texto="Quando a Prefeitura associar catadores, eles aparecem aqui."
              />
            </Card>
          ) : (
            <Tabela
              legenda="Catadores associados (exemplo)"
              colunas={colunasCatadores}
              linhas={estado.catadores}
              chave={(c) => c.id}
              titulo="nome"
            />
          )}
        </Secao>
      </div>

      <Secao id={`${uid}-recentes`} titulo="Pedidos recentes">
        {recentes.length === 0 ? (
          <Card>
            <EmptyState
              icone="pino"
              titulo="Nenhum pedido ainda"
              texto="Quando alguém pedir uma coleta, o pedido aparece aqui."
            />
          </Card>
        ) : (
          <Tabela
            legenda="Pedidos recentes (exemplo)"
            colunas={colunasPedidos}
            linhas={recentes}
            chave={(p) => p.id}
            titulo="quem"
          />
        )}
      </Secao>
    </div>
  );
}
