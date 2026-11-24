import type { Metadata } from "next";
import { Recompensas } from "@/components/cidadao/recompensas";

export const metadata: Metadata = { title: "Recompensas (cidadão)" };

export default function Page() {
  return <Recompensas perfil="cidadao" />;
}
