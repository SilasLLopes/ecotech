// Gera o histórico de exemplo que alimenta o mapa de calor da Prefeitura
// (src/data/historico.json): ~100 doações fictícias espalhadas em torno dos
// pontos de exemplo, com um "perfil" por bairro (quem mais dá e o quê). Não usa
// rede nem dado pessoal; é determinístico (mesma semente, mesmo arquivo).
// Uso: node scripts/geo/build-historico.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const pontos = JSON.parse(readFileSync(resolve(raiz, "src/data/pontos-geo.json"), "utf8"));

let estado = 20261124;
const aleatorio = () => {
  estado = (estado * 1664525 + 1013904223) % 4294967296;
  return estado / 4294967296;
};
const normal = () => {
  const u = Math.max(aleatorio(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * aleatorio());
};
const sorteia = (pares) => {
  const total = pares.reduce((s, [, p]) => s + p, 0);
  let x = aleatorio() * total;
  for (const [v, p] of pares) if ((x -= p) <= 0) return v;
  return pares[0][0];
};

// Peso do bairro (quantas doações), mistura de materiais e parcela de comércios.
const PERFIL = {
  "Campo Velho": { n: 34, comercio: 0.55, mat: [["pet", 4], ["papelao", 4], ["latas", 2], ["vidro", 1]] },
  Centro: { n: 30, comercio: 0.35, mat: [["papelao", 3], ["vidro", 3], ["latas", 3], ["pet", 2]] },
  "Alto São Francisco": { n: 16, comercio: 0.1, mat: [["pet", 4], ["latas", 3], ["vidro", 1]] },
  "Planalto Universitário": { n: 14, comercio: 0.15, mat: [["eletronicos", 3], ["papelao", 3], ["pet", 2]] },
  Combate: { n: 8, comercio: 0.2, mat: [["oleo", 4], ["vidro", 2], ["pet", 1]] },
};
const QTD = { pet: [1, 10], papelao: [2, 14], latas: [1, 8], vidro: [1, 9], oleo: [2, 10], eletronicos: [1, 4] };
const M_POR_GRAU_LAT = 111320;

const saida = [];
for (const [bairro, perfil] of Object.entries(PERFIL)) {
  const base = pontos.filter((p) => p.bairro === bairro);
  for (let i = 0; i < perfil.n; i++) {
    const p = base[Math.floor(aleatorio() * base.length)];
    const sigma = 140; // metros
    const dLat = (normal() * sigma) / M_POR_GRAU_LAT;
    const dLng = (normal() * sigma) / (M_POR_GRAU_LAT * Math.cos((p.lat * Math.PI) / 180));
    const materialId = sorteia(perfil.mat);
    const [min, max] = QTD[materialId];
    saida.push({
      lng: +(p.lng + dLng).toFixed(5),
      lat: +(p.lat + dLat).toFixed(5),
      bairro,
      materialId,
      quantidade: min + Math.floor(aleatorio() * (max - min + 1)),
      tipo: aleatorio() < perfil.comercio ? "comerciante" : "cidadao",
    });
  }
}
writeFileSync(resolve(raiz, "src/data/historico.json"), JSON.stringify(saida) + "\n");
console.log(`${saida.length} doações de exemplo`);
