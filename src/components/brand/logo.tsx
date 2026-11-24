import Image from "next/image";

type Variante = "horizontal" | "vertical" | "simbolo";
type Fundo = "claro" | "escuro" | "mono-branco" | "mono-grafite";

type LogoProps = {
  variante: Variante;
  fundo?: Fundo;
  /** Altura em px; a largura segue a proporção do viewBox do SVG. */
  altura: number;
  className?: string;
  /** Carrega com prioridade (LCP). Use só no logo acima da dobra. */
  priority?: boolean;
};

const PREFIXO: Record<Variante, string> = {
  horizontal: "logo-horizontal",
  vertical: "logo-vertical",
  simbolo: "symbol",
};

const SUFIXO: Record<Fundo, string> = {
  claro: "",
  escuro: "-on-dark",
  "mono-branco": "-mono-white",
  "mono-grafite": "-mono-graphite",
};

// Dimensões do viewBox de cada arquivo em public/brand/.
const PROPORCAO: Record<Variante, { w: number; h: number }> = {
  horizontal: { w: 379.34, h: 107 },
  vertical: { w: 235.34, h: 207.1 },
  simbolo: { w: 128, h: 107 },
};

export function Logo({
  variante,
  fundo = "claro",
  altura,
  className = "h-auto max-w-full",
  priority = false,
}: LogoProps) {
  const { w, h } = PROPORCAO[variante];
  const largura = Math.round((altura * w) / h);
  return (
    <Image
      src={`/brand/${PREFIXO[variante]}${SUFIXO[fundo]}.svg`}
      alt="EcoTech"
      width={largura}
      height={altura}
      className={className}
      priority={priority}
    />
  );
}
