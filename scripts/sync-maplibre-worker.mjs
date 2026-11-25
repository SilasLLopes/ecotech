// O MapLibre carrega o worker de um arquivo próprio. Como o app não pode
// depender de CDN, o arquivo do pacote instalado é copiado para public/map/ e
// o mapa aponta para ele (setWorkerUrl). Roda em predev e prebuild, então a
// cópia acompanha a versão instalada.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const origem = resolve(raiz, "node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs");
const destino = resolve(raiz, "public/map/maplibre-gl-worker.mjs");

if (!existsSync(origem)) {
  console.error("maplibre-gl não está instalado: rode `npm install`.");
  process.exit(1);
}
mkdirSync(dirname(destino), { recursive: true });
copyFileSync(origem, destino);
