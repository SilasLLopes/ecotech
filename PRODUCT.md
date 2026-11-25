# Product

<!-- impeccable:product-schema 1 -->

> Fonte da verdade do **produto**. A identidade visual está em `DESIGN.md`. Itens marcados **[ABERTO]** ainda não foram confirmados pela equipe: agentes não devem tratá-los como decididos nem inventar respostas (ver `docs/process/decisions.md`).

## Platform

web

## Stack

Já existente no repositório (confirmado pelo código): Next.js 16.4.6 (App Router, `cacheComponents` e `partialPrefetching` ligados), React 19.3, TypeScript, Tailwind CSS 4.3.3 via `@tailwindcss/turbopack`. Backend, banco, autenticação e provedor de mapa: **[ABERTO]**.

## Users

Quatro públicos, confirmados pelo responsável do projeto:

1. **Cidadãos que reciclam**: encontram pontos de coleta no mapa, registram descartes, acumulam pontos e resgatam recompensas. É o público principal da interface de marca (cabeçalho, login, mapa, recompensas).
2. **Pontos de coleta / parceiros**: cooperativas, comércios ou ecopontos que recebem material e validam entregas.
3. **Administradores**: equipe EcoTech ou poder público. Usam o painel (dashboard, mapa, usuários, recompensas, relatórios).
4. **Empresas patrocinadoras**: oferecem benefícios em troca dos pontos dos cidadãos.

**Atualização de 2026-11-24 (decisões C-06 a C-12):** o produto é coleta sob demanda, estilo iFood/99, com três perfis: cidadão/comerciante, catador e Prefeitura (dona). O cidadão avisa que tem material, o catador recebe o pedido, junta vários numa rota e coleta; cada coleta gera pontos trocáveis por benefícios em comércios; a Prefeitura guia o rodízio semanal de valores. Cidade de referência: Quixadá (CE). A lista de quatro públicos acima é anterior e fica superada onde conflitar. O MVP em andamento é um protótipo sem autenticação (ver `docs/superpowers/specs/2026-11-24-mvp-coleta-design.md`). Também em 2026-11-24 (C-14 a C-16): cidadão e comerciante têm **catálogos separados**, cada um pago com os próprios pontos (recompensas e cupons para o cidadão; benefícios institucionais, como selo e certificado, para o comerciante, solicitados com protocolo e concedidos pela Prefeitura), e os eventos são a agenda da cidade, divulgados pela Prefeitura no próprio evento, sem anúncios no app (ver `docs/superpowers/specs/2026-11-24-catalogos-por-publico-design.md`).

Perfis, permissões e fluxos detalhados de cada público: **[ABERTO]**.

## Product Purpose

EcoTech conecta tecnologia, natureza e pessoas para transformar a sustentabilidade em benefício coletivo. Quatro propósitos (do board de identidade):

- Incentivar a reciclagem.
- Conectar pessoas e locais de coleta.
- Oferecer recompensas e benefícios.
- Construir uma cidade mais sustentável.

Sucesso, métricas e metas: **[ABERTO]**.

## Positioning

Assinatura: **"Pequenas atitudes. Grandes transformações."** O mecanismo que o diferencia é ligar o gesto individual de reciclar (pequeno) a um ganho concreto para a pessoa (pontos e recompensas) e para a cidade (impacto coletivo mensurável), com tecnologia como meio, não como fim.

## Operating Context

Telas de produto previstas no board: cabeçalho da plataforma (Início, Mapa, Recompensas, avatar), login ("Bem-vindo de volta!", Entrar, Criar conta), painel administrativo (Dashboard, Mapa, Usuários, Recompensas, Relatórios), cartão de recompensas com saldo de pontos, material institucional.

Idioma da interface: português do Brasil (inferido do board; confirmar se haverá outros idiomas: **[ABERTO]**).

## Capabilities and Constraints

Capacidades sugeridas pelo board, **ainda não confirmadas como escopo**: mapa de pontos de coleta, saldo e extrato de pontos, catálogo e resgate de recompensas, painel com indicadores (ex.: "pontos coletados"), gestão de usuários.

Termos fixos: "ponto de coleta" (não "lixeira"), "pontos" (saldo do cidadão), "recompensa", "parceiro", "patrocinador".

Em aberto: backend e banco; autenticação; provedor de mapa; como um descarte é validado; regra de conversão material → pontos; catálogo e resgate; PWA/app nativo; LGPD (dados de localização e conta).

## Brand Commitments

Vinculantes (vêm do board `docs/brand/identity-board.png`): nome **EcoTech** (escrita exata, "E" e "T" maiúsculos), símbolo hexágono + folha + nós de circuito, paleta de seis cores, fonte Inter, assinatura "Pequenas atitudes. Grandes transformações." Regras completas em `docs/brand/brand-guidelines.md` e `DESIGN.md`.

## Evidence on Hand

- `docs/brand/identity-board.png`: board de direção visual.
- `public/brand/*.svg`: logotipos **recriados em SVG a partir do board** (aproximação; substituir pelos arquivos oficiais quando existirem).
- Os números do board ("12.480 pontos coletados", "+200 pts") são dados ilustrativos de mockup. Não são métricas reais e não podem aparecer como fato em produção.
- Não há depoimentos, parceiros reais, preços, metas ou dados de impacto. Não fabricar.

## Product Principles

1. **Gesto pequeno, ganho visível.** Toda tela mostra o que o usuário ganhou ou está perto de ganhar com uma ação simples.
2. **Tecnologia a serviço da natureza.** A interface é limpa e legível; a tecnologia aparece como conexão (mapa, pontos), nunca como ornamento frio.
3. **Cidade antes de indivíduo.** Resultados individuais sempre se conectam a um resultado coletivo.
4. **Confiança por clareza.** Pontos, regras e dados pessoais são explicados em linguagem simples; nada de números sem origem.
5. **Para todos.** Usável em celular, com contraste e teclado corretos, por quem tem pouca familiaridade com tecnologia.

## Accessibility & Inclusion

Meta mínima: WCAG 2.2 AA. Atenção específica: o Verde Principal (#16A36A) **não** atinge contraste AA com branco para texto pequeno (3,24:1). As regras de uso estão em `DESIGN.md`. Público amplo, uso predominante em celular, textos em português simples.
