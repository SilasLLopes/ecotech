import type { Metadata } from "next";
import { PedidosProximos } from "@/components/catador/pedidos-proximos";

export const metadata: Metadata = { title: "Pedidos próximos (catador)" };

export default function Page() {
  return <PedidosProximos />;
}
