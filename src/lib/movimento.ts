// Funções puras do movimento da interface (contador de pontos e variações).

// Valor entre `de` e `para` no tempo `t` (0 a 1), com começo e fim suaves.
export function interpolar(de: number, para: number, t: number): number {
  const x = Math.min(1, Math.max(0, t));
  const suave = x * x * (3 - 2 * x);
  return de + (para - de) * suave;
}

const inteiro = new Intl.NumberFormat("pt-BR");

// "+40 pts", "−120 pts" (sinal de menos de verdade) ou vazio quando não mudou.
export function rotuloDelta(delta: number): string {
  if (delta === 0) return "";
  const abs = Math.abs(delta);
  const unidade = abs === 1 ? "pt" : "pts";
  return `${delta > 0 ? "+" : "−"}${inteiro.format(abs)} ${unidade}`;
}
