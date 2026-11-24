import type { ElementType, ReactNode } from "react";

type CardProps = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
};

export function Card({ as: Tag = "div", className, children }: CardProps) {
  return (
    <Tag
      className={`rounded-lg border border-border-soft bg-white p-6 shadow-card ${className ?? ""}`.trim()}
    >
      {children}
    </Tag>
  );
}
