import type { Metadata } from "next";
import { Eventos } from "@/components/prefeitura/eventos";

export const metadata: Metadata = { title: "Eventos (Prefeitura)" };

export default function Page() {
  return <Eventos />;
}
