"use client";

import { useId } from "react";
import { Icon, type IconeNome } from "./icon";

type StepperProps = {
  rotulo: string;
  valor: number;
  unidade: string;
  onChange: (valor: number) => void;
  passo?: number;
  min?: number;
  // Glifo do item: vira um selo que se enche e dá um pulso quando há quantidade.
  icone?: IconeNome;
};

const BOTAO =
  "inline-flex size-11 items-center justify-center rounded-md border-[1.5px] border-primary-strong bg-white text-primary-strong transition-colors duration-200 hover:bg-mint-wash motion-reduce:transition-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-tech-blue aria-disabled:cursor-not-allowed aria-disabled:border-transparent aria-disabled:bg-mint-wash aria-disabled:text-text-muted";

export function Stepper({
  rotulo,
  valor,
  unidade,
  onChange,
  passo = 1,
  min = 0,
  icone,
}: StepperProps) {
  const id = useId();
  const noMinimo = valor - passo < min;
  return (
    <div
      role="group"
      aria-labelledby={id}
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <span className="flex min-w-0 items-center gap-3">
        {icone && (
          <span
            key={valor}
            aria-hidden="true"
            className={`inline-flex size-11 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 motion-reduce:transition-none ${
              valor > 0
                ? "pulso-selo bg-primary-strong text-white"
                : "bg-mint-wash text-primary-strong"
            }`}
          >
            <Icon nome={icone} />
          </span>
        )}
        <span id={id} className="text-base font-medium text-graphite">
          {rotulo}
        </span>
      </span>
      <div className="flex w-full items-center gap-2 sm:w-auto">
        <button
          type="button"
          className={BOTAO}
          aria-label={`Diminuir ${rotulo}`}
          aria-disabled={noMinimo || undefined}
          onClick={() => {
            if (noMinimo) return;
            onChange(Math.max(min, valor - passo));
          }}
        >
          <Icon nome="menos" />
        </button>
        <span
          aria-live="polite"
          className="flex-1 text-center text-base font-semibold tabular-nums text-graphite sm:min-w-16 sm:flex-none"
        >
          {valor} {unidade}
        </span>
        <button
          type="button"
          className={BOTAO}
          aria-label={`Aumentar ${rotulo}`}
          onClick={() => onChange(valor + passo)}
        >
          <Icon nome="mais" />
        </button>
      </div>
    </div>
  );
}
