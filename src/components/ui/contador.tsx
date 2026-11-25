"use client";

import { useEffect, useRef, useState } from "react";
import { interpolar } from "@/lib/movimento";

const DURACAO_MS = 700;

// Número que sobe (ou desce) até o novo valor. Não anima na montagem, nem ao
// voltar a uma tela escondida (a primeira execução do efeito só sincroniza), e
// com movimento reduzido mostra o valor final na hora. O texto visível é
// aria-hidden: leitor de tela lê só o valor final, sem a contagem.
export function Contador({
  valor,
  formatar = (n) => new Intl.NumberFormat("pt-BR").format(n),
  className,
}: {
  valor: number;
  formatar?: (n: number) => string;
  className?: string;
}) {
  const [exibido, setExibido] = useState(valor);
  const atual = useRef(valor);
  const sincronizado = useRef(false);
  const quadro = useRef<number | null>(null);

  useEffect(() => {
    if (quadro.current !== null) cancelAnimationFrame(quadro.current);
    quadro.current = null;
    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!sincronizado.current || reduzido || atual.current === valor) {
      sincronizado.current = true;
      atual.current = valor;
      setExibido(valor);
      return;
    }
    const de = atual.current;
    atual.current = valor;
    const inicio = performance.now();
    const passo = (agora: number) => {
      const t = (agora - inicio) / DURACAO_MS;
      setExibido(Math.round(interpolar(de, valor, t)));
      quadro.current = t < 1 ? requestAnimationFrame(passo) : null;
    };
    quadro.current = requestAnimationFrame(passo);
    return () => {
      if (quadro.current !== null) cancelAnimationFrame(quadro.current);
      quadro.current = null;
      // Ao esconder a tela, a próxima execução volta a só sincronizar.
      sincronizado.current = false;
    };
  }, [valor]);

  return (
    <span className={`tabular-nums ${className ?? ""}`}>
      <span aria-hidden="true">{formatar(exibido)}</span>
      <span className="sr-only">{formatar(valor)}</span>
    </span>
  );
}
