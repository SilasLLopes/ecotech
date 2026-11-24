// Tipos do domínio de coleta. Só sintaxe apagável (sem enum).
// Todos os dados de seed são de exemplo.

export type Ponto = { x: number; y: number };

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
};

export type Beneficio = {
  id: string;
  comercio: string;
  titulo: string;
  custo: number;
  estoque: number;
  ativo: boolean;
};

export type Resgate = {
  id: string;
  solicitanteId: string;
  beneficioId: string;
  codigo: string;
  em: string;
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

export type Anuncio = {
  id: string;
  solicitanteId: string;
  eventoId: string;
  titulo: string;
  oferta: string;
  status: "em-analise" | "aprovado" | "recusado";
};

export type Destaque = { materialId: MaterialId; multiplicador: number };

export type Estado = {
  versao: 1;
  destaque: Destaque;
  materiais: Material[];
  solicitantes: Solicitante[];
  catadores: Catador[];
  pedidos: Pedido[];
  beneficios: Beneficio[];
  resgates: Resgate[];
  extrato: Lancamento[];
  eventos: Evento[];
  anuncios: Anuncio[];
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
  | { type: "criar-anuncio"; anuncio: Anuncio }
  | { type: "decidir-anuncio"; id: string; aprovado: boolean };
