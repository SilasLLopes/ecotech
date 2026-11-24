import { test } from "node:test";
import assert from "node:assert/strict";
import { distanciaM, ordenarRota } from "./route.ts";

test("distanciaM usa 10 m por unidade do mapa", () => {
  assert.equal(distanciaM({ x: 0, y: 0 }, { x: 3, y: 4 }), 50);
  assert.equal(distanciaM({ x: 1, y: 1 }, { x: 1, y: 1 }), 0);
});

test("ordenarRota segue o vizinho mais próximo", () => {
  const r = ordenarRota({ x: 0, y: 0 }, [
    { id: "A", ponto: { x: 10, y: 0 } },
    { id: "B", ponto: { x: 30, y: 0 } },
    { id: "C", ponto: { x: 20, y: 0 } },
  ]);
  assert.deepEqual(r.ordem, ["A", "C", "B"]);
  assert.equal(r.distanciaM, 300);
  assert.equal(r.minutos, Math.round(300 / 60 + 4 * 3));
});

test("ordenarRota com lista vazia", () => {
  assert.deepEqual(ordenarRota({ x: 0, y: 0 }, []), {
    ordem: [],
    distanciaM: 0,
    minutos: 0,
  });
});

test("ordenarRota com uma parada", () => {
  const r = ordenarRota({ x: 0, y: 0 }, [{ id: "A", ponto: { x: 6, y: 8 } }]);
  assert.deepEqual(r.ordem, ["A"]);
  assert.equal(r.distanciaM, 100);
  assert.equal(r.minutos, Math.round(100 / 60 + 4));
});

test("empate de distância resolve pela ordem de entrada", () => {
  const r = ordenarRota({ x: 0, y: 0 }, [
    { id: "A", ponto: { x: 5, y: 0 } },
    { id: "B", ponto: { x: -5, y: 0 } },
  ]);
  assert.deepEqual(r.ordem, ["A", "B"]);
});

test("ordenarRota não muta a lista de entrada", () => {
  const paradas = [
    { id: "A", ponto: { x: 10, y: 0 } },
    { id: "B", ponto: { x: 30, y: 0 } },
    { id: "C", ponto: { x: 20, y: 0 } },
  ];
  const copia = structuredClone(paradas);
  ordenarRota({ x: 0, y: 0 }, paradas);
  assert.deepEqual(paradas, copia);
});
