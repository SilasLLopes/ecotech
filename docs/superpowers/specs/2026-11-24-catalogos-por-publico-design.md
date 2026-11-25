# Catálogos por público e eventos como agenda: design

Data: 2026-11-24. Aprovado pelo responsável do projeto em conversa. Tamanho: mudança média sobre o MVP já publicado (`docs/superpowers/specs/2026-11-24-mvp-coleta-design.md`). Substitui o fluxo de anúncios e o catálogo único de cupons do MVP.

## Intenção

Duas correções do responsável ao MVP:

1. **Eventos** são eventos da cidade (feiras, campanhas, mutirões). A Prefeitura os divulga **no próprio evento**, não no app. O app não hospeda anúncios de comerciantes.
2. **Comerciante não tem cupons como o cidadão.** Cada público tem seu catálogo de recompensas, pagas com os pontos que cada um ganha pelas coletas.

## Metas

- Catálogo do **cidadão** com as categorias: descontos em supermercados e restaurantes; cupons em lojas de roupas e papelarias; ingressos de cinema e eventos; créditos no transporte público; descontos em academias; kits de jardinagem e mudas; vales-compras.
- Catálogo do **comerciante** (institucional), com estes itens: publicidade em campanhas municipais; Certificado de Comércio Sustentável; selo de estabelecimento parceiro; cupons promocionais para atrair clientes; destaque no ranking de comerciantes; redução de taxa municipal **(condições a definir)**.
- Solicitar um item do comerciante gera uma **solicitação com protocolo** (não um cupom); a Prefeitura marca como "concedido".
- Eventos como **agenda**: a Prefeitura cadastra; cidadão e comerciante consultam, só leitura.
- Tudo continua dados de exemplo, funcional, mobile 360px, com os padrões de acessibilidade do projeto.

## Não metas

- Regras legais ou fiscais reais (percentual, lei, prazo de redução de taxa). O item entra "a definir".
- Recusa de solicitação e devolução de pontos (regra de negócio não definida).
- Inscrição de comerciante em evento, anúncio dentro do app, edição ou exclusão de evento.
- Qualquer decisão dos itens abertos D-03, D-04, D-17 a D-19.

## Antimetas

- O comerciante enxergar ou resgatar cupons do cidadão, ou o contrário.
- Apresentar item institucional como direito já concedido: a tela diz "Solicitado" até a Prefeitura conceder.
- Inventar valores legais, parceiros reais ou números reais.

## Restrições

As do plano anterior continuam: Next 16 com `cacheComponents`; `useId()` para todo id e referência ARIA; estado transitório zerado em `useLayoutEffect` (rotas escondidas ficam montadas); `Icon` com `tamanho`; tokens sem hex; pt-BR; reducer puro; sem dependência nova.

## Abordagem

**Um catálogo com campo `publico`** (escolhida): `Beneficio.publico: "cidadao" | "comerciante"`; as telas filtram por público e o reducer impede o cruzamento. Reaproveita a tela de recompensas, a de benefícios da Prefeitura e o fluxo entre abas. A alternativa de dois tipos e dois catálogos separados duplica reducer, seed e telas sem ganho.

## Decisões do responsável

- Itens do comerciante: os da lista acima, **sem** "destaque no catálogo de parceiros" e **sem** "participação em feiras e eventos ambientais".
- Eventos são eventos da cidade; a divulgação acontece no evento.
- Itens do cidadão: as categorias acima.

## Decisões do assistente (corrigir se discordar)

- O comerciante ganha pontos pelas coletas, como o cidadão, e os gasta no catálogo institucional. Pontos saem na solicitação; não há recusa nem devolução.
- `Resgate.status`: `"emitido"` (cupom do cidadão), `"solicitado"` e `"concedido"` (comerciante). Novo `conceder-resgate`; só `solicitado` vira `concedido`.
- `Estado.versao` sobe para 2 e `anuncios` sai do estado; dados salvos antigos são descartados e o app volta ao exemplo.
- Aba do comerciante renomeada para **Benefícios** (rota `/comerciante/beneficios`; o termo "recompensa" fica para o cidadão). Cidadão ganha a aba **Eventos** (`/cidadao/eventos`), e o comerciante mantém `/comerciante/eventos`, ambas com a mesma agenda.
- Na tela da Prefeitura, benefícios ganham a coluna e o campo "Público"; item de comerciante tem "quem concede" fixo (Prefeitura de Quixadá) e `estoque` rotulado como "vagas". A lista de solicitações dos comerciantes fica na tela de Benefícios.
- A frase do cartão do comerciante passa a "Marque o material do comércio e conquiste benefícios da Prefeitura" (corrige a promessa antiga).

## O que fica para quem planejar

Textos exatos, valores de exemplo dentro de 60 a 400 pontos, nomes fictícios de estabelecimentos, layout fino e ordem das tarefas.
