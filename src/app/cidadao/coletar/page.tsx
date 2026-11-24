import type { Metadata } from "next";
import { Coletar } from "@/components/cidadao/coletar";

export const metadata: Metadata = { title: "Pedir coleta (cidadão)" };

export default function Page() {
  return <Coletar perfil="cidadao" />;
}
