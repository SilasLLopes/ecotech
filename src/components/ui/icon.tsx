import type { ReactNode } from "react";

export type IconeNome =
  | "folha"
  | "pino"
  | "trofeu"
  | "pessoas"
  | "casa"
  | "rota"
  | "check"
  | "mais"
  | "menos"
  | "presente"
  | "calendario"
  | "megafone"
  | "grafico"
  | "caminhao"
  | "relogio"
  | "x"
  | "seta";

// Traçados em grade 24x24, traço de 1,75, pontas arredondadas, currentColor.
const TRACADOS: Record<IconeNome, ReactNode> = {
  folha: (
    <>
      <path d="M5 19c0-9 5-14 14-14 0 9-5 14-14 14Z" />
      <path d="M5 19c3-4 6-7 10-9" />
    </>
  ),
  pino: (
    <>
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  trofeu: (
    <>
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
      <path d="M8 6H5v1.5A3 3 0 0 0 8 10.5M16 6h3v1.5a3 3 0 0 1-3 3" />
      <path d="M12 13v4M8.5 20h7M10 17h4" />
    </>
  ),
  pessoas: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.2a3 3 0 0 1 0 5.6M17.5 14a5.5 5.5 0 0 1 3 5" />
    </>
  ),
  casa: (
    <>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 10v9h12v-9" />
      <path d="M10 19v-5h4v5" />
    </>
  ),
  rota: (
    <>
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="6" r="2" />
      <path d="M8 18h6.5a3.5 3.5 0 0 0 0-7h-5a3.5 3.5 0 0 1 0-7H16" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  mais: <path d="M12 5v14M5 12h14" />,
  menos: <path d="M5 12h14" />,
  presente: (
    <>
      <rect x="4" y="9" width="16" height="11" rx="1.5" />
      <path d="M3 9h18v-0.5M12 9v11" />
      <path d="M12 9c-2.5 0-4-1-4-2.5S9 4 10.5 4C12 4 12 6 12 9Zm0 0c2.5 0 4-1 4-2.5S15 4 13.5 4C12 4 12 6 12 9Z" />
    </>
  ),
  calendario: (
    <>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2" />
      <path d="M4 10h16M8 3.5v4M16 3.5v4" />
    </>
  ),
  megafone: (
    <>
      <path d="M4 10v4h3l8 4V6L7 10H4Z" />
      <path d="M7 14l1.2 5h2.6L10 15.5" />
      <path d="M18.5 9.5a3.5 3.5 0 0 1 0 5" />
    </>
  ),
  grafico: (
    <>
      <path d="M4 4v16h16" />
      <path d="M8 16v-4M12 16V8M16 16v-6" />
    </>
  ),
  caminhao: (
    <>
      <path d="M3 6h11v10H3zM14 9h4l3 3.5V16h-7" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </>
  ),
  relogio: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  x: <path d="m6 6 12 12M18 6 6 18" />,
  seta: <path d="M5 12h14M13 6l6 6-6 6" />,
};

type IconProps = {
  nome: IconeNome;
  className?: string;
};

export function Icon({ nome, className = "size-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`shrink-0 ${className}`}
    >
      {TRACADOS[nome]}
    </svg>
  );
}
