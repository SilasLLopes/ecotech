import Link from "next/link";
import type { ComponentProps } from "react";

export type VarianteBotao = "primario" | "secundario" | "terciario" | "perigo";

const BASE =
  "inline-flex items-center justify-center gap-2 font-semibold transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-tech-blue";

const VARIANTES: Record<VarianteBotao, string> = {
  primario:
    "rounded-md bg-primary-strong px-6 text-white hover:bg-primary-strong-hover",
  secundario:
    "rounded-md border-[1.5px] border-primary-strong bg-white px-6 text-primary-strong hover:bg-mint-wash",
  terciario:
    "rounded-md px-2 text-primary-strong underline-offset-4 hover:underline",
  perigo: "rounded-md bg-danger px-6 text-white hover:bg-danger/90",
};

const DESABILITADO =
  "disabled:cursor-not-allowed disabled:border-transparent disabled:bg-mint-wash disabled:text-text-muted disabled:no-underline";

// "grande" é o botão de ação principal da tela (ex.: "Tenho material...").
const TAMANHOS = {
  padrao: "min-h-11 text-sm",
  grande: "min-h-14 text-base",
};

function classes(
  variante: VarianteBotao,
  fullWidth: boolean,
  grande: boolean,
  extra?: string,
) {
  return [
    BASE,
    grande ? TAMANHOS.grande : TAMANHOS.padrao,
    VARIANTES[variante],
    DESABILITADO,
    fullWidth ? "w-full" : "",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

type ButtonProps = {
  variante: VarianteBotao;
  fullWidth?: boolean;
  grande?: boolean;
} & ComponentProps<"button">;

export function Button({
  variante,
  fullWidth = false,
  grande = false,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={classes(variante, fullWidth, grande, className)} {...props} />
  );
}

type ButtonLinkProps = {
  variante: VarianteBotao;
  fullWidth?: boolean;
  grande?: boolean;
} & ComponentProps<typeof Link>;

export function ButtonLink({
  variante,
  fullWidth = false,
  grande = false,
  className,
  ...props
}: ButtonLinkProps) {
  return <Link className={classes(variante, fullWidth, grande, className)} {...props} />;
}
