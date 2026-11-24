import type { Metadata } from "next";

export const metadata: Metadata = { title: "Catador" };

export default function Page() {
  return (
    <h1 className="text-2xl font-bold text-graphite">Pedidos de coleta</h1>
  );
}
