import type {
  Acao,
  Destaque,
  Estado,
  ItemPedido,
  Lancamento,
  Material,
  Meta,
  Pedido,
} from "./types";

export const MULTIPLICADOR_MAX = 1.5;

export function pontosDoPedido(
  itens: ItemPedido[],
  materiais: Material[],
  destaque: Destaque,
): number {
  let total = 0;
  for (const item of itens) {
    const material = materiais.find((m) => m.id === item.materialId);
    if (!material || !(item.quantidade > 0)) continue;
    const fator =
      item.materialId === destaque.materialId ? destaque.multiplicador : 1;
    total += item.quantidade * material.pontosBase * fator;
  }
  return Math.round(total);
}

// Reducer puro: devolve o mesmo objeto quando a ação não muda nada.
export function reduzir(estado: Estado, acao: Acao): Estado {
  switch (acao.type) {
    case "solicitar": {
      const { pedido } = acao;
      if (
        pedido.itens.length === 0 ||
        pedido.itens.some((i) => !(i.quantidade > 0)) ||
        estado.pedidos.some((p) => p.id === pedido.id)
      ) {
        return estado;
      }
      // Pedido novo nasce aguardando, sem catador nem pontos.
      const novo: Pedido = { ...pedido, status: "aguardando" };
      delete novo.catadorId;
      delete novo.pontos;
      return { ...estado, pedidos: [...estado.pedidos, novo] };
    }

    case "aceitar": {
      let mudou = false;
      const pedidos = estado.pedidos.map((p) => {
        if (p.status !== "aguardando" || !acao.ids.includes(p.id)) return p;
        mudou = true;
        return { ...p, status: "aceito" as const, catadorId: acao.catadorId };
      });
      return mudou ? { ...estado, pedidos } : estado;
    }

    case "coletar": {
      const pedido = estado.pedidos.find((p) => p.id === acao.id);
      if (
        !pedido ||
        pedido.status !== "aceito" ||
        pedido.catadorId !== acao.catadorId ||
        !estado.solicitantes.some((s) => s.id === pedido.solicitanteId)
      ) {
        return estado;
      }
      const pontos = pontosDoPedido(
        pedido.itens,
        estado.materiais,
        estado.destaque,
      );
      const novosLancamentos: Lancamento[] = [
        {
          id: acao.lancamentoId,
          solicitanteId: pedido.solicitanteId,
          descricao: "Coleta concluída",
          pontos,
          em: acao.em,
        },
      ];
      const solicitantes = estado.solicitantes.map((s) => {
        if (s.id !== pedido.solicitanteId) return s;
        let saldo = s.saldo + pontos;
        const metas = s.metas.map((meta): Meta => {
          if (meta.concluida) return meta;
          const progresso = meta.progresso + 1;
          if (progresso < meta.alvo) return { ...meta, progresso };
          saldo += meta.bonus;
          novosLancamentos.push({
            id: `${acao.lancamentoId}-${meta.id}`,
            solicitanteId: s.id,
            descricao: `Bônus da meta: ${meta.titulo}`,
            pontos: meta.bonus,
            em: acao.em,
          });
          return { ...meta, progresso, concluida: true };
        });
        return { ...s, saldo, metas };
      });
      return {
        ...estado,
        pedidos: estado.pedidos.map((p) =>
          p.id === pedido.id ? { ...p, status: "coletado", pontos } : p,
        ),
        solicitantes,
        catadores: estado.catadores.map((c) =>
          c.id === acao.catadorId
            ? { ...c, coletas: c.coletas + 1, posicao: pedido.ponto }
            : c,
        ),
        extrato: [...estado.extrato, ...novosLancamentos],
      };
    }

    case "cancelar": {
      const pedido = estado.pedidos.find((p) => p.id === acao.id);
      if (!pedido || pedido.status !== "aguardando") return estado;
      return {
        ...estado,
        pedidos: estado.pedidos.map((p) =>
          p.id === acao.id ? { ...p, status: "cancelado" } : p,
        ),
      };
    }

    case "resgatar": {
      const solicitante = estado.solicitantes.find(
        (s) => s.id === acao.solicitanteId,
      );
      const beneficio = estado.beneficios.find((b) => b.id === acao.beneficioId);
      if (
        !solicitante ||
        !beneficio ||
        !beneficio.ativo ||
        solicitante.tipo !== beneficio.publico ||
        beneficio.estoque <= 0 ||
        solicitante.saldo < beneficio.custo ||
        estado.resgates.some((r) => r.id === acao.id)
      ) {
        return estado;
      }
      return {
        ...estado,
        solicitantes: estado.solicitantes.map((s) =>
          s.id === solicitante.id ? { ...s, saldo: s.saldo - beneficio.custo } : s,
        ),
        beneficios: estado.beneficios.map((b) =>
          b.id === beneficio.id ? { ...b, estoque: b.estoque - 1 } : b,
        ),
        resgates: [
          ...estado.resgates,
          {
            id: acao.id,
            solicitanteId: acao.solicitanteId,
            beneficioId: acao.beneficioId,
            codigo: acao.codigo,
            em: acao.em,
            status: beneficio.publico === "cidadao" ? "emitido" : "solicitado",
          },
        ],
        extrato: [
          ...estado.extrato,
          {
            id: acao.id,
            solicitanteId: acao.solicitanteId,
            descricao:
              beneficio.publico === "cidadao"
                ? `Resgate: ${beneficio.titulo} (${beneficio.comercio})`
                : `Solicitação: ${beneficio.titulo}`,
            pontos: -beneficio.custo,
            em: acao.em,
          },
        ],
      };
    }

    case "definir-destaque": {
      if (
        !estado.materiais.some((m) => m.id === acao.materialId) ||
        !Number.isFinite(acao.multiplicador)
      ) {
        return estado;
      }
      const limitado = Math.min(Math.max(acao.multiplicador, 1), MULTIPLICADOR_MAX);
      const multiplicador = Math.round(limitado * 100) / 100;
      if (
        estado.destaque.materialId === acao.materialId &&
        estado.destaque.multiplicador === multiplicador
      ) {
        return estado;
      }
      return {
        ...estado,
        destaque: { materialId: acao.materialId, multiplicador },
      };
    }

    case "criar-beneficio": {
      if (estado.beneficios.some((b) => b.id === acao.beneficio.id)) return estado;
      return { ...estado, beneficios: [...estado.beneficios, acao.beneficio] };
    }

    case "alternar-beneficio": {
      if (!estado.beneficios.some((b) => b.id === acao.id)) return estado;
      return {
        ...estado,
        beneficios: estado.beneficios.map((b) =>
          b.id === acao.id ? { ...b, ativo: !b.ativo } : b,
        ),
      };
    }

    case "criar-evento": {
      if (estado.eventos.some((e) => e.id === acao.evento.id)) return estado;
      return { ...estado, eventos: [...estado.eventos, acao.evento] };
    }

    case "conceder-resgate": {
      const resgate = estado.resgates.find((r) => r.id === acao.id);
      if (!resgate || resgate.status !== "solicitado") return estado;
      return {
        ...estado,
        resgates: estado.resgates.map((r) =>
          r.id === acao.id ? { ...r, status: "concedido" } : r,
        ),
      };
    }
  }
}

const COLECOES = [
  "materiais",
  "solicitantes",
  "catadores",
  "pedidos",
  "beneficios",
  "resgates",
  "extrato",
  "eventos",
] as const;

// Validação rasa: versão, destaque (tipos dos dois campos), presença das
// coleções como arrays e, nos itens que mudaram de formato nas últimas versões,
// só o campo novo: público e status dos benefícios e resgates (versão 2),
// coordenadas dos catadores (versão 3). Não valida o resto do formato de cada
// item; chaves extras são ignoradas e uma mudança de modelo sobe a versão.
const ehPonto = (p: unknown) =>
  typeof p === "object" &&
  p !== null &&
  Number.isFinite((p as Record<string, unknown>).lng) &&
  Number.isFinite((p as Record<string, unknown>).lat);

export function parseEstado(raw: string | null): Estado | null {
  if (!raw) return null;
  let dados: unknown;
  try {
    dados = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof dados !== "object" || dados === null || Array.isArray(dados)) {
    return null;
  }
  const obj = dados as Record<string, unknown>;
  if (obj.versao !== 3) return null;
  const destaque = obj.destaque as Record<string, unknown> | null;
  if (typeof destaque !== "object" || destaque === null) return null;
  if (
    typeof destaque.materialId !== "string" ||
    typeof destaque.multiplicador !== "number" ||
    !Number.isFinite(destaque.multiplicador)
  ) {
    return null;
  }
  if (!COLECOES.every((chave) => Array.isArray(obj[chave]))) return null;
  const publicoValido = (b: unknown) =>
    typeof b === "object" &&
    b !== null &&
    ((b as Record<string, unknown>).publico === "cidadao" ||
      (b as Record<string, unknown>).publico === "comerciante");
  const statusValido = (r: unknown) =>
    typeof r === "object" &&
    r !== null &&
    ["emitido", "solicitado", "concedido"].includes(
      (r as Record<string, unknown>).status as string,
    );
  if (!(obj.beneficios as unknown[]).every(publicoValido)) return null;
  if (!(obj.resgates as unknown[]).every(statusValido)) return null;
  const catadorValido = (c: unknown) =>
    typeof c === "object" &&
    c !== null &&
    ehPonto((c as Record<string, unknown>).origem) &&
    ehPonto((c as Record<string, unknown>).posicao);
  if (!(obj.catadores as unknown[]).every(catadorValido)) return null;
  return obj as unknown as Estado;
}
