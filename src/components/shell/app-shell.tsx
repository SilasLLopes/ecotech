import { ViewTransition } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { AvisoExemplo } from "@/components/ui/aviso-exemplo";
import type { Perfil } from "@/lib/nav";
import { BottomNav } from "./bottom-nav";
import { PerfilMenu } from "./perfil-menu";
import { ReiniciarDados } from "./reiniciar-dados";
import { SideNav } from "./side-nav";

const FOCO =
  "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-tech-blue";

export function AppShell({
  perfil,
  children,
}: {
  perfil: Perfil;
  children: ReactNode;
}) {
  const painel = perfil === "prefeitura";
  // Perfis móveis ficam numa coluna de celular centralizada no desktop.
  const coluna = painel ? "" : "mx-auto max-w-md";
  return (
    <div className="flex min-h-dvh flex-1 flex-col lg:flex-row">
      <a
        href={`#conteudo-${perfil}`}
        className={`sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary-strong focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-white ${FOCO}`}
      >
        Pular para o conteúdo
      </a>
      {painel && <SideNav perfil={perfil} />}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-border-soft bg-white/95 backdrop-blur">
          <div
            className={`relative flex h-16 items-center justify-between gap-2 px-4 ${coluna}`}
          >
            <Link
              href="/"
              aria-label="EcoTech: página inicial"
              className={`flex min-h-11 min-w-0 items-center rounded-md ${FOCO} ${
                painel ? "lg:invisible" : ""
              }`}
            >
              <Logo variante="horizontal" altura={32} eager />
            </Link>
            <div className="flex items-center gap-1">
              <PerfilMenu perfil={perfil} />
              <ReiniciarDados comTextoNoDesktop={painel} />
            </div>
          </div>
        </header>
        <AvisoExemplo />
        <main
          id={`conteudo-${perfil}`}
          tabIndex={-1}
          className={`w-full flex-1 px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-6 focus:outline-none ${
            painel ? "lg:pb-10" : ""
          } ${coluna}`}
        >
          <ViewTransition>{children}</ViewTransition>
        </main>
      </div>
      <BottomNav perfil={perfil} />
    </div>
  );
}
