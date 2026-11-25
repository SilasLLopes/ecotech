import { useSyncExternalStore } from "react";

const assinar = () => () => {};

// false na renderização do servidor e na de hidratação; true depois. O estado do
// protótipo vem do navegador: na hidratação a tela mostra o seed e logo em
// seguida troca para o estado salvo. Animações de "mudou o valor" usam isto para
// não tratar essa troca como um ganho de pontos.
export function useHidratado(): boolean {
  return useSyncExternalStore(
    assinar,
    () => true,
    () => false,
  );
}
