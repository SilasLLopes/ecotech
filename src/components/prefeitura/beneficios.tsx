"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { formatarEm, numero } from "@/lib/format";
import { novoId, obterEstado, useDispatch, useEstado } from "@/lib/store";
import type { Beneficio, Publico, Resgate } from "@/lib/types";
import { Campo, focarPrimeiroErro } from "@/components/ui/campo";
import { Tabela, type Coluna } from "./tabela";

type Valores = { comercio: string; titulo: string; custo: string; estoque: string };
type Erros = Partial<Record<keyof Valores, string>>;
// foco: só a criação leva o foco ao aviso; o alternar mantém o foco no botão.
type Aviso = { texto: string; foco: boolean };

const VAZIO: Valores = { comercio: "", titulo: "", custo: "", estoque: "" };
const LIMITE = 999_999;
// Benefícios de comerciante são oferecidos pela própria Prefeitura.
const COMERCIO_PREFEITURA = "Prefeitura de Quixadá";
const PUBLICOS: { id: Publico; rotulo: string }[] = [
  { id: "cidadao", rotulo: "Cidadão" },
  { id: "comerciante", rotulo: "Comerciante" },
];
const ROTULO_PUBLICO: Record<Publico, string> = {
  cidadao: "Cidadão",
  comerciante: "Comerciante",
};
// Onde o benefício aparece para quem resgata.
const ONDE_APARECE: Record<Publico, string> = {
  cidadao: "Recompensas do cidadão",
  comerciante: "Benefícios do comerciante",
};

function inteiroPositivo(texto: string): string | null {
  const t = texto.trim();
  if (!t) return "Informe um número inteiro maior que zero.";
  if (!/^\d+$/.test(t) || Number(t) <= 0) return "Use um número inteiro maior que zero.";
  if (Number(t) > LIMITE) return `Use um número até ${numero(LIMITE)}.`;
  return null;
}

function validar(v: Valores, publico: Publico): Erros {
  const erros: Erros = {};
  if (publico === "cidadao" && !v.comercio.trim()) erros.comercio = "Informe o nome do comércio.";
  if (!v.titulo.trim()) erros.titulo = "Descreva o benefício.";
  const custo = inteiroPositivo(v.custo);
  if (custo) erros.custo = custo;
  const estoque = inteiroPositivo(v.estoque);
  if (estoque) erros.estoque = estoque;
  return erros;
}

type Concessao = { codigo: string; texto: string };

// Solicitações dos comerciantes: pendentes primeiro, depois as concedidas,
// cada grupo na ordem em que chegaram (a mais antiga em cima).
function ordenar(resgates: Resgate[]): Resgate[] {
  const pendentes = resgates.filter((r) => r.status === "solicitado");
  const concedidas = resgates.filter((r) => r.status !== "solicitado");
  return [...pendentes, ...concedidas];
}

function Solicitacoes() {
  const estado = useEstado();
  const dispatch = useDispatch();
  const uid = useId();
  const [aviso, setAviso] = useState<Concessao | null>(null);
  const avisoRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(
    () => () => {
      setAviso(null);
    },
    [],
  );

  // Depois de conceder o foco vai para o aviso: o botão some da tela.
  useEffect(() => {
    if (!aviso) return;
    const el = avisoRef.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: "center" });
  }, [aviso]);

  const doComerciante = new Set(
    estado.beneficios.filter((b) => b.publico === "comerciante").map((b) => b.id),
  );
  const solicitacoes = ordenar(
    estado.resgates.filter(
      (r) => doComerciante.has(r.beneficioId) && r.status !== "emitido",
    ),
  );
  const pendentes = solicitacoes.filter((r) => r.status === "solicitado").length;

  function nomeDe(r: Resgate): string {
    return (
      estado.solicitantes.find((s) => s.id === r.solicitanteId)?.nome ??
      "Comerciante sem cadastro"
    );
  }
  function beneficioDe(r: Resgate): string {
    return estado.beneficios.find((b) => b.id === r.beneficioId)?.titulo ?? "Benefício removido";
  }

  function conceder(r: Resgate) {
    // Confere no estado fresco (o despacho é síncrono): um segundo clique ou
    // outra aba que já concedeu cai aqui, e o reducer também ignoraria.
    const fresco = obterEstado().resgates.find((x) => x.id === r.id);
    if (!fresco || fresco.status !== "solicitado") {
      setAviso((atual) =>
        atual?.codigo === r.codigo
          ? atual
          : { codigo: r.codigo, texto: `A solicitação ${r.codigo} já estava concedida.` },
      );
      return;
    }
    dispatch({ type: "conceder-resgate", id: r.id });
    setAviso({
      codigo: r.codigo,
      texto: `Solicitação concedida: ${beneficioDe(r)}, ${nomeDe(r)}. Protocolo ${r.codigo}.`,
    });
  }

  const colunas: Coluna<Resgate>[] = [
    { id: "codigo", rotulo: "Protocolo", celula: (r) => r.codigo },
    { id: "comerciante", rotulo: "Comerciante", celula: nomeDe },
    { id: "beneficio", rotulo: "Benefício", celula: beneficioDe },
    { id: "em", rotulo: "Solicitado em", celula: (r) => formatarEm(r.em) },
    {
      id: "status",
      rotulo: "Situação",
      celula: (r) =>
        r.status === "solicitado" ? (
          <Chip tom="aviso" icone="relogio">
            Solicitado
          </Chip>
        ) : (
          <Chip tom="ok" icone="check">
            Concedido
          </Chip>
        ),
    },
    {
      id: "acao",
      rotulo: "Ação",
      celula: (r) =>
        r.status === "solicitado" ? (
          <Button
            variante="primario"
            aria-label={`Marcar como concedido: ${beneficioDe(r)}, ${nomeDe(r)}, protocolo ${r.codigo}`}
            onClick={() => conceder(r)}
          >
            Marcar como concedido
          </Button>
        ) : (
          <span className="text-text-muted">Sem ação</span>
        ),
    },
  ];

  return (
    <section aria-labelledby={`${uid}-titulo`} className="flex flex-col gap-3">
      <div>
        <h2 id={`${uid}-titulo`} className="text-xl font-semibold text-graphite">
          Solicitações dos comerciantes ({numero(solicitacoes.length)})
        </h2>
        <p className="mt-1 text-base text-text-muted">
          {pendentes === 0
            ? "Nenhuma solicitação aguarda a Prefeitura."
            : `${numero(pendentes)} ${pendentes === 1 ? "solicitação aguarda" : "solicitações aguardam"} a Prefeitura.`}{" "}
          Os pedidos chegam com o protocolo; marque como concedido quando o benefício for entregue.
        </p>
      </div>

      {/* Região viva sempre montada. */}
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

      {solicitacoes.length === 0 ? (
        <Card>
          <EmptyState
            icone="presente"
            titulo="Nenhuma solicitação por enquanto"
            texto="Quando um comerciante solicitar um benefício, o pedido aparece aqui."
          />
        </Card>
      ) : (
        <Tabela
          legenda="Solicitações dos comerciantes"
          colunas={colunas}
          linhas={solicitacoes}
          chave={(r) => r.id}
          titulo="codigo"
        />
      )}
    </section>
  );
}

export function Beneficios() {
  const estado = useEstado();
  const dispatch = useDispatch();
  const uid = useId();
  const [valores, setValores] = useState<Valores>(VAZIO);
  const [publico, setPublico] = useState<Publico>("cidadao");
  const [erros, setErros] = useState<Erros>({});
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const avisoRef = useRef<HTMLParagraphElement>(null);

  // Com cacheComponents o Next mantém esta tela viva (escondida) ao navegar
  // para outra rota; a limpeza roda ao esconder, então o formulário e o aviso
  // voltam limpos na próxima visita.
  useLayoutEffect(
    () => () => {
      setValores(VAZIO);
      setPublico("cidadao");
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

  function escolherPublico(novo: Publico) {
    setPublico(novo);
    setErros((e) => ({ ...e, comercio: undefined }));
    setAviso(null);
  }

  function criar(e: FormEvent) {
    e.preventDefault();
    const achados = validar(valores, publico);
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
      publico,
      comercio: publico === "comerciante" ? COMERCIO_PREFEITURA : valores.comercio.trim(),
      titulo: valores.titulo.trim(),
      custo: Number(valores.custo),
      estoque: Number(valores.estoque),
      ativo: true,
    };
    dispatch({ type: "criar-beneficio", beneficio });
    setValores(VAZIO);
    setPublico("cidadao");
    setAviso({
      texto: `Benefício criado: ${beneficio.titulo} (${beneficio.comercio}). Já aparece em ${ONDE_APARECE[beneficio.publico]}.`,
      foco: true,
    });
  }

  function alternar(b: Beneficio) {
    dispatch({ type: "alternar-beneficio", id: b.id });
    setAviso({
      texto: b.ativo
        ? `Benefício desativado: ${b.titulo}. Não aparece mais em ${ONDE_APARECE[b.publico]}.`
        : `Benefício ativado: ${b.titulo}. Já aparece em ${ONDE_APARECE[b.publico]}.`,
      foco: false,
    });
  }

  const colunas: Coluna<Beneficio>[] = [
    { id: "comercio", rotulo: "Comércio", celula: (b) => b.comercio },
    { id: "titulo", rotulo: "Benefício", celula: (b) => b.titulo },
    { id: "publico", rotulo: "Público", celula: (b) => ROTULO_PUBLICO[b.publico] },
    { id: "custo", rotulo: "Custo", numerica: true, celula: (b) => `${numero(b.custo)} pts` },
    {
      id: "estoque",
      rotulo: "Estoque ou vagas",
      numerica: true,
      celula: (b) => numero(b.estoque),
    },
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
          Benefícios para cidadãos (em troca de pontos, oferecidos pelos comércios) e para
          comerciantes (oferecidos pela Prefeitura). Só os ativos aparecem para quem tem pontos.
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
              texto="Cadastre o primeiro no formulário abaixo para ele aparecer para o público escolhido."
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

      <Solicitacoes />

      <section aria-labelledby={`${uid}-novo`} className="max-w-xl">
        <Card as="form" noValidate onSubmit={criar} className="flex flex-col gap-4">
          <h2 id={`${uid}-novo`} className="text-xl font-semibold text-graphite">
            Novo benefício
          </h2>
          <p className="text-sm text-text-muted">Todos os campos são obrigatórios.</p>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-semibold text-graphite">Público</legend>
            <div className="grid grid-cols-2 gap-2">
              {PUBLICOS.map((p) => {
                const marcado = publico === p.id;
                return (
                  <label
                    key={p.id}
                    className={`flex min-h-11 cursor-pointer items-center justify-center gap-1 rounded-md border-[1.5px] px-2 text-base font-semibold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-tech-blue ${
                      marcado
                        ? "border-primary-strong bg-mint-wash text-primary-strong"
                        : "border-border-soft bg-white text-graphite"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`${uid}-publico`}
                      value={p.id}
                      checked={marcado}
                      onChange={() => escolherPublico(p.id)}
                      className="sr-only"
                    />
                    {marcado && <Icon nome="check" tamanho="sm" />}
                    {p.rotulo}
                  </label>
                );
              })}
            </div>
          </fieldset>
          {publico === "cidadao" ? (
            <Campo
              id={ids.comercio}
              rotulo="Comércio"
              valor={valores.comercio}
              onChange={(v) => editar("comercio", v)}
              erro={erros.comercio}
            />
          ) : (
            <p className="text-sm text-text-muted">
              Benefício oferecido pela {COMERCIO_PREFEITURA}.
            </p>
          )}
          <Campo
            id={ids.titulo}
            rotulo="Benefício oferecido"
            valor={valores.titulo}
            onChange={(v) => editar("titulo", v)}
            erro={erros.titulo}
            ajuda={publico === "cidadao" ? "Ex.: 6 pães franceses" : "Ex.: Selo de comércio parceiro"}
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
              rotulo={publico === "comerciante" ? "Vagas" : "Estoque"}
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
