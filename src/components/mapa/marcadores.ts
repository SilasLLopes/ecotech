// Elementos de DOM dos marcadores do mapa. O MapLibre posiciona e move estes
// elementos; o estilo (tamanho, queda, anel, foco) está em globals.css, nas
// classes .pino-mapa e .catador-mapa, e só usa tokens da marca.

const RAIO = 17;
const HEXAGONO = Array.from({ length: 6 }, (_, k) => {
  const a = ((60 * k - 90) * Math.PI) / 180;
  return `${(RAIO * Math.cos(a)).toFixed(2)},${(RAIO * Math.sin(a)).toFixed(2)}`;
}).join(" ");

// Glifos desenhados na grade 24x24 do Icon, centralizados no hexágono.
const FOLHA =
  '<path d="M5 19c0-9 5-14 14-14 0 9-5 14-14 14Z"/><path d="M5 19c3-4 6-7 10-9"/>';
const CHECK = '<path d="m5 12.5 4.5 4.5L19 7.5"/>';
const CAMINHAO =
  '<path d="M3 6h11v10H3zM14 9h4l3 3.5V16h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>';
const CASA = '<path d="M4 11 12 4l8 7"/><path d="M6 10v9h12v-9"/><path d="M10 19v-5h4v5"/>';

const GLIFO =
  'fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"';

export type EstadoPino = {
  selecionado: boolean;
  numero?: number;
  // Quando informado, o pino mostra a situação do pedido (mapa da cidade).
  status?: "aguardando" | "aceito" | "coletado";
};

function glifoDoPino({ selecionado, numero, status }: EstadoPino): string {
  const desenho =
    status === "aceito" ? CAMINHAO : status === "coletado" || selecionado ? CHECK : FOLHA;
  return numero !== undefined
    ? `<text x="0" y="5.6" text-anchor="middle" font-size="16" font-weight="800" fill="currentColor" stroke="none">${Math.trunc(numero)}</text>`
    : `<g transform="translate(-9 -9) scale(.75)" ${GLIFO}>${desenho}</g>`;
}

// O SVG do pino é criado uma vez; só o glifo muda. Recriar o SVG reiniciaria a
// animação de queda a cada seleção.
const FORMA = `<svg class="pino-mapa__forma" viewBox="-20 -20 40 40" aria-hidden="true" focusable="false"><polygon points="${HEXAGONO}" stroke-linejoin="round"/><g class="pino-mapa__glifo"></g></svg>`;

// Pino hexagonal de um pedido. Com `aoClicar` vira botão (alvo de 44px, foco
// visível, `aria-pressed` para a seleção); sem ele é só uma imagem.
export function criarPino(
  nome: string,
  indice: number,
  aoClicar: (() => void) | null,
): HTMLElement {
  const el = document.createElement(aoClicar ? "button" : "div");
  el.className = "pino-mapa";
  el.style.setProperty("--i", String(Math.min(indice, 8)));
  el.setAttribute("aria-label", nome);
  if (aoClicar) {
    (el as HTMLButtonElement).type = "button";
    el.addEventListener("click", aoClicar);
  } else {
    el.setAttribute("role", "img");
  }
  return el;
}

export function atualizarPino(el: HTMLElement, estado: EstadoPino, interativo: boolean) {
  if (interativo) el.setAttribute("aria-pressed", String(estado.selecionado));
  el.dataset.selecionado = String(estado.selecionado);
  if (estado.status) el.dataset.status = estado.status;
  else delete el.dataset.status;
  if (!el.firstElementChild) el.innerHTML = FORMA;
  const glifo = el.querySelector(".pino-mapa__glifo");
  const html = glifoDoPino(estado);
  if (glifo && glifo.innerHTML !== html) glifo.innerHTML = html;
}

// Marcador do catador (caminhão) ou da origem da rota (casa), em tech-blue.
export function criarMarcadorCatador(
  tipo: "catador" | "origem",
  nome: string,
): HTMLElement {
  const el = document.createElement("div");
  el.className = `catador-mapa catador-mapa--${tipo}`;
  el.setAttribute("role", "img");
  el.setAttribute("aria-label", nome);
  el.innerHTML = `${tipo === "catador" ? '<span class="catador-mapa__onda"></span>' : ""}<span class="catador-mapa__ponto"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" ${GLIFO}>${tipo === "catador" ? CAMINHAO : CASA}</svg></span>`;
  return el;
}
