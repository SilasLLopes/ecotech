"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip, type TomChip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon, type IconeNome } from "@/components/ui/icon";
import { dataBR, numero } from "@/lib/format";
import { novoId, useDispatch, useEstado } from "@/lib/store";
import type { Anuncio, Estado, Evento } from "@/lib/types";
import { Campo, focarPrimeiroErro } from "@/components/ui/campo";

type Valores = { titulo: string; data: string; local: string; descricao: string };
type Erros = Partial<Record<keyof Valores, string>>;
type Aviso = { texto: string; foco: "aviso" | "anuncio" | null; anuncioId?: string };

const VAZIO: Valores = { titulo: "", data: "", local: "", descricao: "" };
const CAMPOS = ["titulo", "data", "local", "descricao"] as const;

const STATUS: Record<
  Anuncio["status"],
  { rotulo: string; tom: TomChip; icone: IconeNome }
> = {
  "em-analise": { rotulo: "Em análise", tom: "aviso", icone: "relogio" },
  aprovado: { rotulo: "Aprovado", tom: "ok", icone: "check" },
  recusado: { rotulo: "Recusado", tom: "erro", icone: "x" },
};

function validar(v: Valores): Erros {
  const erros: Erros = {};
  if (!v.titulo.trim()) erros.titulo = "Informe o título do evento.";
  if (!v.data) erros.data = "Escolha a data do evento.";
  if (!v.local.trim()) erros.local = "Informe onde o evento acontece.";
  if (!v.descricao.trim()) erros.descricao = "Escreva uma descrição curta.";
  return erros;
}

function nomeDoComercio(estado: Estado, a: Anuncio): string {
  return (
    estado.solicitantes.find((s) => s.id === a.solicitanteId)?.nome ??
    "Comércio sem cadastro"
  );
}

export function Eventos() {
  const estado = useEstado();
  const dispatch = useDispatch();
  const uid = useId();
  const [valores, setValores] = useState<Valores>(VAZIO);
  const [erros, setErros] = useState<Erros>({});
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const avisoRef = useRef<HTMLParagraphElement>(null);

  // Com cacheComponents o Next mantém esta tela viva (escondida) ao navegar
  // para outra rota; a limpeza roda ao esconder, então formulário, erros e
  // aviso voltam limpos na próxima visita.
  useEffect(
    () => () => {
      setValores(VAZIO);
      setErros({});
      setAviso(null);
    },
    [],
  );

  // Foco depois de uma ação que muda a tela: no aviso (evento criado) ou no
  // anúncio decidido (os botões dele somem ou mudam).
  useEffect(() => {
    if (!aviso?.foco) return;
    if (aviso.foco === "aviso") {
      const el = avisoRef.current;
      el?.focus({ preventScroll: true });
      el?.scrollIntoView({ block: "center" });
    } else {
      const el = document.getElementById(`${uid}-anuncio-${aviso.anuncioId}`);
      el?.focus({ preventScroll: true });
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [aviso, uid]);

  const ids = {
    titulo: `${uid}-titulo`,
    data: `${uid}-data`,
    local: `${uid}-local`,
    descricao: `${uid}-descricao`,
  };

  function editar(campo: keyof Valores, valor: string) {
    setValores((v) => ({ ...v, [campo]: valor }));
    setErros((e) => ({ ...e, [campo]: undefined }));
    setAviso(null);
  }

  function criar(e: FormEvent) {
    e.preventDefault();
    const achados = validar(valores);
    setErros(achados);
    const invalidos = CAMPOS.filter((c) => achados[c]);
    if (invalidos.length > 0) {
      setAviso(null);
      focarPrimeiroErro(invalidos.map((c) => ids[c]));
      return;
    }
    const evento: Evento = {
      id: novoId("e"),
      titulo: valores.titulo.trim(),
      data: valores.data,
      local: valores.local.trim(),
      descricao: valores.descricao.trim(),
    };
    dispatch({ type: "criar-evento", evento });
    setValores(VAZIO);
    setAviso({
      texto: `Evento criado: ${evento.titulo}, em ${dataBR(evento.data)}.`,
      foco: "aviso",
    });
  }

  function decidir(a: Anuncio, aprovado: boolean) {
    dispatch({ type: "decidir-anuncio", id: a.id, aprovado });
    setAviso({
      texto: `Anúncio ${aprovado ? "aprovado" : "recusado"}: ${a.titulo}.`,
      foco: "anuncio",
      anuncioId: a.id,
    });
  }

  function listaDeAnuncios(lista: Anuncio[]) {
    return (
      <ul className="flex flex-col gap-3">
        {lista.map((a) => {
          const s = STATUS[a.status];
          return (
            <li key={a.id} className="rounded-lg border border-border-soft bg-mint-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm text-text-muted">{nomeDoComercio(estado, a)}</p>
                  <h4
                    id={`${uid}-anuncio-${a.id}`}
                    tabIndex={-1}
                    className="text-base font-semibold text-graphite focus:outline-3 focus:outline-offset-2 focus:outline-tech-blue"
                  >
                    {a.titulo}
                  </h4>
                </div>
                <Chip tom={s.tom} icone={s.icone}>
                  {s.rotulo}
                </Chip>
              </div>
              <p className="mt-1 text-base text-graphite">{a.oferta}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {a.status !== "aprovado" && (
                  <Button
                    variante="primario"
                    aria-label={`Aprovar anúncio ${a.titulo}`}
                    onClick={() => decidir(a, true)}
                  >
                    Aprovar
                  </Button>
                )}
                {a.status !== "recusado" && (
                  <Button
                    variante="secundario"
                    aria-label={`Recusar anúncio ${a.titulo}`}
                    onClick={() => decidir(a, false)}
                  >
                    Recusar
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  const eventos = estado.eventos.slice().sort((a, b) => a.data.localeCompare(b.data));
  const idsEventos = new Set(estado.eventos.map((e) => e.id));
  const soltos = estado.anuncios.filter((a) => !idsEventos.has(a.eventoId));
  const analise = estado.anuncios.filter((a) => a.status === "em-analise").length;

  return (
    <div className="flex w-full max-w-6xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-graphite">Eventos e anúncios</h1>
        <p className="mt-1 text-base text-text-muted">
          Crie eventos da cidade e decida quais anúncios dos comércios entram.
          Dados de exemplo.
        </p>
      </div>

      {/* Região viva sempre montada: leitores de tela só anunciam texto que
          entra depois de montada. */}
      <div role="status" className="sr-only">
        {aviso?.texto}
      </div>
      {aviso && (
        <p
          ref={avisoRef}
          tabIndex={aviso.foco === "aviso" ? -1 : undefined}
          className="flex scroll-mt-20 items-start gap-2 rounded-lg bg-mint-wash p-4 text-base font-semibold text-primary-strong focus:outline-3 focus:outline-offset-2 focus:outline-tech-blue"
        >
          <Icon nome="check" className="mt-0.5" />
          {aviso.texto}
        </p>
      )}

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_24rem]">
        <section aria-labelledby={`${uid}-lista`} className="flex flex-col gap-4">
          <h2 id={`${uid}-lista`} className="text-xl font-semibold text-graphite">
            Eventos ({numero(eventos.length)})
          </h2>
          <p className="-mt-2 text-sm text-text-muted">
            {analise === 0
              ? "Nenhum anúncio esperando decisão."
              : `${numero(analise)} ${analise === 1 ? "anúncio espera" : "anúncios esperam"} decisão.`}
          </p>
          {eventos.length === 0 ? (
            <Card>
              <EmptyState
                icone="calendario"
                titulo="Nenhum evento cadastrado"
                texto="Crie o primeiro evento no formulário ao lado ou abaixo."
              />
            </Card>
          ) : (
            <ul className="flex flex-col gap-4">
              {eventos.map((ev) => {
                const doEvento = estado.anuncios.filter((a) => a.eventoId === ev.id);
                return (
                  <li key={ev.id}>
                    <Card as="article" className="flex flex-col gap-3">
                      <div>
                        <p className="flex items-center gap-2 text-sm font-semibold text-primary-strong">
                          <Icon nome="calendario" tamanho="sm" />
                          {dataBR(ev.data)}
                        </p>
                        <h3 className="text-lg font-semibold text-graphite">{ev.titulo}</h3>
                        <p className="text-sm text-text-muted">{ev.local}</p>
                      </div>
                      <p className="text-base text-graphite">{ev.descricao}</p>
                      <div className="flex flex-col gap-3 border-t border-border-soft pt-3">
                        <p className="text-sm font-semibold text-graphite">
                          Anúncios recebidos ({numero(doEvento.length)})
                        </p>
                        {doEvento.length === 0 ? (
                          <p className="text-sm text-text-muted">
                            Nenhum comércio enviou anúncio para este evento ainda.
                          </p>
                        ) : (
                          listaDeAnuncios(doEvento)
                        )}
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}

          {soltos.length > 0 && (
            <Card className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold text-graphite">
                Anúncios de eventos que não existem mais
              </h3>
              {listaDeAnuncios(soltos)}
            </Card>
          )}
        </section>

        <section aria-labelledby={`${uid}-novo`}>
          <Card as="form" noValidate onSubmit={criar} className="flex flex-col gap-4">
            <h2 id={`${uid}-novo`} className="text-xl font-semibold text-graphite">
              Novo evento
            </h2>
            <p className="text-sm text-text-muted">Todos os campos são obrigatórios.</p>
            <Campo
              id={ids.titulo}
              rotulo="Título"
              valor={valores.titulo}
              onChange={(v) => editar("titulo", v)}
              erro={erros.titulo}
            />
            <Campo
              id={ids.data}
              rotulo="Data"
              type="date"
              valor={valores.data}
              onChange={(v) => editar("data", v)}
              erro={erros.data}
            />
            <Campo
              id={ids.local}
              rotulo="Local"
              valor={valores.local}
              onChange={(v) => editar("local", v)}
              erro={erros.local}
            />
            <Campo
              id={ids.descricao}
              rotulo="Descrição"
              multilinha
              valor={valores.descricao}
              onChange={(v) => editar("descricao", v)}
              erro={erros.descricao}
            />
            <div>
              <Button type="submit" variante="primario">
                Criar evento
              </Button>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
