import type { Metadata } from "next";
import { Inicio } from "@/components/cidadao/inicio";

export const metadata: Metadata = { title: "Início do comerciante" };

export default function Page() {
  return <Inicio perfil="comerciante" />;
}
