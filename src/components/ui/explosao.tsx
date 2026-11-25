import type { CSSProperties } from "react";

// Seis hexágonos que se espalham em volta do pai (que precisa ser `relative`)
// quando `disparo` muda para um valor maior que zero. O pai incrementa
// `disparo` só quando algo bom acontece de verdade (pontos que chegam); a
// montagem inicial não dispara. Decorativo: aria-hidden.
const DIRECOES = [
  [-46, -34],
  [0, -50],
  [46, -34],
  [-46, 30],
  [0, 46],
  [46, 30],
] as const;

export function Explosao({ disparo }: { disparo: number }) {
  if (disparo <= 0) return null;
  return (
    <span key={disparo} className="explosao" aria-hidden="true">
      {DIRECOES.map(([dx, dy], i) => (
        <span
          key={i}
          className="explosao__hex"
          style={{ "--dx": `${dx}px`, "--dy": `${dy}px` } as CSSProperties}
        />
      ))}
    </span>
  );
}
