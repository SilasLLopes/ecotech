import type { ReactNode } from "react";
import { Icon, type IconeNome } from "./icon";

type EmptyStateProps = {
  icone: IconeNome;
  titulo: string;
  texto: string;
  acao?: ReactNode;
};

export function EmptyState({ icone, titulo, texto, acao }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
      <span className="inline-flex size-14 items-center justify-center rounded-full bg-mint-wash text-primary-strong">
        <Icon nome={icone} tamanho="xl" />
      </span>
      <h2 className="text-xl font-semibold text-graphite">{titulo}</h2>
      <p className="max-w-prose text-base text-text-muted">{texto}</p>
      {acao ? <div className="mt-2">{acao}</div> : null}
    </div>
  );
}
