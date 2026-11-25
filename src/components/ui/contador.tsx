"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useHidratado } from "@/lib/hidratacao";
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
  const hidratado = useHidratado();
  const hidratadoAntes = useRef(false);

  // Ao esconder a tela (cacheComponents) ou desmontar, a próxima execução do
  // efeito abaixo volta a só sincronizar, sem animar uma mudança que ninguém viu.
  useLayoutEffect(
    () => () => {
      sincronizado.current = false;
    },
    [],
  );

  useEffect(() => {
    if (quadro.current !== null) cancelAnimationFrame(quadro.current);
    quadro.current = null;
    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // A troca do seed pelo estado salvo (hidratação) não é uma mudança a animar.
    const real = hidratadoAntes.current && hidratado;
    hidratadoAntes.current = hidratado;
    if (!sincronizado.current || !real || reduzido || atual.current === valor) {
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
      // No fim mostra o valor exato (pode ter casas decimais); no caminho, inteiros.
      setExibido(t >= 1 ? valor : Math.round(interpolar(de, valor, t)));
      quadro.current = t < 1 ? requestAnimationFrame(passo) : null;
    };
    quadro.current = requestAnimationFrame(passo);
    return () => {
      if (quadro.current !== null) cancelAnimationFrame(quadro.current);
      quadro.current = null;
    };
  }, [valor, hidratado]);

  return (
    <span className={`tabular-nums ${className ?? ""}`}>
      <span aria-hidden="true">{formatar(exibido)}</span>
      <span className="sr-only">{formatar(valor)}</span>
    </span>
  );
}
