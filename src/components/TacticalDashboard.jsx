import React from 'react';
import { Play, Pause, SkipForward, RotateCcw, Terminal, Swords, Zap, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
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
  onNextStep,
  onReset,
  speed,
  onSpeedChange,
}) {
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
      desc: 'Divide a arena por coordenadas X e elimina o par crítico.',
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
      desc: 'Multiplicação de inteiros gigantes com 3 produtos recursivos em vez de 4.',
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
      desc: 'Purifica runas no altar e causa dano crítico ao Boss de Caos.',
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
      desc: 'Divide em blocos de 5 para obter pivô perfeito garantindo O(n) no pior caso.',
      accent: 'border-[#2ed573]',
      bgAccent: 'bg-[#2ed573]/15',
    },
  ];

  const currentHero = heroes.find((h) => h.id === activeHeroId) || heroes[0];
  const currentStep = executionSteps[currentStepIndex];

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

        {/* Primary D&C Attack Action */}
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
                <div className="font-retro text-xs opacity-90">{currentHero.complexity} [D&C]</div>
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
            title="Executar Força Bruta O(n²) para comparar o desempenho"
          >
            <div className="flex items-center justify-between text-gray-300">
              <span className="font-pixel text-[8px] text-[#ff4757] flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                TESTAR FORÇA BRUTA:
              </span>
              <span className="font-pixel text-[8px] bg-[#ff4757] text-white px-1 py-0.2">
                O(n²)
              </span>
            </div>
            <div className="text-[11px] text-gray-300 mt-1">
              Verifique todos os pares sequencialmente para comparar a quantidade massiva de operações.
            </div>
          </button>
        </div>
      </div>

      {/* 3. CRT Terminal & Step-by-Step Recursion Visualizer */}
      <div className="bg-[#07070f] border-2 border-[#1c1c30] p-3 flex-1 flex flex-col">
        
        {/* Playback Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#23233c] pb-2 mb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onTogglePlay();
              }}
              className={`pixel-btn py-1 px-2.5 text-[8px] flex items-center gap-1.5 ${
                isPlaying
                  ? 'bg-[#f9ca24] text-black border-yellow-200'
                  : 'bg-[#2ed573] text-black border-green-200'
              }`}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isPlaying ? 'PAUSAR' : 'AUTO PLAY'}</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onNextStep();
              }}
              disabled={isPlaying || currentStepIndex >= executionSteps.length - 1}
              className="pixel-btn bg-[#1f1f38] text-white hover:bg-[#2f2f55] border-[#39395f] py-1 px-2.5 text-[8px] flex items-center gap-1 disabled:opacity-40"
            >
              <SkipForward className="w-3 h-3" />
              <span>PASSO</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onReset();
              }}
              className="pixel-btn bg-[#2a1725] text-[#e94560] hover:bg-[#3d1f35] border-[#e94560] py-1 px-2.5 text-[8px] flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>REINICIAR</span>
            </button>
          </div>

          {/* Speed slider */}
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <span className="font-pixel text-[8px]">VELOCIDADE:</span>
            <input
              type="range"
              min="200"
              max="1600"
              step="100"
              value={speed}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
              className="w-20 accent-[#00d2d3] cursor-pointer"
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
        <div className="flex-1 overflow-y-auto max-h-[140px] space-y-1.5 text-xs text-gray-300 bg-[#040409] p-2 border border-[#171728]">
          {executionSteps.length === 0 ? (
            <div className="text-gray-500 italic py-3 text-center">
              &gt; Selecione o herói e dispare o ataque D&C com [ESPAÇO] ou pelo botão acima.
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

