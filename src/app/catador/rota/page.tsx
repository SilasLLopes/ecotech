import type { Metadata } from "next";
import { Rota } from "@/components/catador/rota";

export const metadata: Metadata = { title: "Rota de coleta (catador)" };

export default function Page() {
  return <Rota />;
}
