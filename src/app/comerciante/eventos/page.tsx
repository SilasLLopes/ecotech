import type { Metadata } from "next";
import { EventosAnuncios } from "@/components/comerciante/eventos-anuncios";

export const metadata: Metadata = { title: "Eventos e anúncios (comerciante)" };

export default function Page() {
  return <EventosAnuncios />;
}
