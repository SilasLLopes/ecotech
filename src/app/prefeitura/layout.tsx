import { AppShell } from "@/components/shell/app-shell";

export default function PrefeituraLayout({ children }: LayoutProps<"/prefeitura">) {
  return <AppShell perfil="prefeitura">{children}</AppShell>;
}
