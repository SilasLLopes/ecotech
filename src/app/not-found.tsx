import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Monolitos } from "@/components/brand/monolitos";
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
        <div className="silhueta-suave relative h-24 w-48 overflow-hidden" aria-hidden="true">
          <Monolitos className="absolute inset-x-0 bottom-0 h-20 text-primary-soft" />
          <span className="absolute left-1/2 top-1 -translate-x-1/2 text-primary-strong">
            <Icon nome="pino" tamanho="xl" />
          </span>
        </div>
        <h1 className="text-2xl font-bold text-graphite">Página não encontrada</h1>
        <p className="text-base text-text-muted">
          Esse caminho não leva a lugar nenhum: o endereço não existe no EcoTech ou
          a página mudou. Volte ao início e escolha um perfil para continuar.
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
