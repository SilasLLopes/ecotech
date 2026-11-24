const numeros = new Intl.NumberFormat("pt-BR");
const horas = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

export function numero(n: number): string {
  return numeros.format(n);
}

export function pontos(n: number): string {
  return `${numeros.format(n)} pts`;
}

// Só chamada em handlers de evento (com `new Date()` do momento da ação).
// O protótipo rotula tudo como "Hoje".
export function hora(d: Date): string {
  return `Hoje, ${horas.format(d)}`;
}

// "2026-12-06" (ISO, com ou sem hora) vira "06/12/2026". Lê a string, sem Date
// (seguro para renderização). Texto fora do formato volta como veio.
export function dataBR(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
}
