import { test } from "node:test";
import assert from "node:assert/strict";
import { ESTADO_INICIAL } from "../data/seed.ts";
import rotasJson from "../data/rotas.json" with { type: "json" };
import { acompanhar } from "./acompanhamento.ts";
import { reduzir } from "./coleta.ts";
import type { Rotas } from "./types.ts";

const rotas = rotasJson as unknown as Rotas;

test("pedido aceito: mostra o catador, as paradas antes e a previsão", () => {
  const a = acompanhar(ESTADO_INICIAL, "p-005", rotas);
  assert.ok(a, "p-005 está aceito por um catador no seed");
  assert.equal(a.catador.id, "c-joao");
  assert.equal(a.antes, 0);
  assert.deepEqual(a.passando, []);
  assert.ok(a.distanciaM > 0 && a.minutos > 0);
  assert.equal(a.exato, true);
});

test("pedido que não está aceito não tem acompanhamento", () => {
  assert.equal(acompanhar(ESTADO_INICIAL, "p-006", rotas), null); // aguardando
  assert.equal(acompanhar(ESTADO_INICIAL, "p-001", rotas), null); // coletado
  assert.equal(acompanhar(ESTADO_INICIAL, "nao-existe", rotas), null);
});

test("com várias paradas, cada pedido sabe quantas vêm antes e o tempo cresce", () => {
  let e = ESTADO_INICIAL;
  e = reduzir(e, { type: "aceitar", ids: ["p-006", "p-007", "p-008"], catadorId: "c-joao" });
  const ids = ["p-005", "p-006", "p-007", "p-008"];
  const itens = ids.map((id) => acompanhar(e, id, rotas));
  assert.ok(itens.every(Boolean));
  const ordenados = itens.map((a, i) => ({ id: ids[i], a: a! })).sort((x, y) => x.a.antes - y.a.antes);
  assert.deepEqual(ordenados.map((x) => x.a.antes), [0, 1, 2, 3]);
  for (let i = 1; i < ordenados.length; i++) {
    assert.ok(ordenados[i].a.minutos > ordenados[i - 1].a.minutos, "tempo cresce a cada parada");
    assert.equal(ordenados[i].a.passando.length, ordenados[i].a.antes);
  }
});

test("depois de coletar, a previsão parte da nova posição do catador", () => {
  let e = reduzir(ESTADO_INICIAL, { type: "aceitar", ids: ["p-007"], catadorId: "c-joao" });
  const antes = acompanhar(e, "p-007", rotas)!;
  e = reduzir(e, { type: "coletar", id: "p-005", catadorId: "c-joao", lancamentoId: "l-x", em: "2026-11-24T10:00" });
  const depois = acompanhar(e, "p-007", rotas)!;
  assert.equal(depois.antes, 0);
  assert.ok(antes.antes >= depois.antes);
});
