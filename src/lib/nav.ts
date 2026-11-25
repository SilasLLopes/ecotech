import type { IconeNome } from "@/components/ui/icon";

export type Perfil = "cidadao" | "comerciante" | "catador" | "prefeitura";

export type ItemNav = { href: string; rotulo: string; icone: IconeNome };

export const PERFIS_ORDEM: Perfil[] = [
  "cidadao",
  "comerciante",
  "catador",
  "prefeitura",
];

export const PERFIS: Record<
  Perfil,
  { rotulo: string; frase: string; icone: IconeNome; raiz: string }
> = {
  cidadao: {
    rotulo: "Cidadão",
    frase: "Marque material para coleta e junte pontos",
    icone: "folha",
    raiz: "/cidadao",
  },
  comerciante: {
    rotulo: "Comerciante",
    frase: "Marque o material do comércio e conquiste benefícios da Prefeitura",
    icone: "casa",
    raiz: "/comerciante",
  },
  catador: {
    rotulo: "Catador",
    frase: "Faça a coleta pela melhor rota",
    icone: "caminhao",
    raiz: "/catador",
  },
  prefeitura: {
    rotulo: "Prefeitura",
    frase: "Gerencie o rodízio e os benefícios",
    icone: "grafico",
    raiz: "/prefeitura",
  },
};

export const NAV: Record<Perfil, ItemNav[]> = {
  cidadao: [
    { href: "/cidadao", rotulo: "Início", icone: "casa" },
    { href: "/cidadao/coletar", rotulo: "Coletar", icone: "folha" },
    { href: "/cidadao/recompensas", rotulo: "Recompensas", icone: "presente" },
    { href: "/cidadao/eventos", rotulo: "Eventos", icone: "calendario" },
  ],
  comerciante: [
    { href: "/comerciante", rotulo: "Início", icone: "casa" },
    { href: "/comerciante/coletar", rotulo: "Coletar", icone: "folha" },
    { href: "/comerciante/beneficios", rotulo: "Benefícios", icone: "presente" },
    { href: "/comerciante/eventos", rotulo: "Eventos", icone: "calendario" },
  ],
  catador: [
    { href: "/catador", rotulo: "Pedidos", icone: "pino" },
    { href: "/catador/rota", rotulo: "Rota", icone: "rota" },
  ],
  prefeitura: [
    { href: "/prefeitura", rotulo: "Painel", icone: "grafico" },
    { href: "/prefeitura/rodizio", rotulo: "Rodízio", icone: "relogio" },
    { href: "/prefeitura/beneficios", rotulo: "Benefícios", icone: "presente" },
    { href: "/prefeitura/eventos", rotulo: "Eventos", icone: "calendario" },
  ],
};

// A raiz do perfil só fica ativa na rota exata; as demais também em subrotas.
export function itemAtivo(pathname: string, href: string, raiz: string): boolean {
  if (href === raiz) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
