import rotasJson from "./rotas.json";
import type { Rotas } from "../lib/types";

// Trechos de rota pelas ruas, pré-calculados por scripts/geo/build-rotas.mjs a
// partir do OpenStreetMap. O app nunca consulta serviço externo para rotas.
export const ROTAS = rotasJson as unknown as Rotas;
