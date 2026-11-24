import type { Metadata } from "next";
import { Recompensas } from "@/components/cidadao/recompensas";

export const metadata: Metadata = { title: "Recompensas (comerciante)" };

export default function Page() {
  return <Recompensas perfil="comerciante" />;
}
