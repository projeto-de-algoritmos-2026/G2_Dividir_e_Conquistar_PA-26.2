# G2_Dividir_e_Conquistar_PA-26.2

**Número da Lista**: 4<br>
**Conteúdo da Disciplina**: Dividir e Conquistar

## Alunos
| Matrícula | Aluno |
| -- | -- |
| 241025274 | João Eduardo de Souza Leles |
| 241032500 | Giovani de Oliveira Teodoro Coelho |

## Sobre
Este projeto é uma aplicação interativa (com temática de RPG tático em pixel art retrô 16-bit) focada na visualização e aplicação prática do paradigma de **Dividir e Conquistar (Divide and Conquer)**. O usuário atua comandando um esquadrão composto por 4 heróis clássicos de RPG (Mago, Cavaleiro, Bárbaro e Assassino) passando por fases de planejamento no **Dashboard Tático de Comando** e execução na **Arena de Combate**, onde as mecânicas centrais de sobrevivência, ataque e resolução de enigmas são impulsionadas diretamente por algoritmos clássicos de Dividir e Conquistar.

O objetivo principal é demonstrar como o paradigma quebra problemas complexos recursivamente em subproblemas menores, resolvendo-os de forma independente e combinando suas soluções com extrema eficiência (frequentemente reduzindo a complexidade de algoritmos quadráticos $O(n^2)$ para $O(n \log n)$ ou $O(n)$). O sistema inclui visualização gráfica em tempo real na arena de batalha, passo a passo interativo da recursão, benchmark comparativo direto contra abordagens de Força Bruta ($O(n^2)$) e telemetria de impacto em atributos de RPG (HP, Mana e Pontuação).

## Vídeo de apresentação
[Assistir ao Vídeo de Apresentação](https://drive.google.com/file/d/1MQkfMt_Aok0O8hdGEFca9xOLmKAAX6dA/view?usp=sharing)

## Instalação
**Linguagem**: JavaScript (ES6+)<br>
**Framework**: React 18 + Vite

**Pré-requisitos**:
- Node.js (versão 18+ recomendada)
- npm

Para rodar o projeto localmente, execute os seguintes comandos no terminal, estando no diretório raiz do projeto:

```bash
# Instale as dependências do projeto
npm install

# Inicie o servidor local de desenvolvimento
npm run dev
```

## Uso
1. Após iniciar o servidor, abra o navegador no endereço exibido no terminal (geralmente `http://localhost:5173`).
2. O sistema é dividido em duas áreas principais: **Arena de Combate** (à esquerda) e **Dashboard Tático de Comando** (à direita).
3. Na **Arena de Combate**, controle a movimentação do herói ativo utilizando `W, A, S, D` ou as `Setas` do teclado (ou o D-Pad virtual), explore o cenário, posicione novos alvos clicando diretamente na arena ou utilize a barra de ações para gerar novas instâncias e cenários de teste.
4. No **Dashboard Tático**, selecione qual personagem do esquadrão deseja ativar:
   - **🧙‍♂️ Mago Arcana**: Dispare a habilidade *Radar de Fissura* para detectar e neutralizar o **Par de Pontos Mais Próximos** antes que colidam na arena.
   - **⚔️ Cavaleiro Real**: Dispare o *Canhão de Cerco* aplicando a **Multiplicação Rápida de Karatsuba** para quebrar a muralha do Boss com valores gigantescos de dano.
   - **🪓 Bárbaro Feroz**: Golpeie o altar corrompido com a **Contagem de Inversões**, medindo o caos das runas elementais e desferindo dano crítico no Boss.
   - **🗡️ Assassino das Sombras**: Execute o golpe fatal com a **Mediana das Medianas (BFPRT)** para isolar o $k$-ésimo alvo de elite com tempo linear determinístico estrito.
5. Utilize os controles do **Terminal de Recursão** (`Auto Play`, `Passo`, `Reiniciar` e slider de velocidade) para inspecionar cada nível de divisão, caso base e merge da árvore recursiva.
6. Teste o botão de **Força Bruta $O(n^2)$** para comparar em tempo real a quantidade massiva de operações evitadas pelo algoritmo de Dividir e Conquistar.
7. A qualquer momento, clique no botão **TEORIA** no cabeçalho para abrir o Grimório e consultar as relações de recorrência, Teorema Mestre e pseudocódigo de cada algoritmo.

## Outros
**Decisões e Regras dos Algoritmos**:

- **Radar de Fissura (Par de Pontos Mais Próximos / Closest Pair of Points - $O(n \log n)$)**:
  - **Problema**: Detectar quais dois projéteis/orbes mágicos em voo estão mais próximos entre si na arena 2D.
  - **Estratégia D&C**: Pré-ordena os pontos pela coordenada X e divide o plano verticalmente por uma linha mediana $X_{mid}$. Conquista recursivamente a menor distância euclidiana nas metades esquerda ($\delta_L$) e direita ($\delta_R$), estabelecendo $\delta = \min(\delta_L, \delta_R)$. Na etapa de combinação, filtra os pontos situados na faixa central $[X_{mid} - \delta, X_{mid} + \delta]$, ordenando-os por Y e comparando cada ponto com no máximo 7 vizinhos geométricos subsequentes.
  - **Recorrência & Complexidade**: $T(n) = 2T(n/2) + O(n \log n) \Rightarrow O(n \log n)$, superando amplamente as $\binom{n}{2} = O(n^2)$ comparações da Força Bruta.

- **Canhão de Cerco (Multiplicação Rápida de Karatsuba - $O(n^{\log_2 3}) \approx O(n^{1.585})$)**:
  - **Problema**: Calcular o dano de cerco resultante da multiplicação de dois inteiros colossais com muitos dígitos para romper a muralha protegida do Boss.
  - **Estratégia D&C**: Fatia os números $X$ e $Y$ em metades de $m = \lfloor n/2 \rfloor$ dígitos: $X = 10^m A + B$ e $Y = 10^m C + D$. Em vez de computar 4 multiplicações parciais ($AC, AD, BC, BD$ como no método escolar quadrático), Karatsuba aplica o truque algébrico de Gauss para calcular apenas 3 multiplicações recursivas: $z_0 = BD$, $z_2 = AC$ e $z_1 = (A+B)(C+D) - z_2 - z_0$. Combina os termos através de deslocamentos de base: $Resultado = z_2 \cdot 10^{2m} + z_1 \cdot 10^m + z_0$.
  - **Recorrência & Complexidade**: $T(n) = 3T(n/2) + O(n) \Rightarrow O(n^{\log_2 3}) \approx O(n^{1.585})$, permitindo operações aritméticas velozes em números gigantescos.

- **O Altar das Runas (Contagem de Inversões com Merge Sort - $O(n \log n)$)**:
  - **Problema**: Medir o nível de entropia/caos de runas elementais no altar (onde pares fora de ordem $i < j$ com $A[i] > A[j]$ fortalecem a maldição do Boss).
  - **Estratégia D&C**: Baseia-se no algoritmo de ordenação Merge Sort. Divide o vetor de runas recursivamente em metades até atingir casos base unitários ($0$ inversões). Conquista contando as inversões internas à esquerda ($inv_L$) e à direita ($inv_R$). Durante a etapa de intercalação (*merge*), sempre que um elemento da metade direita for menor que o elemento da metade esquerda, adiciona-se $(tam\_esquerda - i)$ ao contador de inversões cruzadas, pois o elemento à direita é menor que todos os itens restantes na esquerda que já estavam ordenados.
  - **Recorrência & Complexidade**: $T(n) = 2T(n/2) + O(n) \Rightarrow O(n \log n)$, em contraste com o custo $O(n^2)$ de examinar todos os pares um a um.

- **Sniper da Mediana (Mediana das Medianas / Algoritmo BFPRT - $O(n)$ Pior Caso)**:
  - **Problema**: Isolar com precisão cirúrgica o monstro que detém o $k$-ésimo nível de poder no exército inimigo sem sofrer a degradação para $O(n^2)$ que o QuickSelect comum sofre em pivôs desbalanceados.
  - **Estratégia D&C**: Divide a tropa de monstros em blocos de exatamente 5 elementos. Ordena cada bloco individualmente em tempo constante $O(1)$ e extrai sua mediana local. Em seguida, chama a si mesmo recursivamente para encontrar a *Mediana das Medianas* ($M$). Utiliza $M$ como pivô perfeito para particionar o vetor original: essa escolha matemática garante que pelo menos 30% dos elementos são estritamente menores que $M$ e pelo menos 30% são estritamente maiores, assegurando uma poda de subproblema estrita. O algoritmo recorre unicamente no lado relevante contendo $k$.
  - **Recorrência & Complexidade**: $T(n) \le T(n/5) + T(7n/10) + O(n) \Rightarrow O(n)$ estrito no pior caso, constituindo um dos algoritmos de seleção determinísticos mais elegantes da ciência da computação.
