import React, { useState, useEffect, useRef, useCallback } from 'react';
import RetroHUD from './components/RetroHUD';
import GameCanvas from './components/GameCanvas';
import AlgorithmTerminal from './components/AlgorithmTerminal';
import TheoryModal from './components/TheoryModal';
import { sound } from './audio/soundEffects';
import confetti from 'canvas-confetti';
import { solveClosestPairDC } from './algorithms/closestPair';
import { solveSkylineDC } from './algorithms/skyline';

export default function App() {
  const [activeMission, setActiveMission] = useState(1);
  const [hp, setHp] = useState(5);
  const [maxHp] = useState(5);
  const [mana, setMana] = useState(100);
  const [maxMana] = useState(100);
  const [score, setScore] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isTheoryOpen, setIsTheoryOpen] = useState(false);

  // Execution state for D&C algorithms
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionSteps, setExecutionSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(600); // ms per step

  // Mission States
  const [missionState, setMissionState] = useState({
    // Mission 1: Closest Pair
    points: [
      { id: 1, x: 120, y: 150 },
      { id: 2, x: 200, y: 310 },
      { id: 3, x: 260, y: 180 },
      { id: 4, x: 380, y: 220 },
      { id: 5, x: 420, y: 235 }, // Close to #4!
      { id: 6, x: 520, y: 110 },
      { id: 7, x: 590, y: 290 },
      { id: 8, x: 670, y: 190 },
    ],
    bestPair: null,
    minDist: null,

    // Mission 2: Skyline (prep)
    buildings: [
      { left: 60, height: 160, right: 180 },
      { left: 140, height: 220, right: 280 },
      { left: 240, height: 120, right: 360 },
      { left: 400, height: 200, right: 540 },
      { left: 500, height: 140, right: 650 },
    ],
    skyline: [],

    // Mission 3: Inversions (prep)
    array: [8, 4, 2, 1],
    inversions: 0,

    // Mission 4: QuickSelect (prep)
    monsters: [
      { id: 1, power: 12, eliminated: false },
      { id: 2, power: 45, eliminated: false },
      { id: 3, power: 23, eliminated: false },
      { id: 4, power: 88, eliminated: false },
      { id: 5, power: 34, eliminated: false },
      { id: 6, power: 67, eliminated: false },
      { id: 7, power: 5, eliminated: false },
    ],
    targetK: 4,
    targetFound: null,
  });

  // Algorithm info for active mission
  const getAlgorithmInfo = () => {
    switch (activeMission) {
      case 1:
        return {
          title: 'PAR DE PONTOS MAIS PRÓXIMOS',
          complexity: 'O(n log n)',
          divideDesc: 'Traça linha de fissura e divide pontos por X',
          conquerDesc: 'Calcula δ_min nas metades esquerda e direita',
          combineDesc: 'Verifica faixa central de largura 2δ por Y',
        };
      case 2:
        return {
          title: 'PROBLEMA DO SKYLINE',
          complexity: 'O(n log n)',
          divideDesc: 'Divide a lista de edifícios em duas metades',
          conquerDesc: 'Calcula silhueta esquerda e silhueta direita',
          combineDesc: 'Merge das duas silhuetas com altura máxima',
        };
      case 3:
        return {
          title: 'CONTAGEM DE INVERSÕES',
          complexity: 'O(n log n)',
          divideDesc: 'Divide o array em duas metades',
          conquerDesc: 'Conta inversões internas no Merge Sort',
          combineDesc: 'Soma inversões cruzadas durante o merge',
        };
      case 4:
        return {
          title: 'SNIPER QUICKSELECT',
          complexity: 'O(n) médio',
          divideDesc: 'Particiona monstros com base em um pivô',
          conquerDesc: 'Descarta a metade sem o k-ésimo alvo',
          combineDesc: 'Isola o campeão sem ordenar toda a tropa',
        };
      default:
        return {};
    }
  };

  // Trigger algorithm execution
  const handleTriggerAlgorithm = useCallback(() => {
    if (activeMission === 1) {
      sound.playLaser();
      const result = solveClosestPairDC(missionState.points);
      setExecutionSteps(result.steps);
      setCurrentStepIndex(0);
      setIsPlaying(true);
      setIsExecuting(true);
    } else if (activeMission === 2) {
      sound.playPowerup();
      const result = solveSkylineDC(missionState.buildings);
      setExecutionSteps(result.steps);
      setCurrentStepIndex(0);
      setIsPlaying(true);
      setIsExecuting(true);
    }
  }, [activeMission, missionState.points, missionState.buildings]);

  // Handle auto-step playback timer
  useEffect(() => {
    let timer;
    if (isPlaying && executionSteps.length > 0) {
      if (currentStepIndex < executionSteps.length - 1) {
        timer = setTimeout(() => {
          setCurrentStepIndex((prev) => {
            const next = prev + 1;
            const step = executionSteps[next];
            if (step?.type === 'DIVIDE') {
              sound.playLaser();
            } else if (step?.type === 'STRIP_FOUND_BETTER' || step?.type === 'BASE_CASE' || step?.type === 'MERGE_SKYLINES') {
              sound.playPowerup();
            } else if (step?.type === 'COMPLETED') {
              sound.playVictory();
              try {
                confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
              } catch {}
              // Update state with results
              if (activeMission === 1 && step.data) {
                setMissionState((prev) => ({
                  ...prev,
                  bestPair: step.data.finalPair,
                  minDist: step.data.finalDist,
                }));
                setScore((s) => s + 500);
              } else if (activeMission === 2 && step.data) {
                setMissionState((prev) => ({
                  ...prev,
                  skyline: step.data.finalSkyline,
                }));
                setScore((s) => s + 600);
              }
            }
            return next;
          });
        }, speed);
      } else {
        setIsPlaying(false);
        setIsExecuting(false);
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, executionSteps, speed, activeMission]);

  // Step forward manually
  const handleNextStep = () => {
    if (currentStepIndex < executionSteps.length - 1) {
      setCurrentStepIndex((prev) => {
        const next = prev + 1;
        const step = executionSteps[next];
        if (step?.type === 'COMPLETED') {
          sound.playVictory();
          try {
            confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
          } catch {}
          if (activeMission === 1 && step.data) {
            setMissionState((s) => ({
              ...s,
              bestPair: step.data.finalPair,
              minDist: step.data.finalDist,
            }));
            setScore((sc) => sc + 500);
          } else if (activeMission === 2 && step.data) {
            setMissionState((s) => ({
              ...s,
              skyline: step.data.finalSkyline,
            }));
            setScore((sc) => sc + 600);
          }
        }
        return next;
      });
    }
  };

  // Reset steps
  const handleReset = () => {
    setIsPlaying(false);
    setIsExecuting(false);
    setCurrentStepIndex(-1);
    setExecutionSteps([]);
    if (activeMission === 1) {
      setMissionState((prev) => ({
        ...prev,
        bestPair: null,
        minDist: null,
      }));
    } else if (activeMission === 2) {
      setMissionState((prev) => ({
        ...prev,
        skyline: [],
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white flex flex-col justify-between selection:bg-[#00d2d3] selection:text-black">
      
      {/* Top Retro HUD Navigation */}
      <RetroHUD
        activeMission={activeMission}
        setActiveMission={(mId) => {
          handleReset();
          setActiveMission(mId);
        }}
        hp={hp}
        maxHp={maxHp}
        mana={mana}
        maxMana={maxMana}
        score={score}
        isMuted={isMuted}
        onToggleMute={() => {
          const muted = sound.toggleMute();
          setIsMuted(muted);
        }}
        onOpenDoc={() => setIsTheoryOpen(true)}
      />

      {/* Main Game & Algorithm Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left / Top: Interactive Pixel Game Canvas */}
        <section className="lg:col-span-7 flex flex-col items-center">
          <GameCanvas
            activeMission={activeMission}
            onTriggerAlgorithm={handleTriggerAlgorithm}
            isExecuting={isExecuting}
            executionSteps={executionSteps}
            currentStepIndex={currentStepIndex}
            missionState={missionState}
            setMissionState={setMissionState}
          />
        </section>

        {/* Right / Bottom: CRT Terminal with D&C Recursion Steps */}
        <section className="lg:col-span-5 h-full">
          <AlgorithmTerminal
            activeMission={activeMission}
            executionSteps={executionSteps}
            currentStepIndex={currentStepIndex}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying((p) => !p)}
            onNextStep={handleNextStep}
            onReset={handleReset}
            speed={speed}
            onSpeedChange={setSpeed}
            algorithmInfo={getAlgorithmInfo()}
          />
        </section>

      </main>

      {/* Footer Info */}
      <footer className="w-full bg-[#0d0d1a] border-t-2 border-[#23233c] py-2 px-4 text-center font-retro text-sm text-gray-500">
        PROJETO DE ALGORITMOS 2026.2 • MÓDULO: DIVIDIR E CONQUISTAR • REACT + VITE + CANVAS PIXEL ART
      </footer>

      {/* Theory & Documentation Modal */}
      <TheoryModal
        isOpen={isTheoryOpen}
        onClose={() => setIsTheoryOpen(false)}
      />

    </div>
  );
}
