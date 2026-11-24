import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { AvisoExemplo } from "@/components/ui/aviso-exemplo";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { PERFIS, PERFIS_ORDEM } from "@/lib/nav";

export const metadata: Metadata = { title: { absolute: "EcoTech" } };

export default function Home() {
  return (
    <>
      <AvisoExemplo />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-4 py-10 lg:max-w-3xl">
        <header className="flex flex-col items-center gap-3 text-center">
          <Logo variante="vertical" altura={140} priority />
          <p className="text-lg font-medium text-primary-strong">
            Pequenas atitudes. Grandes transformações.
          </p>
        </header>
        <section aria-labelledby="escolha-perfil" className="flex flex-col gap-4">
          <h1 id="escolha-perfil" className="text-2xl font-bold">
            Escolha um perfil para explorar
          </h1>
          <ul className="grid gap-4 lg:grid-cols-2">
            {PERFIS_ORDEM.map((p) => (
              <li key={p}>
                <Card
                  as={Link}
                  href={PERFIS[p].raiz}
                  className="flex h-full min-h-11 items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-raised motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-tech-blue"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-mint-wash text-primary-strong">
                    <Icon nome={PERFIS[p].icone} tamanho="lg" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-xl font-semibold">{PERFIS[p].rotulo}</span>
                    <span className="text-text-muted">{PERFIS[p].frase}</span>
                  </span>
                  <Icon nome="seta" className="text-primary-strong" />
                </Card>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
