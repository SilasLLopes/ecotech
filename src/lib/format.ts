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
