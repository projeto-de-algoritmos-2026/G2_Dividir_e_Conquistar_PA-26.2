import React, { useState, useEffect, useMemo } from 'react';
import { X, BookOpen, TrendingUp, Cpu, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { sound } from '../audio/soundEffects';

const LOG2_3 = Math.log2(3); // ~1.5849625

function formatOps(value) {
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)} bi`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)} mi`;
  if (value >= 1e3) return value.toLocaleString('pt-BR');
  return String(Math.round(value));
}

function formatCpuTime(ops) {
  // Assuming ~5 * 10^7 JavaScript operations per second in browser canvas loop
  const ms = (ops / 5e7) * 1000;
  if (ms < 0.01) return '< 0.01 ms';
  if (ms < 1000) return `${ms.toFixed(2)} ms`;
  const sec = ms / 1000;
  return `${sec.toFixed(2)} s`;
}

export default function TheoryModal({ isOpen, onClose, initialTab = 'overview' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [inputN, setInputN] = useState(1000);
  const [useLogScale, setUseLogScale] = useState(true);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Compute complexity metrics for current N
  const metrics = useMemo(() => {
    const n = Math.max(2, inputN);
    const opsLinear = Math.round(5 * n); // BFPRT ~ 5n worst-case constant factor
    const opsNLogN = Math.round(n * Math.log2(n));
    const opsKaratsuba = Math.round(Math.pow(n, LOG2_3));
    const opsQuadratic = Math.round(n * n);

    return [
      {
        id: 'bfprt',
        hero: '🗡️ Assassino (BFPRT)',
        formula: 'O(n)',
        recurrence: 'T(n) ≤ T(n/5) + T(7n/10) + O(n)',
        ops: opsLinear,
        color: '#2ed573',
        speedup: Math.max(1, opsQuadratic / opsLinear),
      },
      {
        id: 'nlogn',
        hero: '🧙‍♂️ Mago & 🪓 Bárbaro',
        formula: 'O(n log₂ n)',
        recurrence: 'T(n) = 2T(n/2) + O(n)',
        ops: opsNLogN,
        color: '#00d2d3',
        speedup: Math.max(1, opsQuadratic / opsNLogN),
      },
      {
        id: 'karatsuba',
        hero: '⚔️ Cavaleiro (Karatsuba)',
        formula: 'O(n^1.585)',
        recurrence: 'T(n) = 3T(n/2) + O(n)',
        ops: opsKaratsuba,
        color: '#f9ca24',
        speedup: Math.max(1, opsQuadratic / opsKaratsuba),
      },
      {
        id: 'quadratic',
        hero: '💀 Força Bruta',
        formula: 'O(n²)',
        recurrence: 'T(n) = 4T(n/2) + O(n) / Par a Par',
        ops: opsQuadratic,
        color: '#ff4757',
        speedup: 1,
      },
    ];
  }, [inputN]);

  // Generate SVG polyline points for the 4 complexity curves from n=2 to inputN
  const chartData = useMemo(() => {
    const width = 560;
    const height = 190;
    const padL = 48;
    const padR = 20;
    const padT = 18;
    const padB = 28;
    const plotW = width - padL - padR;
    const plotH = height - padT - padB;

    const samples = 40;
    const maxN = Math.max(10, inputN);
    const maxYLinear = maxN * maxN;
    const maxYLog = Math.log10(Math.max(10, maxYLinear));

    const mapY = (val) => {
      const safeVal = Math.max(1, val);
      const ratio = useLogScale
        ? Math.log10(safeVal) / maxYLog
        : safeVal / maxYLinear;
      return padT + plotH - Math.min(1, Math.max(0, ratio)) * plotH;
    };

    const curves = {
      linear: [],
      nlogn: [],
      karatsuba: [],
      quadratic: [],
    };

    for (let s = 0; s <= samples; s++) {
      const ratioX = s / samples;
      const curN = Math.max(2, Math.round(2 + ratioX * (maxN - 2)));
      const x = padL + ratioX * plotW;

      curves.linear.push(`${x.toFixed(1)},${mapY(5 * curN).toFixed(1)}`);
      curves.nlogn.push(`${x.toFixed(1)},${mapY(curN * Math.log2(curN)).toFixed(1)}`);
      curves.karatsuba.push(`${x.toFixed(1)},${mapY(Math.pow(curN, LOG2_3)).toFixed(1)}`);
      curves.quadratic.push(`${x.toFixed(1)},${mapY(curN * curN).toFixed(1)}`);
    }

    return {
      width,
      height,
      padL,
      padR,
      padT,
      padB,
      plotW,
      plotH,
      curves,
    };
  }, [inputN, useLogScale]);

  if (!isOpen) return null;

  const presets = [16, 100, 1000, 10000, 100000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="pixel-box w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#141428] text-white">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-4 border-[#39395f] p-4 bg-[#1a1a36]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#f9ca24]" />
            <h2 className="font-pixel text-xs sm:text-sm text-[#f9ca24]">
              GRIMÓRIO & SIMULADOR ASSINTÓTICO D&C
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
            { id: 'simulator', label: '📈 Simulador Assintótico' },
            { id: 'overview', label: 'Paradigma D&C' },
            { id: 'closest', label: '🧙 Mago (Closest Pair)' },
            { id: 'karatsuba', label: '⚔️ Cavaleiro (Karatsuba)' },
            { id: 'inversion', label: '🪓 Bárbaro (Inversões)' },
            { id: 'median', label: '🗡️ Assassino (BFPRT)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setActiveTab(tab.id);
              }}
              className={`px-3.5 py-2.5 font-pixel text-[8px] uppercase whitespace-nowrap transition-colors ${
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
          
          {activeTab === 'simulator' && (
            <div className="space-y-4">
              {/* Top Controls: N Selector & Scale Toggle */}
              <div className="bg-[#0c0c18] border-2 border-[#39395f] p-3 flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#00d2d3]" />
                    <span className="font-pixel text-[10px] text-[#00d2d3]">
                      ESCALA DE ENTRADA (N = {inputN.toLocaleString('pt-BR')} ELEMENTOS / DÍGITOS)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-pixel text-[7px] text-gray-400">EIXO Y:</span>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setUseLogScale(true);
                      }}
                      className={`px-2 py-1 font-pixel text-[7px] border ${
                        useLogScale
                          ? 'bg-[#00d2d3] text-black border-white'
                          : 'bg-[#1a1a30] text-gray-300 border-[#39395f]'
                      }`}
                    >
                      ESCALA LOG₁₀
                    </button>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setUseLogScale(false);
                      }}
                      className={`px-2 py-1 font-pixel text-[7px] border ${
                        !useLogScale
                          ? 'bg-[#f9ca24] text-black border-white'
                          : 'bg-[#1a1a30] text-gray-300 border-[#39395f]'
                      }`}
                    >
                      ESCALA LINEAR
                    </button>
                  </div>
                </div>

                {/* Preset Buttons + Logarithmic Slider */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-pixel text-[7px] text-gray-400 mr-1">PRESETS DE N:</span>
                    {presets.map((val) => (
                      <button
                        key={val}
                        onClick={() => {
                          sound.playClick();
                          setInputN(val);
                        }}
                        className={`px-2 py-1 font-pixel text-[8px] border transition-all ${
                          inputN === val
                            ? 'bg-[#f9ca24] text-black border-white shadow-pixel-sm'
                            : 'bg-[#16162b] text-gray-300 border-[#39395f] hover:text-white'
                        }`}
                      >
                        N = {val.toLocaleString('pt-BR')}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <span className="font-pixel text-[7px] text-[#00d2d3]">SLIDER:</span>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="0.05"
                      value={Math.log10(Math.max(10, inputN))}
                      onChange={(e) => {
                        const exp = parseFloat(e.target.value);
                        setInputN(Math.round(Math.pow(10, exp)));
                      }}
                      className="w-full accent-[#00d2d3] cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Interactive SVG Complexity Curves Chart */}
              <div className="bg-[#080811] border-2 border-[#2a2a4a] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
                  <span className="font-pixel text-[8px] text-gray-300">
                    CURVAS DE CRESCIMENTO ASSINTÓTICO (DE n = 2 ATÉ N = {inputN.toLocaleString('pt-BR')})
                  </span>
                  <div className="flex flex-wrap items-center gap-3 font-pixel text-[7px]">
                    <span className="flex items-center gap-1 text-[#2ed573]">
                      <span className="w-2.5 h-1 bg-[#2ed573] inline-block" /> O(n) BFPRT
                    </span>
                    <span className="flex items-center gap-1 text-[#00d2d3]">
                      <span className="w-2.5 h-1 bg-[#00d2d3] inline-block" /> O(n log n)
                    </span>
                    <span className="flex items-center gap-1 text-[#f9ca24]">
                      <span className="w-2.5 h-1 bg-[#f9ca24] inline-block" /> O(n^1.585)
                    </span>
                    <span className="flex items-center gap-1 text-[#ff4757]">
                      <span className="w-2.5 h-1 bg-[#ff4757] inline-block" /> O(n²) Força Bruta
                    </span>
                  </div>
                </div>

                <svg
                  viewBox={`0 0 ${chartData.width} ${chartData.height}`}
                  className="w-full h-auto bg-[#05050c] border border-[#1f1f38]"
                >
                  {/* Horizontal Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((g, idx) => {
                    const gy = chartData.padT + g * chartData.plotH;
                    return (
                      <g key={idx}>
                        <line
                          x1={chartData.padL}
                          y1={gy}
                          x2={chartData.width - chartData.padR}
                          y2={gy}
                          stroke="#1b1b32"
                          strokeDasharray="3,3"
                        />
                      </g>
                    );
                  })}

                  {/* Axes */}
                  <line
                    x1={chartData.padL}
                    y1={chartData.padT}
                    x2={chartData.padL}
                    y2={chartData.height - chartData.padB}
                    stroke="#4b4b7c"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={chartData.padL}
                    y1={chartData.height - chartData.padB}
                    x2={chartData.width - chartData.padR}
                    y2={chartData.height - chartData.padB}
                    stroke="#4b4b7c"
                    strokeWidth="1.5"
                  />

                  {/* Axis Labels */}
                  <text x={8} y={chartData.padT + 8} fill="#a4b0be" fontSize="8" fontFamily="monospace">
                    {useLogScale ? 'log(Ops)' : 'Ops'}
                  </text>
                  <text
                    x={chartData.padL}
                    y={chartData.height - 8}
                    fill="#a4b0be"
                    fontSize="8"
                    fontFamily="monospace"
                  >
                    n = 2
                  </text>
                  <text
                    x={chartData.width - chartData.padR - 65}
                    y={chartData.height - 8}
                    fill="#00d2d3"
                    fontSize="8"
                    fontFamily="monospace"
                  >
                    N = {inputN.toLocaleString('pt-BR')}
                  </text>

                  {/* 4 Complexity Polylines */}
                  <polyline
                    fill="none"
                    stroke="#ff4757"
                    strokeWidth="2.5"
                    points={chartData.curves.quadratic.join(' ')}
                  />
                  <polyline
                    fill="none"
                    stroke="#f9ca24"
                    strokeWidth="2.2"
                    points={chartData.curves.karatsuba.join(' ')}
                  />
                  <polyline
                    fill="none"
                    stroke="#00d2d3"
                    strokeWidth="2.2"
                    points={chartData.curves.nlogn.join(' ')}
                  />
                  <polyline
                    fill="none"
                    stroke="#2ed573"
                    strokeWidth="2.2"
                    points={chartData.curves.linear.join(' ')}
                  />
                </svg>
              </div>

              {/* Comparative Metrics Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {metrics.map((m) => {
                  const isLagging = m.ops > 8e5; // > ~16ms frame budget
                  return (
                    <div
                      key={m.id}
                      className="bg-[#0d0d1d] border-2 p-2.5 flex flex-col justify-between"
                      style={{ borderColor: m.color }}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-pixel text-[8px]" style={{ color: m.color }}>
                            {m.formula}
                          </span>
                          {m.id !== 'quadratic' ? (
                            <span className="font-pixel text-[7px] bg-[#2ed573]/20 text-[#2ed573] px-1 py-0.5">
                              {m.speedup >= 10
                                ? `${Math.round(m.speedup).toLocaleString('pt-BR')}x +RÁPIDO`
                                : `${m.speedup.toFixed(1)}x +RÁPIDO`}
                            </span>
                          ) : (
                            <span className="font-pixel text-[7px] bg-[#ff4757]/20 text-[#ff4757] px-1 py-0.5">
                              BASE O(n²)
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-white text-sm mt-1">{m.hero}</div>
                        <div className="text-xs text-gray-400 font-mono">{m.recurrence}</div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-[#252542] space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Operações:</span>
                          <span className="font-pixel text-[9px] text-white">{formatOps(m.ops)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Tempo CPU:</span>
                          <span
                            className={`font-pixel text-[8px] ${
                              isLagging ? 'text-[#ff4757]' : 'text-[#2ed573]'
                            }`}
                          >
                            {formatCpuTime(m.ops)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 pt-0.5 text-[11px]">
                          {isLagging ? (
                            <span className="text-[#ff4757] flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Queda de FPS (&gt;16ms)
                            </span>
                          ) : (
                            <span className="text-[#2ed573] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Fluido a 60 FPS
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
                <code className="text-[#00d2d3]">T(n) = aT(n/b) + f(n)</code>
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
