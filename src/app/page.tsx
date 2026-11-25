import type { Metadata } from "next";
import { Logo } from "@/components/brand/logo";
import { Monolitos } from "@/components/brand/monolitos";
import { Apresentacao } from "@/components/inicio/apresentacao";
import { AvisoExemplo } from "@/components/ui/aviso-exemplo";

export const metadata: Metadata = { title: { absolute: "EcoTech" } };

export default function Home() {
  return (
    <>
      <AvisoExemplo />
      {/* A silhueta ocupa a largura toda; o texto fica numa coluna acima dela. */}
      <header className="relative overflow-hidden pb-32 pt-8 lg:pb-52 lg:pt-12">
        <div className="mx-auto w-full max-w-md px-4 lg:max-w-5xl">
          <Logo variante="horizontal" altura={40} eager />
          <h1 className="mt-8 max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-graphite lg:text-5xl">
            Pequenas atitudes.
            <span className="block text-primary-strong">Grandes transformações.</span>
          </h1>
          <p className="mt-4 max-w-md text-lg text-text-muted">
            Coleta de recicláveis sob demanda em Quixadá: o morador avisa, o
            catador vem buscar pela melhor rota e a cidade ganha.
          </p>
        </div>
        <Monolitos className="absolute inset-x-0 bottom-0 h-28 text-primary lg:h-44" />
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 pb-12 pt-8 lg:max-w-5xl">
        <h2 id="escolha-perfil" className="text-2xl font-bold">
          Entre por um perfil
        </h2>
        <section aria-labelledby="escolha-perfil">
          <Apresentacao />
        </section>
      </main>
    </>
  );
}
