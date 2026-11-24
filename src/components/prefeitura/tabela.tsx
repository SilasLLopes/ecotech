import type { ReactNode } from "react";

export type Coluna<T> = {
  id: string;
  rotulo: string;
  // Alinha números à direita na tabela larga.
  numerica?: boolean;
  celula: (linha: T) => ReactNode;
};

type TabelaProps<T> = {
  legenda: string;
  colunas: Coluna<T>[];
  linhas: T[];
  chave: (linha: T) => string;
  // Coluna que dá nome ao cartão no mobile (o rótulo dela não é repetido).
  titulo?: string;
};

// Tabela larga (md+) e lista de cartões empilhados (abaixo de md). Só uma das
// duas fica visível (display: none sai da árvore de acessibilidade), então os
// leitores de tela não leem o conteúdo duas vezes.
export function Tabela<T>({ legenda, colunas, linhas, chave, titulo }: TabelaProps<T>) {
  const colunaTitulo = colunas.find((c) => c.id === titulo);
  const demais = colunas.filter((c) => c.id !== titulo);
  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border border-border-soft bg-white shadow-card md:block">
        <table className="w-full border-collapse text-left text-base">
          <caption className="sr-only">{legenda}</caption>
          <thead className="bg-mint-surface">
            <tr>
              {colunas.map((c) => (
                <th
                  key={c.id}
                  scope="col"
                  className={`border-b border-border-soft px-4 py-3 text-sm font-semibold text-text-muted ${
                    c.numerica ? "text-right" : ""
                  }`}
                >
                  {c.rotulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {linhas.map((linha) => (
              <tr key={chave(linha)} className="border-b border-border-soft last:border-b-0">
                {colunas.map((c, i) =>
                  i === 0 ? (
                    <th
                      key={c.id}
                      scope="row"
                      className="px-4 py-3 align-middle font-semibold text-graphite"
                    >
                      {c.celula(linha)}
                    </th>
                  ) : (
                    <td
                      key={c.id}
                      className={`px-4 py-3 align-middle text-graphite ${
                        c.numerica ? "whitespace-nowrap text-right tabular-nums" : ""
                      }`}
                    >
                      {c.celula(linha)}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul aria-label={legenda} className="flex flex-col gap-3 md:hidden">
        {linhas.map((linha) => (
          <li
            key={chave(linha)}
            className="rounded-lg border border-border-soft bg-white p-4 shadow-card"
          >
            {colunaTitulo && (
              <p className="text-base font-semibold text-graphite">
                {colunaTitulo.celula(linha)}
              </p>
            )}
            <dl className={`flex flex-col gap-2 ${colunaTitulo ? "mt-3" : ""}`}>
              {demais.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-4">
                  <dt className="text-sm text-text-muted">{c.rotulo}</dt>
                  <dd className="min-w-0 text-right text-base text-graphite">
                    {c.celula(linha)}
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
