import { test } from "node:test";
import assert from "node:assert/strict";
import { dataBR, formatarEm, hora, numero, pontos } from "./format.ts";

// Intl pode usar espaço sem quebra (U+00A0) entre número e unidade.
const normalizar = (s: string) => s.replace(/ /g, " ");

test("numero usa separador de milhar do pt-BR", () => {
  assert.equal(normalizar(numero(12480)), "12.480");
  assert.equal(numero(0), "0");
});

test("pontos junta o número formatado e 'pts'", () => {
  assert.equal(normalizar(pontos(1250)), "1.250 pts");
  assert.equal(normalizar(pontos(0)), "0 pts");
});

test("hora devolve ISO local AAAA-MM-DDTHH:mm, sem deslocar fuso", () => {
  assert.equal(hora(new Date(2026, 10, 24, 14, 32, 59)), "2026-11-24T14:32");
});

test("hora completa mês, dia, hora e minuto com zero à esquerda", () => {
  assert.equal(hora(new Date(2026, 0, 5, 0, 7)), "2026-01-05T00:07");
  assert.equal(hora(new Date(2026, 11, 31, 23, 59)), "2026-12-31T23:59");
});

test("formatarEm mostra dia/mês e hora de um ISO com hora", () => {
  assert.equal(formatarEm("2026-11-24T07:30"), "24/11, 07:30");
  assert.equal(formatarEm("2026-11-24T07:30:00"), "24/11, 07:30");
});

test("formatarEm aceita ISO só com data", () => {
  assert.equal(formatarEm("2026-11-24"), "24/11");
});

test("formatarEm devolve o texto fora do formato como veio (dados antigos)", () => {
  assert.equal(formatarEm("Hoje, 14:32"), "Hoje, 14:32");
  assert.equal(formatarEm(""), "");
});

test("o que hora grava, formatarEm lê", () => {
  assert.equal(formatarEm(hora(new Date(2026, 10, 24, 9, 5))), "24/11, 09:05");
});

test("dataBR vira dia/mês/ano e preserva texto desconhecido", () => {
  assert.equal(dataBR("2026-12-06"), "06/12/2026");
  assert.equal(dataBR("2026-12-06T10:00"), "06/12/2026");
  assert.equal(dataBR("em breve"), "em breve");
});
