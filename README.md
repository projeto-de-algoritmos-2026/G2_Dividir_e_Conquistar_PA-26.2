# Pixel Conquer: The Divide & Conquer Quest

**Número da Dupla / Grupo:** G2  
**Conteúdo da Disciplina:** Dividir e Conquistar (D&C)  
**Semestre:** 2026.2  

---

## 👥 Alunos

| Matrícula | Aluno |
| :---: | :--- |
| 241025274 | João Eduardo de Souza Leles |
| Preencher | Giovani de Oliveira Teodoro Coelho |

---

## 🎮 Sobre o Projeto

**Pixel Conquer** é um RPG tático e laboratório de algoritmos interativo em **Pixel Art 2D retrô (16-bit)** desenvolvido com **React, JavaScript e Vite**. O usuário comanda um esquadrão composto por **4 classes de heróis clássicos de RPG** dentro de uma arena de batalha:

* 🧙‍♂️ **Mago Arcana** (Fase 1: Par de Pontos Mais Próximos - $O(n \log n)$)
* ⚔️ **Cavaleiro Real** (Fase 2: Multiplicação Rápida de Karatsuba - $O(n^{\log_2 3}) \approx O(n^{1.585})$)
* 🪓 **Bárbaro Feroz** (Fase 3: Contagem de Inversões / Altar do Caos - $O(n \log n)$)
* 🗡️ **Assassino das Sombras** (Fase 4: Mediana das Medianas / BFPRT - $O(n)$ pior caso)

A janela esquerda é a **Arena de Combate** onde todo o time se posiciona em formação tática e o herói selecionado é controlado em tempo real (`W, A, S, D` ou setas). A janela direita é o **Dashboard Tático de Comando**, onde o usuário escolhe qual membro do time vai agir, seleciona habilidades de Dividir e Conquistar vs Força Bruta ($O(n^2)$), e controla passo a passo o visualizador de recursão.

---

## ⚔️ As 4 Missões & Algoritmos Implementados

### 1. Radar de Fissura: Par de Pontos Mais Próximos (Closest Pair of Points)
* **Temática no Jogo:** Projéteis mágicos e orbes flutuam pela arena em rota de colisão. O herói canaliza o feitiço para detectar e destruir o par de projéteis mais perigosos antes que sobrecarreguem o escudo.
* **Paradigma D&C:**
  * **Dividir:** Pré-ordena os pontos por coordenada X e divide o plano verticalmente por uma linha de fissura central em metades esquerda e direita.
  * **Conquistar:** Calcula recursivamente a menor distância euclidiana nas metades esquerda ($\delta_L$) e direita ($\delta_R$), obtendo $\delta = \min(\delta_L, \delta_R)$.
  * **Combinar:** Filtra os pontos que caem na faixa vertical central $[X_{mid} - \delta, X_{mid} + \delta]$, ordena-os por Y e compara cada ponto com no máximo **7 vizinhos** subsequentes na faixa.
* **Complexidade:** $O(n \log n)$ contra $O(n^2)$ de força bruta.
* **Recorrência:** $T(n) = 2T(n/2) + O(n \log n) \Rightarrow O(n \log n)$.

---

### 2. Canhão de Cerco: Multiplicação de Karatsuba (Karatsuba Fast Multiplication)
* **Temática no Jogo:** Para quebrar o escudo de titânio da fortaleza do Boss, o Cavaleiro precisa multiplicar valores colossais de mana e dano de cerco. A multiplicação tradicional escolar realiza $n^2$ multiplicações elementares. Karatsuba utiliza Dividir e Conquistar para quebrar os números em metades e calcular o produto final com apenas 3 multiplicações recursivas.
* **Paradigma D&C:**
  * **Dividir:** Divide os números $X$ e $Y$ em metades: $X = 10^m A + B$ e $Y = 10^m C + D$, com $m = \lfloor n/2 \rfloor$.
  * **Conquistar:** Em vez de 4 multiplicações ($AC, AD, BC, BD$), calcula recursivamente apenas 3:
    1. $z_0 = B \times D$
    2. $z_2 = A \times C$
    3. $z_1 = (A + B) \times (C + D) - z_2 - z_0$ (Identidade de Gauss)
  * **Combinar:** Une os termos com deslocamento de base: $Resultado = z_2 \times 10^{2m} + z_1 \times 10^m + z_0$.
* **Complexidade:** $O(n^{\log_2 3}) \approx O(n^{1.585})$ contra $O(n^2)$ da multiplicação tradicional.
* **Recorrência:** $T(n) = 3T(n/2) + O(n) \Rightarrow O(n^{1.585})$.

---

### 3. O Altar das Runas: Contagem de Inversões (Inversion Counting com Merge Sort)
* **Temática no Jogo:** O Boss do Caos corrompeu o altar do reino desorganizando as runas sagradas. Quanto mais fora de ordem as runas estiverem, maior é o poder da maldição. O herói golpeia o altar, purifica as runas e causa dano crítico ao Boss proporcional ao número de inversões corrigidas!
* **Paradigma D&C:**
  * **Dividir:** Divide o array de runas na metade esquerda e metade direita.
  * **Conquistar:** Conta recursivamente as inversões contidas no lado esquerdo e no lado direito.
  * **Combinar:** Durante a etapa de intercalação (*merge*) com dois ponteiros $i$ e $j$, se $Direita[j] < Esquerda[i]$, então o elemento $Direita[j]$ é menor que **todos os elementos restantes** da metade esquerda. Incrementa o contador em $(tam\_esquerda - i)$ e alinha as runas.
* **Complexidade:** $O(n \log n)$ contra $O(n^2)$ de checagem ingênua.
* **Recorrência:** $T(n) = 2T(n/2) + O(n) \Rightarrow O(n \log n)$.

---

### 4. Sniper da Mediana: Mediana das Medianas (Algoritmo BFPRT)
* **Temática no Jogo:** Uma tropa de monstros guarda os portões. O Assassino precisa isolar cirurgicamente o $k$-ésimo alvo de elite. Para evitar os piores casos degenerados do QuickSelect ($O(n^2)$ com pivôs ruins), o Assassino aplica a Mediana das Medianas, garantindo tempo de execução linear estrito $O(n)$ mesmo no pior caso absoluto!
* **Paradigma D&C:**
  * **Dividir:** Divide o exército de monstros em blocos de 5 elementos. Ordena cada bloco em tempo constante $O(1)$ e extrai suas medianas locais.
  * **Conquistar:** Encontra recursivamente a *Mediana das Medianas* $M$. Este pivô garante que pelo menos $30\%$ dos elementos são estritamente menores e $30\%$ maiores.
  * **Partição e Poda:** Particiona o array ao redor de $M$ e descarta a metade irrelevante onde $k$ não se encontra.
* **Complexidade:** $O(n)$ estrito no pior caso!
* **Recorrência:** $T(n) \le T(n/5) + T(7n/10) + O(n) \Rightarrow O(n)$.

---

## 📊 Recursos Pedagógicos e Telemetria

* **Benchmark em Tempo Real (D&C vs Força Bruta $O(n^2)$):** Todas as 4 missões permitem disparar tanto o ataque ótimo de **Dividir e Conquistar** quanto a abordagem de **Força Bruta $O(n^2)$**, comparando o número exato de operações executadas, a porcentagem de economia computacional e a profundidade da árvore de recursão.
* **Sistema Dinâmico de RPG (HP, Mana e Score):** Algoritmos eficientes de Dividir e Conquistar preservam a Mana do esquadrão e concedem bônus de pontuação, enquanto algoritmos quadráticos $O(n^2)$ sobrecarregam a Mana e causam dano de exaustão ao HP (recuperável via Poção no HUD).
* **Editor de Entradas Customizadas e Pior Caso:** O usuário pode digitar números personalizados $X \times Y$ no Karatsuba, definir vetores de runas customizados na Contagem de Inversões, ou acionar cenários de pior caso na Mediana das Medianas (BFPRT).
* **Árvore de Recursão Visual e Navegação Bidirecional:** Visualização no Canvas da árvore de 3 ramos do Karatsuba ($z_2, z_1, z_0$), arcos de inversão, janelas de poda BFPRT e controles `ANT` / `PRÓX` no terminal CRT.

---

## 🕹️ Controles do Jogo

| Comando | Ação |
| :---: | :--- |
| `W, A, S, D` ou `Setas` | Movimentar o Herói pelo mapa da masmorra |
| `ESPAÇO` ou `E` | Conjurar Feitiço de Dividir e Conquistar |
| `Força Bruta O(n²)` | Executar algoritmo quadrático para comparar operações no painel de Benchmark |
| `D-Pad Virtual` | Movimentação clicável na tela (suporte a mouse e touch) |
| `🎲 Geradores & Inputs` | Gerar cenários aleatórios, pior caso ou digitar entradas customizadas |
| `➕ Colocar no Herói` | Cria um projétil na posição exata onde o personagem estiver |
| `PLAY / ANT / PRÓX` | Pausar, voltar ou avançar passo a passo na recursão e ajustar velocidade |

---

## 💻 Tecnologias Utilizadas

* **React 18** (Componentização, gerenciamento de estado e hooks reativos)
* **JavaScript (ES6+)**
* **Vite** (Build ultrarrápido e Hot Module Replacement)
* **HTML5 Canvas 2D API** (Renderização pixel art a 60 FPS com ciclo de animação do herói)
* **Tailwind CSS** (Estilização retrô 16-bit com relevos chanfrados e sombras pixeladas)
* **Web Audio API** (Sintetizador chiptune 8-bit próprio sem dependência de áudios externos)
* **Lucide Icons & Canvas Confetti**

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos:
* **Node.js** (versão 18+ ou superior recomendada)
* **npm** ou **yarn**

### Passo a passo:

1. Clone o repositório:
```bash
git clone https://github.com/Projeto-de-Algoritmos-2026-2/G2_Dividir_e_Conquistar_PA-26.2.git
cd G2_Dividir_e_Conquistar_PA-26.2
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse no seu navegador:
```
http://localhost:5173
```

Para gerar a versão otimizada de produção:
```bash
npm run build
npm run preview
```

---

## 📚 Grimório de Referências

* CORMEN, Thomas H. et al. *Algoritmos: teoria e prática*. 3. ed. Rio de Janeiro: Elsevier, 2012.
* KLEINBERG, Jon; TARDOS, Éva. *Algorithm Design*. Boston: Pearson / Addison-Wesley, 2006.
* ROUGHGARDEN, Tim. *Algorithms Illuminated: Part 1: The Basics*. Soundlikeyourself Publishing, 2017.
