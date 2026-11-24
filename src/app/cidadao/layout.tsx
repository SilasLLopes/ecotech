import { AppShell } from "@/components/shell/app-shell";

export default function CidadaoLayout({ children }: LayoutProps<"/cidadao">) {
  return <AppShell perfil="cidadao">{children}</AppShell>;
}
