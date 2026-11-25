"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Monolitos } from "@/components/brand/monolitos";
import { Contador } from "@/components/ui/contador";
import { Icon } from "@/components/ui/icon";
import { Revelar } from "@/components/ui/revelar";
import { DEMO } from "@/data/seed";
import { numero } from "@/lib/format";
import { PERFIS } from "@/lib/nav";
import { distanciaM } from "@/lib/route";
import { useEstado } from "@/lib/store";

const FOCO =
  "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-tech-blue";

// Entrada da demonstração: os quatro perfis como painéis com prévia viva dos
// dados de exemplo, cada um com a sua cara (não quatro cartões iguais).
export function Apresentacao() {
  const estado = useEstado();
  const ana = estado.solicitantes.find((s) => s.id === DEMO.cidadao);
  const catador = estado.catadores.find((c) => c.id === DEMO.catador);
  const ativosAna = estado.pedidos.filter(
    (p) => p.solicitanteId === DEMO.cidadao && (p.status === "aguardando" || p.status === "aceito"),
  ).length;
  const aguardando = estado.pedidos.filter((p) => p.status === "aguardando");
  const maisPerto = catador
    ? Math.min(...aguardando.map((p) => distanciaM(catador.posicao, p.ponto)), Infinity)
    : Infinity;
  const coletas = estado.pedidos.filter((p) => p.status === "coletado").length;
  const beneficiosComercio = estado.beneficios.filter((b) => b.ativo && b.publico === "comerciante").length;
  const destaque = estado.materiais.find((m) => m.id === estado.destaque.materialId);

  return (
    <ul className="grid gap-4 lg:grid-cols-5">
      <Revelar as="li" indice={0} className="lg:col-span-3">
        <Painel
          href={PERFIS.cidadao.raiz}
          nome="Cidadão"
          className="min-h-56 bg-reward text-white shadow-raised"
          seta="text-primary-soft"
          fundo={<Monolitos className="absolute inset-x-0 bottom-0 h-28 text-primary-soft opacity-30" />}
        >
          <p className="text-base text-white/85">Avise quando tiver material e junte pontos.</p>
          <p className="mt-auto flex items-baseline gap-2 pt-6">
            <Contador valor={ana?.saldo ?? 0} className="text-5xl font-extrabold" />
            <span className="text-lg font-semibold text-primary-soft">pts</span>
          </p>
          <p className="text-sm text-white/85">
            Saldo de exemplo · {ativosAna === 0 ? "nenhuma coleta em andamento" : `${ativosAna} ${ativosAna === 1 ? "coleta em andamento" : "coletas em andamento"}`}
          </p>
        </Painel>
      </Revelar>

      <Revelar as="li" indice={1} className="lg:col-span-2">
        <Painel href={PERFIS.catador.raiz} nome="Catador" className="min-h-56 border border-border-soft bg-white shadow-card" seta="text-primary-strong">
          <svg viewBox="0 0 140 56" aria-hidden="true" focusable="false" className="absolute right-4 top-5 h-14 w-36">
            <path d="M6 44C28 44 30 18 56 20S88 46 112 26" fill="none" strokeWidth="4" strokeLinecap="round" className="stroke-tech-blue" />
            <circle cx="6" cy="44" r="5" className="fill-tech-blue" />
            <circle cx="56" cy="20" r="6" className="fill-primary-strong" />
            <circle cx="112" cy="26" r="6" className="fill-primary-strong" />
          </svg>
          <p className="max-w-48 text-base text-text-muted">Faça a coleta pela melhor rota.</p>
          <p className="mt-auto pt-6 text-3xl font-extrabold tabular-nums text-graphite">
            {numero(aguardando.length)}
            <span className="ml-2 text-base font-semibold text-text-muted">
              {aguardando.length === 1 ? "pedido aguardando" : "pedidos aguardando"}
            </span>
          </p>
          <p className="text-sm text-text-muted">
            {Number.isFinite(maisPerto)
              ? `O mais perto está a ~${numero(Math.round(maisPerto / 10) * 10)} m de você (exemplo)`
              : "Nenhum pedido por perto agora"}
          </p>
        </Painel>
      </Revelar>

      <Revelar as="li" indice={2} className="lg:col-span-2">
        <Painel href={PERFIS.comerciante.raiz} nome="Comerciante" className="min-h-48 bg-mint-wash" seta="text-primary-strong">
          <p className="max-w-56 text-base text-graphite">Marque o material do comércio e conquiste benefícios da Prefeitura.</p>
          <p className="mt-auto flex items-center gap-2 pt-5 text-base font-semibold text-primary-strong">
            <Icon nome="presente" />
            {numero(beneficiosComercio)} benefícios no programa
          </p>
        </Painel>
      </Revelar>

      <Revelar as="li" indice={3} className="lg:col-span-3">
        <Painel href={PERFIS.prefeitura.raiz} nome="Prefeitura" className="min-h-48 border border-border-soft bg-white shadow-card" seta="text-primary-strong">
          <div aria-hidden="true" className="absolute bottom-5 right-5 flex h-14 items-end gap-1.5">
            {[18, 26, 22, 34, 30, 46].map((h, i) => (
              <span key={i} style={{ height: h, "--i": i } as React.CSSProperties} className="cresce-y w-3 rounded-t-sm bg-primary" />
            ))}
          </div>
          <p className="max-w-56 text-base text-text-muted">Acompanhe a coleta da cidade e guie o rodízio.</p>
          <p className="mt-auto pt-5 text-3xl font-extrabold tabular-nums text-graphite">
            {numero(coletas)}
            <span className="ml-2 text-base font-semibold text-text-muted">{coletas === 1 ? "coleta concluída" : "coletas concluídas"}</span>
          </p>
          <p className="text-sm text-text-muted">
            Em destaque: {destaque?.nome ?? "—"} ×{estado.destaque.multiplicador.toLocaleString("pt-BR")}
          </p>
        </Painel>
      </Revelar>
    </ul>
  );
}

function Painel({
  href,
  nome,
  className,
  seta,
  fundo,
  children,
}: {
  href: string;
  nome: string;
  className: string;
  seta: string;
  fundo?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex h-full flex-col overflow-hidden rounded-xl p-6 transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transform-none ${FOCO} ${className}`}
    >
      {fundo}
      <span className="relative flex items-center justify-between gap-3">
        <span className="text-xl font-bold">{nome}</span>
        <Icon nome="seta" className={`${seta} transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none`} />
      </span>
      <span className="relative mt-2 flex flex-1 flex-col">{children}</span>
    </Link>
  );
}
