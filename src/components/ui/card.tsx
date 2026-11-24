import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type CardProps<T extends ElementType> = {
  as?: T;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

// Repassa o resto das props (id, href, aria-*, role) ao elemento.
export function Card<T extends ElementType = "div">({
  as,
  className,
  children,
  ...rest
}: CardProps<T>) {
  const Tag: ElementType = as ?? "div";
  return (
    <Tag
      {...rest}
      className={`rounded-lg border border-border-soft bg-white p-6 shadow-card ${className ?? ""}`.trim()}
    >
      {children}
    </Tag>
  );
}
