"use client";

import { useId } from "react";
import { Icon } from "./icon";

type StepperProps = {
  rotulo: string;
  valor: number;
  unidade: string;
  onChange: (valor: number) => void;
  passo?: number;
  min?: number;
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
}: StepperProps) {
  const id = useId();
  const noMinimo = valor - passo < min;
  return (
    <div role="group" aria-labelledby={id} className="flex items-center justify-between gap-3">
      <span id={id} className="text-base font-medium text-graphite">
        {rotulo}
      </span>
      <div className="flex items-center gap-2">
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
          className="min-w-16 text-center text-base font-semibold tabular-nums text-graphite"
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
