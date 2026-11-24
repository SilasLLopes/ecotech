"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/icon";
import { PERFIS, PERFIS_ORDEM, type Perfil } from "@/lib/nav";

const FOCO =
  "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-tech-blue";

export function PerfilMenu({ perfil }: { perfil: Perfil }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  // <details> continua aberto numa navegação do cliente: fecha ao mudar a rota.
  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

  // Esc, clique e foco fora fecham o menu.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape" && el?.open) {
        el.open = false;
        el.querySelector("summary")?.focus();
      }
    }
    // Clique ou foco fora fecham (assim abrir o "Reiniciar dados" fecha o menu).
    function aoSairDeFora(e: Event) {
      if (el?.open && e.target instanceof Node && !el.contains(e.target)) {
        el.open = false;
      }
    }
    document.addEventListener("keydown", aoTeclar);
    document.addEventListener("pointerdown", aoSairDeFora);
    document.addEventListener("focusin", aoSairDeFora);
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.removeEventListener("pointerdown", aoSairDeFora);
      document.removeEventListener("focusin", aoSairDeFora);
    };
  }, []);

  return (
    <details ref={ref} className="group">
      <summary
        className={`flex min-h-11 cursor-pointer list-none items-center gap-1.5 rounded-md border-[1.5px] border-border-soft bg-white px-3 text-sm font-semibold text-graphite hover:bg-mint-wash [&::-webkit-details-marker]:hidden ${FOCO}`}
      >
        <Icon nome={PERFIS[perfil].icone} tamanho="sm" className="text-primary-strong" />
        <span className="sr-only">Perfil: </span>
        {PERFIS[perfil].rotulo}
        <Icon
          nome="chevron"
          tamanho="sm"
          className="transition-transform motion-reduce:transition-none group-open:rotate-180"
        />
      </summary>
      <div className="absolute right-4 top-full z-50 mt-1 w-64 max-w-full rounded-lg border border-border-soft bg-white p-2 shadow-raised">
        <p className="px-3 py-2 text-xs font-semibold text-text-muted">
          Trocar de perfil
        </p>
        <ul>
          {PERFIS_ORDEM.map((p) => {
            const atual = p === perfil;
            return (
              <li key={p}>
                <Link
                  href={PERFIS[p].raiz}
                  aria-current={atual ? "page" : undefined}
                  onClick={() => {
                    if (ref.current) ref.current.open = false;
                  }}
                  className={`flex min-h-11 items-center gap-3 rounded-md px-3 text-sm ${FOCO} ${
                    atual
                      ? "bg-mint-wash font-semibold text-primary-strong"
                      : "text-graphite hover:bg-mint-wash"
                  }`}
                >
                  <Icon nome={PERFIS[p].icone} />
                  <span className="flex-1">{PERFIS[p].rotulo}</span>
                  {atual && <Icon nome="check" tamanho="sm" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </details>
  );
}
