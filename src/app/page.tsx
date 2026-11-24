import { Logo } from "@/components/brand/logo";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <Logo variante="vertical" altura={160} priority />
      <p className="text-lg font-medium text-primary-strong">
        Pequenas atitudes. Grandes transformações.
      </p>
    </main>
  );
}
