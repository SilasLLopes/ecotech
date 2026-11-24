// DADOS DE EXEMPLO. Tudo aqui é fictício: pessoas, ruas, comércios, eventos,
// pontos, estoques e séries. Nenhum número representa dado real nem regra
// definida (D-04 segue aberto). As telas devem marcar como "Dados de exemplo".
// Horários são strings fixas: nada aqui chama Date durante a renderização.
// Cenário: Quixadá (CE), mapa ilustrativo de 400 x 300 (1 unidade = 10 m).

import type { Estado, MaterialId, Ponto } from "../lib/types";

export const DEMO = {
  cidadao: "s-ana",
  comerciante: "s-mercadinho",
  catador: "c-joao",
} as const;

export type BairroMapa = {
  id: string;
  nome: string;
  poligono: string;
  rotulo: Ponto;
};

export const MAPA: {
  largura: 400;
  altura: 300;
  bairros: BairroMapa[];
} = {
  largura: 400,
  altura: 300,
  bairros: [
    {
      id: "campo-velho",
      nome: "Campo Velho",
      poligono: "20,20 200,20 210,130 20,130",
      rotulo: { x: 110, y: 112 },
    },
    {
      id: "planalto-universitario",
      nome: "Planalto Universitário",
      poligono: "220,20 380,20 380,130 230,130",
      rotulo: { x: 300, y: 112 },
    },
    {
      id: "alto-sao-francisco",
      nome: "Alto São Francisco",
      poligono: "20,150 90,150 90,280 30,280",
      rotulo: { x: 55, y: 268 },
    },
    {
      id: "centro",
      nome: "Centro",
      poligono: "100,150 280,150 280,260 100,260",
      rotulo: { x: 190, y: 246 },
    },
    {
      id: "combate",
      nome: "Combate",
      poligono: "290,150 380,150 380,280 300,280",
      rotulo: { x: 340, y: 268 },
    },
  ],
};

// Série de exemplo (fora do Estado): coletas concluídas por semana.
export const COLETAS_POR_SEMANA: { semana: string; coletas: number }[] = [
  { semana: "05/10", coletas: 12 },
  { semana: "12/10", coletas: 15 },
  { semana: "19/10", coletas: 14 },
  { semana: "26/10", coletas: 19 },
  { semana: "02/11", coletas: 22 },
  { semana: "09/11", coletas: 21 },
  { semana: "16/11", coletas: 27 },
  { semana: "23/11", coletas: 31 },
];

// Sugestão de exemplo de material em destaque para as próximas semanas.
export const CALENDARIO_ROTACAO: { semana: string; materialId: MaterialId }[] = [
  { semana: "30/11", materialId: "pet" },
  { semana: "07/12", materialId: "vidro" },
  { semana: "14/12", materialId: "latas" },
  { semana: "21/12", materialId: "papelao" },
];

const METAS_PADRAO = () => [
  {
    id: "meta-dia",
    periodo: "diaria" as const,
    titulo: "1 coleta hoje",
    alvo: 1,
    bonus: 5,
    progresso: 0,
    concluida: false,
  },
  {
    id: "meta-mes",
    periodo: "mensal" as const,
    titulo: "5 coletas no mês",
    alvo: 5,
    bonus: 40,
    progresso: 0,
    concluida: false,
  },
];

// Regras seguidas pelo seed (para o reducer ficar coerente):
// - pontos dos pedidos coletados = pontosDoPedido com o destaque abaixo;
// - saldo de cada solicitante = soma do extrato dele (Ana: 4 coletas + 4 bônus
//   diários; Mercadinho: 3 coletas, sem metas; Carlos: sem histórico, saldo 0);
// - ids únicos; pontos dos pedidos dentro do polígono do bairro.
export const ESTADO_INICIAL: Estado = {
  versao: 1,
  destaque: { materialId: "pet", multiplicador: 1.25 },
  materiais: [
    { id: "pet", nome: "PET", unidade: "kg", pontosBase: 8 },
    { id: "papelao", nome: "Papelão", unidade: "kg", pontosBase: 4 },
    { id: "latas", nome: "Latas", unidade: "kg", pontosBase: 12 },
    { id: "vidro", nome: "Vidro", unidade: "kg", pontosBase: 3 },
    { id: "oleo", nome: "Óleo de cozinha", unidade: "L", pontosBase: 10 },
    { id: "eletronicos", nome: "Eletrônicos pequenos", unidade: "un", pontosBase: 20 },
  ],
  solicitantes: [
    {
      id: "s-ana",
      nome: "Ana Beatriz Lima",
      tipo: "cidadao",
      bairro: "Centro",
      endereco: "Rua Coronel Aurélio Matos, 120",
      ponto: { x: 170, y: 190 },
      saldo: 140,
      metas: [
        { ...METAS_PADRAO()[0] },
        { ...METAS_PADRAO()[1], progresso: 4 },
      ],
    },
    {
      id: "s-mercadinho",
      nome: "Mercadinho Bom Preço",
      tipo: "comerciante",
      bairro: "Campo Velho",
      endereco: "Avenida Dom Aureliano Neto, 480",
      ponto: { x: 110, y: 80 },
      saldo: 155,
      metas: [],
    },
    {
      id: "s-carlos",
      nome: "Carlos Eduardo Rocha",
      tipo: "cidadao",
      bairro: "Alto São Francisco",
      endereco: "Travessa das Mangueiras, 35",
      ponto: { x: 50, y: 210 },
      saldo: 0,
      metas: METAS_PADRAO(),
    },
  ],
  catadores: [
    {
      id: "c-joao",
      nome: "João Batista",
      associadoEm: "2024-03-12",
      coletas: 37,
      origem: { x: 150, y: 170 },
    },
    {
      id: "c-francisca",
      nome: "Francisca Lima",
      associadoEm: "2023-08-05",
      coletas: 52,
      origem: { x: 60, y: 190 },
    },
    {
      id: "c-raimundo",
      nome: "Raimundo Alves",
      associadoEm: "2024-09-21",
      coletas: 29,
      origem: { x: 260, y: 90 },
    },
    {
      id: "c-luciana",
      nome: "Luciana Sousa",
      associadoEm: "2025-01-30",
      coletas: 41,
      origem: { x: 330, y: 200 },
    },
  ],
  pedidos: [
    // Coletados da Ana (pontos = pontosDoPedido com PET x1,25).
    {
      id: "p-001",
      solicitanteId: "s-ana",
      itens: [
        { materialId: "pet", quantidade: 3 },
        { materialId: "papelao", quantidade: 2 },
      ],
      endereco: "Rua Coronel Aurélio Matos, 120",
      bairro: "Centro",
      ponto: { x: 170, y: 190 },
      janela: "14h às 16h",
      status: "coletado",
      catadorId: "c-joao",
      pontos: 38,
      criadoEm: "2026-11-03T08:40:00",
    },
    {
      id: "p-002",
      solicitanteId: "s-ana",
      itens: [
        { materialId: "latas", quantidade: 1.5 },
        { materialId: "vidro", quantidade: 2 },
      ],
      endereco: "Rua Coronel Aurélio Matos, 120",
      bairro: "Centro",
      ponto: { x: 170, y: 190 },
      janela: "9h às 11h",
      status: "coletado",
      catadorId: "c-francisca",
      pontos: 24,
      criadoEm: "2026-11-10T07:55:00",
    },
    {
      id: "p-003",
      solicitanteId: "s-ana",
      itens: [
        { materialId: "pet", quantidade: 2 },
        { materialId: "oleo", quantidade: 1 },
      ],
      endereco: "Rua Coronel Aurélio Matos, 120",
      bairro: "Centro",
      ponto: { x: 170, y: 190 },
      janela: "14h às 16h",
      status: "coletado",
      catadorId: "c-joao",
      pontos: 30,
      criadoEm: "2026-11-17T10:05:00",
    },
    {
      id: "p-004",
      solicitanteId: "s-ana",
      itens: [{ materialId: "papelao", quantidade: 7 }],
      endereco: "Rua Coronel Aurélio Matos, 120",
      bairro: "Centro",
      ponto: { x: 170, y: 190 },
      janela: "16h às 18h",
      status: "coletado",
      catadorId: "c-francisca",
      pontos: 28,
      criadoEm: "2026-11-20T13:20:00",
    },
    // Coletados do Mercadinho Bom Preço (histórico do comerciante; PET x1,25).
    {
      id: "p-011",
      solicitanteId: "s-mercadinho",
      itens: [
        { materialId: "pet", quantidade: 4 },
        { materialId: "vidro", quantidade: 5 },
      ],
      endereco: "Avenida Dom Aureliano Neto, 480",
      bairro: "Campo Velho",
      ponto: { x: 110, y: 80 },
      janela: "Hoje, 10h às 12h",
      status: "coletado",
      catadorId: "c-raimundo",
      pontos: 55,
      criadoEm: "2026-11-06T07:45:00",
    },
    {
      id: "p-012",
      solicitanteId: "s-mercadinho",
      itens: [
        { materialId: "latas", quantidade: 3 },
        { materialId: "papelao", quantidade: 6 },
      ],
      endereco: "Avenida Dom Aureliano Neto, 480",
      bairro: "Campo Velho",
      ponto: { x: 110, y: 80 },
      janela: "Hoje, 10h às 12h",
      status: "coletado",
      catadorId: "c-joao",
      pontos: 60,
      criadoEm: "2026-11-13T08:05:00",
    },
    {
      id: "p-013",
      solicitanteId: "s-mercadinho",
      itens: [{ materialId: "oleo", quantidade: 4 }],
      endereco: "Avenida Dom Aureliano Neto, 480",
      bairro: "Campo Velho",
      ponto: { x: 110, y: 80 },
      janela: "Hoje, 14h às 16h",
      status: "coletado",
      catadorId: "c-raimundo",
      pontos: 40,
      criadoEm: "2026-11-19T11:15:00",
    },
    // Aceito pelo João (demonstração do catador).
    {
      id: "p-005",
      solicitanteId: "s-mercadinho",
      itens: [
        { materialId: "pet", quantidade: 4 },
        { materialId: "latas", quantidade: 3 },
      ],
      endereco: "Avenida Dom Aureliano Neto, 480",
      bairro: "Campo Velho",
      ponto: { x: 110, y: 80 },
      janela: "Hoje, 10h às 12h",
      status: "aceito",
      catadorId: "c-joao",
      criadoEm: "2026-11-24T07:30:00",
    },
    // Aguardando, espalhados pelos cinco bairros.
    {
      id: "p-006",
      solicitanteId: "s-mercadinho",
      itens: [
        { materialId: "pet", quantidade: 6 },
        { materialId: "papelao", quantidade: 10 },
      ],
      endereco: "Rua das Oiticicas, 72",
      bairro: "Campo Velho",
      ponto: { x: 150, y: 50 },
      janela: "Hoje, 14h às 16h",
      status: "aguardando",
      criadoEm: "2026-11-24T08:10:00",
    },
    {
      id: "p-007",
      solicitanteId: "s-carlos",
      itens: [
        { materialId: "vidro", quantidade: 4 },
        { materialId: "latas", quantidade: 2 },
      ],
      endereco: "Travessa das Mangueiras, 35",
      bairro: "Alto São Francisco",
      ponto: { x: 50, y: 210 },
      janela: "Hoje, 16h às 18h",
      status: "aguardando",
      criadoEm: "2026-11-24T08:25:00",
    },
    {
      id: "p-008",
      solicitanteId: "s-carlos",
      itens: [{ materialId: "eletronicos", quantidade: 3 }],
      endereco: "Rua Professora Lúcia Maia, 55",
      bairro: "Planalto Universitário",
      ponto: { x: 310, y: 70 },
      janela: "Amanhã, 9h às 11h",
      status: "aguardando",
      criadoEm: "2026-11-24T08:40:00",
    },
    {
      id: "p-009",
      solicitanteId: "s-mercadinho",
      itens: [{ materialId: "oleo", quantidade: 8 }],
      endereco: "Rua do Galpão Velho, 210",
      bairro: "Combate",
      ponto: { x: 340, y: 210 },
      janela: "Hoje, 14h às 16h",
      status: "aguardando",
      criadoEm: "2026-11-24T08:55:00",
    },
    {
      id: "p-010",
      solicitanteId: "s-carlos",
      itens: [
        { materialId: "papelao", quantidade: 5 },
        { materialId: "pet", quantidade: 2 },
      ],
      endereco: "Rua Doutor Epitácio Barros, 300",
      bairro: "Centro",
      ponto: { x: 230, y: 190 },
      janela: "Hoje, 16h às 18h",
      status: "aguardando",
      criadoEm: "2026-11-24T09:05:00",
    },
  ],
  beneficios: [
    {
      id: "b-001",
      comercio: "Mercadinho Bom Preço",
      titulo: "R$ 5 de desconto em compras acima de R$ 40",
      custo: 60,
      estoque: 20,
      ativo: true,
    },
    {
      id: "b-002",
      comercio: "Padaria Trigo Fino",
      titulo: "6 pães franceses",
      custo: 80,
      estoque: 15,
      ativo: true,
    },
    {
      id: "b-003",
      comercio: "Sorveteria Doce Sertão",
      titulo: "Casquinha dupla",
      custo: 120,
      estoque: 12,
      ativo: true,
    },
    {
      id: "b-004",
      comercio: "Papelaria Rabisco",
      titulo: "Caderno de 80 folhas",
      custo: 150,
      estoque: 8,
      ativo: true,
    },
    {
      id: "b-005",
      comercio: "Padaria Trigo Fino",
      titulo: "Bolo caseiro inteiro",
      custo: 200,
      estoque: 3,
      ativo: true,
    },
  ],
  resgates: [],
  // Ana: soma = 140 = saldo, com bônus diário de 5 em cada dia de coleta.
  // Mercadinho: soma = 155 = saldo (sem metas, só coletas).
  extrato: [
    { id: "l-001", solicitanteId: "s-ana", descricao: "Coleta concluída", pontos: 38, em: "2026-11-03T15:10:00" },
    { id: "l-001-meta-dia", solicitanteId: "s-ana", descricao: "Bônus da meta: 1 coleta hoje", pontos: 5, em: "2026-11-03T15:10:00" },
    { id: "l-002", solicitanteId: "s-ana", descricao: "Coleta concluída", pontos: 24, em: "2026-11-10T09:50:00" },
    { id: "l-002-meta-dia", solicitanteId: "s-ana", descricao: "Bônus da meta: 1 coleta hoje", pontos: 5, em: "2026-11-10T09:50:00" },
    { id: "l-003", solicitanteId: "s-ana", descricao: "Coleta concluída", pontos: 30, em: "2026-11-17T14:35:00" },
    { id: "l-003-meta-dia", solicitanteId: "s-ana", descricao: "Bônus da meta: 1 coleta hoje", pontos: 5, em: "2026-11-17T14:35:00" },
    { id: "l-004", solicitanteId: "s-ana", descricao: "Coleta concluída", pontos: 28, em: "2026-11-20T16:45:00" },
    { id: "l-004-meta-dia", solicitanteId: "s-ana", descricao: "Bônus da meta: 1 coleta hoje", pontos: 5, em: "2026-11-20T16:45:00" },
    { id: "l-011", solicitanteId: "s-mercadinho", descricao: "Coleta concluída", pontos: 55, em: "2026-11-06T11:20:00" },
    { id: "l-012", solicitanteId: "s-mercadinho", descricao: "Coleta concluída", pontos: 60, em: "2026-11-13T10:40:00" },
    { id: "l-013", solicitanteId: "s-mercadinho", descricao: "Coleta concluída", pontos: 40, em: "2026-11-19T15:30:00" },
  ],
  eventos: [
    {
      id: "e-001",
      titulo: "Feira de trocas da Praça Dona Zefa",
      data: "2026-12-06",
      local: "Praça Dona Zefa, Centro",
      descricao: "Manhã de troca de livros, brinquedos e roupas, com coleta de recicláveis no local.",
    },
    {
      id: "e-002",
      titulo: "Oficina de compostagem caseira",
      data: "2026-12-12",
      local: "Centro comunitário Vila Verde, Campo Velho",
      descricao: "Oficina prática para montar uma composteira com materiais simples.",
    },
    {
      id: "e-003",
      titulo: "Dia de coleta de eletrônicos pequenos",
      data: "2026-12-19",
      local: "Pátio da escola Maria Auxiliadora, Planalto Universitário",
      descricao: "Ponto de entrega de celulares, carregadores e fones sem uso.",
    },
  ],
  anuncios: [
    {
      id: "a-001",
      solicitanteId: "s-mercadinho",
      eventoId: "e-001",
      titulo: "Sacolas retornáveis na feira",
      oferta: "Sacola retornável grátis para quem levar 2 kg de recicláveis",
      status: "aprovado",
    },
    {
      id: "a-002",
      solicitanteId: "s-mercadinho",
      eventoId: "e-002",
      titulo: "Terra adubada para a oficina",
      oferta: "10% de desconto em adubo e vasos durante a oficina",
      status: "em-analise",
    },
  ],
};
