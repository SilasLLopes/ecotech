"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { numero } from "@/lib/format";
import { novoId, useDispatch, useEstado } from "@/lib/store";
import type { Beneficio } from "@/lib/types";
import { Campo, focarPrimeiroErro } from "@/components/ui/campo";
import { Tabela, type Coluna } from "./tabela";

type Valores = { comercio: string; titulo: string; custo: string; estoque: string };
type Erros = Partial<Record<keyof Valores, string>>;
// foco: só a criação leva o foco ao aviso; o alternar mantém o foco no botão.
type Aviso = { texto: string; foco: boolean };

const VAZIO: Valores = { comercio: "", titulo: "", custo: "", estoque: "" };
const LIMITE = 999_999;

function inteiroPositivo(texto: string): string | null {
  const t = texto.trim();
  if (!t) return "Informe um número inteiro maior que zero.";
  if (!/^\d+$/.test(t) || Number(t) <= 0) return "Use um número inteiro maior que zero.";
  if (Number(t) > LIMITE) return `Use um número até ${numero(LIMITE)}.`;
  return null;
}

function validar(v: Valores): Erros {
  const erros: Erros = {};
  if (!v.comercio.trim()) erros.comercio = "Informe o nome do comércio.";
  if (!v.titulo.trim()) erros.titulo = "Descreva o benefício.";
  const custo = inteiroPositivo(v.custo);
  if (custo) erros.custo = custo;
  const estoque = inteiroPositivo(v.estoque);
  if (estoque) erros.estoque = estoque;
  return erros;
}

export function Beneficios() {
  const estado = useEstado();
  const dispatch = useDispatch();
  const uid = useId();
  const [valores, setValores] = useState<Valores>(VAZIO);
  const [erros, setErros] = useState<Erros>({});
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const avisoRef = useRef<HTMLParagraphElement>(null);

  // Com cacheComponents o Next mantém esta tela viva (escondida) ao navegar
  // para outra rota; a limpeza roda ao esconder, então o formulário e o aviso
  // voltam limpos na próxima visita.
  useEffect(
    () => () => {
      setValores(VAZIO);
      setErros({});
      setAviso(null);
    },
    [],
  );

  // Depois de criar um benefício o foco vai para a confirmação.
  useEffect(() => {
    if (!aviso?.foco) return;
    const el = avisoRef.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: "center" });
  }, [aviso]);

  const ids = {
    comercio: `${uid}-comercio`,
    titulo: `${uid}-titulo`,
    custo: `${uid}-custo`,
    estoque: `${uid}-estoque`,
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
    const campos = (["comercio", "titulo", "custo", "estoque"] as const).filter(
      (c) => achados[c],
    );
    if (campos.length > 0) {
      setAviso(null);
      focarPrimeiroErro(campos.map((c) => ids[c]));
      return;
    }
    const beneficio: Beneficio = {
      id: novoId("b"),
      comercio: valores.comercio.trim(),
      titulo: valores.titulo.trim(),
      custo: Number(valores.custo),
      estoque: Number(valores.estoque),
      ativo: true,
    };
    dispatch({ type: "criar-beneficio", beneficio });
    setValores(VAZIO);
    setAviso({
      texto: `Benefício criado: ${beneficio.titulo} (${beneficio.comercio}). Já aparece em Recompensas.`,
      foco: true,
    });
  }

  function alternar(b: Beneficio) {
    dispatch({ type: "alternar-beneficio", id: b.id });
    setAviso({
      texto: b.ativo
        ? `Benefício desativado: ${b.titulo}. Não aparece mais em Recompensas.`
        : `Benefício ativado: ${b.titulo}. Já aparece em Recompensas.`,
      foco: false,
    });
  }

  const colunas: Coluna<Beneficio>[] = [
    { id: "comercio", rotulo: "Comércio", celula: (b) => b.comercio },
    { id: "titulo", rotulo: "Benefício", celula: (b) => b.titulo },
    { id: "custo", rotulo: "Custo", numerica: true, celula: (b) => `${numero(b.custo)} pts` },
    { id: "estoque", rotulo: "Estoque", numerica: true, celula: (b) => numero(b.estoque) },
    {
      id: "ativo",
      rotulo: "Situação",
      celula: (b) =>
        b.ativo ? (
          <Chip tom="ok" icone="check">
            Ativo
          </Chip>
        ) : (
          <Chip tom="neutro" icone="x">
            Inativo
          </Chip>
        ),
    },
    {
      id: "acao",
      rotulo: "Ação",
      celula: (b) => (
        <Button
          variante="secundario"
          aria-label={`${b.ativo ? "Desativar" : "Ativar"} benefício ${b.titulo}, ${b.comercio}`}
          onClick={() => alternar(b)}
        >
          {b.ativo ? "Desativar" : "Ativar"}
        </Button>
      ),
    },
  ];

  return (
    <div className="flex w-full max-w-6xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-graphite">Benefícios</h1>
        <p className="mt-1 text-base text-text-muted">
          Benefícios que os comércios oferecem em troca de pontos. Só os ativos
          aparecem para quem tem pontos. Dados de exemplo.
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
          tabIndex={-1}
          className="flex scroll-mt-20 items-start gap-2 rounded-lg bg-mint-wash p-4 text-base font-semibold text-primary-strong focus:outline-3 focus:outline-offset-2 focus:outline-tech-blue"
        >
          <Icon nome="check" className="mt-0.5" />
          {aviso.texto}
        </p>
      )}

      <section aria-labelledby={`${uid}-lista`} className="flex flex-col gap-3">
        <h2 id={`${uid}-lista`} className="text-xl font-semibold text-graphite">
          Benefícios cadastrados ({numero(estado.beneficios.length)})
        </h2>
        {estado.beneficios.length === 0 ? (
          <Card>
            <EmptyState
              icone="presente"
              titulo="Nenhum benefício cadastrado"
              texto="Cadastre o primeiro no formulário abaixo para ele aparecer em Recompensas."
            />
          </Card>
        ) : (
          <Tabela
            legenda="Benefícios cadastrados"
            colunas={colunas}
            linhas={estado.beneficios}
            chave={(b) => b.id}
            titulo="titulo"
          />
        )}
      </section>

      <section aria-labelledby={`${uid}-novo`} className="max-w-xl">
        <Card as="form" noValidate onSubmit={criar} className="flex flex-col gap-4">
          <h2 id={`${uid}-novo`} className="text-xl font-semibold text-graphite">
            Novo benefício
          </h2>
          <p className="text-sm text-text-muted">Todos os campos são obrigatórios.</p>
          <Campo
            id={ids.comercio}
            rotulo="Comércio"
            valor={valores.comercio}
            onChange={(v) => editar("comercio", v)}
            erro={erros.comercio}
          />
          <Campo
            id={ids.titulo}
            rotulo="Benefício oferecido"
            valor={valores.titulo}
            onChange={(v) => editar("titulo", v)}
            erro={erros.titulo}
            ajuda="Ex.: 6 pães franceses"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo
              id={ids.custo}
              rotulo="Custo em pontos"
              valor={valores.custo}
              onChange={(v) => editar("custo", v)}
              erro={erros.custo}
              inputMode="numeric"
            />
            <Campo
              id={ids.estoque}
              rotulo="Estoque"
              valor={valores.estoque}
              onChange={(v) => editar("estoque", v)}
              erro={erros.estoque}
              inputMode="numeric"
            />
          </div>
          <div>
            <Button type="submit" variante="primario">
              Criar benefício
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
