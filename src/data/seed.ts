// DADOS DE EXEMPLO. Tudo aqui é fictício: pessoas, ruas, comércios, eventos,
// pontos, estoques e séries. Nenhum número representa dado real nem regra
// definida (D-04 segue aberto). As telas devem marcar como "Dados de exemplo".
// Horários são strings fixas: nada aqui chama Date durante a renderização.
// Cenário: Quixadá (CE). Coordenadas e nomes de rua vêm do OpenStreetMap
// (src/data/pontos-geo.json); número da casa, pessoas e comércios são fictícios.

import type { Estado, MaterialId, Ponto } from "../lib/types";

export const DEMO = {
  cidadao: "s-ana",
  comerciante: "s-mercadinho",
  catador: "c-joao",
} as const;

export type BairroMapa = { id: string; nome: string; centro: Ponto };

// Bairros de exemplo (nomes de Quixadá), cada um com um ponto de referência no
// meio dos pontos do seed. Sem limites oficiais: o mapa vem do OpenStreetMap.
export const BAIRROS: BairroMapa[] = [
  { id: "campo-velho", nome: "Campo Velho", centro: { lng: -39.009955, lat: -4.962929 } },
  { id: "planalto-universitario", nome: "Planalto Universitário", centro: { lng: -39.026598, lat: -4.967553 } },
  { id: "alto-sao-francisco", nome: "Alto São Francisco", centro: { lng: -39.006526, lat: -4.966252 } },
  { id: "centro", nome: "Centro", centro: { lng: -39.014929, lat: -4.972332 } },
  { id: "combate", nome: "Combate", centro: { lng: -39.025889, lat: -4.971856 } },
];

// Caixa da mancha urbana de Quixadá usada pelas invariantes do seed.
export const AREA_URBANA = { oeste: -39.045, sul: -4.99, leste: -38.985, norte: -4.945 };

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

// Modelo (versão 2): o catálogo de benefícios tem dois públicos. O cidadão troca
// pontos por recompensas de estabelecimentos fictícios (resgate "emitido"); o
// comerciante solicita benefícios da prefeitura (resgate "solicitado", que a
// prefeitura marca como "concedido"). Os eventos são só a agenda pública da cidade.
// Regras seguidas pelo seed (para o reducer ficar coerente):
// - pontos dos pedidos coletados = pontosDoPedido com o destaque abaixo;
// - saldo de cada solicitante = soma do extrato dele (Ana: 4 coletas + 4 bônus
//   diários; Mercadinho: 3 coletas, sem metas; Carlos: sem histórico, saldo 0);
// - ids únicos; pontos dentro da área urbana (AREA_URBANA) e iguais a pontos reais de pontos-geo.json.
export const ESTADO_INICIAL: Estado = {
  versao: 3,
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
      endereco: "Rua Oscar Barbosa, 120",
      ponto: { lng: -39.015, lat: -4.971836 },
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
      endereco: "Rua Dom Lucas, 480",
      ponto: { lng: -39.009934, lat: -4.96426 },
      saldo: 155,
      metas: [],
    },
    {
      id: "s-carlos",
      nome: "Carlos Eduardo Rocha",
      tipo: "cidadao",
      bairro: "Alto São Francisco",
      endereco: "Rua Benigno Bezerra, 35",
      ponto: { lng: -39.007244, lat: -4.965513 },
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
      origem: { lng: -39.017484, lat: -4.97368 },
      posicao: { lng: -39.017484, lat: -4.97368 },
    },
    {
      id: "c-francisca",
      nome: "Francisca Lima",
      associadoEm: "2023-08-05",
      coletas: 52,
      origem: { lng: -39.005809, lat: -4.966992 },
      posicao: { lng: -39.005809, lat: -4.966992 },
    },
    {
      id: "c-raimundo",
      nome: "Raimundo Alves",
      associadoEm: "2024-09-21",
      coletas: 29,
      origem: { lng: -39.028036, lat: -4.967476 },
      posicao: { lng: -39.028036, lat: -4.967476 },
    },
    {
      id: "c-luciana",
      nome: "Luciana Sousa",
      associadoEm: "2025-01-30",
      coletas: 41,
      origem: { lng: -39.027069, lat: -4.972878 },
      posicao: { lng: -39.027069, lat: -4.972878 },
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
      endereco: "Rua Oscar Barbosa, 120",
      bairro: "Centro",
      ponto: { lng: -39.015, lat: -4.971836 },
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
      endereco: "Rua Oscar Barbosa, 120",
      bairro: "Centro",
      ponto: { lng: -39.015, lat: -4.971836 },
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
      endereco: "Rua Oscar Barbosa, 120",
      bairro: "Centro",
      ponto: { lng: -39.015, lat: -4.971836 },
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
      endereco: "Rua Oscar Barbosa, 120",
      bairro: "Centro",
      ponto: { lng: -39.015, lat: -4.971836 },
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
      endereco: "Rua Dom Lucas, 480",
      bairro: "Campo Velho",
      ponto: { lng: -39.009934, lat: -4.96426 },
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
      endereco: "Rua Dom Lucas, 480",
      bairro: "Campo Velho",
      ponto: { lng: -39.009934, lat: -4.96426 },
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
      endereco: "Rua Dom Lucas, 480",
      bairro: "Campo Velho",
      ponto: { lng: -39.009934, lat: -4.96426 },
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
      endereco: "Rua Dom Lucas, 480",
      bairro: "Campo Velho",
      ponto: { lng: -39.009934, lat: -4.96426 },
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
      endereco: "Rua Jardim Primavera, 72",
      bairro: "Campo Velho",
      ponto: { lng: -39.009976, lat: -4.961597 },
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
      endereco: "Rua Benigno Bezerra, 35",
      bairro: "Alto São Francisco",
      ponto: { lng: -39.007244, lat: -4.965513 },
      janela: "Hoje, 16h às 18h",
      status: "aguardando",
      criadoEm: "2026-11-24T08:25:00",
    },
    {
      id: "p-008",
      solicitanteId: "s-carlos",
      itens: [{ materialId: "eletronicos", quantidade: 3 }],
      endereco: "Avenida Francisco Pinheiro de Almeida, 55",
      bairro: "Planalto Universitário",
      ponto: { lng: -39.025161, lat: -4.967629 },
      janela: "Amanhã, 9h às 11h",
      status: "aguardando",
      criadoEm: "2026-11-24T08:40:00",
    },
    {
      id: "p-009",
      solicitanteId: "s-mercadinho",
      itens: [{ materialId: "oleo", quantidade: 8 }],
      endereco: "Rua Francisco Segundo Costa, 210",
      bairro: "Combate",
      ponto: { lng: -39.024709, lat: -4.970834 },
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
      endereco: "Rua Autran Moreno, 300",
      bairro: "Centro",
      ponto: { lng: -39.012303, lat: -4.971479 },
      janela: "Hoje, 16h às 18h",
      status: "aguardando",
      criadoEm: "2026-11-24T09:05:00",
    },
  ],
  beneficios: [
    // Cidadão: recompensas de estabelecimentos fictícios.
    {
      id: "b-001",
      publico: "cidadao",
      comercio: "Mercado Bom Preço",
      titulo: "R$ 10 de desconto em compras acima de R$ 60",
      custo: 80,
      estoque: 20,
      ativo: true,
    },
    {
      id: "b-002",
      publico: "cidadao",
      comercio: "Restaurante Sabor do Sertão",
      titulo: "Prato feito para uma pessoa",
      custo: 120,
      estoque: 10,
      ativo: true,
    },
    {
      id: "b-003",
      publico: "cidadao",
      comercio: "Boutique Linha Fina",
      titulo: "R$ 30 de desconto em roupas",
      custo: 200,
      estoque: 5,
      ativo: true,
    },
    {
      id: "b-004",
      publico: "cidadao",
      comercio: "Papelaria Rabisco",
      titulo: "Caderno de 80 folhas",
      custo: 60,
      estoque: 15,
      ativo: true,
    },
    {
      id: "b-005",
      publico: "cidadao",
      comercio: "Cine Praça Central",
      titulo: "Ingresso de cinema",
      custo: 100,
      estoque: 12,
      ativo: true,
    },
    {
      id: "b-006",
      publico: "cidadao",
      comercio: "Passe Vai e Volta",
      titulo: "Crédito de R$ 10 para transporte",
      custo: 90,
      estoque: 20,
      ativo: true,
    },
    {
      id: "b-007",
      publico: "cidadao",
      comercio: "Academia Corpo em Movimento",
      titulo: "Semana experimental com aulas livres",
      custo: 150,
      estoque: 6,
      ativo: true,
    },
    {
      id: "b-008",
      publico: "cidadao",
      comercio: "Viveiro Folha Nova",
      titulo: "Kit de jardinagem com 3 mudas",
      custo: 140,
      estoque: 8,
      ativo: true,
    },
    {
      id: "b-009",
      publico: "cidadao",
      comercio: "Galeria Centro Vivo",
      titulo: "Vale-compras de R$ 50",
      custo: 200,
      estoque: 3,
      ativo: true,
    },
    // Comerciante: benefícios oferecidos pela prefeitura; estoque = vagas.
    {
      id: "b-101",
      publico: "comerciante",
      comercio: "Prefeitura de Quixadá",
      titulo: "Publicidade em campanhas municipais",
      custo: 300,
      estoque: 5,
      ativo: true,
    },
    {
      id: "b-102",
      publico: "comerciante",
      comercio: "Prefeitura de Quixadá",
      titulo: "Certificado de Comércio Sustentável",
      custo: 200,
      estoque: 10,
      ativo: true,
    },
    {
      id: "b-103",
      publico: "comerciante",
      comercio: "Prefeitura de Quixadá",
      titulo: "Selo de estabelecimento parceiro",
      custo: 120,
      estoque: 20,
      ativo: true,
    },
    {
      id: "b-104",
      publico: "comerciante",
      comercio: "Prefeitura de Quixadá",
      titulo: "Cupons promocionais para atrair clientes",
      custo: 80,
      estoque: 20,
      ativo: true,
    },
    {
      id: "b-105",
      publico: "comerciante",
      comercio: "Prefeitura de Quixadá",
      titulo: "Destaque no ranking de comerciantes",
      custo: 150,
      estoque: 10,
      ativo: true,
    },
    {
      id: "b-106",
      publico: "comerciante",
      comercio: "Prefeitura de Quixadá",
      titulo: "Redução de taxa municipal (condições a definir)",
      custo: 400,
      estoque: 5,
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
      descricao: "Manhã de troca de livros, brinquedos e roupas, com ponto de coleta de recicláveis no local. Entrada livre.",
    },
    {
      id: "e-002",
      titulo: "Mutirão de limpeza do Campo Velho",
      data: "2026-12-12",
      local: "Centro comunitário Vila Verde, Campo Velho",
      descricao: "Moradores se reúnem às 8h para limpar ruas e canteiros do bairro. Luvas e sacos são fornecidos no local.",
    },
    {
      id: "e-003",
      titulo: "Semana do meio ambiente",
      data: "2026-12-15",
      local: "Praça da Matriz, Centro",
      descricao: "Uma semana de palestras, oficinas e exposições sobre reciclagem e cuidado com a cidade. Programação aberta ao público.",
    },
    {
      id: "e-004",
      titulo: "Campanha de coleta de eletrônicos pequenos",
      data: "2026-12-19",
      local: "Pátio da escola Maria Auxiliadora, Planalto Universitário",
      descricao: "Ponto de entrega de celulares, carregadores e fones sem uso, das 8h às 12h.",
    },
  ],
};
