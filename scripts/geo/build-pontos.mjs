#!/usr/bin/env node
// Preparo único (à mão): escolhe posições de exemplo sobre ruas reais de Quixadá e grava
// src/data/pontos-geo.json. Não roda em tempo de execução do app.
//
// Serviços públicos usados, no máximo 1 pedido por segundo, User-Agent genérico, sem dado pessoal:
//   - Nominatim (OpenStreetMap): ponto de referência de cada bairro e geocodificação reversa;
//   - routing.openstreetmap.de (FOSSGIS), perfil a pé: `nearest` encaixa a posição na rua.
// Dados © OpenStreetMap contributors (ODbL).
//
// Uso: node scripts/geo/build-pontos.mjs
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SAIDA = fileURLToPath(new URL("../../src/data/pontos-geo.json", import.meta.url));
const UA = "ecotech-prototype-geo-script";
const INTERVALO_MS = 1100;
const DISTANCIA_MINIMA_M = 200; // pontos não ficam colados

// Pontos de exemplo: a chave liga o seed (Tarefa 2) ao ponto. Quem divide endereço no seed
// divide o ponto: os pedidos p-001..p-005 usam s-ana, p-011..p-013 usam s-mercadinho,
// p-007 usa s-carlos.
const PONTOS = [
  { chave: "s-ana", bairro: "Centro" },
  { chave: "p-010", bairro: "Centro" },
  { chave: "c-joao", bairro: "Centro" },
  { chave: "s-mercadinho", bairro: "Campo Velho" },
  { chave: "p-006", bairro: "Campo Velho" },
  { chave: "s-carlos", bairro: "Alto São Francisco" },
  { chave: "c-francisca", bairro: "Alto São Francisco" },
  { chave: "p-008", bairro: "Planalto Universitário" },
  { chave: "c-raimundo", bairro: "Planalto Universitário" },
  { chave: "p-009", bairro: "Combate" },
  { chave: "c-luciana", bairro: "Combate" },
];

// Posições (leste, norte em metros) testadas em ordem, em torno do ponto de referência do
// bairro, até achar uma que caia numa rua com nome. Cada ponto do mesmo bairro começa num
// deslocamento diferente.
const DESLOCAMENTOS = [
  [0, 0], [150, 120], [-150, 100], [120, -160], [-170, -130],
  [300, 0], [-300, 40], [0, 300], [20, -300], [280, 260], [-260, -240], [-280, 260], [260, -260],
  [450, 100], [-450, 0], [0, 450], [0, -450],
];
const INICIO_POR_INDICE = [0, 5, 9]; // 1º, 2º e 3º ponto do mesmo bairro

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ultimo = 0;
async function pegarJson(url) {
  const espera = ultimo + INTERVALO_MS - Date.now();
  if (espera > 0) await sleep(espera);
  for (let tentativa = 1; tentativa <= 3; tentativa++) {
    ultimo = Date.now();
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "pt-BR" } });
      if (r.ok) return await r.json();
      console.warn(`  HTTP ${r.status} em ${url}`);
    } catch (e) {
      console.warn(`  falha em ${url}: ${e.message}`);
    }
    await sleep(INTERVALO_MS * 2);
  }
  throw new Error(`Pedido falhou 3 vezes: ${url}`);
}

const nominatim = (rota, params) =>
  pegarJson(`https://nominatim.openstreetmap.org/${rota}?${new URLSearchParams({ format: "jsonv2", ...params })}`);
const nearest = (lng, lat) =>
  pegarJson(`https://routing.openstreetmap.de/routed-foot/nearest/v1/foot/${lng},${lat}?number=1`);

function metros(a, b) {
  const R = 6371008.8;
  const rad = (g) => (g * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const deslocar = (p, leste, norte) => ({
  lng: p.lng + leste / (111320 * Math.cos((p.lat * Math.PI) / 180)),
  lat: p.lat + norte / 110574,
});
const arredondar = (n) => Math.round(n * 1e6) / 1e6;
const norm = (s) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();

// 1. Ponto de referência de cada bairro (Nominatim). O Nominatim não devolve um ponto útil
// para "Centro"; nesse caso usa-se a posição abaixo, conferida no mapa (Praça do Cristo Redentor).
const CENTRO_MANUAL = { lng: -39.015, lat: -4.9715 };
const referencias = {};
for (const bairro of [...new Set(PONTOS.map((p) => p.bairro))]) {
  if (bairro === "Centro") {
    referencias[bairro] = CENTRO_MANUAL;
    continue;
  }
  const achados = await nominatim("search", {
    q: `${bairro}, Quixadá, Ceará`,
    limit: "5",
    countrycodes: "br",
  });
  const sub = achados.find((x) => x.category === "place" && /Quixad/.test(x.display_name));
  if (!sub) throw new Error(`Bairro sem referência no Nominatim: ${bairro}`);
  referencias[bairro] = { lng: Number(sub.lon), lat: Number(sub.lat) };
  console.log(`Referência ${bairro}: ${sub.lat}, ${sub.lon} (${sub.display_name})`);
}

// 2. Para cada ponto, primeira posição que cai numa rua com nome, distinta das já escolhidas.
const escolhidos = [];
const contagemPorBairro = {};
for (const def of PONTOS) {
  const i = (contagemPorBairro[def.bairro] = (contagemPorBairro[def.bairro] ?? -1) + 1);
  const ref = referencias[def.bairro];
  const inicio = INICIO_POR_INDICE[i] ?? 0;
  let aceito = null;
  for (let k = 0; k < DESLOCAMENTOS.length && !aceito; k++) {
    const [le, no] = DESLOCAMENTOS[(inicio + k) % DESLOCAMENTOS.length];
    const alvo = deslocar(ref, le, no);
    const viz = (await nearest(alvo.lng, alvo.lat)).waypoints?.[0];
    if (!viz || !viz.name) {
      console.log(`  ${def.chave}: sem nome em ${le},${no}; tentando outra posição`);
      continue;
    }
    const [lng, lat] = viz.location.map(arredondar);
    const pos = { lng, lat };
    if (viz.distance > 120) continue; // longe de qualquer rua: não é a malha urbana
    if (escolhidos.some((e) => metros(e, pos) < DISTANCIA_MINIMA_M)) continue;
    if (escolhidos.some((e) => norm(e.rua) === norm(viz.name))) continue; // uma rua por ponto
    const rev = await nominatim("reverse", { lat: String(lat), lon: String(lng), zoom: "17", addressdetails: "1" });
    const rua = rev.address?.road;
    if (!rua) {
      console.log(`  ${def.chave}: geocodificação reversa sem rua em ${lat},${lng}`);
      continue;
    }
    if (norm(rua) !== norm(viz.name)) {
      console.log(`  ${def.chave}: nomes divergem ("${rua}" x "${viz.name}"); tentando outra posição`);
      continue;
    }
    // Nos bairros que existem no OpenStreetMap, o ponto cai dentro deles ("Centro" não é um
    // bairro mapeado: o OSM divide a área central em Sitiá Oeste, Baviera etc.).
    const suburbio = rev.address?.suburb ?? rev.address?.neighbourhood ?? "";
    if (def.bairro !== "Centro" && norm(suburbio) !== norm(def.bairro)) {
      console.log(`  ${def.chave}: ponto cai em "${suburbio}", não em ${def.bairro}; tentando outra posição`);
      continue;
    }
    aceito = { chave: def.chave, bairro: def.bairro, lng, lat, rua };
  }
  if (!aceito) throw new Error(`Nenhuma posição válida para ${def.chave} (${def.bairro})`);
  console.log(`${aceito.chave}\t${aceito.bairro}\t${aceito.rua}\t${aceito.lng}, ${aceito.lat}`);
  escolhidos.push(aceito);
}

// Só grava com tudo certo (nunca arquivo incompleto).
writeFileSync(SAIDA, JSON.stringify(escolhidos, null, 2) + "\n");
console.log(`Gravado ${escolhidos.length} pontos em ${SAIDA}`);
