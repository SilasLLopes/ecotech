# Identidade local e movimento com função: design

Data: 2026-11-24. Aprovado pelo responsável do projeto em conversa ("aplique tudo"), depois da crítica das telas e da proposta de direção. Frente C, depois de A (catálogos) e B (mapa real). Atualiza a seção Motion do `DESIGN.md`, a pedido do responsável ("animações mais evidentes e claras").

## Intenção

Tirar a cara de template do protótipo e dar a ele autenticidade de lugar e de produto, sem mexer na marca (paleta, Inter, logotipo e hexágono ficam). A leitura de quem avalia deve ser: isto foi desenhado para Quixadá e para esta operação de coleta, não montado de peças genéricas.

**Tese:** o gesto pequeno vira rastro visível. Cada ação do usuário deixa uma marca que se vê andando: o pedido que vira ponto no mapa, o ponto que vira caminho, o caminho que vira pontos no saldo. O movimento existe para mostrar essa cadeia, não para enfeitar.

## O que a crítica achou (telas atuais)

- Estrutura repetida: cartões brancos arredondados com ícone em círculo, título e texto cinza; a faixa de KPIs da Prefeitura é o mesmo cartão cinco vezes ("hero-metric" com rótulo pequeno).
- Nada diz Quixadá fora do mapa; vazios e erros usam o mesmo ícone genérico.
- O mapa fica dentro de um cartão com moldura, como um anexo, e o catador não tem sensação de "app de corrida".
- Quase nada se move; os pontos não contam, o pedido não "anda".
- Textos corretos, porém genéricos; uma faixa cheia de "Dados de exemplo" ocupa a tela toda.

## Metas

1. **Identidade local:** silhueta dos monólitos de Quixadá, desenhada em SVG próprio, como motivo recorrente (abertura, cartão de saldo, estados vazios, 404), no lugar de curvas de folha e ícones genéricos; glifos próprios para cada material (garrafa PET, caixa de papelão, lata, vidro, óleo, eletrônicos).
2. **Composição específica por tela**, não cartões iguais: abertura com apresentação dos quatro perfis com prévia viva dos dados de exemplo; catador com mapa em primeiro plano (grudado no topo) e a lista como uma "gaveta" que sobe sobre ele; cidadão com linha do tempo do pedido e cartão de saldo vivo; Prefeitura com o mapa e um ranking de bairros no centro, e os indicadores numa faixa corrida em vez de cinco cartões.
3. **Movimento com função e evidente:** contador de pontos que sobe (com "+N pts" e uma explosão curta de hexágonos quando a coleta é concluída), pedido que ganha cada etapa com a linha se preenchendo, cupom que entra como ticket, materiais que reagem ao toque, listas que entram em sequência, barras do gráfico que crescem, troca de tela com transição curta. Todo movimento respeita `prefers-reduced-motion` com alternativa que preserva o estado.
4. **Superfícies do navegador no estilo da marca:** seleção de texto, foco, barra de rolagem, `accent-color`, quebra equilibrada de títulos, números tabulares.
5. **Voz de produto:** textos curtos, concretos e locais, sem jargão e sem culpa. A faixa "Protótipo com dados de exemplo" vira uma etiqueta discreta no topo, e o rótulo continua em todas as telas.

## Não metas

- Mudar paleta, fonte, logotipo ou hexágono. Fotografia (D-10), vídeo, som, biblioteca de animação, tema escuro.
- Efeitos decorativos contínuos (só o pulso do catador no mapa e o que o usuário dispara).
- Novos fluxos ou regras de negócio.

## Antimetas

- Movimento que atrasa a tarefa: nada bloqueia clique, e toda animação termina em menos de 1,2 s (exceto a rota do mapa, até 1,8 s).
- Efeito sem significado (parallax, hover que flutua, entrada igual em tudo).
- Gradiente de texto, `border-left` colorido, vidro como enfeite, emoji no lugar de ícone, eyebrow acima de título.
- Número ou fato novo: os dados continuam de exemplo e marcados.

## Restrições

As do MVP e dos planos A e B: `cacheComponents` (nada de `Date`/`Math.random` na renderização), `useId()`, cleanup em `useLayoutEffect`, tokens sem hex fora de arquivos de ilustração/estilo, 360px sem rolagem horizontal, WCAG 2.2 AA (contraste, foco, alvos de 44px), reducer puro, testes em `src/lib` para lógica nova. Sem dependência nova: CSS, a Web Animations API quando preciso e `ViewTransition` do React 19.3.

## Abordagem

CSS e pequenos componentes próprios (`Contador`, `Revelar`, `Explosao`) sobre tokens de movimento no `@theme`; transição entre telas com `<ViewTransition>` se funcionar com `cacheComponents` (testar; se não, fica sem). Uma biblioteca de animação foi descartada: o catálogo de efeitos é pequeno e todos têm alternativa estática.

## Decisões do assistente (corrigir se discordar)

- Os monólitos são desenhados à mão como curvas simples (silhueta estilizada, não cópia de foto); as figuras principais são a Pedra da Galinha Choca e as vizinhas, como forma geral.
- `DESIGN.md` > Motion passa de "curto, útil e suave" para "movimento com função": 150 a 250 ms nas respostas, 400 a 800 ms no momento principal, sem bounce e sem laços decorativos, sempre com alternativa para movimento reduzido.
- Pontos "voando" só quando o saldo realmente sobe (comparando o saldo anterior), nunca na primeira renderização.
