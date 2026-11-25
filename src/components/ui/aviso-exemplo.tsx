import { Icon } from "./icon";

// Rótulo de transparência: tudo no protótipo é dado de exemplo. Faixa fina, para
// não disputar a tela com o conteúdo.
export function AvisoExemplo() {
  return (
    <p className="flex items-center justify-center gap-1.5 border-b border-border-soft bg-mint-wash px-4 py-1 text-center text-xs font-medium text-graphite">
      <Icon nome="megafone" tamanho="sm" className="text-primary-strong" />
      Protótipo com dados de exemplo
    </p>
  );
}
