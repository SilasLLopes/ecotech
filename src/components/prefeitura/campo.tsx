import { Icon } from "@/components/ui/icon";

type CampoProps = {
  id: string;
  rotulo: string;
  valor: string;
  onChange: (valor: string) => void;
  erro?: string;
  ajuda?: string;
  multilinha?: boolean;
  type?: "text" | "date";
  inputMode?: "numeric" | "text";
  autoComplete?: string;
};

const CONTROLE =
  "w-full rounded-md border-[1.5px] bg-white px-4 text-base text-graphite focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-tech-blue";

// Campo de formulário (components.md): rótulo visível, texto de 16px, 44px de
// altura, erro ligado por aria-describedby. O elemento tem id para o foco ir
// ao primeiro campo com erro.
export function Campo({
  id,
  rotulo,
  valor,
  onChange,
  erro,
  ajuda,
  multilinha = false,
  type = "text",
  inputMode,
  autoComplete = "off",
}: CampoProps) {
  const idErro = `${id}-erro`;
  const idAjuda = `${id}-ajuda`;
  const descrito = [erro ? idErro : null, ajuda ? idAjuda : null]
    .filter(Boolean)
    .join(" ");
  const comum = {
    id,
    value: valor,
    "aria-invalid": erro ? (true as const) : undefined,
    "aria-describedby": descrito || undefined,
    autoComplete,
    className: `${CONTROLE} ${erro ? "border-danger" : "border-border-soft"}`,
  };
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-semibold text-graphite">
        {rotulo}
      </label>
      {multilinha ? (
        <textarea
          {...comum}
          rows={3}
          onChange={(e) => onChange(e.target.value)}
          className={`${comum.className} min-h-24 py-2`}
        />
      ) : (
        <input
          {...comum}
          type={type}
          inputMode={inputMode}
          onChange={(e) => onChange(e.target.value)}
          className={`${comum.className} h-11`}
        />
      )}
      {ajuda && (
        <p id={idAjuda} className="text-sm text-text-muted">
          {ajuda}
        </p>
      )}
      {erro && (
        <p id={idErro} className="flex items-start gap-1 text-sm font-semibold text-danger">
          <Icon nome="x" className="mt-0.5 size-4" />
          {erro}
        </p>
      )}
    </div>
  );
}

// Foco no primeiro campo com erro (os ids vêm na ordem do formulário).
export function focarPrimeiroErro(ids: string[]) {
  const el = ids.map((id) => document.getElementById(id)).find(Boolean);
  el?.focus();
}
