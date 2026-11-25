import { test } from "node:test";
import assert from "node:assert/strict";
import { interpolar, rotuloDelta } from "./movimento.ts";

test("interpolar vai do valor inicial ao final e limita o tempo a 0–1", () => {
  assert.equal(interpolar(100, 140, 0), 100);
  assert.equal(interpolar(100, 140, 1), 140);
  assert.equal(interpolar(100, 140, -3), 100);
  assert.equal(interpolar(100, 140, 9), 140);
  assert.equal(interpolar(140, 100, 1), 100);
});

test("interpolar é monótona e suave (começa e termina devagar)", () => {
  let anterior = 100;
  for (let t = 0.05; t <= 1.0001; t += 0.05) {
    const v = interpolar(100, 140, t);
    assert.ok(v >= anterior, `t=${t}`);
    anterior = v;
  }
  // No meio exato passa pela metade; no começo anda menos que o linear.
  assert.equal(interpolar(0, 100, 0.5), 50);
  assert.ok(interpolar(0, 100, 0.1) < 10);
  assert.ok(interpolar(0, 100, 0.9) > 90);
});

test("interpolar devolve o valor final inteiro quando de e para são iguais", () => {
  assert.equal(interpolar(7, 7, 0.4), 7);
});

test("rotuloDelta escreve a variação de pontos", () => {
  assert.equal(rotuloDelta(40), "+40 pts");
  assert.equal(rotuloDelta(1), "+1 pt");
  assert.equal(rotuloDelta(-120), "−120 pts");
  assert.equal(rotuloDelta(-1), "−1 pt");
  assert.equal(rotuloDelta(0), "");
  assert.equal(rotuloDelta(1234), "+1.234 pts");
});
