import React from 'react';
import { Dices, PlusCircle, AlertTriangle, Crosshair, Sparkles } from 'lucide-react';
import { sound } from '../audio/soundEffects';

export default function MissionActionBar({
  activeMission,
  missionState,
  setMissionState,
  heroPosition,
  isExecuting,
  onReset,
}) {
  // Mission 1: Randomize projectiles or place at hero position
  const handleRandomizePoints = () => {
    sound.playClick();
    onReset();
    const count = 8;
    const newPoints = [];
    for (let i = 1; i <= count; i++) {
      newPoints.push({
        id: i,
        x: Math.round(50 + Math.random() * 640),
        y: Math.round(70 + Math.random() * 280),
      });
    }
    setMissionState((prev) => ({
      ...prev,
      points: newPoints,
      bestPair: null,
      minDist: null,
    }));
  };

  const handleAddPointAtHero = () => {
    sound.playPowerup();
    onReset();
    const newId = (missionState.points?.length || 0) + 1;
    const newPoint = {
      id: newId,
      x: Math.round(heroPosition.x),
      y: Math.round(heroPosition.y),
    };
    setMissionState((prev) => ({
      ...prev,
      points: [...(prev.points || []), newPoint],
      bestPair: null,
      minDist: null,
    }));
  };

  // Mission 2: Randomize buildings
  const handleRandomizeBuildings = () => {
    sound.playClick();
    onReset();
    const count = 5;
    const newBuildings = [];
    let curL = 50;
    for (let i = 0; i < count; i++) {
      const width = Math.round(90 + Math.random() * 90);
      const height = Math.round(110 + Math.random() * 150);
      const right = curL + width;
      newBuildings.push({ left: curL, height, right });
      curL += Math.round(width * 0.7); // overlap to test skyline merge
    }
    setMissionState((prev) => ({
      ...prev,
      buildings: newBuildings,
      skyline: [],
    }));
  };

  // Mission 3: Shuffle Runes or Worst Case Reverse
  const handleShuffleRunes = () => {
    sound.playClick();
    onReset();
    const shuffled = [1, 2, 3, 4, 5, 6, 7, 8].sort(() => Math.random() - 0.5);
    setMissionState((prev) => ({
      ...prev,
      array: shuffled,
      inversions: 0,
    }));
  };

  const handleWorstCaseRunes = () => {
    sound.playLaser();
    onReset();
    setMissionState((prev) => ({
      ...prev,
      array: [8, 7, 6, 5, 4, 3, 2, 1], // Maximum possible inversions = n*(n-1)/2 = 28
      inversions: 0,
    }));
  };

  // Mission 4: Randomize monsters or change target K
  const handleRandomizeMonsters = () => {
    sound.playClick();
    onReset();
    const count = 7;
    const newMonsters = [];
    for (let i = 1; i <= count; i++) {
      newMonsters.push({
        id: i,
        power: Math.round(5 + Math.random() * 94),
        eliminated: false,
      });
    }
    setMissionState((prev) => ({
      ...prev,
      monsters: newMonsters,
      targetFound: null,
    }));
  };

  const handleChangeTargetK = (k) => {
    sound.playClick();
    onReset();
    setMissionState((prev) => ({
      ...prev,
      targetK: k,
      targetFound: null,
    }));
  };

  return (
    <div className="w-full max-w-[760px] bg-[#141424] border-2 border-[#39395f] p-2.5 mt-2 flex flex-wrap items-center justify-between gap-2 text-xs font-pixel">
      
      <div className="text-[8px] text-[#00d2d3] flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5" />
        <span>OPÇÕES DA SALA:</span>
      </div>

      {/* Mission 1 Actions */}
      {activeMission === 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRandomizePoints}
            disabled={isExecuting}
            className="pixel-btn bg-[#1f1f38] text-gray-200 hover:text-white py-1 px-2 text-[8px] flex items-center gap-1.5"
          >
            <Dices className="w-3 h-3 text-[#f9ca24]" />
            <span>Gerar Novos Projéteis</span>
          </button>
          <button
            onClick={handleAddPointAtHero}
            disabled={isExecuting}
            className="pixel-btn bg-[#1a2f2b] text-[#2ed573] hover:bg-[#25453e] py-1 px-2 text-[8px] flex items-center gap-1.5 border-[#2ed573]"
          >
            <PlusCircle className="w-3 h-3" />
            <span>Colocar Projétil no Herói</span>
          </button>
        </div>
      )}

      {/* Mission 2 Actions */}
      {activeMission === 2 && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRandomizeBuildings}
            disabled={isExecuting}
            className="pixel-btn bg-[#1f1f38] text-gray-200 hover:text-white py-1 px-2 text-[8px] flex items-center gap-1.5"
          >
            <Dices className="w-3 h-3 text-[#f9ca24]" />
            <span>Gerar Novas Torres</span>
          </button>
        </div>
      )}

      {/* Mission 3 Actions */}
      {activeMission === 3 && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleShuffleRunes}
            disabled={isExecuting}
            className="pixel-btn bg-[#1f1f38] text-gray-200 hover:text-white py-1 px-2 text-[8px] flex items-center gap-1.5"
          >
            <Dices className="w-3 h-3 text-[#f9ca24]" />
            <span>Embaralhar Runas</span>
          </button>
          <button
            onClick={handleWorstCaseRunes}
            disabled={isExecuting}
            className="pixel-btn bg-[#33181f] text-[#ff4757] hover:bg-[#47222c] py-1 px-2 text-[8px] flex items-center gap-1.5 border-[#ff4757]"
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Pior Caso (Ordem Inversa)</span>
          </button>
        </div>
      )}

      {/* Mission 4 Actions */}
      {activeMission === 4 && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRandomizeMonsters}
            disabled={isExecuting}
            className="pixel-btn bg-[#1f1f38] text-gray-200 hover:text-white py-1 px-2 text-[8px] flex items-center gap-1.5"
          >
            <Dices className="w-3 h-3 text-[#f9ca24]" />
            <span>Novos Monstros</span>
          </button>
          
          <div className="flex items-center gap-1 bg-[#0a0a14] px-2 py-1 border border-[#39395f]">
            <Crosshair className="w-3 h-3 text-[#f9ca24]" />
            <span className="text-[7px] text-gray-400">BUSCAR K:</span>
            {[1, 3, 4, 7].map((k) => (
              <button
                key={k}
                onClick={() => handleChangeTargetK(k)}
                disabled={isExecuting}
                className={`px-1.5 py-0.5 text-[8px] ${
                  missionState.targetK === k
                    ? 'bg-[#00d2d3] text-black font-bold'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {k}º
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
