# Telas

Especificação das telas do board e das previstas. **Fonte:** [`identity-board.png`](../brand/identity-board.png). Componentes: [`components.md`](./components.md). Tokens: [`/DESIGN.md`](../../DESIGN.md).

Legenda: **[BOARD]** aparece no board; **[PROPOSTA]** não está no board, é sugestão coerente com a marca e deve ser validada pela equipe (escopo funcional ainda **[ABERTO]**, ver [`decisions.md`](../process/decisions.md)). Todos os números e nomes nos exemplos são ilustrativos.

## 1. Cabeçalho da plataforma + banner de abertura [BOARD]

```
┌──────────────────────────────────────────────────────────────┐
│ [logo]                        Início  Mapa  Recompensas  (👤) │  navbar branca, 64px
├──────────────────────────────────────────────────────────────┤
│ ░░ foto: cidade com árvores, overlay grafite à esquerda ░░░░ │
│   Juntos por                                       ╱ curva   │
│   uma cidade                                      ╱  de      │
│   mais verde  ← "mais verde" em primary-soft     ╱   folha   │
│   [Encontrar ponto de coleta]  ← botão sobre escuro          │
└──────────────────────────────────────────────────────────────┘
```

- Título Display; um único CTA primário acima da dobra.
- Mobile: foto vira fundo com overlay mais forte; navegação em menu.
- Acessibilidade: contraste do texto sobre foto garantido pelo overlay; `alt` na foto.

## 2. Login [BOARD]

```
        ┌────────────────────────┐
        │        [símbolo]       │  logo vertical, ~96px de largura
        │        EcoTech         │
        │                        │
        │   Bem-vindo de volta!  │  Headline
        │  E-mail   [__________] │
        │  Senha    [__________] │
        │  [        Entrar     ] │  botão primário, largura total
        │      Criar conta       │  link terciário
        └────────────────────────┘   cartão branco, xl, sombra Card, max 400px
```

- Fundo `mint-surface` com curva de folha discreta no canto.
- Erros por campo (texto + ícone), erro geral em `role="alert"`. "Esqueci minha senha" como link. Sem login social até decisão (D-02).
- Estados: padrão, carregando ("Entrando..."), erro de credencial ("E-mail ou senha incorretos. Tente de novo."), conta criada.

## 3. Painel administrativo [BOARD]

```
┌────────────┬─────────────────────────────────────────────────┐
│ [logo]     │  Dashboard                                      │
│ ▣ Dashboard│ ┌──────────────┐ ┌──────────┐ ┌──────────┐      │
│ ◎ Mapa     │ │ ♻ 12.480     │ │ KPI 2    │ │ KPI 3    │      │
│ ☺ Usuários │ │ Pontos       │ │          │ │          │      │
│ ★ Recomp.  │ │ coletados ╱╲╱│ └──────────┘ └──────────┘      │
│ ▤ Relatór. │ └──────────────┘                                │
│            │  [ gráfico de tendência ]  [ tabela recentes ]  │
└────────────┴─────────────────────────────────────────────────┘
```

- Operate: legibilidade, consistência e densidade média acima de expressão. Marca só nos detalhes (logo, verdes, ícones).
- KPI com tendência; gráficos com alternativa em tabela; filtros de período como controle segmentado.
- Itens da navegação: Dashboard, Mapa, Usuários, Recompensas, Relatórios. Conteúdo de cada um além do Dashboard é **[PROPOSTA]**.
- Toda tabela: cabeçalhos com `scope`, ordenação por teclado, estado vazio, paginação, versão empilhada no mobile.

## 4. Cartão de recompensas [BOARD]

Ver "Cartão de recompensa" em `components.md`. Aparece no perfil do cidadão e, em miniatura, no cabeçalho do app (saldo). Também serve de modelo para o cartão impresso/digital institucional.

## 5. Material institucional [BOARD]

Peça de apoio (folheto, slide, post): fundo branco ou `mint-wash`, logo vertical centralizado no topo, mensagem curta ("Uma cidade mais sustentável começa com você."), silhueta de cidade verde em `primary` a ~15% na base. Margens generosas, um só ponto focal. Rodapé de assinatura (ver §8).

## 6. Ícone do app e favicon [BOARD]

`public/brand/icon-app.svg` e `favicon.svg`. Ver guia de marca §3 e §4.

## 7. Mapa de pontos de coleta [PROPOSTA]

> **Substituído pelo MVP de coleta (C-07, C-12).** O modelo de produto deixou de ser "achar um ponto de coleta" e virou "pedir que um catador venha buscar". O mapa existe agora como mapa esquemático de **pedidos** e **rota** (ver "MVP de coleta" abaixo). O texto desta seção fica como referência de uma eventual busca de pontos fixos, que não está no escopo.

Página principal do cidadão. Mapa em tela cheia no desktop com lista lateral; no mobile, mapa com gaveta inferior de lista. Pinos hexagonais. Busca por endereço/CEP, filtros por tipo de material (chips), cartão do ponto (nome, distância, "Aberto agora", materiais aceitos, botão "Como chegar"). Obrigatório: lista como alternativa acessível, estado sem resultados, permissão de localização pedida **com explicação** e opcional (LGPD, D-14).

## 8. Rodapé de assinatura [BOARD]

Faixa grafite/verde escuro com logo horizontal `on-dark`, assinatura "Pequenas atitudes. **Grandes transformações.**" (segunda frase em `primary`) e quatro pilares em linha com ícone: Reciclagem inteligente · Conexão com a cidade · Recompensas sustentáveis · Um futuro mais verde. Em mobile, pilares em grade 2×2.

## 9. Recompensas, Perfil, Parceiros [PROPOSTA]

- **Recompensas:** cartão de saldo no topo; grade de benefícios (parceiro, descrição, custo em pontos, "Resgatar"); estado "pontos insuficientes" mostra quanto falta, sem culpa.
- **Perfil do cidadão:** avatar, nível/selo hexagonal (se houver gamificação, D-04), histórico de descartes.
- **Área do parceiro:** validação de entregas e extrato. Fluxo **[ABERTO]**.

## 10. MVP de coleta [IMPLEMENTADO]

Protótipo navegável com quatro perfis, sem login. Todo dado é de exemplo (`src/data/seed.ts`), a cidade é Quixadá (CE) e o estado fica no navegador. Toda tela mostra a faixa "Protótipo com dados de exemplo" e o botão de reiniciar dados fica no cabeçalho. Fonte dos fluxos: `docs/superpowers/specs/2026-11-24-mvp-coleta-design.md`.

Estrutura comum (`AppShell`): cabeçalho fixo com logo, `PerfilMenu` e reiniciar; faixa de exemplo; `<main id="conteudo-<perfil>">` com link "Pular para o conteúdo"; navegação inferior nos perfis de celular. Cidadão, comerciante e catador ficam numa coluna de celular (`max-w-md`) centralizada no desktop; a Prefeitura usa o painel largo com barra lateral a partir de `lg`. O perfil ativo vem da **URL**, não de `localStorage` (C-13).

### Entrada `/`

Logo vertical, assinatura e quatro cartões de perfil (Cidadão, Comerciante, Catador, Prefeitura), cada um um link para a raiz do perfil. Duas colunas em `lg`.

### Cidadão (`/cidadao`)

Navegação inferior: Início · Coletar · Recompensas. Usuária de exemplo: Ana Beatriz Lima.

| Rota | O que mostra | Estados |
|---|---|---|
| `/cidadao` | Saudação, cartão de saldo (`bg-reward`), botão grande "Tenho material para ser reciclado", "Item da semana" (material em destaque e o acréscimo, com a nota de que a diferença é pequena de propósito), "Suas metas" (diária e mensal), "Suas coletas", últimas atividades do extrato | Coletas: vazia ("Nenhuma coleta em andamento") ou uma lista com **todos** os pedidos ativos (o mais recente primeiro), cada um com suas etapas (aguardando catador, aceito pelo catador); pedido coletado sai da lista e aparece em "Últimas atividades". "Cancelar pedido" em cada pedido, só enquanto aguarda, com aviso numa região viva (foco vai para o aviso). Extrato vazio. Cadastro de exemplo não encontrado (após limpar dados) com orientação de reiniciar |
| `/cidadao/coletar` | Lista de materiais com `Stepper` (kg, L ou un), selo "Em destaque", endereço de exemplo, janela de retirada (Manhã, Tarde, Noite), estimativa de pontos ao vivo e "Pedir coleta" | Botão desabilitado e explicado enquanto nada foi marcado (`aria-describedby`). Após enviar: "Pedido enviado!" com resumo, "Acompanhar na tela inicial" e "Fazer outro pedido" |
| `/cidadao/recompensas` | Cartão de saldo, lista de benefícios ativos do público cidadão com custo e "Resgatar", cupons resgatados com código | Saldo insuficiente ("Faltam N pts. Cada coleta aproxima você.") ou esgotado (chip "Esgotado"): botão desabilitado com o motivo ligado por `aria-describedby`; resgate com confirmação numa região viva e trava curta contra duplo toque; sem benefícios; sem cupons |

### Comerciante (`/comerciante`)

Navegação inferior: Início · Coletar · Benefícios · Eventos. Comércio de exemplo: Mercadinho Bom Preço (saldo de exemplo vindo de três coletas no histórico). `/comerciante`, `/comerciante/coletar` e `/comerciante/beneficios` reutilizam as telas do cidadão com textos de comércio (sem metas). A frase do perfil na entrada ("Marque o material do comércio e conquiste benefícios da Prefeitura") foi escrita pela implementação e aguarda confirmação do responsável do projeto.

| Rota | O que mostra | Estados |
|---|---|---|
| `/comerciante/beneficios` | Cartão de saldo, "Benefícios disponíveis" (só itens institucionais ativos, com custo, vagas e "Solicitar") e "Minhas solicitações" com protocolo e status | Mesmos estados do cidadão com o vocabulário do comércio (Sem vagas, "Faltam N pts"); solicitação confirmada numa região viva com o protocolo; status Solicitado (relógio) e Concedido (check), sempre texto + ícone, que muda sozinho quando a Prefeitura concede; sem benefícios; sem solicitações |
| `/comerciante/eventos` | "Eventos e anúncios": eventos abertos da Prefeitura, cada um com "Anunciar neste evento" (formulário inline: título do anúncio, oferta ao cidadão) e "Meus anúncios" com status | Erros por campo com foco no primeiro; sem eventos; sem anúncios; status Em análise, Aprovado, Recusado (ícone + texto + ajuda); aviso numa região viva quando a Prefeitura decide |

### Catador (`/catador`)

Navegação inferior: Pedidos · Rota. Catador de exemplo: João Batista (associado, C-10; não há cadastro nem login no app).

| Rota | O que mostra | Estados |
|---|---|---|
| `/catador` | `MapaQuixada` com pinos dos pedidos aguardando, lista "Aguardando coleta" ordenada por distância da origem do catador, seleção por caixa de marcação (lista e pino) e barra fixa com resumo da rota (paradas, distância, tempo estimados) e "Aceitar e ver rota" | Sem pedidos por perto; nada selecionado (botão desabilitado e explicado); pedido tirado da seleção por outra aba (aviso e confirmação antes de aceitar); aceitar leva a `/catador/rota` |
| `/catador/rota` | Mapa com a rota numerada, resumo e lista "Paradas" em ordem (vizinho mais próximo, rotulada como estimativa), cada uma com endereço, itens, janela, pontos estimados; só a próxima parada tem "Coletado" | Sem rota ativa; rota concluída (com contagem); feedback da coleta numa região viva ("+N pts para <solicitante>"); parada que sumiu da rota |

### Prefeitura (`/prefeitura`)

Painel largo; navegação em barra lateral (`lg`) ou inferior (menor). Itens: Painel · Rodízio · Benefícios · Eventos.

| Rota | O que mostra | Estados |
|---|---|---|
| `/prefeitura` | "Painel da Prefeitura": cinco indicadores calculados do estado (coletas concluídas, material coletado por unidade, pontos distribuídos, cupons resgatados, aguardando coleta), gráfico "Coletas por semana (exemplo)" com tabela alternativa, catadores associados (tabela com nota de que só associados entram) e pedidos recentes | Sem catadores; sem pedidos. Gráfico é série fixa de exemplo, fora do estado |
| `/prefeitura/rodizio` | Item em destaque agora, escolha do material (rádio), multiplicador de ×1,00 a ×1,50 em passos de 0,05 (`Stepper`-like), estimativa de exemplo para um pedido, "Publicar item da semana" (botão grande) e calendário sugerido de exemplo | Limite do multiplicador avisado; confirmação numa região viva; a publicação muda a estimativa na tela de pedir coleta e no item da semana dos demais perfis |
| `/prefeitura/beneficios` | Lista de benefícios (ativar e desativar) e formulário "Criar benefício" (comércio, benefício, custo, estoque) | Todos os campos obrigatórios, erros por campo com foco no primeiro; sem benefícios; confirmação numa região viva |
| `/prefeitura/eventos` | Anúncios em análise com "Aprovar" e "Recusar", lista de eventos e formulário "Criar evento" (título, data, local, descrição) | Erros por campo; sem eventos; confirmação numa região viva |

### Página não encontrada (`src/app/not-found.tsx`)

Qualquer endereço sem rota mostra: logo (link para `/`), cartão com ícone de pino, título "Página não encontrada", uma frase sem culpa e o botão "Voltar ao início". Título da aba: "Página não encontrada | EcoTech".

Limitações conhecidas do protótipo estão em [`decisions.md`](../process/decisions.md) (seção "Limitações conhecidas do protótipo").

## Checklist antes de dar uma tela como pronta

Ver [`workflow.md`](../process/workflow.md) §6 (definição de pronto de UI).
