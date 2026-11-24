import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

export const metadata: Metadata = { title: "Página não encontrada" };

export default function NaoEncontrada() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-4 py-10">
      <Link
        href="/"
        aria-label="EcoTech: página inicial"
        className="flex min-h-11 items-center rounded-md focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-tech-blue"
      >
        <Logo variante="horizontal" altura={40} eager />
      </Link>
      <Card className="flex w-full flex-col items-center gap-3 text-center">
        <span className="inline-flex size-14 items-center justify-center rounded-full bg-mint-wash text-primary-strong">
          <Icon nome="pino" tamanho="xl" />
        </span>
        <h1 className="text-2xl font-bold text-graphite">Página não encontrada</h1>
        <p className="text-base text-text-muted">
          Esse endereço não existe no EcoTech, ou a página mudou de lugar. Volte
          ao início e escolha um perfil para continuar.
        </p>
        <div className="mt-2">
          <ButtonLink href="/" variante="primario">
            Voltar ao início
          </ButtonLink>
        </div>
      </Card>
    </main>
  );
}
