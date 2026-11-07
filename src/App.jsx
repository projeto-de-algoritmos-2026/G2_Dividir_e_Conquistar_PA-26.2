import React, { useState, useEffect, useCallback } from 'react';
import RetroHUD from './components/RetroHUD';
import GameCanvas from './components/GameCanvas';
import TacticalDashboard from './components/TacticalDashboard';
import MissionActionBar from './components/MissionActionBar';
import TheoryModal from './components/TheoryModal';
import { sound } from './audio/soundEffects';
import confetti from 'canvas-confetti';
import { solveClosestPairDC, solveClosestPairBruteForce } from './algorithms/closestPair';
import { solveKaratsubaDC, solveKaratsubaBruteForce } from './algorithms/karatsuba';
import { solveInversionsDC, solveInversionsBruteForce } from './algorithms/inversionCount';
import { solveMedianOfMediansDC, solveMedianBruteForce } from './algorithms/medianOfMedians';

export default function App() {
  const [activeMission, setActiveMission] = useState(1);
  const [hp, setHp] = useState(5);
  const [maxHp] = useState(5);
  const [mana, setMana] = useState(100);
  const [maxMana] = useState(100);
  const [score, setScore] = useState(0);
  const [heroPosition, setHeroPosition] = useState({ x: 400, y: 250 });
  const [isMuted, setIsMuted] = useState(false);
  const [isTheoryOpen, setIsTheoryOpen] = useState(false);

  // Execution state for D&C and Brute Force algorithms
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionSteps, setExecutionSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(600); // ms per step

  // Benchmark telemetry comparing D&C vs Brute Force O(n^2)
  const [benchmarkMetrics, setBenchmarkMetrics] = useState(null);

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

    // Mission 2: Cavaleiro - Karatsuba
    karatsubaX: 1234,
    karatsubaY: 5678,
    karatsubaProduct: null,

    // Mission 3: Inversions
    array: [8, 4, 2, 1, 9, 3, 7, 5],
    inversions: 0,

    // Mission 4: Median of Medians (BFPRT)
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

  // Restore HP and Mana with Potion
  const handleRestoreStats = useCallback(() => {
    setHp(maxHp);
    setMana(maxMana);
  }, [maxHp, maxMana]);

  // Apply completion effects for final step
  const applyStepCompletion = useCallback((step) => {
    if (!step || step.type !== 'COMPLETED') return;
    sound.playVictory();
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch {}

    const isBF = !!step.data?.isBruteForce;
    // Regenerate +10 mana on efficient D&C completion
    if (!isBF) {
      setMana((m) => Math.min(maxMana, m + 10));
    }

    if (activeMission === 1 && step.data) {
      setMissionState((prev) => ({
        ...prev,
        bestPair: step.data.finalPair,
        minDist: step.data.finalDist,
      }));
      setScore((s) => s + (isBF ? 150 : 500));
    } else if (activeMission === 2 && step.data) {
      setMissionState((prev) => ({
        ...prev,
        karatsubaProduct: step.data.finalProduct,
      }));
      setScore((s) => s + (isBF ? 200 : 850));
    } else if (activeMission === 3 && step.data) {
      setMissionState((prev) => ({
        ...prev,
        array: step.data.finalSorted,
        inversions: step.data.totalInversions,
      }));
      setScore((s) => s + (isBF ? 150 : step.data.totalInversions * 150 + 400));
    } else if (activeMission === 4 && step.data) {
      setMissionState((prev) => ({
        ...prev,
        monsters: step.data.monsters,
        targetFound: step.data.finalTarget,
      }));
      setScore((s) => s + (isBF ? 200 : 750));
    }
  }, [activeMission, maxMana]);

  // Trigger Divide & Conquer algorithm execution
  const handleTriggerAlgorithm = useCallback(() => {
    // D&C is mana-efficient: costs 15 MP
    setMana((m) => Math.max(0, m - 15));

    if (activeMission === 1) {
      sound.playLaser();
      const result = solveClosestPairDC(missionState.points);
      setExecutionSteps(result.steps);
      setBenchmarkMetrics({
        mode: 'DC',
        dcOps: result.operationsCount,
        bfOps: result.bruteForceOps,
        maxDepth: result.maxDepth,
        dcComplexity: 'O(n log n)',
      });
    } else if (activeMission === 2) {
      sound.playExplosion();
      const result = solveKaratsubaDC(missionState.karatsubaX, missionState.karatsubaY);
      setExecutionSteps(result.steps);
      setBenchmarkMetrics({
        mode: 'DC',
        dcOps: result.operationsCount,
        bfOps: result.gradeSchoolMults,
        maxDepth: result.maxDepth,
        dcComplexity: 'O(n^1.585)',
      });
    } else if (activeMission === 3) {
      sound.playLaser();
      const result = solveInversionsDC(missionState.array);
      setExecutionSteps(result.steps);
      setBenchmarkMetrics({
        mode: 'DC',
        dcOps: result.operationsCount,
        bfOps: result.bruteForceOps,
        maxDepth: result.maxDepth,
        dcComplexity: 'O(n log n)',
      });
    } else if (activeMission === 4) {
      sound.playLaser();
      const result = solveMedianOfMediansDC(missionState.monsters, missionState.targetK);
      setExecutionSteps(result.steps);
      setBenchmarkMetrics({
        mode: 'DC',
        dcOps: result.operationsCount,
        bfOps: result.bruteForceOps,
        maxDepth: result.maxDepth,
        dcComplexity: 'O(n) pior caso',
      });
    }

    setCurrentStepIndex(0);
    setIsPlaying(true);
    setIsExecuting(true);
  }, [
    activeMission,
    missionState.points,
    missionState.karatsubaX,
    missionState.karatsubaY,
    missionState.array,
    missionState.monsters,
    missionState.targetK,
  ]);

  // Trigger Brute Force O(n^2) comparison across all 4 missions
  const handleTriggerBruteForce = useCallback(() => {
    sound.playExplosion();
    // Quadratic complexity drains heavy Mana (35 MP) and causes -1 HP exhaustion
    setMana((m) => Math.max(0, m - 35));
    setHp((h) => Math.max(1, h - 1));

    if (activeMission === 1) {
      const dcRef = solveClosestPairDC(missionState.points);
      const result = solveClosestPairBruteForce(missionState.points);
      setExecutionSteps(result.steps);
      setBenchmarkMetrics({
        mode: 'BF',
        dcOps: dcRef.operationsCount,
        bfOps: result.operationsCount,
        maxDepth: dcRef.maxDepth,
        dcComplexity: 'O(n log n)',
      });
    } else if (activeMission === 2) {
      const dcRef = solveKaratsubaDC(missionState.karatsubaX, missionState.karatsubaY);
      const result = solveKaratsubaBruteForce(missionState.karatsubaX, missionState.karatsubaY);
      setExecutionSteps(result.steps);
      setBenchmarkMetrics({
        mode: 'BF',
        dcOps: dcRef.operationsCount,
        bfOps: dcRef.gradeSchoolMults,
        maxDepth: dcRef.maxDepth,
        dcComplexity: 'O(n^1.585)',
      });
    } else if (activeMission === 3) {
      const dcRef = solveInversionsDC(missionState.array);
      const result = solveInversionsBruteForce(missionState.array);
      setExecutionSteps(result.steps);
      setBenchmarkMetrics({
        mode: 'BF',
        dcOps: dcRef.operationsCount,
        bfOps: result.operationsCount,
        maxDepth: dcRef.maxDepth,
        dcComplexity: 'O(n log n)',
      });
    } else if (activeMission === 4) {
      const dcRef = solveMedianOfMediansDC(missionState.monsters, missionState.targetK);
      const result = solveMedianBruteForce(missionState.monsters, missionState.targetK);
      setExecutionSteps(result.steps);
      setBenchmarkMetrics({
        mode: 'BF',
        dcOps: dcRef.operationsCount,
        bfOps: result.operationsCount,
        maxDepth: dcRef.maxDepth,
        dcComplexity: 'O(n) pior caso',
      });
    }

    setCurrentStepIndex(0);
    setIsPlaying(true);
    setIsExecuting(true);
  }, [
    activeMission,
    missionState.points,
    missionState.karatsubaX,
    missionState.karatsubaY,
    missionState.array,
    missionState.monsters,
    missionState.targetK,
  ]);

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
            } else if (
              step?.type === 'STRIP_FOUND_BETTER' ||
              step?.type === 'BASE_CASE' ||
              step?.type === 'COMBINE_KARATSUBA'
            ) {
              sound.playPowerup();
            } else if (step?.type === 'COMPLETED') {
              applyStepCompletion(step);
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
  }, [isPlaying, currentStepIndex, executionSteps, speed, applyStepCompletion]);

  // Step backward manually
  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setIsPlaying(false);
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // Step forward manually
  const handleNextStep = () => {
    if (currentStepIndex < executionSteps.length - 1) {
      setCurrentStepIndex((prev) => {
        const next = prev + 1;
        const step = executionSteps[next];
        if (step?.type === 'COMPLETED') {
          applyStepCompletion(step);
          setIsExecuting(false);
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
    setBenchmarkMetrics(null);
    if (activeMission === 1) {
      setMissionState((prev) => ({
        ...prev,
        bestPair: null,
        minDist: null,
      }));
    } else if (activeMission === 2) {
      setMissionState((prev) => ({
        ...prev,
        karatsubaProduct: null,
      }));
    } else if (activeMission === 3) {
      setMissionState((prev) => ({
        ...prev,
        array: [8, 4, 2, 1, 9, 3, 7, 5],
        inversions: 0,
      }));
    } else if (activeMission === 4) {
      setMissionState((prev) => ({
        ...prev,
        monsters: prev.monsters.map((m) => ({ ...m, eliminated: false })),
        targetFound: null,
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
        onRestoreStats={handleRestoreStats}
      />

      {/* Main Game & Algorithm Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left / Top: Interactive Pixel Game Canvas */}
        <section className="lg:col-span-7 flex flex-col items-center">
          <GameCanvas
            activeMission={activeMission}
            setActiveMission={(mId) => {
              handleReset();
              setActiveMission(mId);
            }}
            onTriggerAlgorithm={handleTriggerAlgorithm}
            isExecuting={isExecuting}
            executionSteps={executionSteps}
            currentStepIndex={currentStepIndex}
            missionState={missionState}
            setMissionState={setMissionState}
            onHeroPositionChange={setHeroPosition}
          />
          <MissionActionBar
            activeMission={activeMission}
            missionState={missionState}
            setMissionState={setMissionState}
            heroPosition={heroPosition}
            isExecuting={isExecuting}
            onReset={handleReset}
          />
        </section>

        {/* Right / Bottom: Tactical RPG Dashboard with Hero, Benchmark & Step Controls */}
        <section className="lg:col-span-5 h-full">
          <TacticalDashboard
            activeHeroId={activeMission}
            onSelectHero={(id) => {
              handleReset();
              setActiveMission(id);
            }}
            onTriggerAlgorithm={handleTriggerAlgorithm}
            onTriggerBruteForce={handleTriggerBruteForce}
            isExecuting={isExecuting}
            executionSteps={executionSteps}
            currentStepIndex={currentStepIndex}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying((p) => !p)}
            onPrevStep={handlePrevStep}
            onNextStep={handleNextStep}
            onReset={handleReset}
            speed={speed}
            onSpeedChange={setSpeed}
            benchmarkMetrics={benchmarkMetrics}
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
