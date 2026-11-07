import React, { useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Swords,
  Zap,
  ShieldAlert,
  BarChart3,
  GitBranch,
} from 'lucide-react';
import { sound } from '../audio/soundEffects';

export default function TacticalDashboard({
  activeHeroId,
  onSelectHero,
  onTriggerAlgorithm,
  onTriggerBruteForce,
  isExecuting,
  executionSteps = [],
  currentStepIndex,
  isPlaying,
  onTogglePlay,
  onPrevStep,
  onNextStep,
  onReset,
  speed,
  onSpeedChange,
  benchmarkMetrics,
}) {
  const logContainerRef = useRef(null);

  const heroes = [
    {
      id: 1,
      type: 'mage',
      name: 'Mago Arcana',
      title: 'Mestre do Espaço 2D',
      icon: '🧙‍♂️',
      hp: '80/80',
      mana: '120/120',
      algoName: 'Raio de Fissura',
      algoType: 'Par de Pontos Mais Próximos',
      complexity: 'O(n log n)',
      bruteDesc: 'Compara todos os n(n-1)/2 pares de projéteis em O(n²).',
      accent: 'border-[#00d2d3]',
      bgAccent: 'bg-[#00d2d3]/15',
    },
    {
      id: 2,
      type: 'knight',
      name: 'Cavaleiro Real',
      title: 'Canhão de Cerco Karatsuba',
      icon: '⚔️',
      hp: '150/150',
      mana: '50/50',
      algoName: 'Canhão Karatsuba',
      algoType: 'Multiplicação Rápida de Inteiros',
      complexity: 'O(n^1.585)',
      bruteDesc: 'Multiplicação escolar tradicional dígito a dígito em O(n²).',
      accent: 'border-[#f9ca24]',
      bgAccent: 'bg-[#f9ca24]/15',
    },
    {
      id: 3,
      type: 'barbarian',
      name: 'Bárbaro Feroz',
      title: 'Destruidor de Entropia',
      icon: '🪓',
      hp: '180/180',
      mana: '30/30',
      algoName: 'Fúria das Runas',
      algoType: 'Contagem de Inversões',
      complexity: 'O(n log n)',
      bruteDesc: 'Testa todos os pares (i, j) sequencialmente em O(n²).',
      accent: 'border-[#ff4757]',
      bgAccent: 'bg-[#ff4757]/15',
    },
    {
      id: 4,
      type: 'assassin',
      name: 'Assassino Sombrio',
      title: 'Mestre BFPRT',
      icon: '🗡️',
      hp: '90/90',
      mana: '80/80',
      algoName: 'Mediana das Medianas',
      algoType: 'Seleção Linear Determinística',
      complexity: 'O(n) pior caso',
      bruteDesc: 'Seleção quadrática sem poda BFPRT no pior caso O(n²).',
      accent: 'border-[#2ed573]',
      bgAccent: 'bg-[#2ed573]/15',
    },
  ];

  const currentHero = heroes.find((h) => h.id === activeHeroId) || heroes[0];
  const currentStep = executionSteps[currentStepIndex];

  // Auto-scroll CRT terminal log as steps advance
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [currentStepIndex]);

  // Calculate benchmark savings percentage
  const dcOps = benchmarkMetrics?.dcOps ?? 0;
  const bfOps = benchmarkMetrics?.bfOps ?? 0;
  const savingsPct =
    bfOps > 0 ? Math.max(0, Math.round(((bfOps - dcOps) / bfOps) * 100)) : 0;
  const currentDepth = currentStep?.data?.depth ?? 0;
  const maxDepth = benchmarkMetrics?.maxDepth ?? 0;

  return (
    <div className="w-full bg-[#121224] border-4 border-[#39395f] shadow-pixel-lg p-4 flex flex-col font-retro text-white">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-[#39395f] pb-2 mb-3">
        <div className="flex items-center gap-2 text-[#00d2d3]">
          <Swords className="w-5 h-5 text-[#f9ca24]" />
          <h2 className="font-pixel text-[11px] uppercase tracking-wider text-[#f9ca24]">
            DASHBOARD TÁTICO DO ESQUADRÃO
          </h2>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#1b1b36] border border-[#39395f] font-pixel text-[8px] text-[#2ed573]">
          <span className="w-2 h-2 rounded-full bg-[#2ed573] animate-ping" />
          ARENA PRONTA
        </div>
      </div>

      {/* 1. Hero Selector Cards */}
      <div className="mb-3">
        <div className="font-pixel text-[8px] text-gray-400 mb-1.5 flex items-center justify-between">
          <span>ESCOLHA O PERSONAGEM QUE VAI AGIR:</span>
          <span className="text-[#00d2d3] font-retro text-xs">Clique no herói para assumir o controle</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {heroes.map((hero) => {
            const isSelected = hero.id === activeHeroId;
            return (
              <button
                key={hero.id}
                onClick={() => {
                  sound.playClick();
                  onSelectHero(hero.id);
                }}
                className={`p-2 text-left border-2 transition-all relative overflow-hidden ${
                  isSelected
                    ? `${hero.accent} ${hero.bgAccent} shadow-pixel-sm scale-[1.02]`
                    : 'border-[#2a2a48] bg-[#0e0e1a] hover:border-gray-500 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl">{hero.icon}</span>
                    <div>
                      <div className="font-pixel text-[9px] font-bold text-white leading-tight">
                        {hero.name}
                      </div>
                      <div className="font-retro text-xs text-gray-400">
                        HP: {hero.hp} | MP: {hero.mana}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-[7px] font-pixel bg-[#00d2d3] text-black px-1 py-0.5 rounded-xs">
                      ATIVO
                    </span>
                  )}
                </div>

                <div className="font-retro text-xs text-[#f9ca24] truncate">
                  ⚡ {hero.algoName}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Attack Selection for Active Hero */}
      <div className="bg-[#0b0b17] border-2 border-[#2b2b4d] p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{currentHero.icon}</span>
            <div>
              <span className="font-pixel text-[10px] text-white uppercase block">
                {currentHero.name} - MENU DE ATAQUES
              </span>
              <span className="text-xs text-gray-400">
                {currentHero.title} • Especialidade: <strong className="text-[#00d2d3]">{currentHero.complexity}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Primary D&C Attack vs Brute Force Comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          <button
            onClick={() => {
              sound.playLaser();
              onTriggerAlgorithm();
            }}
            disabled={isExecuting}
            className={`pixel-btn py-2 px-3 text-[9px] flex items-center justify-between border-black shadow-pixel ${
              activeHeroId === 1
                ? 'bg-[#00d2d3] text-black hover:bg-[#34e7e4]'
                : activeHeroId === 2
                ? 'bg-[#f9ca24] text-black hover:bg-[#f6b93b]'
                : activeHeroId === 3
                ? 'bg-[#ff4757] text-white hover:bg-[#ff6b81]'
                : 'bg-[#2ed573] text-black hover:bg-[#55e68b]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 animate-bounce" />
              <div className="text-left">
                <div className="font-bold">{currentHero.algoName}</div>
                <div className="font-retro text-xs opacity-90">{currentHero.complexity} [D&C • -15 MP]</div>
              </div>
            </div>
            <span className="font-pixel text-[7px] bg-black/30 px-1 py-0.5 rounded">
              ESPAÇO
            </span>
          </button>

          {/* Interactive comparison attack: Brute Force */}
          <button
            onClick={() => {
              sound.playExplosion();
              if (onTriggerBruteForce) onTriggerBruteForce();
            }}
            disabled={isExecuting}
            className="p-2 bg-[#2a131b] hover:bg-[#3d1a27] border-2 border-[#e94560] text-left flex flex-col justify-between text-xs shadow-pixel-sm active:translate-y-0.5 cursor-pointer disabled:opacity-50"
            title="Executar Força Bruta O(n²) para comparar o desempenho (-35 MP, -1 HP)"
          >
            <div className="flex items-center justify-between text-gray-300">
              <span className="font-pixel text-[8px] text-[#ff4757] flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                FORÇA BRUTA:
              </span>
              <span className="font-pixel text-[7px] bg-[#ff4757] text-white px-1 py-0.5">
                O(n²) • -1 HP
              </span>
            </div>
            <div className="text-[11px] text-gray-300 mt-1 leading-tight">
              {currentHero.bruteDesc}
            </div>
          </button>
        </div>
      </div>

      {/* 3. Benchmark & Telemetry Panel (D&C vs Brute Force) */}
      <div className="bg-[#0d0d1d] border-2 border-[#2a2a4a] p-2.5 mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 font-pixel text-[8px] text-[#00d2d3]">
            <BarChart3 className="w-3.5 h-3.5 text-[#f9ca24]" />
            <span>BENCHMARK: D&C vs FORÇA BRUTA O(n²)</span>
          </div>
          <div className="flex items-center gap-1 font-pixel text-[7px] text-gray-400">
            <GitBranch className="w-3 h-3 text-[#2ed573]" />
            <span>
              ÁRVORE: NÍVEL {currentDepth}/{maxDepth || '-'}
            </span>
          </div>
        </div>

        {benchmarkMetrics ? (
          <div className="space-y-1.5">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#081b1e] border border-[#00d2d3]/50 p-1">
                <div className="font-pixel text-[7px] text-[#00d2d3]">OPERAÇÕES D&C</div>
                <div className="font-pixel text-xs text-white mt-0.5">{dcOps} ops</div>
                <div className="text-[10px] text-[#2ed573]">{benchmarkMetrics.dcComplexity}</div>
              </div>
              <div className="bg-[#241018] border border-[#ff4757]/50 p-1">
                <div className="font-pixel text-[7px] text-[#ff4757]">FORÇA BRUTA</div>
                <div className="font-pixel text-xs text-white mt-0.5">{bfOps} ops</div>
                <div className="text-[10px] text-[#ff4757]">O(n²)</div>
              </div>
              <div className="bg-[#182215] border border-[#2ed573]/50 p-1">
                <div className="font-pixel text-[7px] text-[#f9ca24]">ECONOMIA D&C</div>
                <div className="font-pixel text-xs text-[#2ed573] mt-0.5">
                  {savingsPct > 0 ? `-${savingsPct}%` : 'ÓTIMO'}
                </div>
                <div className="text-[10px] text-gray-300">
                  {benchmarkMetrics.mode === 'BF' ? 'Modo: O(n²)' : 'Modo: D&C'}
                </div>
              </div>
            </div>

            {/* Visual comparison bar */}
            <div className="w-full bg-[#1a1a2e] h-2 border border-[#39395f] overflow-hidden flex">
              <div
                className="bg-[#00d2d3] h-full transition-all duration-300"
                style={{
                  width: `${bfOps > 0 ? Math.min(100, Math.max(12, Math.round((dcOps / bfOps) * 100))) : 50}%`,
                }}
                title={`D&C: ${dcOps} operações`}
              />
              <div
                className="bg-[#ff4757]/70 h-full flex-1"
                title={`Excesso Força Bruta: ${Math.max(0, bfOps - dcOps)} operações extras`}
              />
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-400 text-center py-1">
            Execute um ataque <strong>D&C</strong> ou <strong>Força Bruta</strong> para comparar o número exato de operações e a profundidade da árvore.
          </div>
        )}
      </div>

      {/* 4. CRT Terminal & Step-by-Step Recursion Visualizer */}
      <div className="bg-[#07070f] border-2 border-[#1c1c30] p-3 flex-1 flex flex-col">
        
        {/* Playback Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#23233c] pb-2 mb-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                sound.playClick();
                onTogglePlay();
              }}
              disabled={executionSteps.length === 0}
              className={`pixel-btn py-1 px-2 text-[8px] flex items-center gap-1 disabled:opacity-40 ${
                isPlaying
                  ? 'bg-[#f9ca24] text-black border-yellow-200'
                  : 'bg-[#2ed573] text-black border-green-200'
              }`}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isPlaying ? 'PAUSAR' : 'PLAY'}</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                if (onPrevStep) onPrevStep();
              }}
              disabled={isPlaying || currentStepIndex <= 0}
              title="Voltar para o passo anterior da recursão"
              className="pixel-btn bg-[#1f1f38] text-white hover:bg-[#2f2f55] border-[#39395f] py-1 px-2 text-[8px] flex items-center gap-1 disabled:opacity-40"
            >
              <SkipBack className="w-3 h-3" />
              <span>ANT</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onNextStep();
              }}
              disabled={isPlaying || currentStepIndex >= executionSteps.length - 1}
              title="Avançar para o próximo passo da recursão"
              className="pixel-btn bg-[#1f1f38] text-white hover:bg-[#2f2f55] border-[#39395f] py-1 px-2 text-[8px] flex items-center gap-1 disabled:opacity-40"
            >
              <span>PRÓX</span>
              <SkipForward className="w-3 h-3" />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onReset();
              }}
              className="pixel-btn bg-[#2a1725] text-[#e94560] hover:bg-[#3d1f35] border-[#e94560] py-1 px-2 text-[8px] flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>RESET</span>
            </button>
          </div>

          {/* Speed slider */}
          <div className="flex items-center gap-1.5 text-xs text-gray-300">
            <span className="font-pixel text-[7px]">VEL:</span>
            <input
              type="range"
              min="200"
              max="1600"
              step="100"
              value={speed}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
              className="w-16 accent-[#00d2d3] cursor-pointer"
            />
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
          <div>
            PASSO: <span className="text-[#f9ca24] font-pixel text-[9px]">{executionSteps.length > 0 ? currentStepIndex + 1 : 0}</span> / {executionSteps.length}
          </div>
          <div>
            FASE: <span className="text-[#00d2d3] font-pixel text-[9px]">{currentStep?.type || 'PRONTO'}</span>
          </div>
        </div>

        {/* Log Box */}
        <div
          ref={logContainerRef}
          className="flex-1 overflow-y-auto max-h-[135px] space-y-1.5 text-xs text-gray-300 bg-[#040409] p-2 border border-[#171728]"
        >
          {executionSteps.length === 0 ? (
            <div className="text-gray-500 italic py-3 text-center">
              &gt; Selecione o herói e dispare o ataque D&C com [ESPAÇO] ou teste a Força Bruta O(n²).
            </div>
          ) : (
            executionSteps.slice(0, currentStepIndex + 1).map((step, idx) => {
              const isLatest = idx === currentStepIndex;
              return (
                <div
                  key={idx}
                  className={`p-1 border-l-2 leading-relaxed ${
                    isLatest
                      ? 'border-[#00d2d3] bg-[#00d2d3]/10 text-white font-semibold'
                      : 'border-gray-700 text-gray-400'
                  }`}
                >
                  <span className="text-[#f9ca24] mr-1.5">[{step.type}]</span>
                  <span>{step.message}</span>
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
}
