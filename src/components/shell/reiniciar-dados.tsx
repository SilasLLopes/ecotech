"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { reiniciar } from "@/lib/store";

const FOCO =
  "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-tech-blue";

export function ReiniciarDados({ comTextoNoDesktop }: { comTextoNoDesktop: boolean }) {
  const uid = useId();
  const [aberto, setAberto] = useState(false);
  const gatilho = useRef<HTMLButtonElement>(null);
  const cancelar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!aberto) return;
    cancelar.current?.focus();
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAberto(false);
        gatilho.current?.focus();
      }
    }
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [aberto]);

  return (
    <>
      <button
        ref={gatilho}
        type="button"
        aria-expanded={aberto}
        aria-controls={aberto ? `${uid}-confirmar-reinicio` : undefined}
        title="Reiniciar dados de exemplo"
        onClick={() => setAberto((v) => !v)}
        className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md px-2 text-sm font-semibold text-primary-strong hover:bg-mint-wash ${FOCO}`}
      >
        <Icon nome="reiniciar" />
        <span className={comTextoNoDesktop ? "sr-only lg:not-sr-only" : "sr-only"}>
          Reiniciar dados de exemplo
        </span>
      </button>
      {aberto && (
        <div
          id={`${uid}-confirmar-reinicio`}
          role="group"
          aria-labelledby={`${uid}-confirmar-reinicio-titulo`}
          className="absolute right-4 top-full z-50 mt-1 w-72 max-w-full rounded-lg border border-border-soft bg-white p-4 shadow-raised"
        >
          <p id={`${uid}-confirmar-reinicio-titulo`} className="text-sm text-graphite">
            Apagar o que você fez no protótipo e voltar aos dados de exemplo?
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              ref={cancelar}
              variante="secundario"
              className="flex-1 px-3"
              onClick={() => {
                setAberto(false);
                gatilho.current?.focus();
              }}
            >
              Cancelar
            </Button>
            <Button
              variante="primario"
              className="flex-1 px-3"
              onClick={() => {
                reiniciar();
                setAberto(false);
                gatilho.current?.focus();
              }}
            >
              Reiniciar
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
