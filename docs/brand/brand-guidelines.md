# EcoTech: guia de marca

Fonte visual: [`identity-board.png`](./identity-board.png). Sistema de cores, tipografia e componentes: [`/DESIGN.md`](../../DESIGN.md). Produto e públicos: [`/PRODUCT.md`](../../PRODUCT.md).

> **Status dos assets:** os SVGs em `public/brand/` foram **recriados a partir do board** (símbolo desenhado à mão em SVG, wordmark em curvas da Inter Bold). São uma aproximação fiel, mas não os arquivos oficiais de um designer. Quando existirem vetores oficiais, substitua mantendo os mesmos nomes de arquivo. Medidas de área de respiro e tamanho mínimo abaixo são **propostas** (decisão D-09).

## 1. Essência

| | |
|---|---|
| Nome | **EcoTech** (um só termo, "E" e "T" maiúsculos; nunca "Ecotech", "ECOTECH", "Eco Tech", "Eco-Tech") |
| Assinatura | **Pequenas atitudes. Grandes transformações.** |
| Descritor | Conectando tecnologia, natureza e pessoas para transformar a sustentabilidade em benefício coletivo. |
| Propósitos | Incentivar a reciclagem · Conectar pessoas e locais de coleta · Oferecer recompensas e benefícios · Construir uma cidade mais sustentável |
| Pilares (rodapé do board) | Reciclagem inteligente · Conexão com a cidade · Recompensas sustentáveis · Um futuro mais verde |

Personalidade: **acolhedora, concreta, confiável, otimista**. Fala com gente comum, não com ativista nem com engenheiro.

## 2. Símbolo

Hexágono arredondado (estrutura, tecnologia, favo, ordem) contendo uma **folha** (natureza, reciclagem) cortada por uma nervura que atravessa o anel, ao lado de **quatro nós de circuito** em azul (conexão, rede, cidade). Leitura: *a natureza, conectada*.

Construção (viewBox interna do símbolo, unidades arbitrárias):

- Anel: hexágono de ponta para cima, traço de 10 un., cantos arredondados, degradê `#2CC56F → #16A36A → #126B4A` a 135°.
- Folha: preenchida, ponta no canto superior direito, degradê `#1A8B54 → #126B4A`.
- Nervura: recorte (máscara) de 5,5 un. que atravessa folha e anel no canto inferior esquerdo. É um **vazado**: o fundo aparece por ela, em qualquer cor.
- Nós: 4 círculos vazados (azul `#2478C8`), 3 com haste horizontal curta ligada ao anel e 1 solto abaixo.

## 3. Versões e arquivos

Todos em `public/brand/`, servidos em `/brand/<arquivo>`.

| Arquivo | Uso |
|---|---|
| `logo-horizontal.svg` | **Padrão.** Cabeçalhos, rodapés, e-mails, documentos. Fundo claro. |
| `logo-horizontal-on-dark.svg` | Fundos escuros (grafite, verde escuro). "Tech" em branco, folha em tom mais claro. |
| `logo-vertical.svg` / `-on-dark.svg` | Login, splash, capas, espaços estreitos e altos. |
| `symbol.svg` / `symbol-on-dark.svg` | Avatar, selo, onde o nome já aparece ao lado ou o espaço é pequeno. |
| `logo-*-mono-graphite.svg` | Uma cor, sobre claro: impressão P&B, carimbos, marca d'água. |
| `logo-*-mono-white.svg` | Uma cor, sobre escuro ou sobre foto escurecida. |
| `symbol-mono-*.svg` | Símbolo em uma cor. |
| `icon-app.svg` | Ícone do app: quadrado verde em degradê, símbolo branco (512×512). |
| `favicon.svg` | Favicon: quadrado branco com borda suave, símbolo colorido. |

**Escolha da versão:** fundo claro → colorida; fundo escuro liso → `on-dark`; foto, fundo colorido ou uma tinta só → mono (branca sobre escuro, grafite sobre claro).

## 4. Regras de uso

**Área de respiro (proposta):** manter livre, em todos os lados, uma distância igual à altura da letra "E" do wordmark.

**Tamanho mínimo (proposta, digital):** horizontal 120 px de largura · vertical 72 px · símbolo 24 px. Abaixo disso, use o ícone/favicon.

**Cores:** só as versões acima. No wordmark, "Eco" é Verde Principal e "Tech" é Grafite (ou branco no escuro). Em mono, tudo em uma cor.

**Nunca:**
- recolorir fora das versões, trocar a ordem das cores de "Eco"/"Tech";
- esticar, achatar, girar, inclinar;
- aplicar sombra, brilho, contorno, 3D;
- redesenhar o símbolo ou digitar o wordmark em outra fonte (use os SVGs; o wordmark é **curva**, não texto);
- pôr o logotipo colorido sobre foto movimentada ou sobre verde médio: use mono branca;
- separar nós de circuito do hexágono ou remover a nervura.

**No código (Next.js):**

```tsx
import Image from "next/image";
<Image src="/brand/logo-horizontal.svg" alt="EcoTech" width={160} height={48} loading="eager" />
```

Use `alt="EcoTech"` quando o logotipo é o único nome visível; `alt=""` se o texto "EcoTech" já está ao lado. Para favicon e ícones, use as convenções de arquivo do App Router (`src/app/icon.svg`, `src/app/apple-icon.png`, `src/app/favicon.ico`); leia `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/app-icons.md` antes. O `favicon.ico` atual de `src/app/` é o padrão do template e deve ser substituído. Exportar PNG/ICO a partir dos SVG (ImageMagick):

```bash
magick -background none -density 384 public/brand/favicon.svg -resize 180x180 src/app/apple-icon.png
magick -background none -density 384 public/brand/favicon.svg -define icon:auto-resize=48,32,16 src/app/favicon.ico
cp public/brand/favicon.svg src/app/icon.svg
```

## 5. Imagem e ilustração

- **Fotografia:** cidade real com muita arborização (skyline entre copas), luz natural, céu aberto. Pessoas reais em situações reais de descarte e coleta: sem poses de banco de imagem. Verde da foto deve conviver com o verde da marca: evite fotos saturadas demais.
- **Curvas de folha:** formas grandes e translúcidas em `primary` (10 a 25%), uma por superfície, cortando um canto. Ver `DESIGN.md` > Shapes.
- **Ícones:** traço fino arredondado; folha, pino, troféu, pessoas, reciclagem.
- **Sem:** emojis como ícones, ilustrações 3D genéricas, planeta sorrindo, lixeiras cartunescas, gradientes fora do da marca.
- Gerar imagem por IA só com decisão explícita da equipe (D-10); se usada, deve parecer fotografia, não render.

## 6. Voz e texto (pt-BR)

**Tom:** positivo, direto, concreto, humano. Verbos de ação. Fala do ganho antes da regra. Uma ideia por frase. Trate o usuário por **você**.

| Faça | Evite |
|---|---|
| "Encontre o ponto de coleta mais perto de você." | "Localize os ecopontos disponíveis na sua região geográfica." |
| "Você ganhou 200 pontos. Falta pouco para o próximo benefício." | "Parabéns, eco-herói! 🌍💚" |
| "Não conseguimos carregar o mapa. Tente de novo." | "Erro 500." |
| "Pequenas atitudes. Grandes transformações." (assinatura, sem alterar) | Reescrever ou traduzir a assinatura |

Regras: sentence case em botões e títulos ("Criar conta"); ponto final em frases completas, sem ponto em rótulos; números no padrão brasileiro; sem jargão ("onboarding", "gamificação"); sem culpa ou alarmismo ("o planeta está morrendo"); sem promessas de impacto que não possamos medir (ex.: não escrever "você salvou X árvores" sem fonte e cálculo).

**Vocabulário fixo:** ponto de coleta · pontos · recompensa · parceiro · patrocinador · descarte · reciclagem. Mensagens de erro: dizer o que houve, o que fazer, sem culpar.

**Microcopy-base do board (reuso permitido):** "Bem-vindo de volta!", "Entrar", "Criar conta", "Início", "Mapa", "Recompensas", "Você faz a diferença!", "Juntos por uma cidade mais verde", "Uma cidade mais sustentável começa com você."

## 7. Aplicações previstas (do board)

Ícone do app · favicon · cabeçalho da plataforma · tela de login · painel administrativo · cartão de recompensas · material institucional. Especificação de cada tela: [`docs/design/screens.md`](../design/screens.md).
