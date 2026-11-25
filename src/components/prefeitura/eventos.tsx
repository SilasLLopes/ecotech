"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { dataBR, numero } from "@/lib/format";
import { novoId, useDispatch, useEstado } from "@/lib/store";
import type { Evento } from "@/lib/types";
import { Campo, focarPrimeiroErro } from "@/components/ui/campo";

type Valores = { titulo: string; data: string; local: string; descricao: string };
type Erros = Partial<Record<keyof Valores, string>>;

const VAZIO: Valores = { titulo: "", data: "", local: "", descricao: "" };
const CAMPOS = ["titulo", "data", "local", "descricao"] as const;

function validar(v: Valores): Erros {
  const erros: Erros = {};
  if (!v.titulo.trim()) erros.titulo = "Informe o título do evento.";
  if (!v.data) erros.data = "Escolha a data do evento.";
  if (!v.local.trim()) erros.local = "Informe onde o evento acontece.";
  if (!v.descricao.trim()) erros.descricao = "Escreva uma descrição curta.";
  return erros;
}

export function Eventos() {
  const estado = useEstado();
  const dispatch = useDispatch();
  const uid = useId();
  const [valores, setValores] = useState<Valores>(VAZIO);
  const [erros, setErros] = useState<Erros>({});
  const [aviso, setAviso] = useState<string | null>(null);
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

  // Depois de criar um evento, o foco vai para o aviso.
  useEffect(() => {
    if (!aviso) return;
    const el = avisoRef.current;
    el?.focus({ preventScroll: true });
    el?.scrollIntoView({ block: "center" });
  }, [aviso]);

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
    setAviso(`Evento criado: ${evento.titulo}, em ${dataBR(evento.data)}.`);
  }

  const eventos = estado.eventos.slice().sort((a, b) => a.data.localeCompare(b.data));

  return (
    <div className="flex w-full max-w-6xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-graphite">Eventos</h1>
        <p className="mt-1 text-base text-text-muted">
          Cadastre os eventos da cidade. Eles formam a agenda pública. Dados de
          exemplo.
        </p>
      </div>

      {/* Região viva sempre montada: leitores de tela só anunciam texto que
          entra depois de montada. */}
      <div role="status" className="sr-only">
        {aviso}
      </div>
      {aviso && (
        <p
          ref={avisoRef}
          tabIndex={-1}
          className="flex scroll-mt-20 items-start gap-2 rounded-lg bg-mint-wash p-4 text-base font-semibold text-primary-strong focus:outline-3 focus:outline-offset-2 focus:outline-tech-blue"
        >
          <Icon nome="check" className="mt-0.5" />
          {aviso}
        </p>
      )}

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_24rem]">
        <section aria-labelledby={`${uid}-lista`} className="flex flex-col gap-4">
          <h2 id={`${uid}-lista`} className="text-xl font-semibold text-graphite">
            Eventos ({numero(eventos.length)})
          </h2>
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
              {eventos.map((ev) => (
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
                  </Card>
                </li>
              ))}
            </ul>
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
