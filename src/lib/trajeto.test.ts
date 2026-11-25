import { test } from "node:test";
import assert from "node:assert/strict";
import { chavePonto, minutosDoTrajeto, trajeto } from "./trajeto.ts";
import { distanciaM } from "./route.ts";
import type { Rotas } from "./types.ts";

const A = { lng: -39.001, lat: -4.96 };
const B = { lng: -39.002, lat: -4.96 };
const C = { lng: -39.003, lat: -4.96 };

const rotas: Rotas = {
  pontos: { A, B, C },
  trechos: {
    "A>B": { d: 120, s: 90, g: [[-39.001, -4.96], [-39.0015, -4.9602], [-39.002, -4.96]] },
    "B>C": { d: 130, s: 100, g: [[-39.002, -4.96], [-39.003, -4.96]] },
  },
};

test("chavePonto arredonda a 5 casas e é estável", () => {
  assert.equal(chavePonto({ lng: -39.0150004, lat: -4.9718361 }), "-39.01500,-4.97184");
  assert.equal(chavePonto({ lng: -39.015, lat: -4.97184 }), "-39.01500,-4.97184");
});

test("trajeto concatena os trechos guardados sem repetir a junção", () => {
  const r = trajeto([A, B, C], rotas);
  assert.deepEqual(r.coords, [
    [-39.001, -4.96],
    [-39.0015, -4.9602],
    [-39.002, -4.96],
    [-39.003, -4.96],
  ]);
  assert.equal(r.distanciaM, 250);
  assert.equal(r.segundos, 190);
  assert.equal(r.exato, true);
});

test("trecho ausente cai em linha reta e marca como estimativa", () => {
  const r = trajeto([A, C], rotas);
  assert.deepEqual(r.coords, [
    [A.lng, A.lat],
    [C.lng, C.lat],
  ]);
  const metros = distanciaM(A, C);
  assert.equal(r.distanciaM, metros);
  assert.equal(r.segundos, metros / 1.4);
  assert.equal(r.exato, false);
});

test("ponto fora das rotas guardadas também vira linha reta estimada", () => {
  const fora = { lng: -39.5, lat: -4.5 };
  const r = trajeto([A, fora], rotas);
  assert.equal(r.exato, false);
  assert.deepEqual(r.coords[r.coords.length - 1], [fora.lng, fora.lat]);
});

test("um trecho exato e outro estimado: soma os dois e marca estimado", () => {
  const D = { lng: -39.004, lat: -4.96 };
  const r = trajeto([A, B, D], rotas);
  assert.equal(r.exato, false);
  assert.equal(r.distanciaM, 120 + distanciaM(B, D));
});

test("um ponto devolve só esse ponto, e nenhum devolve vazio", () => {
  assert.deepEqual(trajeto([B], rotas), {
    coords: [[B.lng, B.lat]],
    distanciaM: 0,
    segundos: 0,
    exato: true,
  });
  assert.deepEqual(trajeto([], rotas), { coords: [], distanciaM: 0, segundos: 0, exato: true });
});

test("minutosDoTrajeto soma o tempo a pé e 4 min de manuseio por parada", () => {
  assert.equal(minutosDoTrajeto(600, 3), 22);
  assert.equal(minutosDoTrajeto(0, 0), 0);
  assert.equal(minutosDoTrajeto(90, 1), 6); // 1,5 + 4 = 5,5 → 6
});
