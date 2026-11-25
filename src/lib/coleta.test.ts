import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MULTIPLICADOR_MAX,
  parseEstado,
  pontosDoPedido,
  reduzir,
} from "./coleta.ts";
import type { Acao, Estado, Pedido } from "./types.ts";

function pedido(over: Partial<Pedido> = {}): Pedido {
  return {
    id: "p1",
    solicitanteId: "s1",
    itens: [{ materialId: "pet", quantidade: 2 }],
    endereco: "Rua de exemplo, 10",
    bairro: "Centro",
    ponto: { lng: -39.01, lat: -4.96 },
    janela: "Hoje, 14h às 16h",
    status: "aguardando",
    criadoEm: "2026-01-01T10:00:00",
    ...over,
  };
}

function base(): Estado {
  return {
    versao: 3,
    destaque: { materialId: "pet", multiplicador: 1.25 },
    materiais: [
      { id: "pet", nome: "PET", unidade: "kg", pontosBase: 8 },
      { id: "vidro", nome: "Vidro", unidade: "kg", pontosBase: 3 },
    ],
    solicitantes: [
      {
        id: "s1",
        nome: "Solicitante de exemplo",
        tipo: "cidadao",
        bairro: "Centro",
        endereco: "Rua de exemplo, 10",
        ponto: { lng: -39.01, lat: -4.96 },
        saldo: 100,
        metas: [
          {
            id: "m1",
            periodo: "diaria",
            titulo: "2 coletas",
            alvo: 2,
            bonus: 15,
            progresso: 0,
            concluida: false,
          },
        ],
      },
    ],
    catadores: [
      {
        id: "c1",
        nome: "Catador de exemplo",
        associadoEm: "2025-01-01",
        coletas: 5,
        origem: { lng: -39.02, lat: -4.97 },
        posicao: { lng: -39.02, lat: -4.97 },
      },
    ],
    pedidos: [],
    beneficios: [
      { id: "b1", publico: "cidadao", comercio: "Loja de exemplo", titulo: "Desconto", custo: 40, estoque: 2, ativo: true },
    ],
    resgates: [],
    extrato: [],
    eventos: [],
  };
}

function comPedido(p: Pedido): Estado {
  return { ...base(), pedidos: [p] };
}

test("pontosDoPedido aplica o destaque só ao material em destaque", () => {
  const e = base();
  assert.equal(
    pontosDoPedido([{ materialId: "pet", quantidade: 2 }], e.materiais, e.destaque),
    20,
  );
  assert.equal(
    pontosDoPedido([{ materialId: "vidro", quantidade: 1 }], e.materiais, e.destaque),
    3,
  );
  assert.equal(pontosDoPedido([], e.materiais, e.destaque), 0);
});

test("pontosDoPedido arredonda com Math.round", () => {
  const e = base();
  assert.equal(
    pontosDoPedido([{ materialId: "vidro", quantidade: 1.5 }], e.materiais, e.destaque),
    5,
  );
});

test("pontosDoPedido distingue round de ceil e de floor", () => {
  const e = base();
  // 0,8 kg de vidro x 3 = 2,4: round dá 2 (ceil daria 3).
  assert.equal(
    pontosDoPedido([{ materialId: "vidro", quantidade: 0.8 }], e.materiais, e.destaque),
    2,
  );
});

test("solicitar adiciona pedido aguardando", () => {
  const novo = reduzir(base(), { type: "solicitar", pedido: pedido() });
  assert.equal(novo.pedidos.length, 1);
  assert.equal(novo.pedidos[0].status, "aguardando");
});

test("solicitar zera status, catadorId e pontos vindos no pedido", () => {
  const novo = reduzir(base(), {
    type: "solicitar",
    pedido: pedido({ status: "coletado", catadorId: "c1", pontos: 99 }),
  });
  assert.equal(novo.pedidos[0].status, "aguardando");
  assert.equal(novo.pedidos[0].catadorId, undefined);
  assert.equal(novo.pedidos[0].pontos, undefined);
});

test("solicitar ignora itens vazios, quantidade <= 0 e id repetido", () => {
  const e = base();
  assert.equal(reduzir(e, { type: "solicitar", pedido: pedido({ itens: [] }) }), e);
  assert.equal(
    reduzir(e, {
      type: "solicitar",
      pedido: pedido({ itens: [{ materialId: "pet", quantidade: 0 }] }),
    }),
    e,
  );
  assert.equal(
    reduzir(e, {
      type: "solicitar",
      pedido: pedido({ itens: [{ materialId: "pet", quantidade: -1 }] }),
    }),
    e,
  );
  const com = comPedido(pedido());
  assert.equal(reduzir(com, { type: "solicitar", pedido: pedido() }), com);
});

test("aceitar muda só pedidos aguardando", () => {
  const e: Estado = {
    ...base(),
    pedidos: [
      pedido({ id: "a" }),
      pedido({ id: "b", status: "aceito", catadorId: "c9" }),
      pedido({ id: "c", status: "cancelado" }),
    ],
  };
  const novo = reduzir(e, { type: "aceitar", ids: ["a", "b", "c", "zzz"], catadorId: "c1" });
  assert.equal(novo.pedidos[0].status, "aceito");
  assert.equal(novo.pedidos[0].catadorId, "c1");
  assert.equal(novo.pedidos[1].catadorId, "c9");
  assert.equal(novo.pedidos[2].status, "cancelado");
  assert.equal(novo.pedidos[2].catadorId, undefined);
});

test("aceitar sem efeito devolve o mesmo estado", () => {
  const e = comPedido(pedido({ status: "cancelado" }));
  assert.equal(reduzir(e, { type: "aceitar", ids: ["p1", "zzz"], catadorId: "c1" }), e);
});

const aceito = () => pedido({ status: "aceito", catadorId: "c1" });
const coletar = { type: "coletar", id: "p1", catadorId: "c1", lancamentoId: "l1", em: "2026-01-01T15:00:00" } as const;

test("coletar conclui o pedido, credita pontos e avança metas", () => {
  const novo = reduzir(comPedido(aceito()), coletar);
  assert.equal(novo.pedidos[0].status, "coletado");
  assert.equal(novo.pedidos[0].pontos, 20);
  assert.equal(novo.solicitantes[0].saldo, 120);
  assert.equal(novo.catadores[0].coletas, 6);
  assert.equal(novo.solicitantes[0].metas[0].progresso, 1);
  assert.equal(novo.solicitantes[0].metas[0].concluida, false);
  assert.equal(novo.extrato.length, 1);
  assert.deepEqual(novo.extrato[0], {
    id: "l1",
    solicitanteId: "s1",
    descricao: novo.extrato[0].descricao,
    pontos: 20,
    em: "2026-01-01T15:00:00",
  });
});

test("coletar conclui a meta uma única vez e soma o bônus", () => {
  const e = comPedido(aceito());
  e.solicitantes[0].metas[0].progresso = 1;
  const novo = reduzir(e, coletar);
  const meta = novo.solicitantes[0].metas[0];
  assert.equal(meta.concluida, true);
  assert.equal(meta.progresso, 2);
  assert.equal(novo.solicitantes[0].saldo, 100 + 20 + 15);
  assert.equal(novo.extrato.length, 2);
  assert.equal(novo.extrato[1].id, "l1-m1");
  assert.equal(novo.extrato[1].pontos, 15);

  // Nova coleta com meta concluída não paga o bônus de novo.
  const outro: Estado = {
    ...novo,
    pedidos: [...novo.pedidos, pedido({ id: "p2", status: "aceito", catadorId: "c1" })],
  };
  const depois = reduzir(outro, { ...coletar, id: "p2", lancamentoId: "l2" });
  assert.equal(depois.solicitantes[0].saldo, 100 + 20 + 15 + 20);
  assert.equal(depois.extrato.length, 3);
});

test("coletar repetido ou de outro catador devolve o mesmo estado", () => {
  const novo = reduzir(comPedido(aceito()), coletar);
  assert.equal(reduzir(novo, { ...coletar, lancamentoId: "l9" }), novo);
  const e = comPedido(aceito());
  assert.equal(reduzir(e, { ...coletar, catadorId: "c2" }), e);
  const aguardando = comPedido(pedido());
  assert.equal(reduzir(aguardando, coletar), aguardando);
});

test("coletar sem solicitante correspondente devolve o mesmo estado", () => {
  const e = comPedido(pedido({ status: "aceito", catadorId: "c1", solicitanteId: "fantasma" }));
  assert.equal(reduzir(e, coletar), e);
});

test("cancelar só afeta pedido aguardando", () => {
  const e: Estado = {
    ...base(),
    pedidos: [pedido({ id: "a" }), pedido({ id: "b", status: "aceito", catadorId: "c1" })],
  };
  const novo = reduzir(e, { type: "cancelar", id: "a" });
  assert.equal(novo.pedidos[0].status, "cancelado");
  assert.equal(reduzir(e, { type: "cancelar", id: "b" }), e);
  assert.equal(reduzir(e, { type: "cancelar", id: "zzz" }), e);
});

const resgatar = { type: "resgatar", id: "r1", solicitanteId: "s1", beneficioId: "b1", codigo: "ECO-1234", em: "2026-01-02T09:00:00" } as const;

test("resgatar debita saldo e estoque e registra resgate e lançamento", () => {
  const novo = reduzir(base(), resgatar);
  assert.equal(novo.solicitantes[0].saldo, 60);
  assert.equal(novo.beneficios[0].estoque, 1);
  assert.equal(novo.resgates.length, 1);
  assert.deepEqual(novo.resgates[0], {
    id: "r1",
    solicitanteId: "s1",
    beneficioId: "b1",
    codigo: "ECO-1234",
    em: "2026-01-02T09:00:00",
    status: "emitido",
  });
  assert.equal(novo.extrato.length, 1);
  assert.equal(novo.extrato[0].pontos, -40);
});

function comComerciante(): Estado {
  const e = base();
  e.solicitantes[0].tipo = "comerciante";
  e.beneficios[0].publico = "comerciante";
  e.beneficios[0].titulo = "Selo de exemplo";
  return e;
}

test("resgatar do comerciante vira solicitação e o extrato diz Solicitação", () => {
  const novo = reduzir(comComerciante(), resgatar);
  assert.equal(novo.resgates[0].status, "solicitado");
  assert.equal(novo.solicitantes[0].saldo, 60);
  assert.equal(novo.beneficios[0].estoque, 1);
  assert.ok(novo.extrato[0].descricao.startsWith("Solicitação:"));
  assert.equal(novo.extrato[0].pontos, -40);
});

test("resgatar de outro público devolve o mesmo estado", () => {
  const cidadaoPedeComerciante = base();
  cidadaoPedeComerciante.beneficios[0].publico = "comerciante";
  assert.equal(reduzir(cidadaoPedeComerciante, resgatar), cidadaoPedeComerciante);
  assert.equal(cidadaoPedeComerciante.solicitantes[0].saldo, 100);
  assert.equal(cidadaoPedeComerciante.beneficios[0].estoque, 2);

  const comercianteQuerCidadao = base();
  comercianteQuerCidadao.solicitantes[0].tipo = "comerciante";
  assert.equal(reduzir(comercianteQuerCidadao, resgatar), comercianteQuerCidadao);
  assert.equal(comercianteQuerCidadao.solicitantes[0].saldo, 100);
  assert.equal(comercianteQuerCidadao.beneficios[0].estoque, 2);
});

test("conceder-resgate muda só solicitado para concedido", () => {
  const solicitado = reduzir(comComerciante(), resgatar);
  const concedido = reduzir(solicitado, { type: "conceder-resgate", id: "r1" });
  assert.equal(concedido.resgates[0].status, "concedido");
  assert.equal(concedido.solicitantes[0].saldo, solicitado.solicitantes[0].saldo);
  assert.equal(reduzir(concedido, { type: "conceder-resgate", id: "r1" }), concedido);
  assert.equal(reduzir(solicitado, { type: "conceder-resgate", id: "zzz" }), solicitado);
  const emitido = reduzir(base(), resgatar);
  assert.equal(reduzir(emitido, { type: "conceder-resgate", id: "r1" }), emitido);
});

test("resgatar com saldo exatamente igual ao custo funciona", () => {
  const e = base();
  e.solicitantes[0].saldo = 40;
  const novo = reduzir(e, resgatar);
  assert.notEqual(novo, e);
  assert.equal(novo.solicitantes[0].saldo, 0);
  assert.equal(novo.resgates.length, 1);
});

test("resgatar inválido devolve o mesmo estado", () => {
  const e = base();
  const pobre = base();
  pobre.solicitantes[0].saldo = 39;
  assert.equal(reduzir(pobre, resgatar), pobre);
  const semEstoque = base();
  semEstoque.beneficios[0].estoque = 0;
  assert.equal(reduzir(semEstoque, resgatar), semEstoque);
  const inativo = base();
  inativo.beneficios[0].ativo = false;
  assert.equal(reduzir(inativo, resgatar), inativo);
  const feito = reduzir(e, resgatar);
  assert.equal(reduzir(feito, resgatar), feito);
  assert.equal(reduzir(e, { ...resgatar, beneficioId: "zzz" }), e);
  assert.equal(reduzir(e, { ...resgatar, solicitanteId: "zzz" }), e);
});

test("definir-destaque limita e arredonda o multiplicador", () => {
  const e = base();
  assert.equal(MULTIPLICADOR_MAX, 1.5);
  let novo = reduzir(e, { type: "definir-destaque", materialId: "vidro", multiplicador: 1.234 });
  assert.deepEqual(novo.destaque, { materialId: "vidro", multiplicador: 1.23 });
  novo = reduzir(e, { type: "definir-destaque", materialId: "pet", multiplicador: 9 });
  assert.equal(novo.destaque.multiplicador, 1.5);
  novo = reduzir(e, { type: "definir-destaque", materialId: "pet", multiplicador: 0.2 });
  assert.equal(novo.destaque.multiplicador, 1);
  assert.equal(
    reduzir(e, { type: "definir-destaque", materialId: "latas", multiplicador: 1.1 }),
    e,
  );
});

test("alternar-beneficio e criar-beneficio", () => {
  const e = base();
  const off = reduzir(e, { type: "alternar-beneficio", id: "b1" });
  assert.equal(off.beneficios[0].ativo, false);
  assert.equal(reduzir(e, { type: "alternar-beneficio", id: "zzz" }), e);
  const novo = { id: "b2", publico: "cidadao" as const, comercio: "Outra", titulo: "Brinde", custo: 10, estoque: 5, ativo: true };
  const com = reduzir(e, { type: "criar-beneficio", beneficio: novo });
  assert.equal(com.beneficios.length, 2);
  assert.equal(reduzir(com, { type: "criar-beneficio", beneficio: novo }), com);
});

test("criar-evento", () => {
  const e = base();
  const evento = { id: "e1", titulo: "Feira", data: "2026-02-01", local: "Praça", descricao: "Exemplo" };
  const comEvento = reduzir(e, { type: "criar-evento", evento });
  assert.equal(comEvento.eventos.length, 1);
  assert.equal(reduzir(comEvento, { type: "criar-evento", evento }), comEvento);
});

test("parseEstado rejeita entradas inválidas", () => {
  assert.equal(parseEstado(null), null);
  assert.equal(parseEstado(""), null);
  assert.equal(parseEstado("{"), null);
  assert.equal(parseEstado("[]"), null);
  assert.equal(parseEstado('{"versao":0}'), null);
  const semPedidos: Partial<Estado> = base();
  delete semPedidos.pedidos;
  assert.equal(parseEstado(JSON.stringify(semPedidos)), null);
});

test("parseEstado rejeita destaque malformado", () => {
  const com = (destaque: unknown) => JSON.stringify({ ...base(), destaque });
  assert.equal(parseEstado(com({})), null);
  assert.equal(parseEstado(com({ materialId: "pet", multiplicador: null })), null);
  assert.equal(parseEstado(com({ materialId: 3, multiplicador: 1.2 })), null);
  assert.equal(parseEstado(com({ materialId: "pet", multiplicador: "1.2" })), null);
  assert.notEqual(parseEstado(com({ materialId: "pet", multiplicador: 1.2 })), null);
});

test("parseEstado exige a versão 3 e o modelo de público, status e posição", () => {
  const com = (mut: (o: Record<string, unknown>) => void) => {
    const o = JSON.parse(JSON.stringify(reduzir(base(), resgatar))) as Record<string, unknown>;
    mut(o);
    return JSON.stringify(o);
  };
  assert.equal(parseEstado(com((o) => { o.versao = 1; })), null);
  assert.equal(parseEstado(com((o) => { o.versao = 2; })), null);
  assert.equal(
    parseEstado(com((o) => { delete (o.beneficios as Record<string, unknown>[])[0].publico; })),
    null,
  );
  assert.equal(
    parseEstado(com((o) => { (o.beneficios as Record<string, unknown>[])[0].publico = "x"; })),
    null,
  );
  assert.equal(
    parseEstado(com((o) => { (o.resgates as Record<string, unknown>[])[0].status = "x"; })),
    null,
  );
  assert.equal(
    parseEstado(com((o) => { delete (o.resgates as Record<string, unknown>[])[0].status; })),
    null,
  );
  const v2 = reduzir(base(), resgatar);
  assert.deepEqual(parseEstado(JSON.stringify(v2)), v2);
});

function congelar<T>(valor: T): T {
  if (typeof valor === "object" && valor !== null && !Object.isFrozen(valor)) {
    Object.freeze(valor);
    for (const filho of Object.values(valor)) congelar(filho);
  }
  return valor;
}

test("reduzir não muta o estado (Estado congelado, uma ação de cada tipo)", () => {
  const e = base();
  e.pedidos = [
    pedido({ id: "a" }),
    pedido({ id: "b", status: "aceito", catadorId: "c1" }),
  ];
  e.resgates = [
    { id: "r0", solicitanteId: "s1", beneficioId: "b1", codigo: "ECO-0000", em: "2026-01-01T08:00:00", status: "solicitado" },
  ];
  congelar(e);
  const acoes: Acao[] = [
    { type: "solicitar", pedido: pedido({ id: "novo" }) },
    { type: "aceitar", ids: ["a"], catadorId: "c1" },
    { ...coletar, id: "b" },
    { type: "cancelar", id: "a" },
    resgatar,
    { type: "definir-destaque", materialId: "vidro", multiplicador: 1.3 },
    { type: "criar-beneficio", beneficio: { id: "b2", publico: "cidadao", comercio: "Outra", titulo: "Brinde", custo: 10, estoque: 5, ativo: true } },
    { type: "alternar-beneficio", id: "b1" },
    { type: "criar-evento", evento: { id: "e1", titulo: "Feira", data: "2026-02-01", local: "Praça", descricao: "Exemplo" } },
    { type: "conceder-resgate", id: "r0" },
  ];
  for (const acao of acoes) {
    const novo = reduzir(e, acao);
    assert.notEqual(novo, e, `${acao.type} deveria mudar o estado`);
  }
});

test("parseEstado devolve um Estado serializado igual", () => {
  const e = comPedido(pedido());
  assert.deepEqual(parseEstado(JSON.stringify(e)), e);
});

test("coletar leva o catador até o ponto da parada coletada", () => {
  const e = comPedido(aceito());
  assert.deepEqual(e.catadores[0].posicao, { lng: -39.02, lat: -4.97 });
  const novo = reduzir(e, coletar);
  assert.deepEqual(novo.catadores[0].posicao, e.pedidos[0].ponto);
  // Sem efeito (já coletado) não move o catador nem muda o estado.
  assert.equal(reduzir(novo, coletar), novo);
});

test("parseEstado exige posição do catador com latitude e longitude numéricas", () => {
  const com = (mut: (c: Record<string, unknown>) => void) => {
    const o = JSON.parse(JSON.stringify(base())) as { catadores: Record<string, unknown>[] };
    mut(o.catadores[0]);
    return JSON.stringify(o);
  };
  assert.notEqual(parseEstado(com(() => {})), null);
  assert.equal(parseEstado(com((c) => { delete c.posicao; })), null);
  assert.equal(parseEstado(com((c) => { c.posicao = { lng: "x", lat: -4.9 }; })), null);
  assert.equal(parseEstado(com((c) => { c.posicao = { x: 1, y: 2 }; })), null);
  assert.equal(parseEstado(com((c) => { c.origem = { x: 1, y: 2 }; })), null);
});
