import type { ReactNode } from "react";
import { Monolitos } from "@/components/brand/monolitos";
import { Icon, type IconeNome } from "./icon";

type EmptyStateProps = {
  icone: IconeNome;
  titulo: string;
  texto: string;
  acao?: ReactNode;
};

// Estado vazio com a silhueta dos monólitos de Quixadá e o ícone do assunto
// pousado nela, no lugar do ícone solto em círculo.
export function EmptyState({ icone, titulo, texto, acao }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
      <div className="silhueta-suave relative h-24 w-48 overflow-hidden" aria-hidden="true">
        <Monolitos className="absolute inset-x-0 bottom-0 h-20 text-primary-soft" />
        <span className="absolute left-1/2 top-1 -translate-x-1/2 text-primary-strong">
          <Icon nome={icone} tamanho="xl" />
        </span>
      </div>
      <h2 className="text-xl font-semibold text-graphite">{titulo}</h2>
      <p className="max-w-prose text-base text-text-muted">{texto}</p>
      {acao ? <div className="mt-2">{acao}</div> : null}
    </div>
  );
}
