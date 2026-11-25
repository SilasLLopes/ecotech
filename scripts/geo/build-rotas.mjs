#!/usr/bin/env node
// Preparo único (à mão): calcula o trajeto A PÉ entre todo par ordenado de pontos de
// src/data/pontos-geo.json e grava src/data/rotas.json. Não roda em tempo de execução.
//
// Serviço: routing.openstreetmap.de (FOSSGIS), instância `routed-foot` do OSRM com perfil
// a pé. ATENÇÃO: o servidor demo do OSRM (router.project-osrm.org) ignora o perfil e devolve
// rota de carro; por isso o endereço usa `routed-foot`. Velocidade média esperada: ~4,5 km/h.
// No máximo 1 pedido por segundo, User-Agent genérico, nenhum dado pessoal.
// Dados © OpenStreetMap contributors (ODbL).
//
// Formato: { pontos: Record<chave, {lng, lat}>, trechos: Record<"A>B", { d, s, g }> }
//   d = distância em metros, s = duração em segundos, g = [lng, lat][] com 5 casas.
//
// Uso: node scripts/geo/build-rotas.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ENTRADA = fileURLToPath(new URL("../../src/data/pontos-geo.json", import.meta.url));
const SAIDA = fileURLToPath(new URL("../../src/data/rotas.json", import.meta.url));
const UA = "ecotech-prototype-geo-script";
const INTERVALO_MS = 1100;
const BASE = "https://routing.openstreetmap.de/routed-foot/route/v1/foot";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const arredondar = (n) => Math.round(n * 1e5) / 1e5;

const pontos = JSON.parse(readFileSync(ENTRADA, "utf8"));
const porChave = Object.fromEntries(pontos.map((p) => [p.chave, p]));
const chaves = pontos.map((p) => p.chave);

let ultimo = 0;
async function rota(a, b) {
  const url = `${BASE}/${a.lng},${a.lat};${b.lng},${b.lat}?overview=full&geometries=geojson&steps=false&alternatives=false`;
  for (let tentativa = 1; tentativa <= 3; tentativa++) {
    const espera = ultimo + INTERVALO_MS - Date.now();
    if (espera > 0) await sleep(espera);
    ultimo = Date.now();
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA } });
      if (r.ok) {
        const j = await r.json();
        if (j.code === "Ok" && j.routes?.[0]) return j.routes[0];
        console.warn(`  resposta sem rota (${j.code}) em ${a.chave}>${b.chave}`);
      } else {
        console.warn(`  HTTP ${r.status} em ${a.chave}>${b.chave}`);
      }
    } catch (e) {
      console.warn(`  falha em ${a.chave}>${b.chave}: ${e.message}`);
    }
    await sleep(INTERVALO_MS * 2);
  }
  throw new Error(`Abortado: ${a.chave}>${b.chave} falhou 3 vezes. Nada foi gravado.`);
}

const trechos = {};
let feitos = 0;
const total = chaves.length * (chaves.length - 1);
for (const de of chaves) {
  for (const para of chaves) {
    if (de === para) continue;
    const r = await rota(porChave[de], porChave[para]);
    const g = [];
    for (const [lng, lat] of r.geometry.coordinates) {
      const c = [arredondar(lng), arredondar(lat)];
      const u = g[g.length - 1];
      if (!u || u[0] !== c[0] || u[1] !== c[1]) g.push(c); // sem pontos repetidos
    }
    trechos[`${de}>${para}`] = { d: Math.round(r.distance), s: Math.round(r.duration), g };
    feitos++;
    if (feitos % 10 === 0) console.log(`${feitos}/${total}`);
  }
}

const saida = {
  pontos: Object.fromEntries(pontos.map((p) => [p.chave, { lng: p.lng, lat: p.lat }])),
  trechos,
};
// Só grava com todos os pares prontos (nunca arquivo incompleto). JSON compacto.
writeFileSync(SAIDA, JSON.stringify(saida) + "\n");
console.log(`Gravado ${feitos} trechos em ${SAIDA}`);
