import { AppShell } from "@/components/shell/app-shell";

export default function CatadorLayout({ children }: LayoutProps<"/catador">) {
  return <AppShell perfil="catador">{children}</AppShell>;
}
