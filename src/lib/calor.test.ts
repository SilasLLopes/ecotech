import { test } from "node:test";
import assert from "node:assert/strict";
import { ESTADO_INICIAL } from "../data/seed.ts";
import {
  celulasQuentes,
  distanciaAoCatador,
  doacoesDoEstado,
  localMaisProximo,
  misturaDeMateriais,
  pontosDeCalor,
  porBairro,
  type DoacaoComStatus,
} from "./calor.ts";
import type { Catador } from "./types.ts";

const d = (over: Partial<DoacaoComStatus> = {}): DoacaoComStatus => ({
  lng: -39.01,
  lat: -4.965,
  bairro: "Centro",
  materialId: "pet",
  quantidade: 3,
  tipo: "cidadao",
  status: "coletado",
  ...over,
});

test("doacoesDoEstado vira uma doação por item de cada pedido não cancelado", () => {
  const e = structuredClone(ESTADO_INICIAL);
  e.pedidos[0].status = "cancelado";
  const doacoes = doacoesDoEstado(e);
  const esperadas = e.pedidos
    .filter((p) => p.status !== "cancelado")
    .reduce((n, p) => n + p.itens.length, 0);
  assert.equal(doacoes.length, esperadas);
  const p = e.pedidos.find((x) => x.status === "aguardando")!;
  const dele = doacoes.filter((x) => x.lng === p.ponto.lng && x.lat === p.ponto.lat && x.status === "aguardando");
  assert.equal(dele.length >= p.itens.length, true);
  // Tipo vem do solicitante (o Mercadinho é comerciante).
  const mercadinho = e.pedidos.find((x) => x.solicitanteId === "s-mercadinho")!;
  assert.equal(
    doacoes.find((x) => x.lng === mercadinho.ponto.lng && x.lat === mercadinho.ponto.lat)?.tipo,
    "comerciante",
  );
});

test("pontosDeCalor: 'todos' conta doações; um material soma a quantidade dele", () => {
  const doacoes = [
    d({ materialId: "pet", quantidade: 3 }),
    d({ materialId: "pet", quantidade: 5 }),
    d({ materialId: "vidro", quantidade: 4 }),
  ];
  const todos = pontosDeCalor(doacoes, { materialId: "todos", soColetados: false });
  assert.deepEqual(todos.map((p) => p.peso), [1, 1, 1]);
  const pet = pontosDeCalor(doacoes, { materialId: "pet", soColetados: false });
  assert.deepEqual(pet.map((p) => p.peso), [3, 5]);
});

test("pontosDeCalor: 'só coletados' tira o que ainda não foi coletado", () => {
  const doacoes = [d({ status: "coletado" }), d({ status: "aguardando" }), d({ status: "aceito" })];
  assert.equal(pontosDeCalor(doacoes, { materialId: "todos", soColetados: true }).length, 1);
  assert.equal(pontosDeCalor(doacoes, { materialId: "todos", soColetados: false }).length, 3);
});

test("celulasQuentes agrupa por quadra de ~250 m, soma pesos e ordena do mais quente", () => {
  const perto = [
    { lng: -39.0100, lat: -4.9650, peso: 2 },
    { lng: -39.0101, lat: -4.9651, peso: 3 }, // ~15 m: mesma célula
  ];
  const longe = [{ lng: -39.0200, lat: -4.9750, peso: 4 }];
  const cel = celulasQuentes([...longe, ...perto], 250);
  assert.equal(cel.length, 2);
  assert.equal(cel[0].peso, 5);
  assert.equal(cel[0].doacoes, 2);
  assert.equal(cel[1].peso, 4);
  // O centro da célula quente é o centroide ponderado.
  assert.ok(Math.abs(cel[0].lng - (-39.0100 * 2 + -39.0101 * 3) / 5) < 1e-9);
});

test("celulasQuentes de lista vazia é vazio", () => {
  assert.deepEqual(celulasQuentes([], 250), []);
});

test("localMaisProximo devolve a rua e o bairro de referência mais perto", () => {
  const refs = [
    { rua: "Rua A", bairro: "Centro", lng: -39.01, lat: -4.965 },
    { rua: "Rua B", bairro: "Combate", lng: -39.03, lat: -4.975 },
  ];
  const r = localMaisProximo({ lng: -39.0299, lat: -4.9749 }, refs);
  assert.equal(r.rua, "Rua B");
  assert.equal(r.bairro, "Combate");
  assert.ok(r.distanciaM < 30);
});

test("distanciaAoCatador usa o catador mais perto", () => {
  const catadores = [
    { posicao: { lng: -39.01, lat: -4.965 } },
    { posicao: { lng: -39.02, lat: -4.965 } },
  ] as Catador[];
  const m = distanciaAoCatador({ lng: -39.0199, lat: -4.965 }, catadores);
  assert.ok(m < 20);
  assert.equal(distanciaAoCatador({ lng: 0, lat: 0 }, []), Infinity);
});

test("misturaDeMateriais ordena por doações e soma quantidades; porBairro dá a parte de cada um", () => {
  const doacoes = [
    d({ materialId: "pet", quantidade: 3, bairro: "Centro" }),
    d({ materialId: "pet", quantidade: 5, bairro: "Centro" }),
    d({ materialId: "vidro", quantidade: 4, bairro: "Combate" }),
    d({ materialId: "latas", quantidade: 2, bairro: "Centro", status: "aguardando" }),
  ];
  const mix = misturaDeMateriais(doacoes, false);
  assert.deepEqual(mix.map((m) => [m.materialId, m.doacoes, m.quantidade]), [
    ["pet", 2, 8],
    ["vidro", 1, 4],
    ["latas", 1, 2],
  ]);
  assert.equal(misturaDeMateriais(doacoes, true).length, 2);
  const bairros = porBairro(doacoes, false);
  assert.deepEqual(bairros.map((b) => [b.bairro, b.doacoes]), [["Centro", 3], ["Combate", 1]]);
  assert.equal(bairros[0].parte, 0.75);
});
