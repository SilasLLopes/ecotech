import type { Metadata } from "next";
import { Beneficios } from "@/components/prefeitura/beneficios";

export const metadata: Metadata = { title: "Benefícios (Prefeitura)" };

export default function Page() {
  return <Beneficios />;
}
