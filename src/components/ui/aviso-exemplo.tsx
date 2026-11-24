import { Icon } from "./icon";

export function AvisoExemplo() {
  return (
    <p className="flex items-center justify-center gap-2 border-b border-border-soft bg-mint-wash px-4 py-2 text-center text-sm text-graphite">
      <Icon nome="megafone" tamanho="sm" className="text-primary-strong" />
      Protótipo com dados de exemplo
    </p>
  );
}
