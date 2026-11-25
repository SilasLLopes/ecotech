// Silhueta dos monólitos de Quixadá: cúpulas de granito que sobem de repente da
// planície do sertão (a Pedra da Galinha Choca e as vizinhas). Desenho próprio,
// em curvas simples, estilizado; não é cópia de fotografia. Decorativo.
//
// Formas em `currentColor` com opacidades diferentes (as de trás mais claras,
// o chão por último). Quem usa define a cor: por exemplo `text-primary` sobre
// fundo claro ou `text-primary-soft` sobre fundo escuro. O desenho se repete 3
// vezes (a do meio espelhada) para cobrir telas largas sem cortar o topo das
// cúpulas; cada cópia cabe em 400 unidades, então não há sobreposição.
function Cupulas() {
  return (
    <>
      <path opacity="0.3" d="M0 120C2 92 8 66 26 58C44 52 56 64 60 86C62 98 63 110 66 120Z" />
      <path opacity="0.42" d="M92 120C84 76 98 30 138 22C166 17 188 38 192 70C194 90 196 106 202 120Z" />
      <path opacity="0.42" d="M226 120C222 90 236 58 270 52C290 49 304 58 310 72C318 62 332 60 344 68C356 76 358 96 360 120Z" />
      <path opacity="0.3" d="M356 120C354 96 366 80 384 78C394 77 400 84 400 96L400 120Z" />
      <path opacity="0.7" d="M0 120V108C12 102 26 101 40 104C54 97 70 96 84 102C94 106 100 112 110 116C130 108 150 104 170 108C180 110 188 114 196 118C214 110 236 107 258 111C272 108 290 108 304 113C320 108 340 106 360 110C376 107 390 108 400 112V120Z" />
    </>
  );
}

export function Monolitos({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 150"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
      className={`pointer-events-none block w-full ${className}`}
    >
      <g fill="currentColor" transform="translate(0 30)">
        <Cupulas />
        <g transform="translate(800 0) scale(-1 1)">
          <Cupulas />
        </g>
        <g transform="translate(800 0)">
          <Cupulas />
        </g>
      </g>
    </svg>
  );
}
