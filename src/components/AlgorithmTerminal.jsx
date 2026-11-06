import React from 'react';
import { Play, Pause, SkipForward, RotateCcw, Terminal, Cpu } from 'lucide-react';
import { sound } from '../audio/soundEffects';

export default function AlgorithmTerminal({
  activeMission,
  executionSteps = [],
  currentStepIndex,
  isPlaying,
  onTogglePlay,
  onNextStep,
  onReset,
  speed,
  onSpeedChange,
  algorithmInfo,
}) {
  const currentStep = executionSteps[currentStepIndex];

  return (
    <div className="w-full bg-[#121224] border-4 border-[#39395f] shadow-pixel-lg p-4 flex flex-col h-full font-retro">
      
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between border-b-2 border-[#39395f] pb-2 mb-3">
        <div className="flex items-center gap-2 text-[#00d2d3]">
          <Terminal className="w-4 h-4" />
          <span className="font-pixel text-[10px] tracking-wide uppercase">
            TERMINAL D&C // {algorithmInfo?.title || 'CONSOLE'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-[#1f1f38] text-[#2ed573] border border-[#2ed573] text-xs font-pixel text-[8px]">
            COMPLEXIDADE: {algorithmInfo?.complexity || 'O(n log n)'}
          </span>
        </div>
      </div>

      {/* Control Bar: Step, Play, Reset, Speed */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a0a14] p-2.5 border-2 border-[#282845] mb-3">
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

        {/* Speed Slider */}
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <span className="font-pixel text-[8px]">VELOCIDADE:</span>
          <input
            type="range"
            min="200"
            max="1600"
            step="100"
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="w-24 accent-[#00d2d3] cursor-pointer"
          />
          <span className="text-[#00d2d3] font-pixel text-[8px]">
            {((1800 - speed) / 100).toFixed(0)}x
          </span>
        </div>
      </div>

      {/* Step Counter Indicator */}
      <div className="flex items-center justify-between text-xs text-gray-400 mb-2 px-1">
        <div>
          ETAPA: <span className="text-[#f9ca24] font-pixel text-[9px]">{executionSteps.length > 0 ? currentStepIndex + 1 : 0}</span> / {executionSteps.length}
        </div>
        <div className="text-right">
          FASE: <span className="text-[#00d2d3] font-pixel text-[9px]">{currentStep?.type || 'AGUARDANDO CONJURAÇÃO'}</span>
        </div>
      </div>

      {/* Terminal Output Log Area */}
      <div className="flex-1 bg-[#07070f] border-2 border-[#1c1c30] p-3 overflow-y-auto max-h-[170px] space-y-2 text-sm">
        {executionSteps.length === 0 ? (
          <div className="text-gray-500 italic py-4 text-center">
            &gt; Pressione [ESPAÇO] no jogo ou clique em "CONJURAR ALGORITMO" para iniciar o processo de Dividir e Conquistar...
          </div>
        ) : (
          executionSteps.slice(0, currentStepIndex + 1).map((step, idx) => {
            const isLatest = idx === currentStepIndex;
            return (
              <div
                key={idx}
                className={`p-1.5 border-l-2 leading-relaxed transition-all ${
                  isLatest
                    ? 'border-[#00d2d3] bg-[#00d2d3]/10 text-white font-semibold'
                    : 'border-gray-700 text-gray-400'
                }`}
              >
                <span className="text-[#f9ca24] mr-2">[{step.type}]</span>
                <span>{step.message}</span>
              </div>
            );
          })
        )}
      </div>

      {/* D&C Strategy Summary Footer */}
      <div className="mt-3 pt-2 border-t border-[#23233c] grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-[#121829] p-1.5 border border-[#1e2a4a]">
          <div className="text-[#00d2d3] font-pixel text-[8px]">1. DIVIDIR</div>
          <div className="text-gray-300 text-[11px] truncate">{algorithmInfo?.divideDesc || 'Divide o problema em metades'}</div>
        </div>
        <div className="bg-[#1e1529] p-1.5 border border-[#3b1e4a]">
          <div className="text-[#f9ca24] font-pixel text-[8px]">2. CONQUISTAR</div>
          <div className="text-gray-300 text-[11px] truncate">{algorithmInfo?.conquerDesc || 'Resolve subproblemas recursivos'}</div>
        </div>
        <div className="bg-[#12241f] p-1.5 border border-[#1b4237]">
          <div className="text-[#2ed573] font-pixel text-[8px]">3. COMBINAR</div>
          <div className="text-gray-300 text-[11px] truncate">{algorithmInfo?.combineDesc || 'Merge das soluções parciais'}</div>
        </div>
      </div>

    </div>
  );
}
