import type { Metadata } from "next";

export const metadata: Metadata = { title: "Eventos (comerciante)" };

// Provisória: a agenda de eventos substitui esta página.
export default function Page() {
  return (
    <div className="flex w-full max-w-6xl flex-col gap-2">
      <h1 className="text-2xl font-bold text-graphite">Eventos</h1>
      <p className="text-base text-text-muted">
        A agenda de eventos da cidade chega em breve. Dados de exemplo.
      </p>
    </div>
  );
}
