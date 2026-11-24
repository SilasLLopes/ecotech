"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { Icon } from "@/components/ui/icon";
import { itemAtivo, NAV, PERFIS, type Perfil } from "@/lib/nav";

// Barra lateral do painel: só a Prefeitura, a partir de lg.
export function SideNav({ perfil }: { perfil: Perfil }) {
  const pathname = usePathname();
  const raiz = PERFIS[perfil].raiz;
  return (
    <div className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-6 border-r border-border-soft bg-white p-4 lg:flex">
      <Link
        href="/"
        aria-label="EcoTech: página inicial"
        className="flex min-h-11 items-center rounded-md focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-tech-blue"
      >
        <Logo variante="horizontal" altura={32} />
      </Link>
      <nav aria-label="Painel">
        <ul className="flex flex-col gap-1">
          {NAV[perfil].map((item) => {
            const ativo = itemAtivo(pathname, item.href, raiz);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={ativo ? "page" : undefined}
                  className={`flex min-h-11 items-center gap-3 rounded-md px-3 text-sm focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-tech-blue ${
                    ativo
                      ? "bg-primary-strong font-semibold text-white"
                      : "font-medium text-graphite hover:bg-mint-wash"
                  }`}
                >
                  <Icon nome={item.icone} />
                  {item.rotulo}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
