import { test } from "node:test";
import assert from "node:assert/strict";
import { AREA_URBANA, BAIRROS, ESTADO_INICIAL } from "../data/seed.ts";
import historico from "../data/historico.json" with { type: "json" };

const materiais = new Set(ESTADO_INICIAL.materiais.map((m) => m.id));
const bairros = new Set(BAIRROS.map((b) => b.nome));

test("histórico de exemplo do mapa de calor é válido", () => {
  assert.ok(historico.length >= 50, "histórico grande o bastante para ter calor");
  for (const [i, d] of historico.entries()) {
    assert.ok(materiais.has(d.materialId as never), `#${i}: material ${d.materialId}`);
    assert.ok(bairros.has(d.bairro), `#${i}: bairro ${d.bairro}`);
    assert.ok(Number.isFinite(d.quantidade) && d.quantidade > 0, `#${i}: quantidade`);
    assert.ok(d.tipo === "cidadao" || d.tipo === "comerciante", `#${i}: tipo`);
    assert.ok(
      d.lng >= AREA_URBANA.oeste && d.lng <= AREA_URBANA.leste &&
        d.lat >= AREA_URBANA.sul && d.lat <= AREA_URBANA.norte,
      `#${i}: fora da área urbana`,
    );
  }
});

test("o histórico cobre todos os bairros e todos os materiais", () => {
  assert.equal(new Set(historico.map((d) => d.bairro)).size, BAIRROS.length);
  assert.equal(new Set(historico.map((d) => d.materialId)).size, ESTADO_INICIAL.materiais.length);
});
