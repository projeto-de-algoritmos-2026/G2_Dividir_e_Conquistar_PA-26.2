import React, { useState } from 'react';
import { X, BookOpen, Cpu, Shield, Sparkles } from 'lucide-react';

export default function TheoryModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="pixel-box w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#141428] text-white">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-4 border-[#39395f] p-4 bg-[#1a1a36]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#f9ca24]" />
            <h2 className="font-pixel text-xs sm:text-sm text-[#f9ca24]">
              GRIMÓRIO DE DIVIDIR & CONQUISTAR
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#39395f] text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b-2 border-[#39395f] bg-[#0d0d1a] overflow-x-auto text-xs">
          {[
            { id: 'overview', label: 'Paradigma D&C' },
            { id: 'closest', label: '🧙 Mago (Closest Pair)' },
            { id: 'karatsuba', label: '⚔️ Cavaleiro (Karatsuba)' },
            { id: 'inversion', label: '🪓 Bárbaro (Inversões)' },
            { id: 'median', label: '🗡️ Assassino (Mediana das Medianas)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 font-pixel text-[9px] uppercase whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#1a1a36] text-[#00d2d3] border-b-2 border-[#00d2d3]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-4 font-retro text-lg leading-relaxed text-gray-200">
          
          {activeTab === 'overview' && (
            <div>
              <h3 className="font-pixel text-xs text-[#00d2d3] mb-2">O Que é Dividir e Conquistar?</h3>
              <p>
                O paradigma de <strong>Dividir e Conquistar (Divide and Conquer)</strong> resolve um problema quebrando-o recursivamente em subproblemas menores da mesma natureza, resolvendo-os de forma independente e depois combinando suas soluções para obter a resposta do problema original.
              </p>

              <div className="my-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-[#0f0f1b] p-3 border-2 border-[#00d2d3]">
                  <div className="font-pixel text-[9px] text-[#00d2d3] mb-1">1. DIVIDIR</div>
                  <p className="text-sm text-gray-300">Quebra a entrada em dois ou mais subproblemas de tamanho menor (geralmente n/2).</p>
                </div>
                <div className="bg-[#0f0f1b] p-3 border-2 border-[#f9ca24]">
                  <div className="font-pixel text-[9px] text-[#f9ca24] mb-1">2. CONQUISTAR</div>
                  <p className="text-sm text-gray-300">Resolve recursivamente os subproblemas. Se o tamanho for pequeno o suficiente, atinge o caso base.</p>
                </div>
                <div className="bg-[#0f0f1b] p-3 border-2 border-[#2ed573]">
                  <div className="font-pixel text-[9px] text-[#2ed573] mb-1">3. COMBINAR</div>
                  <p className="text-sm text-gray-300">Une as soluções parciais para compor a solução do problema global (etapa de Merge).</p>
                </div>
              </div>

              <div className="bg-[#1f1f38] p-3 border-l-4 border-[#f9ca24] text-sm">
                <span className="font-pixel text-[9px] text-[#f9ca24] block mb-1">TEOREMA MESTRE (MASTER THEOREM):</span>
                Muitos algoritmos D&C seguem a relação de recorrência:
                <br />
                <code className="text-[#00d2d3]">T(n) = 2T(n/2) + O(n) =&gt; Complexidade final: O(n log n)</code>
              </div>
            </div>
          )}

          {activeTab === 'closest' && (
            <div>
              <h3 className="font-pixel text-xs text-[#00d2d3] mb-2">Par de Pontos Mais Próximos (Closest Pair)</h3>
              <p>
                <strong>Problema:</strong> Dados $n$ pontos no plano 2D, encontrar os dois pontos com a menor distância euclidiana.
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-300 my-2">
                <li><strong>Força Bruta:</strong> Compara todos os pares possíveis $\binom{n}{2} = O(n^2)$. Para milhares de alvos, torna o jogo inviável.</li>
                <li><strong>Dividir e Conquistar:</strong> Ordena os pontos por X, traça uma linha vertical divisória, encontra a menor distância $\delta = \min(\delta_L, \delta_R)$, e verifica apenas os pontos que caem na faixa de largura $2\delta$ ao redor do meio ordenados por Y.</li>
                <li><strong>Garantia Geométrica:</strong> Na faixa central, cada ponto precisa ser comparado com no máximo <strong>7 vizinhos</strong>!</li>
                <li><strong>Complexidade:</strong> <span className="text-[#2ed573] font-bold">O(n log n)</span>.</li>
              </ul>
            </div>
          )}

          {activeTab === 'karatsuba' && (
            <div>
              <h3 className="font-pixel text-xs text-[#00d2d3] mb-2">Multiplicação Rápida de Karatsuba</h3>
              <p>
                <strong>Problema:</strong> Multiplicar dois números inteiros com $n$ dígitos. O método escolar tradicional realiza 4 multiplicações parciais por divisão, resultando em complexidade quadrática $O(n^2)$.
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-300 my-2">
                <li><strong>Dividir:</strong> Fatie os números $X$ e $Y$ em duas metades: $X = 10^m A + B$ e $Y = 10^m C + D$, onde $m = \lfloor n/2 \rfloor$.</li>
                <li><strong>Truque Algébrico de Gauss:</strong> O produto original seria 10^(2m) AC + 10^m(AD + BC) + BD (4 multiplicações). Karatsuba notou que o termo central pode ser reescrito com apenas 1 produto extra: (A+B)(C+D) - AC - BD!</li>
                <li><strong>Conquistar:</strong> Calcula recursivamente apenas 3 multiplicações: $z_0 = BD$, $z_2 = AC$, e $z_1 = (A+B)(C+D) - z_2 - z_0$.</li>
                <li><strong>Recorrência:</strong> T(n) = 3T(n/2) + O(n). Pelo Teorema Mestre, caso 1: O(n^log2(3)) ≈ O(n^1.585).</li>
              </ul>
            </div>
          )}

          {activeTab === 'inversion' && (
            <div>
              <h3 className="font-pixel text-xs text-[#00d2d3] mb-2">Contagem de Inversões (Inversion Count)</h3>
              <p>
                <strong>Problema:</strong> Medir quão fora de ordem um array está. Um par $(i, j)$ é uma inversão se $i &lt; j$ e $A[i] &gt; A[j]$.
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-300 my-2">
                <li>Utilizado em sistemas de recomendação de afinidade, algoritmos de ranking e motores de detecção de caos.</li>
                <li>Modifica o algoritmo de <strong>Merge Sort</strong>: ao fazer o merge das duas metades já ordenadas, se o elemento da metade direita for menor que o da metade esquerda, todos os elementos restantes na esquerda formam inversões com ele!</li>
                <li><strong>Complexidade:</strong> <span className="text-[#2ed573] font-bold">O(n log n)</span> (vs $O(n^2)$ de força bruta).</li>
              </ul>
            </div>
          )}

          {activeTab === 'median' && (
            <div>
              <h3 className="font-pixel text-xs text-[#00d2d3] mb-2">Mediana das Medianas (Algoritmo BFPRT)</h3>
              <p>
                <strong>Problema:</strong> Encontrar o $k$-ésimo menor elemento de um array em tempo linear estrito mesmo no <strong>pior caso</strong>.
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-300 my-2">
                <li>O QuickSelect comum tem caso médio $O(n)$, mas no pior caso (pivôs ruins) degrada para $O(n^2)$.</li>
                <li><strong>Dividir:</strong> Divide o array em blocos de 5 elementos. Ordena cada bloco (em tempo constante $O(1)$) e extrai sua mediana local.</li>
                <li><strong>Conquistar:</strong> Encontra recursivamente a <em>Mediana das Medianas</em> $M$. Esse elemento é garantidamente maior que pelo menos $30\%$ dos elementos e menor que pelo menos $30\%$, eliminando a possibilidade de partições degeneradas!</li>
                <li><strong>Recorrência:</strong> $T(n) \le T(n/5) + T(7n/10) + O(n)$. Como $1/5 + 7/10 = 9/10 &lt; 1$, a soma das séries geométricas converge para $\mathbf{O(n)}$ no pior caso!</li>
              </ul>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="border-t-2 border-[#39395f] p-3 bg-[#1a1a36] flex justify-end">
          <button
            onClick={onClose}
            className="pixel-btn bg-[#00d2d3] text-black font-pixel text-[9px]"
          >
            ENTENDIDO, VOLTAR AO JOGO
          </button>
        </div>

      </div>
    </div>
  );
}

