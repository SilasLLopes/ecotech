import type { ReactNode } from "react";
import { Icon, type IconeNome } from "./icon";

export type TomChip = "ok" | "aviso" | "erro" | "neutro";

const TONS: Record<TomChip, string> = {
  ok: "bg-mint-wash text-primary-strong",
  aviso: "bg-warning/10 text-warning",
  erro: "bg-danger/10 text-danger",
  neutro: "bg-mint-surface text-text-muted",
};

type ChipProps = {
  tom: TomChip;
  icone?: IconeNome;
  children: ReactNode;
};

export function Chip({ tom, icone, children }: ChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${TONS[tom]}`}
    >
      {icone ? <Icon nome={icone} tamanho="sm" /> : null}
      {children}
    </span>
  );
}
