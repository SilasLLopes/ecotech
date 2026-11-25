import historico from "./historico.json";
import pontosGeo from "./pontos-geo.json";
import type { DoacaoComStatus } from "../lib/calor";

// Histórico de exemplo que alimenta o mapa de calor (gerado por
// scripts/geo/build-historico.mjs): doações fictícias já coletadas, em torno dos
// pontos de exemplo. Fora do Estado: não muda com as ações do app.
export const HISTORICO_DOACOES: DoacaoComStatus[] = (
  historico as Omit<DoacaoComStatus, "status">[]
).map((d) => ({ ...d, status: "coletado" }));

// Ruas de referência (nome real do OpenStreetMap) para dar nome aos pontos quentes.
export const REFERENCIAS_DE_RUA = pontosGeo.map((p) => ({
  rua: p.rua,
  bairro: p.bairro,
  lng: p.lng,
  lat: p.lat,
}));
