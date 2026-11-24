"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { hora, numero } from "@/lib/format";
import { novoId, obterEstado, useDispatch, useEstado } from "@/lib/store";
import {
  CartaoSaldo,
  formatarEm,
  SemSolicitante,
  useSolicitante,
  type PerfilMovel,
} from "./compartilhado";

// Código do cupom: 6 caracteres maiúsculos derivados do id do resgate.
function codigoDoResgate(id: string): string {
  return id.replace(/[^a-z0-9]/gi, "").slice(-6).toUpperCase();
}

// Depois de um resgate, ignora cliques por um instante (duplo clique). É uma
// guarda em ref, não estado: nunca deixa os botões presos.
const TRAVA_MS = 800;

type Resultado = { ok: boolean; id: string; codigo: string };

export function Recompensas({ perfil }: { perfil: PerfilMovel }) {
  const estado = useEstado();
  const uid = useId();
  const dispatch = useDispatch();
  const solicitante = useSolicitante(perfil);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const travado = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confirmacao = useRef<HTMLParagraphElement>(null);

  // Com cacheComponents o Next mantém esta tela viva (escondida) ao navegar; a
  // limpeza roda quando ela é escondida, então a volta não traz o aviso antigo
  // nem puxa o foco para ele, e não deixa a guarda de duplo clique ligada.
  useLayoutEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
      travado.current = false;
      setResultado(null);
    },
    [],
  );

  // Depois de resgatar (ou de ser recusado), leva o foco e a tela até o aviso:
  // com a grade em coluna única ele fica fora da área visível.
  useEffect(() => {
    if (!resultado) return;
    const el = confirmacao.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: "center" });
  }, [resultado]);

  if (!solicitante) return <SemSolicitante />;

  const beneficios = estado.beneficios.filter((b) => b.ativo);
  const cupons = estado.resgates
    .filter((r) => r.solicitanteId === solicitante.id)
    .slice()
    .reverse();

  function resgatar(beneficioId: string) {
    if (!solicitante || travado.current) return;
    travado.current = true;
    timer.current = setTimeout(() => {
      travado.current = false;
      timer.current = null;
    }, TRAVA_MS);
    const id = novoId("r");
    const codigo = codigoDoResgate(id);
    dispatch({
      type: "resgatar",
      id,
      solicitanteId: solicitante.id,
      beneficioId,
      codigo,
      em: hora(new Date()),
    });
    // O reducer pode recusar (estoque ou saldo mudaram em outra aba): confere
    // no estado fresco, na hora do clique.
    const feito = obterEstado().resgates.some((r) => r.id === id);
    setResultado({ ok: feito, id, codigo });
  }

  // Se os dados de exemplo foram reiniciados, o cupom do aviso não existe mais.
  const aviso =
    resultado && (!resultado.ok || estado.resgates.some((r) => r.id === resultado.id))
      ? resultado
      : null;
  const feito = aviso?.ok ?? false;
  const mensagem = aviso
    ? aviso.ok
      ? `Cupom resgatado! Seu código é ${aviso.codigo}.`
      : "Não foi possível resgatar agora. Confira o saldo e tente de novo."
    : null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-graphite">Recompensas</h1>

      <CartaoSaldo saldo={solicitante.saldo} comercio={perfil === "comerciante"} />

      {/* Região viva sempre montada: leitores de tela só anunciam texto que
          entra depois de montada. */}
      <div role="status" className="sr-only">
        {mensagem}
      </div>
      {mensagem && (
        <p
          ref={confirmacao}
          tabIndex={-1}
          className={`flex scroll-mt-20 items-center gap-2 rounded-lg p-4 text-base font-semibold focus:outline-3 focus:outline-offset-2 focus:outline-tech-blue ${
            feito ? "bg-mint-wash text-primary-strong" : "bg-danger/10 text-danger"
          }`}
        >
          <Icon nome={feito ? "check" : "x"} />
          {mensagem}
        </p>
      )}

      {beneficios.length === 0 ? (
        <Card>
          <EmptyState
            icone="presente"
            titulo="Nenhum benefício disponível agora"
            texto="A Prefeitura e os comércios da cidade vão adicionar novidades. Volte em breve."
          />
        </Card>
      ) : (
        <section aria-labelledby={`${uid}-beneficios`} className="flex flex-col gap-4">
          <h2 id={`${uid}-beneficios`} className="text-xl font-semibold text-graphite">
            Benefícios para trocar
          </h2>
          <p className="-mt-2 text-sm text-text-muted">
            Benefícios e pontos de exemplo.
          </p>
          <ul className="grid gap-4 sm:grid-cols-2">
            {beneficios.map((b) => {
              const falta = b.custo - solicitante.saldo;
              const esgotado = b.estoque <= 0;
              const semSaldo = falta > 0;
              const motivo = esgotado
                ? "Esgotado por enquanto."
                : semSaldo
                  ? `Faltam ${numero(falta)} pts. Cada coleta aproxima você.`
                  : null;
              return (
                <li key={b.id}>
                  <Card className="flex h-full flex-col gap-3">
                    <div>
                      <p className="text-sm text-text-muted">{b.comercio}</p>
                      <h3 className="text-lg font-semibold text-graphite">
                        {b.titulo}
                      </h3>
                    </div>
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-base">
                      <span className="font-bold tabular-nums text-primary-strong">
                        {numero(b.custo)} pts
                      </span>
                      {esgotado ? (
                        <Chip tom="erro" icone="x">
                          Esgotado
                        </Chip>
                      ) : (
                        <span className="text-sm text-text-muted">
                          Restam {numero(b.estoque)}
                        </span>
                      )}
                    </p>
                    <div className="mt-auto flex flex-col gap-2">
                      <Button
                        variante="primario"
                        fullWidth
                        disabled={Boolean(motivo)}
                        aria-describedby={motivo ? `${uid}-motivo-${b.id}` : undefined}
                        onClick={() => resgatar(b.id)}
                      >
                        Resgatar
                      </Button>
                      {motivo && (
                        <p id={`${uid}-motivo-${b.id}`} className="text-sm text-text-muted">
                          {motivo}
                        </p>
                      )}
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {cupons.length === 0 ? (
        <Card>
          <EmptyState
            icone="presente"
            titulo="Você ainda não tem cupons"
            texto="Quando você resgatar um benefício, o código aparece aqui para mostrar no comércio."
          />
        </Card>
      ) : (
        <section aria-labelledby={`${uid}-cupons`} className="flex flex-col gap-4">
          <h2 id={`${uid}-cupons`} className="text-xl font-semibold text-graphite">
            Meus cupons
          </h2>
          <ul className="flex flex-col gap-3">
            {cupons.map((r) => {
              const b = estado.beneficios.find((x) => x.id === r.beneficioId);
              return (
                <li key={r.id}>
                  <Card className="flex flex-col gap-2">
                    <p className="text-sm text-text-muted">
                      {b?.comercio ?? "Comércio parceiro"} · {formatarEm(r.em)}
                    </p>
                    <p className="text-base font-semibold text-graphite">
                      {b?.titulo ?? "Benefício resgatado"}
                    </p>
                    <p className="text-sm text-text-muted">Código do cupom</p>
                    <p className="text-2xl font-extrabold tracking-widest tabular-nums text-primary-strong">
                      {r.codigo}
                    </p>
                  </Card>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
