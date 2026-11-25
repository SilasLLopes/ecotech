import type { Metadata } from "next";
import { Agenda } from "@/components/eventos/agenda";

export const metadata: Metadata = { title: "Eventos (comerciante)" };

export default function Page() {
  return <Agenda />;
}
