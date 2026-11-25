import type { CSSProperties, ElementType, ReactNode } from "react";

// Entrada em sequência de itens de uma lista: sobe 12 px e aparece, com atraso
// de 60 ms por posição (teto de 6). Só toca quando o item monta, então voltar
// a uma tela escondida não repete a entrada. Movimento reduzido: aparece na hora.
export function Revelar({
  indice = 0,
  as: Tag = "div",
  className,
  children,
}: {
  indice?: number;
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  const estilo = { "--i": Math.min(indice, 6) } as CSSProperties;
  return (
    <Tag className={`revelar ${className ?? ""}`} style={estilo}>
      {children}
    </Tag>
  );
}
