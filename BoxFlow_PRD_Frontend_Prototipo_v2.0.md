# BoxFlow - PRD do Protótipo Front-end

**Produto:** BoxFlow  
**Documento:** Product Requirements Document focado em interface e experiência  
**Versão:** 2.0  
**Data:** 17/09/2026  
**Status:** Especificação para construção de protótipo navegável  
**Escopo técnico desta versão:** Front-end com dados mockados, sem dependência de backend, sensor ou integração real.

> Este documento define o que deve existir, aparecer e funcionar no protótipo visual do BoxFlow. O objetivo não é implementar o pipeline real de LiDAR neste momento, mas demonstrar de forma convincente como operadores, supervisores e demais usuários consultariam volumes, materiais, estados dos boxes, histórico, reconstrução 3D e relatórios.

---

## 1. Objetivo do protótipo

O protótipo deve representar a experiência futura do BoxFlow como um sistema operacional de acompanhamento dos boxes de armazenamento. Todas as informações exibidas inicialmente serão simuladas, porém a interface deve se comportar como um produto real: filtros funcionam, formulários cadastram dados localmente, estados mudam, históricos são atualizados, importações podem ser demonstradas, relatórios podem ser exportados e a visualização 3D pode ser manipulada.

O protótipo precisa responder rapidamente às seguintes perguntas:

1. Qual material está em cada box agora?
2. Qual é o estado operacional de cada box: livre, recebendo, armazenado, retirando, em limpeza ou manutenção?
3. Qual foi o último volume medido em m³ e quando essa leitura ocorreu?
4. A leitura é válida ou existe alguma limitação?
5. O que aconteceu anteriormente naquele box?
6. Como a superfície/material aparece dentro do box em uma reconstrução 3D?
7. Como o volume mudou entre duas medições?
8. Quais boxes precisam de atenção?
9. Quais dados podem ser exportados para análise ou conferência?
10. Como dados do sistema legado poderiam entrar no BoxFlow?

A prioridade é **clareza operacional e força de demonstração**, não fidelidade de infraestrutura.

---

## 2. Princípios do protótipo

### 2.1 Dados simulados, experiência realista

Todos os dados iniciais serão mockados. O protótipo deve exibir um selo discreto como **"Ambiente de demonstração"** para evitar que valores simulados sejam confundidos com medições reais.

Os mocks devem ficar centralizados em uma camada própria e não espalhados pelos componentes. Isso permite substituir os mocks por API posteriormente sem reconstruir a interface.

### 2.2 Estado operacional e estado da medição são diferentes

A interface deve separar claramente dois conceitos:

**Estado operacional do box** descreve o que está acontecendo fisicamente com o espaço e o material.

- LIVRE
- RECEBENDO
- ARMAZENADO
- EM RETIRADA
- EM LIMPEZA
- EM MANUTENÇÃO

**Estado da medição** descreve a confiabilidade/atualidade do dado volumétrico.

- VÁLIDA
- VENCIDA
- INCONCLUSIVA
- INVÁLIDA
- RECALIBRAÇÃO NECESSÁRIA
- SEM DADOS
- NÃO INSTRUMENTADO

Exemplo: um box pode estar **EM LIMPEZA** e possuir a última leitura **VENCIDA**. Outro pode estar **RECEBENDO Ureia** com leitura **VÁLIDA**.

Nunca utilizar o mesmo chip visual para representar as duas categorias.

### 2.3 Ausência de dado não significa zero

Um box sem leitura deve mostrar `--` ou "Sem leitura", nunca `0 m³`. Zero só deve aparecer quando o cenário simulado indicar explicitamente uma medição válida de box vazio.

### 2.4 Última leitura válida e última tentativa são diferentes

Uma falha de aquisição não apaga o último volume válido. A interface deve ser capaz de apresentar simultaneamente:

- Última leitura válida: 4.210 m³ às 14:32.
- Última tentativa: falhou às 14:38.

### 2.5 O protótipo não deve prometer precisão inexistente

Não usar frases como "99% de precisão". Cobertura da superfície não é precisão. Se houver limites mínimo/máximo de volume no mock, eles devem aparecer como faixa estimada, não como garantia metrológica.

### 2.6 A navegação precisa funcionar

Não construir apenas telas estáticas. O usuário deve conseguir:

- clicar em um box e abrir detalhes;
- filtrar boxes;
- trocar entre abas;
- cadastrar e editar materiais;
- iniciar/alterar/encerrar um ciclo de ocupação;
- importar dados de exemplo;
- exportar informações;
- navegar no histórico;
- manipular a cena 3D;
- alternar cenários de demonstração.

---

## 3. Perfis considerados no design

O protótipo não precisa implementar autenticação ou RBAC real, mas suas telas devem atender aos principais perfis.

| Perfil | O que precisa conseguir visualizar ou fazer |
|---|---|
| Operador | Consultar seu box, material atual, volume, estado operacional e condição da leitura |
| Supervisor | Acompanhar os 10 boxes, identificar pendências e consultar histórico |
| Estoque/Planejamento | Analisar material, volume e variação ao longo do tempo; exportar dados |
| Técnico/Manutenção | Visualizar cobertura, falhas, calibração simulada e reconstrução 3D |
| Equipe de validação | Comparar medições simuladas, referências e resultados de ensaio |

No ambiente de demonstração pode existir um **seletor de perfil** apenas para mudar o foco visual ou os menus exibidos. Isso é opcional e não representa segurança real.

---

## 4. Arquitetura de navegação

### 4.1 Menu lateral principal

1. **Dashboard**
2. **Boxes**
3. **Materiais**
4. **Histórico**
5. **Relatórios**
6. **Validação**

No rodapé do menu:

- Ambiente de demonstração
- Configurações do protótipo

### 4.2 Navegação contextual do box

Ao abrir um box:

- Visão geral
- Reconstrução 3D
- Histórico
- Movimentações
- Diagnóstico

### 4.3 Rotas sugeridas

```text
/dashboard
/boxes
/boxes/:boxId
/boxes/:boxId/3d
/boxes/:boxId/historico
/boxes/:boxId/movimentacoes
/boxes/:boxId/diagnostico
/materiais
/historico
/relatorios
/validacao
/demo
```

---

# 5. Tela 01 - Dashboard operacional

## 5.1 Objetivo

Permitir que um supervisor entenda a situação dos 10 boxes em poucos segundos.

## 5.2 Estrutura visual

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ BoxFlow                         Terminal / Unidade      Demo      Usuário   │
├───────────────┬────────────────────────────────────────────────────────────┤
│ Dashboard     │  RESUMO OPERACIONAL                                      │
│ Boxes         │  [10 Boxes] [6 válidos] [3 atenção] [2 livres]            │
│ Materiais     │                                                            │
│ Histórico     │  Filtros: [Box] [Material] [Operação] [Medição]           │
│ Relatórios    │                                                            │
│ Validação     │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│               │  │ Box 01 │ │ Box 02 │ │ Box 03 │ │ Box 04 │ │ Box 05 │   │
│               │  │ ...    │ │ ...    │ │ ...    │ │ ...    │ │ ...    │   │
│               │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘   │
│               │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│               │  │ Box 06 │ │ Box 07 │ │ Box 08 │ │ Box 09 │ │ Box 10 │   │
│               │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘   │
│               │                                                            │
│               │  Pendências recentes             Atividade recente         │
└───────────────┴────────────────────────────────────────────────────────────┘
```

## 5.3 Cabeçalho

Exibir:

- logotipo/nome BoxFlow;
- unidade/terminal;
- selo "Ambiente de demonstração";
- horário da última atualização geral;
- botão de notificações;
- avatar/menu de usuário fictício.

## 5.4 Cards de resumo

Cards recomendados:

1. **Boxes monitorados:** `9 / 10`
2. **Leituras utilizáveis:** quantidade de boxes com leitura válida e recente
3. **Precisam de atenção:** vencida, inconclusiva, falha ou recalibração
4. **Boxes livres:** estado operacional LIVRE
5. **Recebendo agora:** quantidade em RECEBENDO

Os números devem reagir aos mocks/filtros.

## 5.5 Filtros

- Box
- Material
- Estado operacional
- Estado da medição
- Somente com pendência

Adicionar ação **Limpar filtros**.

## 5.6 Grade principal dos 10 boxes

A primeira visualização deve ser em cards. Opcionalmente permitir alternar `Cards | Tabela`.

Cada card precisa mostrar:

- Box 01, Box 02 etc.;
- material atual ou "Sem material";
- estado operacional;
- volume mais recente utilizável em m³;
- horário/idade da leitura;
- estado da medição;
- ícone de alerta se última tentativa falhou;
- mini tendência/sparkline opcional;
- botão/ação "Ver detalhes".

### Exemplo de card

```text
BOX 02                                      [ARMAZENADO]
Fertilizante B

4.210 m³
Última leitura válida: há 8 min
● Válida

⚠ Última tentativa falhou há 2 min

Ver detalhes →
```

## 5.7 Painel de pendências

Lista lateral ou seção inferior com prioridade visual:

- Box 08 - recalibração necessária
- Box 06 - leitura inconclusiva
- Box 03 - leitura vencida
- Box 02 - falha na última tentativa
- Box 10 - não instrumentado

Clicar em uma pendência abre o box correspondente.

## 5.8 Atividade recente

Timeline curta:

- 14:38 - tentativa de leitura do Box 02 falhou
- 14:34 - Box 07 iniciou recebimento
- 14:31 - Box 03 entrou em limpeza
- 14:25 - nova leitura válida no Box 05

---

# 6. Tela 02 - Boxes

## 6.1 Objetivo

Exibir os 10 boxes em formato de gestão e permitir alterações simuladas de estado operacional.

## 6.2 Conteúdo

Tabela com:

- Box
- Material atual
- Estado operacional
- Volume atual
- Estado da medição
- Última atualização
- Última movimentação
- Ações

## 6.3 Ações

- Ver detalhes
- Atualizar situação
- Alterar material/ciclo
- Abrir 3D
- Exportar dados do box

## 6.4 Modal "Atualizar situação do box"

Campos:

- Estado operacional
- Data/hora
- Material relacionado
- Observação

A mudança deve ser registrada imediatamente na timeline local do box.

---

# 7. Tela 03 - Detalhe do box / Visão geral

## 7.1 Objetivo

Concentrar as informações operacionais e volumétricas de um único box.

## 7.2 Cabeçalho

Exemplo:

```text
Box 05       [EM RETIRADA]       Material D

Última leitura utilizável: 2.670 m³
Atualizada há 4 min              ● Válida
```

Ações de topo:

- Atualizar operação
- Abrir visualização 3D
- Exportar
- Mais ações

## 7.3 Cards principais

- Volume atual em m³
- Variação desde a leitura anterior (`+/- m³`)
- Estado da medição
- Cobertura da superfície, quando mockada
- Última tentativa

## 7.4 Última tentativa x última leitura válida

Este bloco deve existir sempre que houver divergência.

```text
Última leitura válida
2.670 m³ - 14:25 - válida

Última tentativa
14:30 - inconclusiva - cobertura insuficiente
```

## 7.5 Gráfico de histórico

Gráfico de linha de volume por tempo.

Regras visuais:

- lacunas permanecem como lacunas;
- não ligar artificialmente períodos sem leitura;
- marcar alterações de material e mudanças operacionais na linha do tempo;
- tooltip deve mostrar data/hora, volume, estado e material;
- permitir 24h, 7 dias, 30 dias e período personalizado.

## 7.6 Linha do tempo operacional

Exemplo:

```text
12/09 08:20   Recebimento iniciado - Material D
12/09 15:40   Estado alterado para ARMAZENADO
14/09 09:10   Retirada iniciada
14/09 11:05   Leitura válida: 2.670 m³
```

## 7.7 Resumo da reconstrução 3D

Card grande com preview da cena 3D, volume e botão **Explorar em 3D**.

---

# 8. Tela 04 - Reconstrução 3D do box

## 8.1 Objetivo

Representar visualmente o resultado esperado de uma aquisição LiDAR 3D e permitir ao usuário entender onde o material está, como sua superfície se comporta e como mudou entre medições.

Essa tela é uma parte central da demonstração do BoxFlow.

## 8.2 Importante para o protótipo

O protótipo **não precisa consumir uma nuvem de pontos real**. Deve usar dados simulados estruturados em grade de alturas, pontos 3D ou uma malha predefinida, mantendo uma interface de dados que possa ser substituída no futuro por saída real do pipeline LiDAR.

Mostrar selo **"Reconstrução simulada"** no ambiente de demonstração.

## 8.3 Layout

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Box 05 > Reconstrução 3D               14/09 11:05      2.670 m³          │
├───────────────────────────────────────────────────────┬────────────────────┤
│                                                       │ CAMADAS            │
│                                                       │ ☑ Material         │
│                                                       │ ☑ Box / referência │
│                  CENA 3D INTERATIVA                  │ ☐ Nuvem de pontos  │
│                                                       │ ☑ Regiões ocultas  │
│                                                       │ ☐ Sensor / FoV     │
│                                                       │                    │
│                                                       │ VISUALIZAÇÃO       │
│                                                       │ [Superfície]       │
│                                                       │ [Altura]           │
├───────────────────────────────────────────────────────┴────────────────────┤
│  ◀ 08:00 ───────────────● 11:05 ─────────────────────────────── 14:00 ▶   │
│  [Comparar com outra leitura]       [Resetar câmera] [Tela cheia]         │
└────────────────────────────────────────────────────────────────────────────┘
```

## 8.4 Cena 3D

A cena deve representar:

- paredes e limites do box;
- geometria de referência do box vazio;
- superfície do material;
- bases/estruturas fixas simplificadas quando pertinente;
- opcionalmente posição do sensor e campo de visão;
- regiões sem observação, quando o cenário mock tiver lacunas.

## 8.5 Modos de visualização

### Modo superfície

Malha contínua representando a superfície da pilha.

### Modo nuvem de pontos

Visualização simulada de pontos capturados para comunicar a origem LiDAR.

### Modo altura

Aplicar escala visual de altura sobre a superfície. Incluir legenda em metros.

### Modo cobertura

Distinguir região observada de região não observada. Não chamar cobertura de precisão.

## 8.6 Interações obrigatórias

- rotacionar/orbitar;
- zoom;
- pan;
- resetar câmera;
- vistas rápidas: isométrica, topo, frontal e lateral;
- tela cheia;
- ligar/desligar camadas;
- selecionar data/leitura;
- tooltip ao apontar para uma região, mostrando altura aproximada simulada.

## 8.7 Comparação entre duas medições

Botão **Comparar leituras** abre seletor de duas datas válidas.

A interface deve mostrar:

- Leitura A: data/hora + volume
- Leitura B: data/hora + volume
- Δ volume em m³
- material em cada leitura
- compatibilidade simulada

Visualizações possíveis:

1. slider Antes/Depois;
2. sobreposição das duas superfícies;
3. lado a lado;
4. mapa visual das regiões que aumentaram/diminuíram.

Para o MVP visual, implementar pelo menos **slider temporal + sobreposição opcional**.

## 8.8 Painel de informações da leitura

- Volume: `2.670 m³`
- Material: `Material D`
- Aquisição: data/hora
- Estado: Válida
- Cobertura: `92%` apenas como dado simulado
- Faixa estimada: se houver no mock
- Origem: Demonstração

## 8.9 Dados mock recomendados para 3D

Estrutura sugerida:

```ts
interface MockSurfaceFrame {
  id: string;
  boxId: string;
  capturedAt: string;
  volumeM3: number | null;
  materialId: string | null;
  measurementStatus: MeasurementStatus;
  grid: number[][];          // alturas por célula
  observedMask: boolean[][]; // região observada ou não
}
```

A malha pode ser gerada localmente a partir da `grid`.

---

# 9. Tela 05 - Materiais

## 9.1 Objetivo

Permitir cadastrar e organizar os tipos de material utilizados nos boxes e consultar onde cada material está ou esteve.

## 9.2 Lista de materiais

Tabela/cards:

- Nome
- Código interno opcional
- Categoria opcional
- Situação: ativo/inativo
- Boxes atuais
- Última utilização
- Ações

## 9.3 Cadastro de material

Modal ou drawer **Novo material**.

Campos:

- Nome do material - obrigatório
- Código/identificador legado - opcional
- Categoria - opcional
- Descrição/observação - opcional
- Cor de identificação visual - opcional e apenas para UI
- Ativo - sim/não

Não exigir densidade ou massa para o protótipo de volumetria.

## 9.4 Detalhe do material

Exibir:

- informações cadastradas;
- boxes onde está atualmente;
- boxes onde esteve anteriormente;
- histórico de ciclos;
- volumes históricos relacionados;
- botão exportar.

---

# 10. Ciclo de ocupação / movimentação de material

## 10.1 Conceito

O protótipo deve guardar o histórico de **qual material ocupava determinado box e em qual fase operacional ele estava**.

Fluxo visual recomendado:

```text
LIVRE
  ↓
RECEBENDO
  ↓
ARMAZENADO
  ↓
EM RETIRADA
  ↓
EM LIMPEZA
  ↓
LIVRE
```

Pode haver transições excepcionais para **EM MANUTENÇÃO**.

## 10.2 Regra de demonstração

Para simplificar o protótipo, considerar **um material ativo por ciclo de ocupação do box**. Essa é uma premissa de interface a validar posteriormente com a operação e não deve ser apresentada como regra industrial definitiva.

## 10.3 Cadastro/início de ciclo

Ação **Iniciar recebimento**.

Campos:

- Box
- Material
- Data/hora de início
- Referência externa/identificador legado - opcional
- Observação

Após salvar:

- estado operacional vira RECEBENDO;
- material aparece no card do box;
- evento entra no histórico.

## 10.4 Alterações do ciclo

Ações rápidas:

- Marcar como armazenado
- Iniciar retirada
- Finalizar retirada
- Iniciar limpeza
- Finalizar limpeza e liberar box

Cada ação abre confirmação com data/hora e observação opcional.

## 10.5 Box em limpeza

Quando o box estiver EM LIMPEZA:

- Material atual: nenhum
- Mostrar `Último material: X`
- Mostrar data da última retirada
- Mostrar estado da medição separadamente

## 10.6 Box livre

Quando o ciclo é encerrado:

- estado operacional LIVRE;
- sem material atual;
- histórico anterior permanece disponível;
- última leitura volumétrica não é apagada, mas deve ser contextualizada pela data.

---

# 11. Tela 06 - Histórico geral

## 11.1 Objetivo

Concentrar medições e acontecimentos operacionais em uma linha do tempo pesquisável.

## 11.2 Filtros

- período;
- box;
- material;
- tipo de evento;
- estado operacional;
- estado da medição.

## 11.3 Tipos de evento

- leitura volumétrica;
- falha/inconclusão;
- início de recebimento;
- alteração para armazenado;
- início/fim de retirada;
- início/fim de limpeza;
- material alterado;
- recalibração simulada;
- importação de dado legado.

## 11.4 Visualizações

Alternar:

- Timeline
- Tabela
- Gráfico de volume

## 11.5 Ação de exportação

Exportar resultado filtrado em CSV.

---

# 12. Tela 07 - Importação de dados do sistema antigo

## 12.1 Objetivo

Demonstrar como informações existentes no sistema legado poderiam ser incorporadas ao BoxFlow, principalmente histórico de material e ocupação.

O protótipo não precisa integrar diretamente com o sistema antigo. Deve demonstrar um fluxo de importação local.

## 12.2 Formatos

- CSV
- XLSX, se a biblioteca escolhida permitir processamento local

## 12.3 Fluxo em etapas

### Etapa 1 - Selecionar arquivo

Área drag-and-drop e botão selecionar arquivo.

### Etapa 2 - Mapear colunas

Exemplo:

```text
Coluna do arquivo       Campo BoxFlow
BOX                     → Box
PRODUTO                  → Material
DATA_ENTRADA             → Início do ciclo
DATA_SAIDA               → Fim do ciclo
SITUACAO                 → Estado operacional
OBS                      → Observação
```

### Etapa 3 - Pré-visualizar

Tabela com 10-20 primeiras linhas e indicadores:

- válido;
- campo ausente;
- box desconhecido;
- material novo;
- possível duplicidade.

### Etapa 4 - Confirmar importação

Resumo:

- 120 registros analisados
- 112 válidos
- 5 com alerta
- 3 rejeitados

### Etapa 5 - Resultado

Os registros importados aparecem no histórico local com origem `LEGADO / DEMO`.

## 12.4 Importante

Como é um protótipo front-end, o arquivo pode ser processado apenas no navegador e os dados podem ser persistidos em IndexedDB/localStorage.

---

# 13. Tela 08 - Relatórios e exportações

## 13.1 Objetivo

Permitir extrair dados apresentados no protótipo para conferência e apresentação.

## 13.2 Relatórios disponíveis

### Resumo dos boxes

Campos:

- Box
- Material atual
- Estado operacional
- Volume atual
- Estado da medição
- Data/hora da leitura

### Histórico de um box

- período;
- material;
- volumes;
- mudanças de estado;
- falhas/pendências.

### Histórico por material

- material;
- boxes utilizados;
- períodos;
- volumes relacionados.

## 13.3 Exportações

Implementar, no mínimo:

- **CSV real gerado pelo navegador** para tabelas filtradas;
- botão **Gerar relatório PDF**. Se o PDF for complexo para a primeira entrega, pode inicialmente gerar uma página de impressão bem formatada e usar `window.print()`/print stylesheet.

Exportar somente os dados atualmente filtrados quando a ação partir de uma tabela filtrada.

---

# 14. Tela 09 - Diagnóstico do box

## 14.1 Objetivo

Exibir detalhes técnicos sem poluir a interface principal.

## 14.2 Conteúdo

- última tentativa;
- última leitura válida;
- motivo da falha/inconclusão;
- cobertura simulada;
- calibração: válida / pendente / expirada;
- versão da referência geométrica;
- origem dos dados;
- sensor simulado;
- horário da última atualização;
- histórico curto de ocorrências técnicas.

## 14.3 Visual

Usar cards e tabela compacta. Evitar transformar essa tela em painel de infraestrutura.

---

# 15. Tela 10 - Validação

## 15.1 Objetivo

Demonstrar como a equipe técnica compararia uma medição BoxFlow com um volume de referência conhecido.

## 15.2 Tabela de ensaios

- Ensaio
- Box/cena
- Volume de referência
- Volume estimado
- Erro em m³
- Erro relativo, quando aplicável
- Condição da leitura
- Resultado do critério

Todos os números nesta área são simulados no protótipo e devem ser marcados como tal.

## 15.3 Detalhe do ensaio

Pode abrir drawer/modal com:

- imagem/preview 3D;
- parâmetros simulados;
- cobertura;
- observações;
- gráfico de repetições.

---

# 16. Painel de demonstração

## 16.1 Objetivo

Permitir que a equipe apresente vários cenários sem editar código.

Esse painel pode ficar escondido em `/demo` ou ser aberto por um botão discreto disponível apenas no ambiente de protótipo.

## 16.2 Funções

- restaurar dados iniciais;
- avançar relógio simulado;
- simular nova leitura válida;
- simular falha de aquisição;
- simular leitura inconclusiva;
- simular leitura vencida;
- exigir recalibração;
- iniciar recebimento;
- iniciar retirada;
- iniciar/finalizar limpeza;
- liberar box;
- trocar material;
- carregar cenário completo.

## 16.3 Presets

### Cenário A - Operação normal

Maioria dos boxes com leituras válidas e diferentes materiais.

### Cenário B - Atenção técnica

Falha recente, leitura inconclusiva e recalibração necessária em boxes diferentes.

### Cenário C - Giro operacional

Um box recebendo, outro retirando, outro em limpeza e outro sendo liberado.

### Cenário D - Comparação 3D

Duas ou três reconstruções diferentes do mesmo box para demonstrar aumento/redução da pilha.

---

# 17. Dados iniciais do mock

Todos os valores abaixo são **fictícios e destinados apenas à demonstração da interface**.

| Box | Estado operacional | Material atual | Volume exibido | Estado da medição | Situação especial |
|---|---|---|---:|---|---|
| Box 01 | RECEBENDO | Material A | 1.840 m³ | VÁLIDA | volume crescendo |
| Box 02 | ARMAZENADO | Material B | 4.210 m³ | VÁLIDA | última tentativa falhou |
| Box 03 | EM LIMPEZA | - | 125 m³ | VENCIDA | último material: Material C |
| Box 04 | LIVRE | - | 0 m³ | VÁLIDA | box vazio confirmado no mock |
| Box 05 | EM RETIRADA | Material D | 2.670 m³ | VÁLIDA | volume reduzindo |
| Box 06 | ARMAZENADO | Material A | 3.910 m³* | INCONCLUSIVA | preserva última válida |
| Box 07 | RECEBENDO | Material E | 1.230 m³ | VÁLIDA | leitura recente |
| Box 08 | EM MANUTENÇÃO | - | 2.500 m³* | RECALIBRAÇÃO NECESSÁRIA | valor antigo preservado |
| Box 09 | ARMAZENADO | Material B | 4.850 m³ | VÁLIDA | operação normal |
| Box 10 | LIVRE | - | -- | NÃO INSTRUMENTADO | sem volume fictício |

`*` Último volume válido anterior; não representa nova medição bem-sucedida.

---

# 18. Modelo de dados do front-end

O protótipo deve usar interfaces tipadas e uma camada de serviço mockada.

## 18.1 Box

```ts
interface Box {
  id: string;
  code: string;
  name: string;
  operationalStatus: OperationalStatus;
  measurementStatus: MeasurementStatus;
  currentMaterialId: string | null;
  lastMaterialId: string | null;
  latestValidMeasurementId: string | null;
  latestAttemptId: string | null;
  instrumented: boolean;
}
```

## 18.2 Material

```ts
interface Material {
  id: string;
  name: string;
  legacyCode?: string;
  category?: string;
  description?: string;
  displayColor?: string;
  active: boolean;
}
```

## 18.3 Ciclo de ocupação

```ts
interface OccupancyCycle {
  id: string;
  boxId: string;
  materialId: string;
  startedAt: string;
  endedAt: string | null;
  currentStage: 'RECEIVING' | 'STORED' | 'WITHDRAWING' | 'CLEANING';
  externalReference?: string;
  notes?: string;
  source: 'DEMO' | 'LEGACY_IMPORT';
}
```

## 18.4 Medição

```ts
interface Measurement {
  id: string;
  boxId: string;
  capturedAt: string;
  volumeM3: number | null;
  status: MeasurementStatus;
  coverageRatio?: number | null;
  volumeMinM3?: number | null;
  volumeMaxM3?: number | null;
  materialId?: string | null;
  source: 'DEMO';
}
```

## 18.5 Tentativa

```ts
interface AcquisitionAttempt {
  id: string;
  boxId: string;
  startedAt: string;
  finishedAt: string;
  status: 'SUCCESS' | 'FAILED' | 'INCONCLUSIVE';
  reason?: string;
}
```

## 18.6 Evento operacional

```ts
interface OperationalEvent {
  id: string;
  boxId: string;
  occurredAt: string;
  type: string;
  title: string;
  description?: string;
  materialId?: string;
  source: 'DEMO' | 'LEGACY_IMPORT';
}
```

---

# 19. Persistência do protótipo

## 19.1 Requisito

Não é necessário backend.

## 19.2 Estratégia recomendada

- mocks iniciais em arquivos TypeScript/JSON;
- estado da aplicação em store global;
- alterações de usuário persistidas em `localStorage` ou preferencialmente `IndexedDB` quando houver importação de arquivos;
- botão **Restaurar demonstração** limpa o estado persistido e recarrega a seed original.

## 19.3 Abstração

Componentes não devem importar arquivos mock diretamente.

Usar serviços/repositórios como:

```text
BoxRepository
MaterialRepository
MeasurementRepository
OperationsRepository
ImportService
ExportService
Surface3DRepository
```

Hoje esses serviços leem dados locais. No futuro poderão chamar API.

---

# 20. Design visual

## 20.1 Direção

Visual de software industrial moderno, limpo e confiável. Evitar dashboard genérico excessivamente carregado.

Características:

- menu lateral escuro;
- superfícies claras;
- bastante espaço em branco;
- cards com bordas suaves;
- hierarquia tipográfica forte;
- gráficos simples;
- números de volume grandes e legíveis;
- status sempre com texto + ícone, não somente cor.

## 20.2 Paleta provisória

Enquanto não existir identidade final, usar uma paleta consistente e fácil de substituir por tokens.

- Navegação / azul profundo: `#0B1F33`
- Primária / azul: `#2563EB`
- Destaque técnico / ciano: `#0891B2`
- Sucesso: `#16A34A`
- Atenção: `#D97706`
- Erro: `#DC2626`
- Recalibração / roxo: `#7C3AED`
- Texto principal: `#172033`
- Fundo: `#F4F7FA`
- Superfície: `#FFFFFF`

Essas cores são sugestão de protótipo, não identidade definitiva.

## 20.3 Distinção visual entre estados

**Estado operacional:** chip de contorno/ícone próprio.  
**Estado da medição:** indicador semântico preenchido com cor de qualidade.

Não usar, por exemplo, o mesmo verde para "ARMAZENADO" e "VÁLIDA" de forma que pareçam o mesmo conceito.

## 20.4 Responsividade

Prioridade: desktop 1366×768 e 1440×900.

O protótipo deve continuar utilizável em tablet. Mobile não é prioridade, mas não deve quebrar completamente.

---

# 21. Componentes reutilizáveis

Criar componentes reutilizáveis para evitar telas montadas de forma inconsistente.

- `AppShell`
- `Sidebar`
- `Topbar`
- `KpiCard`
- `BoxCard`
- `OperationalStatusChip`
- `MeasurementStatusBadge`
- `MaterialBadge`
- `VolumeDisplay`
- `LastValidMeasurement`
- `LatestAttemptAlert`
- `VolumeHistoryChart`
- `OperationalTimeline`
- `FiltersBar`
- `DataTable`
- `ExportMenu`
- `MaterialForm`
- `OperationalUpdateModal`
- `ImportWizard`
- `Surface3DViewer`
- `SurfaceLayerControls`
- `MeasurementComparisonPanel`
- `EmptyState`
- `ErrorState`
- `DemoBadge`

---

# 22. Estados de interface que precisam existir

A IA/desenvolvedor não deve implementar apenas o "happy path".

Cada tela relevante precisa prever:

- carregando;
- sem resultados;
- sem dados do box;
- erro de carregamento simulado;
- filtro sem correspondência;
- formulário com validação;
- confirmação de alteração;
- sucesso de cadastro;
- importação parcialmente válida;
- exportação em andamento/concluída;
- WebGL/3D indisponível com fallback informativo.

---

# 23. Requisitos funcionais do front-end

| ID | Requisito | Prioridade |
|---|---|---|
| FE-001 | Exibir os 10 boxes no dashboard | P0 |
| FE-002 | Exibir material, estado operacional, volume e estado da medição em cada box | P0 |
| FE-003 | Filtrar dashboard por box, material e estados | P0 |
| FE-004 | Abrir detalhe do box | P0 |
| FE-005 | Exibir histórico volumétrico do box | P0 |
| FE-006 | Exibir última tentativa separada da última leitura válida | P0 |
| FE-007 | Cadastrar/editar/inativar material localmente | P0 |
| FE-008 | Iniciar e atualizar ciclo de ocupação do box | P0 |
| FE-009 | Registrar limpeza e liberar box | P0 |
| FE-010 | Preservar histórico após troca/saída do material | P0 |
| FE-011 | Exibir visualização 3D manipulável por box | P0 |
| FE-012 | Trocar leitura/data na visualização 3D | P0 |
| FE-013 | Ligar/desligar camadas da visualização 3D | P0 |
| FE-014 | Comparar duas reconstruções/medições | P1 |
| FE-015 | Importar CSV de demonstração | P0 |
| FE-016 | Mapear colunas e pré-visualizar importação | P1 |
| FE-017 | Exportar tabelas filtradas em CSV | P0 |
| FE-018 | Gerar relatório imprimível/PDF | P1 |
| FE-019 | Exibir histórico geral/timeline | P0 |
| FE-020 | Exibir diagnóstico técnico do box | P1 |
| FE-021 | Exibir ensaios simulados de validação | P1 |
| FE-022 | Possuir painel de cenários de demonstração | P0 |
| FE-023 | Persistir alterações locais entre recargas | P0 |
| FE-024 | Restaurar seed original | P0 |
| FE-025 | Identificar visualmente todo dado como demonstração | P0 |

---

# 24. Critérios de aceite por tela

## Dashboard

- os 10 boxes aparecem sem rolagem horizontal em desktop;
- é possível identificar material e operação sem abrir o detalhe;
- é possível identificar qualidade/idade da medição;
- filtros alteram cards e KPIs;
- pendências abrem o box correto.

## Detalhe do box

- volume, material, operação e qualidade aparecem no primeiro viewport;
- histórico gráfico funciona;
- eventos operacionais aparecem em ordem cronológica;
- falha posterior não substitui o último volume válido.

## 3D

- cena pode ser rotacionada e ampliada;
- material e estrutura do box são distinguíveis;
- usuário pode selecionar pelo menos duas leituras diferentes;
- volume e timestamp mudam junto com a leitura;
- camadas podem ser ligadas/desligadas;
- comparação entre leituras mostra Δm³;
- interface identifica reconstrução como simulada.

## Materiais

- usuário consegue cadastrar, editar e inativar;
- material cadastrado pode ser selecionado em um ciclo;
- histórico não é apagado quando material fica inativo.

## Ciclo operacional

- usuário consegue percorrer RECEBENDO → ARMAZENADO → EM RETIRADA → EM LIMPEZA → LIVRE;
- cada transição cria evento no histórico;
- box em limpeza mostra último material;
- box livre não mantém material como atual.

## Importação

- CSV pode ser selecionado;
- mapeamento de colunas é visível;
- preview identifica inconsistências;
- registros confirmados aparecem no histórico.

## Exportação

- CSV é baixado com filtros aplicados;
- relatório visual pode ser impresso/salvo como PDF.

---

# 25. Ordem recomendada de implementação

## Fase 1 - Base visual e dados

1. Design system/tokens
2. AppShell + navegação
3. Tipos e seed mock
4. Store global
5. Dashboard
6. BoxCard e estados

## Fase 2 - Experiência do box

7. Detalhe do box
8. Histórico de volume
9. Timeline operacional
10. Ações de ciclo de ocupação
11. Cadastro de materiais

## Fase 3 - Diferencial visual

12. Surface3DViewer
13. Dados de superfície simulados
14. Camadas
15. Timeline da reconstrução
16. Comparação de leituras

## Fase 4 - Fluxos de demonstração

17. Histórico geral
18. Importação CSV/XLSX
19. Exportação CSV
20. Relatório para impressão/PDF
21. Diagnóstico
22. Validação
23. Painel `/demo`

## Fase 5 - Refinamento

24. Empty/loading/error states
25. Responsividade tablet
26. acessibilidade básica
27. microinterações
28. revisão de consistência visual

---

# 26. Sugestões técnicas para a implementação do protótipo

O PRD não obriga um framework específico. A implementação deve seguir o stack já escolhido pela equipe. Recomendações:

- TypeScript;
- biblioteca de componentes consistente ou componentes próprios com tokens;
- biblioteca de gráficos para série temporal;
- **Three.js** para a reconstrução 3D; se o projeto for React, `@react-three/fiber` pode simplificar integração;
- `IndexedDB` para dados locais mais ricos e importações;
- parser de CSV no cliente;
- parser XLSX apenas se necessário;
- geração de CSV no navegador;
- stylesheet de impressão para relatório PDF inicial.

A camada de mock deve se comportar de forma assíncrona, inclusive com pequeno delay configurável, para aproximar a arquitetura de uma futura API.

---

# 27. Fora do escopo deste protótipo

- backend real;
- autenticação real;
- banco de dados real;
- integração com sistema legado;
- integração com LiDAR físico;
- cálculo geométrico real de volume;
- calibração real;
- precisão metrológica;
- automação de equipamentos;
- decisão operacional automática;
- conversão de m³ para toneladas;
- densidade;
- previsão por IA;
- valor financeiro do estoque.

---

# 28. Decisões pendentes que não devem bloquear o front-end

Podem continuar como parâmetros/mock até validação:

- idade máxima para considerar leitura atual;
- tolerância volumétrica;
- capacidade geométrica útil em m³;
- tecnologia LiDAR definitiva;
- quantidade de sensores por box;
- regra definitiva para múltiplos materiais no mesmo box;
- campos exatos disponíveis no sistema legado;
- identidade visual final do BoxFlow.

O protótipo deve tornar esses pontos substituíveis sem refazer toda a interface.

---

# 29. Definition of Done do protótipo

O protótipo é considerado pronto para apresentação quando:

1. todas as rotas principais são navegáveis;
2. os 10 boxes possuem dados mock coerentes e estados variados;
3. cards, filtros e KPIs funcionam;
4. materiais podem ser cadastrados e associados a ciclos;
5. é possível demonstrar o ciclo completo até limpeza e liberação do box;
6. histórico mantém eventos e medições anteriores;
7. dados podem ser importados de um CSV de exemplo;
8. dados filtrados podem ser exportados;
9. a tela 3D é interativa e possui mais de uma reconstrução por box de demonstração;
10. comparação 3D/volumétrica funciona em pelo menos um box;
11. o painel de demonstração permite reproduzir cenários sem alterar código;
12. nenhum valor simulado é apresentado como medição real;
13. a interface distingue claramente estado operacional de estado da medição;
14. a apresentação funciona em desktop sem erros visuais graves.

---

# 30. Resultado esperado

Ao abrir o BoxFlow durante uma apresentação, uma pessoa que nunca viu o projeto deve conseguir entender visualmente que:

- existem 10 boxes monitorados;
- cada box possui um contexto operacional e, quando ocupado, um material associado;
- o sistema pretende medir volume automaticamente;
- a confiabilidade/idade da medição é mostrada junto com o número;
- o histórico permite entender o que mudou;
- a reconstrução 3D mostra a forma e distribuição do material dentro do box;
- o mesmo box pode ser comparado em diferentes momentos;
- ciclos de recebimento, armazenamento, retirada, limpeza e liberação ficam registrados;
- dados antigos podem ser incorporados e os resultados podem ser exportados.

Esse é o foco do protótipo: **fazer o usuário visualizar como o BoxFlow funcionaria no dia a dia antes da integração com o LiDAR e com os sistemas reais.**
