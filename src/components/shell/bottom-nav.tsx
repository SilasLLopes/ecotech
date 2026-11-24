"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { itemAtivo, NAV, PERFIS, type Perfil } from "@/lib/nav";

export function BottomNav({ perfil }: { perfil: Perfil }) {
  const pathname = usePathname();
  const itens = NAV[perfil];
  const raiz = PERFIS[perfil].raiz;
  return (
    <nav
      aria-label="Principal"
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-border-soft bg-white pb-[env(safe-area-inset-bottom)] ${
        perfil === "prefeitura" ? "lg:hidden" : ""
      }`}
    >
      <ul className="mx-auto flex max-w-md">
        {itens.map((item) => {
          const ativo = itemAtivo(pathname, item.href, raiz);
          return (
            <li key={item.href} className="min-w-0 flex-1">
              <Link
                href={item.href}
                aria-current={ativo ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 border-t-[3px] px-1 text-xs focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-tech-blue ${
                  ativo
                    ? "border-primary-strong bg-mint-wash font-semibold text-primary-strong"
                    : "border-transparent font-medium text-text-muted hover:bg-mint-wash"
                }`}
              >
                <Icon nome={item.icone} />
                <span className="max-w-full truncate">{item.rotulo}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
