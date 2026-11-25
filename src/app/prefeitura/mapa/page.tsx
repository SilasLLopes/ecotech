import type { Metadata } from "next";
import { MapaDeCalor } from "@/components/prefeitura/mapa-de-calor";

export const metadata: Metadata = { title: "Mapa de calor (Prefeitura)" };

export default function Page() {
  return <MapaDeCalor />;
}
