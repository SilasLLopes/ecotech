import type { Metadata } from "next";
import { Painel } from "@/components/prefeitura/painel";

export const metadata: Metadata = { title: "Painel da Prefeitura" };

export default function Page() {
  return <Painel />;
}
