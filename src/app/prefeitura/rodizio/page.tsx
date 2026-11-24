import type { Metadata } from "next";
import { Rodizio } from "@/components/prefeitura/rodizio";

export const metadata: Metadata = { title: "Rodízio da semana" };

export default function Page() {
  return <Rodizio />;
}
