# Pixel Conquer: The Divide & Conquer Quest

**Número da Dupla / Grupo:** G2  
**Conteúdo da Disciplina:** Dividir e Conquistar (D&C)  
**Semestre:** 2026.2  

---

## 👥 Alunos

| Matrícula | Aluno |
| :---: | :--- |
| Preencher | Preencher |
| Preencher | Preencher |

---

## 🎮 Sobre o Projeto

**Pixel Conquer** é um jogo/laboratório interativo em **Pixel Art 2D retrô (16-bit)** desenvolvido com **React, JavaScript e Vite**. O usuário assume o controle de um mago herói que explora uma masmorra mística onde as mecânicas centrais de sobrevivência, combate e resolução de enigmas são impulsionadas diretamente por **4 algoritmos fundamentais de Dividir e Conquistar**.

Em vez de apenas ler sobre teoria de complexidade, o jogador movimenta o herói em tempo real pelo mapa, desvia de perigos e conjura magias algorítmicas, visualizando passo a passo como as chamadas recursivas dividem a arena, resolvem os subproblemas e combinam as soluções parciais.

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

### 2. A Ponte do Horizonte: Problema do Skyline (Skyline Problem)
* **Temática no Jogo:** O herói precisa cruzar um precipício intransponível repleto de pilares e torres em ruínas. A habilidade de alvenaria recursiva une os prédios e ergue uma ponte contínua que permite ao herói caminhar até o baú de tesouro 🏆.
* **Paradigma D&C:**
  * **Dividir:** Divide a lista de edifícios retangulares no formato $[L_i, H_i, R_i]$ em duas metades balanceadas.
  * **Conquistar:** Calcula recursivamente a silhueta da metade esquerda e da metade direita.
  * **Combinar (Merge):** Percorre as duas silhuetas simultaneamente mantendo a altura corrente de cada lado ($h_1$ e $h_2$). A altura visível resultante em cada coordenada é $\max(h_1, h_2)$, descartando sobreposições redundantes.
* **Complexidade:** $O(n \log n)$.
* **Recorrência:** $T(n) = 2T(n/2) + O(n) \Rightarrow O(n \log n)$.

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

### 4. Sniper da Mediana: QuickSelect (Seleção Linear de Ordem)
* **Temática no Jogo:** Uma tropa de monstros guarda os portões. O oráculo adverte que apenas o $k$-ésimo monstro mais forte carrega a chave do portal. O herói mira com seu arco e utiliza QuickSelect para descartar metades inteiras do exército sem precisar ordenar a tropa inteira!
* **Paradigma D&C com Poda (Prune and Search):**
  * **Dividir:** Escolhe um monstro pivô e particiona a tropa em monstros com poder menor/igual à esquerda e maiores à direita. O pivô assume sua posição definitiva $p$.
  * **Conquistar / Poda:**
    * Se $p = k - 1$, o alvo exato foi encontrado!
    * Se $k - 1 < p$, descarta todos os monstros à direita e recorre apenas no subarray esquerdo.
    * Se $k - 1 > p$, descarta todos os monstros à esquerda e recorre apenas no subarray direito.
* **Complexidade:** $O(n)$ no caso médio!

---

## 🕹️ Controles do Jogo

| Comando | Ação |
| :---: | :--- |
| `W, A, S, D` ou `Setas` | Movimentar o Herói pelo mapa da masmorra |
| `ESPAÇO` ou `E` | Conjurar Feitiço de Dividir e Conquistar |
| `D-Pad Virtual` | Movimentação clicável na tela (suporte a mouse e touch) |
| `🎲 Geradores` | Criar novos projéteis, torres, runas e monstros dinamicamente |
| `➕ Colocar no Herói` | Cria um projétil na posição exata onde o personagem estiver |
| `Controles do Terminal` | Pausar, avançar passo a passo e controlar velocidade da animação |

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
