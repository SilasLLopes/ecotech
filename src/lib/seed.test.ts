import { test } from "node:test";
import assert from "node:assert/strict";
import { AREA_URBANA, BAIRROS, ESTADO_INICIAL } from "../data/seed.ts";
import pontosGeo from "../data/pontos-geo.json" with { type: "json" };
import rotasJson from "../data/rotas.json" with { type: "json" };
import { parseEstado, pontosDoPedido } from "./coleta.ts";
import { chavePonto } from "./trajeto.ts";
import type { Ponto, Rotas } from "./types.ts";

const e = ESTADO_INICIAL;
const rotas = rotasJson as unknown as Rotas;

function repetidos(ids: string[]): string[] {
  return ids.filter((id, i) => ids.indexOf(id) !== i);
}

test("saldo de cada solicitante é a soma do seu extrato", () => {
  for (const s of e.solicitantes) {
    const soma = e.extrato
      .filter((l) => l.solicitanteId === s.id)
      .reduce((total, l) => total + l.pontos, 0);
    assert.equal(s.saldo, soma, `saldo de ${s.id}`);
  }
});

test("pontos de cada pedido coletado seguem pontosDoPedido", () => {
  const coletados = e.pedidos.filter((p) => p.status === "coletado");
  assert.ok(coletados.length > 0);
  for (const p of coletados) {
    assert.equal(
      p.pontos,
      pontosDoPedido(p.itens, e.materiais, e.destaque),
      `pontos de ${p.id}`,
    );
  }
});

test("ids são únicos em cada coleção", () => {
  const colecoes: Record<string, { id: string }[]> = {
    materiais: e.materiais,
    solicitantes: e.solicitantes,
    catadores: e.catadores,
    pedidos: e.pedidos,
    beneficios: e.beneficios,
    resgates: e.resgates,
    extrato: e.extrato,
    eventos: e.eventos,
  };
  for (const [nome, itens] of Object.entries(colecoes)) {
    assert.deepEqual(repetidos(itens.map((i) => i.id)), [], nome);
  }
});

test("todas as referências entre coleções existem", () => {
  const ids = (itens: { id: string }[]) => new Set(itens.map((i) => i.id));
  const solicitantes = ids(e.solicitantes);
  const catadores = ids(e.catadores);
  const beneficios = ids(e.beneficios);
  const materiais = ids(e.materiais);

  assert.ok(materiais.has(e.destaque.materialId), "destaque");
  for (const p of e.pedidos) {
    assert.ok(solicitantes.has(p.solicitanteId), `${p.id}: solicitante`);
    if (p.catadorId) assert.ok(catadores.has(p.catadorId), `${p.id}: catador`);
    for (const i of p.itens) assert.ok(materiais.has(i.materialId), `${p.id}: material`);
  }
  for (const r of e.resgates) {
    assert.ok(solicitantes.has(r.solicitanteId), `${r.id}: solicitante`);
    assert.ok(beneficios.has(r.beneficioId), `${r.id}: benefício`);
  }
  for (const l of e.extrato) {
    assert.ok(solicitantes.has(l.solicitanteId), `${l.id}: solicitante`);
  }
});

test("pedidos aceitos e coletados têm catador; aguardando não tem", () => {
  for (const p of e.pedidos) {
    if (p.status === "aceito" || p.status === "coletado") {
      assert.ok(p.catadorId, `${p.id} sem catador`);
    }
    if (p.status === "aguardando") assert.equal(p.catadorId, undefined, p.id);
  }
});

const emArea = (p: Ponto) =>
  p.lng >= AREA_URBANA.oeste &&
  p.lng <= AREA_URBANA.leste &&
  p.lat >= AREA_URBANA.sul &&
  p.lat <= AREA_URBANA.norte;

function pontosDoSeed(): { rotulo: string; ponto: Ponto; endereco?: string }[] {
  return [
    ...e.pedidos.map((p) => ({ rotulo: p.id, ponto: p.ponto, endereco: p.endereco })),
    ...e.solicitantes.map((s) => ({ rotulo: s.id, ponto: s.ponto, endereco: s.endereco })),
    ...e.catadores.flatMap((c) => [
      { rotulo: `${c.id} origem`, ponto: c.origem },
      { rotulo: `${c.id} posição`, ponto: c.posicao },
    ]),
  ];
}

test("todo ponto do seed fica dentro da área urbana de Quixadá", () => {
  for (const { rotulo, ponto } of pontosDoSeed()) {
    assert.ok(emArea(ponto), `${rotulo}: ponto fora da área urbana`);
  }
  for (const b of BAIRROS) assert.ok(emArea(b.centro), `bairro ${b.nome}`);
});

test("todo bairro citado pelo seed existe em BAIRROS", () => {
  const nomes = new Set(BAIRROS.map((b) => b.nome));
  for (const p of e.pedidos) assert.ok(nomes.has(p.bairro), `${p.id}: ${p.bairro}`);
  for (const s of e.solicitantes) assert.ok(nomes.has(s.bairro), `${s.id}: ${s.bairro}`);
});

test("todo ponto do seed é um ponto real de pontos-geo.json, e o endereço traz o nome da rua", () => {
  const porChave = new Map(pontosGeo.map((g) => [chavePonto(g), g]));
  for (const { rotulo, ponto, endereco } of pontosDoSeed()) {
    const geo = porChave.get(chavePonto(ponto));
    assert.ok(geo, `${rotulo}: ponto não está em pontos-geo.json`);
    if (endereco) {
      assert.ok(
        endereco.startsWith(`${geo.rua}, `),
        `${rotulo}: endereço "${endereco}" deveria começar por "${geo.rua}, "`,
      );
    }
  }
});

test("todo ponto do seed tem rota guardada para todos os outros", () => {
  const chaves = new Set(pontosDoSeed().map((x) => chavePonto(x.ponto)));
  const porChave = new Map(
    Object.entries(rotas.pontos).map(([id, p]) => [chavePonto(p), id]),
  );
  const ids = [...chaves].map((c) => {
    const id = porChave.get(c);
    assert.ok(id, `ponto ${c} não está em rotas.json`);
    return id;
  });
  for (const a of ids) {
    for (const b of ids) {
      if (a === b) continue;
      assert.ok(rotas.trechos[`${a}>${b}`], `faltam o trecho ${a}>${b}`);
    }
  }
});

test("todo benefício tem público válido e há ao menos um ativo de cada público", () => {
  for (const b of e.beneficios) {
    assert.ok(b.publico === "cidadao" || b.publico === "comerciante", `${b.id}: público`);
  }
  for (const publico of ["cidadao", "comerciante"] as const) {
    assert.ok(
      e.beneficios.some((b) => b.publico === publico && b.ativo),
      `nenhum benefício ativo de ${publico}`,
    );
  }
});

test("benefícios de comerciante vêm da Prefeitura de Quixadá", () => {
  for (const b of e.beneficios.filter((x) => x.publico === "comerciante")) {
    assert.equal(b.comercio, "Prefeitura de Quixadá", b.id);
  }
});

test("resgates do seed ligam benefício e solicitante do mesmo público", () => {
  for (const r of e.resgates) {
    const b = e.beneficios.find((x) => x.id === r.beneficioId);
    const s = e.solicitantes.find((x) => x.id === r.solicitanteId);
    assert.ok(b && s, r.id);
    assert.equal(s.tipo, b.publico, r.id);
    assert.ok(["emitido", "solicitado", "concedido"].includes(r.status), r.id);
  }
});

test("o seed é um estado da versão 3 e passa por parseEstado", () => {
  assert.equal(e.versao, 3);
  assert.deepEqual(Object.keys(e).sort(), [
    "beneficios",
    "catadores",
    "destaque",
    "eventos",
    "extrato",
    "materiais",
    "pedidos",
    "resgates",
    "solicitantes",
    "versao",
  ]);
  assert.deepEqual(parseEstado(JSON.stringify(e)), e);
});
