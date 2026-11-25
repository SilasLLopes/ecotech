import { test } from "node:test";
import assert from "node:assert/strict";
import { ateFracao, easeSuave, pontoNaFracao, type Coord } from "./percurso.ts";

// Dois trechos retos sobre o equador: 0,001° e 0,002° de longitude (1/3 e 2/3).
const linha: Coord[] = [
  [0, 0],
  [0.001, 0],
  [0.003, 0],
];

function proximo(a: Coord, b: Coord) {
  assert.ok(Math.abs(a[0] - b[0]) < 1e-9 && Math.abs(a[1] - b[1]) < 1e-9, `${a} ≠ ${b}`);
}

test("ateFracao devolve o começo, o fim e os pontos intermediários", () => {
  assert.deepEqual(ateFracao(linha, 0), [[0, 0]]);
  assert.deepEqual(ateFracao(linha, 1), linha);
  const terco = ateFracao(linha, 1 / 3);
  assert.equal(terco.length, 2);
  proximo(terco[1], [0.001, 0]);
  const meio = ateFracao(linha, 0.5);
  assert.equal(meio.length, 3);
  proximo(meio[2], [0.0015, 0]);
});

test("ateFracao limita a fração e não muta a entrada", () => {
  const copia = structuredClone(linha);
  assert.deepEqual(ateFracao(linha, -2), [[0, 0]]);
  assert.deepEqual(ateFracao(linha, 7), linha);
  assert.notEqual(ateFracao(linha, 1), linha);
  assert.deepEqual(linha, copia);
});

test("pontoNaFracao anda pela linha em proporção ao comprimento", () => {
  proximo(pontoNaFracao(linha, 0), [0, 0]);
  proximo(pontoNaFracao(linha, 0.5), [0.0015, 0]);
  proximo(pontoNaFracao(linha, 1), [0.003, 0]);
  proximo(pontoNaFracao(linha, 9), [0.003, 0]);
});

test("percurso vazio ou de um ponto não quebra", () => {
  assert.deepEqual(ateFracao([], 0.5), []);
  assert.deepEqual(ateFracao([[1, 2]], 0.5), [[1, 2]]);
  assert.deepEqual(pontoNaFracao([[1, 2]], 0.5), [1, 2]);
});

test("easeSuave começa em 0, termina em 1 e só cresce", () => {
  assert.equal(easeSuave(0), 0);
  assert.equal(easeSuave(1), 1);
  assert.equal(easeSuave(-1), 0);
  assert.equal(easeSuave(2), 1);
  let anterior = 0;
  for (let t = 0.1; t <= 1; t += 0.1) {
    const v = easeSuave(t);
    assert.ok(v >= anterior, `${t}`);
    anterior = v;
  }
});
