import { test } from "node:test";
import assert from "node:assert/strict";
import { ESTADO_INICIAL, MAPA } from "../data/seed.ts";
import { parseEstado, pontosDoPedido } from "./coleta.ts";
import type { Ponto } from "./types.ts";

const e = ESTADO_INICIAL;

function repetidos(ids: string[]): string[] {
  return ids.filter((id, i) => ids.indexOf(id) !== i);
}

// Ray casting; "x,y x,y ..." é o formato de BairroMapa.poligono.
function dentro(ponto: Ponto, poligono: string): boolean {
  const vs = poligono.split(/\s+/).map((par) => {
    const [x, y] = par.split(",").map(Number);
    return { x, y };
  });
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const a = vs[i];
    const b = vs[j];
    const cruza =
      a.y > ponto.y !== b.y > ponto.y &&
      ponto.x < ((b.x - a.x) * (ponto.y - a.y)) / (b.y - a.y) + a.x;
    if (cruza) inside = !inside;
  }
  return inside;
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

test("cada ponto de pedido e de solicitante cai dentro do seu bairro no mapa", () => {
  const bairros = new Map(MAPA.bairros.map((b) => [b.nome, b.poligono]));
  const conferir = (rotulo: string, bairro: string, ponto: Ponto) => {
    const poligono = bairros.get(bairro);
    assert.ok(poligono, `${rotulo}: bairro "${bairro}" não está no MAPA`);
    assert.ok(dentro(ponto, poligono), `${rotulo}: ponto fora de ${bairro}`);
  };
  for (const p of e.pedidos) conferir(p.id, p.bairro, p.ponto);
  for (const s of e.solicitantes) conferir(s.id, s.bairro, s.ponto);
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

test("o seed é um estado da versão 2 e passa por parseEstado", () => {
  assert.equal(e.versao, 2);
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
