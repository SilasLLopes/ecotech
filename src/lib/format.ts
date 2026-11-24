const numeros = new Intl.NumberFormat("pt-BR");

export function numero(n: number): string {
  return numeros.format(n);
}

export function pontos(n: number): string {
  return `${numeros.format(n)} pts`;
}

function doisDigitos(n: number): string {
  return String(n).padStart(2, "0");
}

// Só chamada em handlers de evento (com `new Date()` do momento da ação).
// Devolve ISO local "AAAA-MM-DDTHH:mm" (partes locais, sem deslocar para UTC),
// o mesmo formato do seed: dá para ordenar e não envelhece ("Hoje" mentiria no
// dia seguinte). A tela formata com `formatarEm`.
export function hora(d: Date): string {
  return `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}T${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}`;
}

const ISO = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}:\d{2}))?/;

// "2026-11-24T07:30" vira "24/11, 07:30"; sem hora, "24/11". Lê a string, sem
// Date (seguro para renderização). Texto fora do formato (dados antigos, como
// "Hoje, 14:32", que versões anteriores gravavam no localStorage) volta como veio.
export function formatarEm(em: string): string {
  const m = ISO.exec(em);
  if (!m) return em;
  return m[4] ? `${m[3]}/${m[2]}, ${m[4]}` : `${m[3]}/${m[2]}`;
}

// "2026-12-06" (ISO, com ou sem hora) vira "06/12/2026". Lê a string, sem Date
// (seguro para renderização). Texto fora do formato volta como veio.
export function dataBR(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
}
