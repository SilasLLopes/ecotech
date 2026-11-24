"use client";

import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import {
  SemSolicitante,
  useSolicitante,
} from "@/components/cidadao/compartilhado";
import { Button } from "@/components/ui/button";
import { Campo, focarPrimeiroErro } from "@/components/ui/campo";
import { Card } from "@/components/ui/card";
import { Chip, type TomChip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon, type IconeNome } from "@/components/ui/icon";
import { dataBR, numero } from "@/lib/format";
import { novoId, useDispatch, useEstado } from "@/lib/store";
import type { Anuncio } from "@/lib/types";

type Valores = { titulo: string; oferta: string };
type Erros = Partial<Record<keyof Valores, string>>;
type Aviso = { texto: string; foco: boolean; ok: boolean };

const VAZIO: Valores = { titulo: "", oferta: "" };
const CAMPOS = ["titulo", "oferta"] as const;
const TITULO_MAX = 60;
const OFERTA_MAX = 120;

const STATUS: Record<
  Anuncio["status"],
  { rotulo: string; tom: TomChip; icone: IconeNome; ajuda: string }
> = {
  "em-analise": {
    rotulo: "Em análise",
    tom: "aviso",
    icone: "relogio",
    ajuda: "A Prefeitura ainda vai decidir.",
  },
  aprovado: {
    rotulo: "Aprovado",
    tom: "ok",
    icone: "check",
    ajuda: "A Prefeitura aprovou este anúncio.",
  },
  recusado: {
    rotulo: "Recusado",
    tom: "erro",
    icone: "x",
    ajuda: "A Prefeitura não aprovou. Você pode enviar um novo anúncio.",
  },
};

function validar(v: Valores): Erros {
  const erros: Erros = {};
  const titulo = v.titulo.trim();
  const oferta = v.oferta.trim();
  if (!titulo) erros.titulo = "Informe o título do anúncio.";
  else if (titulo.length > TITULO_MAX)
    erros.titulo = `Use até ${TITULO_MAX} caracteres no título.`;
  if (!oferta) erros.oferta = "Descreva a oferta para o cidadão.";
  else if (oferta.length > OFERTA_MAX)
    erros.oferta = `Use até ${OFERTA_MAX} caracteres na oferta.`;
  return erros;
}

export function EventosAnuncios() {
  const estado = useEstado();
  const dispatch = useDispatch();
  const uid = useId();
  const solicitante = useSolicitante("comerciante");
  const [aberto, setAberto] = useState<string | null>(null);
  const [valores, setValores] = useState<Valores>(VAZIO);
  const [erros, setErros] = useState<Erros>({});
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const avisoRef = useRef<HTMLParagraphElement>(null);
  // Status vistos na última renderização, para avisar quando a Prefeitura
  // decide em outra aba (ou outro perfil).
  const vistos = useRef<Map<string, Anuncio["status"]> | null>(null);

  // Com cacheComponents o Next mantém esta tela viva (escondida) ao navegar
  // para outra rota; a limpeza roda ao esconder, então formulário, erros e
  // aviso voltam limpos na próxima visita.
  useEffect(
    () => () => {
      setAberto(null);
      setValores(VAZIO);
      setErros({});
      setAviso(null);
    },
    [],
  );

  const meus = useMemo(
    () => estado.anuncios.filter((a) => a.solicitanteId === solicitante?.id),
    [estado.anuncios, solicitante?.id],
  );

  useEffect(() => {
    const atuais = new Map(meus.map((a) => [a.id, a.status] as const));
    const antes = vistos.current;
    vistos.current = atuais;
    if (!antes) return;
    for (const a of meus) {
      const anterior = antes.get(a.id);
      if (anterior && anterior !== a.status && a.status !== "em-analise") {
        setAviso({
          texto: `A Prefeitura ${a.status === "aprovado" ? "aprovou" : "recusou"} o anúncio ${a.titulo}.`,
          foco: false,
          ok: a.status === "aprovado",
        });
      }
    }
  }, [meus]);

  // Depois de enviar, leva foco e tela até a confirmação (o formulário fecha).
  useEffect(() => {
    if (!aviso?.foco) return;
    const el = avisoRef.current;
    el?.focus({ preventScroll: true });
    el?.scrollIntoView({ block: "center" });
  }, [aviso]);

  if (!solicitante) return <SemSolicitante />;

  const idForm = (eventoId: string) => `${uid}-form-${eventoId}`;
  const idBotao = (eventoId: string) => `${uid}-abrir-${eventoId}`;
  const idCampos = (eventoId: string) => ({
    titulo: `${idForm(eventoId)}-titulo`,
    oferta: `${idForm(eventoId)}-oferta`,
  });

  function abrir(eventoId: string) {
    setAberto(eventoId);
    setValores(VAZIO);
    setErros({});
    setAviso(null);
    // O campo só existe depois da renderização.
    requestAnimationFrame(() => {
      document.getElementById(idCampos(eventoId).titulo)?.focus();
    });
  }

  function fechar(eventoId: string) {
    setAberto(null);
    setValores(VAZIO);
    setErros({});
    requestAnimationFrame(() => {
      document.getElementById(idBotao(eventoId))?.focus();
    });
  }

  function editar(campo: keyof Valores, valor: string) {
    setValores((v) => ({ ...v, [campo]: valor }));
    setErros((e) => ({ ...e, [campo]: undefined }));
  }

  function enviar(e: FormEvent, eventoId: string) {
    e.preventDefault();
    if (!solicitante) return;
    const achados = validar(valores);
    setErros(achados);
    const invalidos = CAMPOS.filter((c) => achados[c]);
    if (invalidos.length > 0) {
      focarPrimeiroErro(invalidos.map((c) => idCampos(eventoId)[c]));
      return;
    }
    const anuncio: Anuncio = {
      id: novoId("a"),
      solicitanteId: solicitante.id,
      eventoId,
      titulo: valores.titulo.trim(),
      oferta: valores.oferta.trim(),
      status: "em-analise",
    };
    dispatch({ type: "criar-anuncio", anuncio });
    setAberto(null);
    setValores(VAZIO);
    setErros({});
    setAviso({
      texto: `Anúncio enviado para análise: ${anuncio.titulo}. A Prefeitura vai decidir.`,
      foco: true,
      ok: true,
    });
  }

  const eventos = estado.eventos.slice().sort((a, b) => a.data.localeCompare(b.data));
  const meusRecentes = meus.slice().reverse();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-graphite">Eventos e anúncios</h1>
        <p className="mt-1 text-base text-text-muted">
          Anuncie seu comércio nos eventos da cidade. A Prefeitura aprova cada
          anúncio. Dados de exemplo.
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
          tabIndex={aviso.foco ? -1 : undefined}
          className={`flex scroll-mt-20 items-start gap-2 rounded-lg p-4 text-base font-semibold focus:outline-3 focus:outline-offset-2 focus:outline-tech-blue ${
            aviso.ok ? "bg-mint-wash text-primary-strong" : "bg-danger/10 text-danger"
          }`}
        >
          <Icon nome={aviso.ok ? "check" : "x"} className="mt-0.5" />
          {aviso.texto}
        </p>
      )}

      <section aria-labelledby={`${uid}-eventos`} className="flex flex-col gap-4">
        <h2 id={`${uid}-eventos`} className="text-xl font-semibold text-graphite">
          Eventos abertos para patrocínio ({numero(eventos.length)})
        </h2>
        {eventos.length === 0 ? (
          <Card>
            <EmptyState
              icone="calendario"
              titulo="Nenhum evento aberto agora"
              texto="Quando a Prefeitura abrir um evento, ele aparece aqui para você anunciar."
            />
          </Card>
        ) : (
          <ul className="flex flex-col gap-4">
            {eventos.map((ev) => {
              const idsCampos = idCampos(ev.id);
              const aqui = meus.filter((a) => a.eventoId === ev.id).length;
              const formAberto = aberto === ev.id;
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
                    {aqui > 0 && (
                      <p className="text-sm text-text-muted">
                        Você tem {numero(aqui)} {aqui === 1 ? "anúncio" : "anúncios"} neste
                        evento. Veja em Meus anúncios.
                      </p>
                    )}
                    {!formAberto && (
                      <div>
                        <Button
                          id={idBotao(ev.id)}
                          variante="secundario"
                          fullWidth
                          aria-label={`Anunciar neste evento: ${ev.titulo}`}
                          onClick={() => abrir(ev.id)}
                        >
                          Anunciar neste evento
                        </Button>
                      </div>
                    )}
                    {formAberto && (
                      <form
                        id={idForm(ev.id)}
                        noValidate
                        aria-labelledby={`${idForm(ev.id)}-titulo-form`}
                        onSubmit={(e) => enviar(e, ev.id)}
                        className="flex flex-col gap-4 rounded-lg bg-mint-surface p-4"
                      >
                        <h4
                          id={`${idForm(ev.id)}-titulo-form`}
                          className="text-base font-semibold text-graphite"
                        >
                          Novo anúncio neste evento
                        </h4>
                        <p className="text-sm text-text-muted">
                          Todos os campos são obrigatórios.
                        </p>
                        <Campo
                          id={idsCampos.titulo}
                          rotulo="Título do anúncio"
                          valor={valores.titulo}
                          onChange={(v) => editar("titulo", v)}
                          erro={erros.titulo}
                          ajuda={`Até ${TITULO_MAX} caracteres.`}
                        />
                        <Campo
                          id={idsCampos.oferta}
                          rotulo="Oferta ao cidadão"
                          multilinha
                          valor={valores.oferta}
                          onChange={(v) => editar("oferta", v)}
                          erro={erros.oferta}
                          ajuda={`O que o cidadão ganha. Até ${OFERTA_MAX} caracteres.`}
                        />
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Button type="submit" variante="primario" fullWidth>
                            Enviar para análise
                          </Button>
                          <Button
                            variante="secundario"
                            fullWidth
                            onClick={() => fechar(ev.id)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </form>
                    )}
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby={`${uid}-meus`} className="flex flex-col gap-4">
        <h2 id={`${uid}-meus`} className="text-xl font-semibold text-graphite">
          Meus anúncios ({numero(meus.length)})
        </h2>
        {meusRecentes.length === 0 ? (
          <Card>
            <EmptyState
              icone="megafone"
              titulo="Você ainda não enviou anúncios"
              texto="Escolha um evento acima e toque em Anunciar neste evento. A Prefeitura analisa e o status aparece aqui."
            />
          </Card>
        ) : (
          <ul className="flex flex-col gap-3">
            {meusRecentes.map((a) => {
              const s = STATUS[a.status];
              const ev = estado.eventos.find((e) => e.id === a.eventoId);
              return (
                <li key={a.id}>
                  <Card as="article" className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm text-text-muted">
                          {ev ? `${ev.titulo}, ${dataBR(ev.data)}` : "Evento que não existe mais"}
                        </p>
                        <h3 className="text-base font-semibold text-graphite">{a.titulo}</h3>
                      </div>
                      <Chip tom={s.tom} icone={s.icone}>
                        {s.rotulo}
                      </Chip>
                    </div>
                    <p className="text-base text-graphite">{a.oferta}</p>
                    <p className="text-sm text-text-muted">{s.ajuda}</p>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
