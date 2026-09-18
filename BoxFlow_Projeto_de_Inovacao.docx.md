**PROJETO DE INOVAÇÃO**

**BOXFLOW: INVENTÁRIO VOLUMÉTRICO INTELIGENTE PARA BOXES DE FERTILIZANTES**

**1 RESUMO EXECUTIVO**

O BoxFlow mede o volume de fertilizante em cada box com sensores de distância e reconstrução tridimensional da superfície. Calcula ocupação e capacidade disponível, informa a confiabilidade de cada leitura e rejeita medições comprometidas sem apagar o último valor válido. Mantém histórico auditável e, quando os registros de movimentação permitirem, comparar a variação física do estoque com as entradas e saídas registradas.

**2 DESAFIO ESCOLHIDO**

**2.1 Qual desafio será abordado**

A proposta atende ao Desafio 3: automatizar a medição e o monitoramento do volume de carga armazenada dentro de cada box de fertilizantes, substituindo a estimativa visual e a contagem manual por uma medição física registrada.

O BoxFlow observa a superfície do material com sensores de distância, compara essa superfície com a geometria do box vazio e publica volume ocupado, capacidade disponível, percentual de ocupação, horário da leitura, cobertura da medição e confiabilidade do resultado. O histórico fica disponível por box.

**2.2 Por que ele é relevante**

O Itaqui lidera a entrada de fertilizantes pelo Arco Norte, corredor que em 2025 superou Paranaguá em volume importado. Só no primeiro semestre daquele ano o complexo movimentou cerca de 2 milhões de toneladas de fertilizantes, com alta de 39% sobre o mesmo período do ano anterior. O terminal de fertilizantes divulga 70 mil toneladas de armazenagem estática distribuídas em 10 baias, recebimento de até 1.250 t/h e expedição rodoviária de 700 t/h.

Esses números mudam a escala do problema. Na capacidade máxima divulgada de recebimento, o estoque em pátio varia cerca de 20 toneladas por minuto. Um inventário atualizado uma vez por turno já nasce defasado. E um erro relativo de 1% sobre a armazenagem estática do terminal equivale a 700 toneladas de produto que ninguém consegue confirmar com evidência.

A decisão que depende dessa informação é operacional e imediata: cabe mais um lote neste box, qual box liberar para o próximo navio, quando programar a retirada. Hoje ela é tomada com base em uma estimativa que não pode ser reproduzida nem auditada.

**3 CONTEXTO DO PROBLEMA**

**3.1 Situação atual**

O volume armazenado em cada box é avaliado por inspeção visual, por contagem manual de movimentações ou pela combinação das duas. A pilha é formada e retomada por pá-carregadeira, tem superfície irregular e muda de formato ao longo do turno. Não existe registro numérico da medição, apenas o resultado informado por quem olhou.

A operação, portanto, não sabe apenas "quanto tem". Também não sabe quando aquele número foi obtido, qual parte da pilha foi observada e se poeira, iluminação, oclusão por equipamento ou movimentação em curso comprometeram a avaliação.

**3.2 Principais impactos**

Os efeitos aparecem em toda a cadeia de decisão do pátio:

a) a capacidade disponível é planejada com margem de segurança informal, o que reduz o aproveitamento dos boxes;

b) o inventário fica defasado em relação às entradas e saídas, principalmente durante operações de navio;

c) não há histórico por box, o que impede comparar cenários, investigar diferenças ou auditar decisões;

d) uma leitura ruim tem a mesma aparência de uma leitura boa, de modo que uma estimativa incompleta pode ser tratada como precisa;

e) divergências entre o estoque físico e o registrado aparecem tarde, quando a evidência já se perdeu;

f) a equipe operacional gasta tempo em conferências que não deixam rastro reaproveitável.

**3.3 Evidências que sustentam o problema**

O próprio edital reconhece que não existe sistema automatizado de medição de volume nos boxes e que a avaliação é feita por inspeção visual ou contagem manual.

A escala do terminal amplifica o efeito. Com recebimento divulgado de até 1.250 t/h e expedição rodoviária de 700 t/h, a quantidade de produto que atravessa o pátio entre duas conferências é grande o bastante para invalidar a conferência anterior.

A natureza do material agrava o quadro. Fertilizantes absorvem umidade do ar, empedram e compactam ao longo do armazenamento, e a densidade aparente varia entre produtos, entre lotes e conforme a compactação. Uma estimativa visual convertida em toneladas acumula dois erros distintos: o do volume observado e o da densidade suposta. O BoxFlow trata esses dois erros separadamente, em vez de escondê-los em um único número.

**4 PÚBLICO-ALVO**

**4.1 Quem utilizará a solução**

O usuário direto é a equipe que decide sobre armazenagem e movimentação de fertilizantes no Complexo Portuário do Itaqui.

Quadro 1 \- Usuários diretos e decisões apoiadas

| Perfil | Decisão que o BoxFlow apoia |
| ----- | ----- |
| Operadores de pátio e armazenagem | Onde descarregar, quando repetir uma medição e por que uma leitura falhou |
| Supervisores operacionais | Sequência de recebimento, liberação de box e necessidade de inspeção presencial |
| Controle de estoque | Fechamento por box, evidência das divergências e histórico das medições |
| Planejamento e logística | Capacidade disponível para o próximo navio ou lote e previsão de ocupação |
| Gestão, manutenção e qualidade | Disponibilidade dos sensores, condição dos equipamentos e rastreabilidade das decisões |

Fonte: elaborado pelos autores (2026).

**4.2 Quem será beneficiado**

A administração portuária ganha visibilidade sobre a utilização real dos boxes. Operadores e empresas usuárias da infraestrutura ganham previsibilidade de capacidade e evidência documentada sobre o estoque que lhes pertence. Os donos da carga ganham rastreabilidade.

O projeto assume uma pendência de forma explícita: quem paga pela solução e quem a usa diariamente podem não ser a mesma pessoa. Definir isso faz parte do trabalho de aceleração, e a equipe planeja entrevistas com a linha de frente e com quem responde pela materialidade do estoque antes de fechar o desenho comercial.

**5 PROPOSTA DE SOLUÇÃO**

O BoxFlow transforma medições da superfície do fertilizante em um inventário rastreável. A arquitetura é organizada em camadas, para que a primeira entregue valor sem depender de integração externa e as seguintes acrescentem auditoria e reconciliação.

Quadro 2 \- Camadas da solução e condições de entrega

| Camada | O que entrega | Condição |
| ----- | ----- | ----- |
| Núcleo volumétrico | Sensor, superfície tridimensional, volume, capacidade, qualidade e histórico | Obrigatória, demonstrável no hackathon |
| Confiabilidade | Faixas de incerteza, estados de leitura, falha segura e trilha de auditoria | Demonstrável em bancada |
| Copiloto de IA | Consulta, compara e explica medições já validadas | Prioridade 1, não calcula volume |
| Balanço físico | Compara variação do estoque com entradas e saídas registradas | Depende da cadeia de dados do terminal |
| Multibox | Assinatura de transferência entre boxes e conservação de massa | Etapa de piloto |

Fonte: elaborado pelos autores (2026).

**5.1 Como funciona**

**Referência do box vazio.** As dimensões, o piso, as paredes e as regiões interditadas do box são cadastradas como geometria de referência.

**Posição do sensor.** A posição e a orientação de cada sensor são calibradas com alvos em locais conhecidos e ficam versionadas junto com o modelo e a versão do firmware.

**Aquisição.** O sensor coleta distâncias até a superfície do material, com registro da duração da varredura, da qualidade por região e do estado de movimento no box.

**Reconstrução da superfície.** As leituras viram nuvem de pontos, grade de alturas ou malha tridimensional no sistema de coordenadas do box.

**Cálculo volumétrico.** O sistema integra a diferença entre o piso de referência e a superfície observada, e produz volume ocupado, capacidade disponível, percentual de ocupação, altura da pilha por região e cobertura da medição.

**Controle de qualidade.** Antes de atualizar o inventário, a leitura passa por verificação de cobertura, ruído, oclusão, dados ausentes, consistência geométrica e tempo desde a última referência válida.

**Registro e sincronização.** O resultado é enviado à plataforma por API. Sem rede, o processamento acontece localmente e a sincronização ocorre depois, sem perda de leitura.

**5.2 Um número central e duas faixas**

O desafio pede um volume, então a interface entrega um número. Esse número nunca aparece sozinho.

Junto dele o sistema publica uma faixa estrutural admissível, construída apenas com a geometria do box, os raios válidos e os limites do instrumento, e uma faixa condicional, que acrescenta hipóteses declaradas sobre o material, como a continuidade da superfície nas regiões não observadas. A distância entre as duas faixas mostra quanto da conclusão vem de medição e quanto vem de suposição.

Na prática, o painel diz "estimativa de 42,1 m³, faixa admissível de 39,8 a 45,0 m³" em vez de "volume garantido". A diferença parece sutil e é o que separa um dado utilizável de um número bonito.

**5.3 Quatro estados e falha segura**

Quadro 3 \- Estados da leitura e resposta do sistema

| Estado | Quando ocorre | O que o sistema faz |
| ----- | ----- | ----- |
| Válida | Cobertura e consistência suficientes | Publica a nova medição e atualiza o histórico |
| Não conclusiva | Faixa larga demais para sustentar uma decisão | Preserva o último valor válido e mostra o fator limitante |
| Inválida | Movimento durante a varredura, oclusão extrema ou sensor degradado | Rejeita a leitura, registra o motivo e não imputa dados |
| Regime rompido | Mudança de posição, calibração ou máscara do sensor | Fecha a janela e exige nova medição de referência |

Fonte: elaborado pelos autores (2026).

Uma leitura comprometida não substitui o último valor confiável. O sistema mantém o valor anterior, sinaliza que ele está desatualizado e registra por que a nova leitura foi recusada. Ausência de alerta também nunca é apresentada como tranquilidade: a tela informa qual limite foi possível excluir naquela janela.

**5.4 Plataforma web**

A visão geral apresenta um cartão por box com produto, volume, capacidade disponível, ocupação, horário da última leitura válida e idade dessa leitura. O estado aparece em texto e em cor, sem depender apenas da diferença entre vermelho e verde.

A tela do box detalha a medição atual com as duas faixas e a cobertura, o mapa das regiões observadas e não observadas, o histórico versionado, as leituras rejeitadas com o respectivo motivo e as tendências de ocupação. A linguagem da interface é parte do produto.

Quadro 4 \- Diretrizes de linguagem da interface

| Evitar | Usar |
| ----- | ----- |
| "Tudo certo." | "Nenhuma divergência acima do limite acordado foi observada nesta janela." |
| "Volume garantido." | "Estimativa de 42,1 m³, faixa admissível de 39,8 a 45,0 m³." |
| "Sem dados." | "Não conclusivo: cobertura insuficiente, nova varredura necessária." |

Fonte: elaborado pelos autores (2026).

**5.5 Estimativa de massa e reconciliação com os registros**

Quando houver parâmetros validados de densidade aparente, o painel pode apresentar uma estimativa em toneladas como leitura secundária, sempre com a fonte, o produto, o lote, a data e a validade do parâmetro utilizado. Essa estimativa não é pesagem certificada, e o texto da tela diz isso.

A camada de balanço compara duas medições físicas válidas com as movimentações registradas entre elas. Se a variação observada não for compatível com o que os registros explicam, considerando a incerteza dos dois lados, o sistema abre um evento para investigação. A comparação usa a variação entre medições, e não o estoque absoluto, porque isso reduz a dependência de conhecer com exatidão o ponto de partida.

Dois cuidados de projeto sustentam essa camada. O primeiro é evitar circularidade: a densidade não pode ser recalibrada continuamente pelos mesmos registros que o sistema deveria auditar, sob pena de qualquer divergência ser absorvida pelo parâmetro. O segundo é a fronteira temporal: um ticket tem carimbo de hora, uma varredura tem início, fim e duração, e sob fluxo essa diferença carrega massa. O sistema declara esse termo em vez de ignorá-lo.

Essa camada depende de algo que ainda precisa ser confirmado no terminal: uma chave comum que ligue ticket, box, lote e horário. Se essa chave não existir, o núcleo volumétrico continua resolvendo o Desafio 3 e a promessa de balanço automático sai do escopo. A equipe prefere declarar isso agora a descobrir na entrega.

**5.6 Papel da inteligência artificial**

O cálculo do volume é geométrico e determinístico. A inteligência artificial entra depois da medição e da validação, como copiloto que consulta, compara e explica resultados já aprovados.

Quadro 5 \- Contrato de operação da inteligência artificial

| A IA pode | A IA não pode |
| ----- | ----- |
| Consultar medições, faixas e histórico por funções estruturadas | Preencher dado ausente ou alterar a nuvem de pontos |
| Explicar por que uma leitura foi rejeitada, citando as regras acionadas | Declarar furto, perda ou causa operacional sem evidência |
| Citar box, horário, versão da medição e origem da densidade | Inventar densidade, ticket, lote ou percentual de precisão |
| Recusar resposta quando o dado estiver ausente, inválido ou vencido | Transformar "sem alerta" em "está tudo certo" |

Fonte: elaborado pelos autores (2026).

Perguntas típicas: qual box tem capacidade para receber um lote de determinado tamanho, qual foi a última medição válida do Box 03, por que a leitura das 14h foi rejeitada. Cada resposta cita os identificadores das medições usadas, e cada interação fica registrada para auditoria.

**5.7 Diferenciais da proposta**

a) a arquitetura não depende de um modelo específico de sensor, pois o software recebe um contrato comum de dados e permite trocar a fonte de medição sem reescrever o produto;

b) cada leitura carrega qualidade explícita, o que separa o que foi medido do que foi suposto;

c) a falha é segura por projeto, de modo que uma leitura ruim nunca sobrescreve silenciosamente um valor bom;

d) o histórico é versionado, e mudança de calibração, de posição ou de algoritmo abre nova série com procedência, em vez de contaminar a comparação;

e) a inteligência artificial explica evidências em vez de produzir números, o que torna a resposta auditável;

f) a evolução para balanço físico está desenhada e condicionada aos dados reais, não vendida como pronta.

O que a proposta não afirma também conta. O BoxFlow não substitui pesagem sob controle metrológico legal, não entrega massa certificada e não apresenta percentual de precisão antes dos ensaios. Sistemas de medição volumétrica tridimensional para granéis já existem no mercado, e a equipe não reivindica ineditismo de sensoriamento. O que se propõe acrescentar é a transformação dessas medições em um inventário validado, com incerteza declarada e ligação rastreável com os registros operacionais.

**6 VIABILIDADE**

**6.1 Recursos necessários**

A construção do protótipo exige os seguintes recursos:

a) maquete representando pelo menos um box, com material granulado para simular o fertilizante;

b) sensor de distância ou fonte de dados tridimensionais, com estrutura de suporte e posicionamento ajustável;

c) recipientes de volume conhecido e balança digital para construir a verdade de referência dos ensaios;

d) notebook ou minicomputador para processamento local, API, banco de dados e plataforma web;

e) bibliotecas de processamento tridimensional e ferramentas de versionamento de código e de dados.

**6.2 Tecnologias utilizadas**

A escolha do sensoriamento permanece em aberto. Poderão ser avaliados sensores LiDAR, câmeras com sensor de profundidade, visão estéreo, sensores de tempo de voo com múltiplas zonas, perfilometria com linha laser, scanners tridimensionais ou combinações dessas tecnologias. A definição dependerá de testes de precisão, alcance, custo, integração e robustez no ambiente operacional, e a modalidade principal será congelada antes dos ensaios de confirmação.

Quadro 6 \- Modalidades de sensoriamento em avaliação

| Modalidade candidata | Vantagem na bancada | Risco a testar |
| ----- | ----- | ----- |
| Tempo de voo multizona | Custo baixo, integração simples e leitura rápida | Amostragem espacial limitada e agregação dentro de cada zona |
| Linha laser com câmera | Perfil mais denso e geometria controlável | Calibração entre câmera e laser, iluminação e movimento |
| Câmera de profundidade ou visão estéreo | Nuvem densa e ferramental maduro | Poeira, alcance, textura da superfície e iluminação |
| LiDAR ou scanner tridimensional | Alcance e robustez em ambiente industrial | Investimento, instalação, zonas cegas e segurança |

Fonte: elaborado pelos autores (2026).

No lado do software, a solução poderá utilizar Python, bibliotecas de visão computacional e de geometria computacional, API REST, banco de dados relacional, interface web responsiva, comunicação por WebSocket, contêineres e processamento em dispositivo de borda. A arquitetura é modular justamente para permitir a substituição da fonte de sensoriamento sem reescrever o núcleo.

Uma cautela técnica orienta o desenvolvimento: uma matriz de zonas não equivale automaticamente a uma grade de pontos independentes. Cada zona agrega o retorno de uma área angular, e a distribuição do material dentro dela influencia o valor lido. Por isso a validação mede o suporte espacial real, em vez de assumir a resolução nominal do fabricante.

**6.3 Validação**

A maquete produzirá cenários com volumes conhecidos e formatos de pilha distintos. O protocolo, a versão do algoritmo e os critérios de validade são congelados antes de olhar qualquer resultado.

Quadro 7 \- Cenas de ensaio e verdade de referência

| Cena | Construção | Verdade de referência |
| ----- | ----- | ----- |
| Box vazio | Sem material | Geometria aferida |
| Ocupação baixa | Recipientes de volume conhecido | Volume nominal aferido |
| Ocupação média irregular | Material granulado em formas repetíveis | Massa em balança e densidade medida à parte |
| Ocupação alta | Maior ocupação segura da maquete | Construção por incrementos conhecidos |
| Leitura comprometida | Obstrução, movimento ou sensor deslocado | Estado induzido conhecido |

Fonte: elaborado pelos autores (2026).

Cada execução registra volume estimado, faixas, cobertura, erro absoluto e relativo, repetibilidade entre leituras da mesma cena, tempo de aquisição e de processamento, decisão do controle de qualidade e motivo de eventual rejeição. Todas as cenas elegíveis e todas as repetições entram no relatório, inclusive as desfavoráveis. Nenhum percentual de precisão será apresentado como resultado antes da realização dos ensaios.

**6.4 Principais riscos**

Quadro 8 \- Riscos e respostas planejadas

| Risco | Resposta planejada |
| ----- | ----- |
| Poeira, iluminação ou reflexividade da superfície | Avaliar proteção, limpeza, posicionamento e troca de modalidade de sensoriamento |
| Oclusões e regiões não observadas | Reposicionar ou combinar sensores e rejeitar leituras com cobertura insuficiente |
| Alcance insuficiente para a dimensão real do box | Ajustar a escala do protótipo e selecionar outra fonte para o piloto |
| Degradação da leitura com o box cheio | Medir a curva de erro por faixa de ocupação e avaliar um segundo sensor |
| Instabilidade de rede | Processar na borda e sincronizar depois |
| Registro sem vínculo com box, lote e horário | Manter a volumetria e retirar a promessa de balanço automático |
| Densidade desatualizada tornando janelas não conclusivas | Ancorar a densidade em eventos controlados e declarar a idade do parâmetro |
| Escopo excessivo no hackathon | Congelar o núcleo e adiar integrações que ameacem a demonstração |

Fonte: elaborado pelos autores (2026).

**7 PLANO DE DESENVOLVIMENTO**

**7.1 O que será entregue no hackathon**

A entrega é organizada por prioridade, e a prioridade mais baixa nunca compete com a mais alta pelo tempo da equipe.

**Prioridade 0, não negociável.** Montar a maquete e cadastrar a geometria do box vazio. Capturar distâncias com o sensor e reconstruir a superfície. Estimar o volume e comparar com um volume conhecido. Calcular erro, cobertura e qualidade da leitura. Registrar os resultados por API e banco de dados. Exibir volume, capacidade disponível, histórico e alertas no painel. Demonstrar uma leitura válida e uma leitura comprometida, com preservação do último valor confiável.

**Prioridade 1\.** Copiloto de inteligência artificial respondendo perguntas sobre as medições já validadas, com citação dos identificadores usados e uma recusa correta quando o dado não existir.

**Prioridade 2\.** Simulação rotulada de ticket e da reconciliação por janela, apresentada como evolução condicionada aos dados do terminal e nunca como integração pronta.

A demonstração principal é simples de propósito: uma alteração física conhecida acontece na maquete, o sistema mede, declara a qualidade, atualiza o painel, e a inteligência artificial explica o resultado sem recalcular nada.

**7.2 O que será desenvolvido durante a aceleração**

**Visita técnica.** Levantar dimensões reais, estruturas, zonas cegas, poeira, vibração e rotas seguras de instalação. Verificar com que frequência existem períodos sem movimentação e quanto duram. Confirmar se registro de pesagem, box, lote e horário compartilham uma chave comum, com que resolução temporal e por qual via de acesso.

**Entrevistas.** Duas conversas curtas, uma com a linha de frente e outra com quem responde pela materialidade do estoque, para entender qual diferença já é considerada normal, quem investiga uma divergência hoje e o que mudaria se ela aparecesse mais cedo. A equipe considera esse o maior risco aberto do projeto, e ele não se resolve com mais engenharia.

**Metrologia.** Medir a curva de erro e de cobertura por faixa de ocupação, a repetibilidade em condições reais, a variação da densidade por produto e o efeito da fronteira temporal sob fluxo.

**Piloto.** Fase de sombra sem afetar a operação, com medição de disponibilidade e de taxa de conclusividade. Só depois disso os eventos passam a chegar para decisão assistida, com registro da ação tomada.

**Escala.** Comparar cobertura fixa por box, cobertura parcial nos boxes críticos e sensor compartilhado, decidindo por valor demonstrado e não por preferência técnica.

Cada fase tem critério de passagem definido: a modalidade mede a maquete com qualidade, a demonstração ponta a ponta é reprodutível, a linhagem dos dados sustenta janelas de comparação, a maioria das janelas úteis é conclusiva, o evento muda uma decisão real, e a cobertura industrial cabe no orçamento e nas regras de segurança do terminal.

**8 IMPACTO ESPERADO**

**8.1 Indicadores de sucesso**

Quadro 9 \- Indicadores de sucesso e forma de avaliação

| Indicador | Forma de avaliação |
| ----- | ----- |
| Erro volumétrico | Diferença entre volume estimado e volume conhecido, por cena e por faixa de ocupação |
| Repetibilidade | Dispersão entre leituras da mesma cena, sem ajuste entre repetições |
| Cobertura | Percentual da superfície relevante efetivamente observada |
| Tempo de atualização | Intervalo entre a captura e a exibição no painel, com aquisição e processamento separados |
| Disponibilidade | Proporção de leituras válidas por sensor, box e turno |
| Taxa de conclusividade | Janelas em que o sistema concluiu algo útil, sobre todas as janelas em que a decisão era necessária |
| Falha segura | Leituras comprometidas corretamente rejeitadas, com motivo registrado |
| Ação confirmada | Eventos que efetivamente mudaram uma decisão ou geraram investigação |

Fonte: elaborado pelos autores (2026).

A taxa de conclusividade protege o projeto de um auto engano comum. Um sistema parece excelente quando conta apenas as janelas fáceis. O denominador aqui inclui todas as oportunidades de decisão, inclusive aquelas em que o sistema não conseguiu responder.

**8.2 Benefícios esperados para o Complexo Portuário do Itaqui**

a) inventário atualizado por medição física, com redução da dependência de estimativa visual;

b) melhor aproveitamento dos boxes, porque a capacidade disponível deixa de exigir margem informal de segurança;

c) planejamento mais previsível de recebimento, descarga e retirada, com base em ocupação medida;

d) histórico auditável por box, útil para investigar diferenças e sustentar decisões perante terceiros;

e) identificação mais cedo de divergências entre estoque físico e registros, quando ainda é possível investigar;

f) menos tempo da equipe operacional gasto em conferência manual que não deixa rastro;

g) apoio à troca de produto no box, à identificação de material residual e à integração entre campo, sistemas e gestão.

**8.3 Escalabilidade**

A plataforma começa em um box e se expande para os demais, para outros terminais e para outros granéis. Como o núcleo do software não depende de um sensor específico, cada instalação pode usar a fonte de medição que couber em suas restrições de custo, alcance e segurança. A solução pode ser adaptada para grãos, biomassa, agregados, clínquer e minérios, sempre com calibração e validação próprias.

Com cobertura em mais de um box aparece uma capacidade que um box isolado não oferece: quando dois boxes apresentam diferenças de sinais opostos e magnitudes compatíveis na mesma janela, o sistema sinaliza compatibilidade com uma transferência interna não registrada. Isso é evidência para investigação, e o texto da tela diz exatamente isso, sem afirmar causa.

**9 EQUIPE**

A equipe reúne competências complementares nos eixos de Tecnologia, Design e Negócios.

Quadro 10 \- Composição da equipe, competências e papéis

| Integrante | Formação | Competências | Papel no BoxFlow |
| ----- | ----- | ----- | ----- |
| Rafael Silveira Soeiro | Acadêmico de Sistemas de Informação, IFMA | Backend, arquitetura, APIs, bancos de dados e integração | Líder da equipe e líder técnico. Coordena o desenvolvimento, a arquitetura e a integração dos componentes. |
| Rai Abreu Machado | Acadêmico do BICT, UFMA | Desenvolvimento de software, lógica, testes e integração | Apoia a implementação, o processamento dos dados, as integrações e os testes do protótipo. |
| Emylle Costa Oliveira | Acadêmica de Sistemas de Informação, IFMA; Bacharel em Arquitetura e Urbanismo, UEMA | UI/UX, prototipação, pesquisa com usuários, organização visual e comunicação | Responsável pela experiência do usuário, interface do painel, protótipos, fluxogramas e apresentação visual. |
| Pedro Gabriel Araujo Siqueira | Acadêmico do BICT, UFMA | Requisitos, processos, regras de negócio e proposta de valor | Analista de negócios. Traduz necessidades operacionais em requisitos e conduz a visita técnica e as entrevistas. |
| Suellen Evelyn Pontes dos Santos | Licenciada em Matemática, UFMA; acadêmica de Sistemas de Informação, IFMA | Análise quantitativa, indicadores, requisitos e avaliação de resultados | Analista de negócios. Responde pelo protocolo de ensaios, pelas métricas de incerteza e pela validação dos resultados. |

Fonte: elaborado pelos autores (2026).

O desenvolvimento tecnológico é conduzido por Rafael e Rai, o design por Emylle, e a frente de negócios por Pedro e Suellen. Algumas decisões têm dono definido para evitar disputa durante o evento: o congelamento do algoritmo cabe à liderança técnica, o congelamento do protocolo e das métricas cabe à análise quantitativa, as mensagens de qualidade na interface são decididas por design e tecnologia em conjunto, e o escopo entre as prioridades 0, 1 e 2 é decidido pelo líder da equipe.

A diversidade de formações sustenta as frentes exigidas: construir, comunicar e avaliar a viabilidade. A equipe também produz imagens explicativas, mockups, fluxogramas de processo e diagramas técnicos, o que facilita a comunicação da solução com avaliadores, operadores e gestores.

A experiência de execução é reforçada por resultados em competições de inovação. Os integrantes já conquistaram o 1º lugar no Hackathon do Mercado, organizado pela SEMISPE e pela Fábrica de Inovação do IFMA, e o 1º lugar no Hackathon MGEST, realizado pela Fundação Dom Cabral em parceria com o Grupo Mateus. Essas conquistas demonstram capacidade de trabalhar sob prazo curto, transformar desafio em protótipo e apresentar solução de forma objetiva.

**10 MATERIAL COMPLEMENTAR**

Acompanham a proposta, conforme disponibilidade e regras de submissão:

a) Vídeo de demonstração do mockup.  Disponível em: [acessar arquivo](https://drive.google.com/file/d/1vAxyBCiknt7-YdlcIXG52oeuZ-KYpgOH/view?usp=sharing);

b) Fluxograma do processo de medição, validação e atualização do inventário. Disponível em: [acessar arquivo](https://drive.google.com/file/d/1-rbYL9wdIzQAAeEVuA-QqAc-Aozl1Cvh/view);

c) Diagrama C4 da arquitetura. Disponível em: [acessar arquivo](https://drive.google.com/file/d/1KA295nZIxBmOxicbhaE6YZjXiThMohKB/view);

d) Imagens explicativas da solução e da maquete. Disponível em: [acessar arquivo](https://drive.google.com/file/d/1q9xKkzg8DhDBvpP6y9ZU_TPpQlUjJcYG/view).