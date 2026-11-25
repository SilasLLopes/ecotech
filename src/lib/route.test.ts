import { test } from "node:test";
import assert from "node:assert/strict";
import { distanciaM, ordenarRota } from "./route.ts";

// No equador, 0,001° de longitude ≈ 111,19 m (raio médio de 6.371 km).
const GRAU_M = 111194.9;

function perto(real: number, esperado: number, tolerancia = 1) {
  assert.ok(
    Math.abs(real - esperado) <= tolerancia,
    `${real} deveria estar a ${tolerancia} de ${esperado}`,
  );
}

test("distanciaM mede em metros reais (haversine)", () => {
  perto(distanciaM({ lng: 0, lat: 0 }, { lng: 0, lat: 0.001 }), GRAU_M / 1000);
  perto(distanciaM({ lng: 0, lat: 0 }, { lng: 0.001, lat: 0 }), GRAU_M / 1000);
  assert.equal(distanciaM({ lng: -39.01, lat: -4.96 }, { lng: -39.01, lat: -4.96 }), 0);
  // Simétrica.
  const a = { lng: -39.015, lat: -4.9718 };
  const b = { lng: -39.0099, lat: -4.9643 };
  assert.equal(distanciaM(a, b), distanciaM(b, a));
  // Em Quixadá 1° de longitude é um pouco menor que no equador (cos 4,97°).
  perto(distanciaM({ lng: -39, lat: -4.97 }, { lng: -38.999, lat: -4.97 }), (GRAU_M / 1000) * Math.cos((4.97 * Math.PI) / 180), 0.05);
});

test("ordenarRota segue o vizinho mais próximo", () => {
  const r = ordenarRota({ lng: 0, lat: 0 }, [
    { id: "A", ponto: { lng: 0.001, lat: 0 } },
    { id: "B", ponto: { lng: 0.003, lat: 0 } },
    { id: "C", ponto: { lng: 0.002, lat: 0 } },
  ]);
  assert.deepEqual(r.ordem, ["A", "C", "B"]);
  perto(r.distanciaM, (GRAU_M * 3) / 1000);
});

test("ordenarRota com lista vazia", () => {
  assert.deepEqual(ordenarRota({ lng: 0, lat: 0 }, []), { ordem: [], distanciaM: 0 });
});

test("ordenarRota com uma parada", () => {
  const r = ordenarRota({ lng: 0, lat: 0 }, [{ id: "A", ponto: { lng: 0, lat: 0.002 } }]);
  assert.deepEqual(r.ordem, ["A"]);
  perto(r.distanciaM, (GRAU_M * 2) / 1000);
});

test("empate de distância resolve pela ordem de entrada", () => {
  const r = ordenarRota({ lng: 0, lat: 0 }, [
    { id: "A", ponto: { lng: 0.001, lat: 0 } },
    { id: "B", ponto: { lng: -0.001, lat: 0 } },
  ]);
  assert.deepEqual(r.ordem, ["A", "B"]);
});

test("ordenarRota não muta a lista de entrada", () => {
  const paradas = [
    { id: "A", ponto: { lng: 0.001, lat: 0 } },
    { id: "B", ponto: { lng: 0.003, lat: 0 } },
    { id: "C", ponto: { lng: 0.002, lat: 0 } },
  ];
  const copia = structuredClone(paradas);
  ordenarRota({ lng: 0, lat: 0 }, paradas);
  assert.deepEqual(paradas, copia);
});
