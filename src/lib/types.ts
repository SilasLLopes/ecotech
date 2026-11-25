// Tipos do domínio de coleta. Só sintaxe apagável (sem enum).
// Todos os dados de seed são de exemplo.

// Coordenadas geográficas reais (graus decimais).
export type Ponto = { lng: number; lat: number };

export type MaterialId =
  | "pet"
  | "papelao"
  | "latas"
  | "vidro"
  | "oleo"
  | "eletronicos";

export type Material = {
  id: MaterialId;
  nome: string;
  unidade: "kg" | "L" | "un";
  pontosBase: number;
};

export type ItemPedido = { materialId: MaterialId; quantidade: number };

export type StatusPedido = "aguardando" | "aceito" | "coletado" | "cancelado";

export type Pedido = {
  id: string;
  solicitanteId: string;
  itens: ItemPedido[];
  endereco: string;
  bairro: string;
  ponto: Ponto;
  janela: string;
  status: StatusPedido;
  catadorId?: string;
  pontos?: number;
  criadoEm: string;
};

export type Meta = {
  id: string;
  periodo: "diaria" | "mensal";
  titulo: string;
  alvo: number;
  bonus: number;
  progresso: number;
  concluida: boolean;
};

export type Solicitante = {
  id: string;
  nome: string;
  tipo: "cidadao" | "comerciante";
  bairro: string;
  endereco: string;
  ponto: Ponto;
  saldo: number;
  metas: Meta[];
};

export type Catador = {
  id: string;
  nome: string;
  associadoEm: string;
  coletas: number;
  origem: Ponto;
  // Onde o catador está agora: a origem até a primeira coleta, depois o ponto
  // da última parada coletada.
  posicao: Ponto;
};

// Quem pode resgatar: bate com Solicitante.tipo.
export type Publico = "cidadao" | "comerciante";

export type Beneficio = {
  id: string;
  publico: Publico;
  comercio: string;
  titulo: string;
  custo: number;
  estoque: number;
  ativo: boolean;
};

// Cidadão: o cupom nasce "emitido". Comerciante: a solicitação nasce
// "solicitado" e a prefeitura a marca "concedido".
export type StatusResgate = "emitido" | "solicitado" | "concedido";

export type Resgate = {
  id: string;
  solicitanteId: string;
  beneficioId: string;
  codigo: string;
  em: string;
  status: StatusResgate;
};

// pontos é negativo no resgate.
export type Lancamento = {
  id: string;
  solicitanteId: string;
  descricao: string;
  pontos: number;
  em: string;
};

export type Evento = {
  id: string;
  titulo: string;
  data: string;
  local: string;
  descricao: string;
};

export type Destaque = { materialId: MaterialId; multiplicador: number };

export type Estado = {
  versao: 3;
  destaque: Destaque;
  materiais: Material[];
  solicitantes: Solicitante[];
  catadores: Catador[];
  pedidos: Pedido[];
  beneficios: Beneficio[];
  resgates: Resgate[];
  extrato: Lancamento[];
  eventos: Evento[];
};

// Ids, horários e códigos vêm prontos na ação: o reducer é puro.
export type Acao =
  | { type: "solicitar"; pedido: Pedido }
  | { type: "aceitar"; ids: string[]; catadorId: string }
  // O lançamento de bônus de meta usa o id `${lancamentoId}-${meta.id}`.
  | { type: "coletar"; id: string; catadorId: string; lancamentoId: string; em: string }
  | { type: "cancelar"; id: string }
  | {
      type: "resgatar";
      id: string;
      solicitanteId: string;
      beneficioId: string;
      codigo: string;
      em: string;
    }
  | { type: "definir-destaque"; materialId: MaterialId; multiplicador: number }
  | { type: "criar-beneficio"; beneficio: Beneficio }
  | { type: "alternar-beneficio"; id: string }
  | { type: "criar-evento"; evento: Evento }
  | { type: "conceder-resgate"; id: string };

// Trechos de rota pelas ruas, pré-calculados (scripts/geo/build-rotas.mjs).
// `pontos` liga o id de cada ponto de exemplo às suas coordenadas; `trechos` é
// indexado por "idA>idB" com distância em metros, duração a pé em segundos e a
// geometria como lista de [lng, lat].
export type Trecho = { d: number; s: number; g: [number, number][] };
export type Rotas = {
  pontos: Record<string, Ponto>;
  trechos: Record<string, Trecho>;
};
