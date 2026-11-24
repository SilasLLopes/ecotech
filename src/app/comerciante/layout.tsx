import { AppShell } from "@/components/shell/app-shell";

export default function ComercianteLayout({ children }: LayoutProps<"/comerciante">) {
  return <AppShell perfil="comerciante">{children}</AppShell>;
}
