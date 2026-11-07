import React, { useState, useEffect } from 'react';
import { Dices, PlusCircle, AlertTriangle, Crosshair, Sparkles, Sliders, Check } from 'lucide-react';
import { sound } from '../audio/soundEffects';

export default function MissionActionBar({
  activeMission,
  missionState,
  setMissionState,
  heroPosition,
  isExecuting,
  onReset,
}) {
  // Local state for custom user inputs
  const [customX, setCustomX] = useState(String(missionState.karatsubaX || 1234));
  const [customY, setCustomY] = useState(String(missionState.karatsubaY || 5678));
  const [customArrayText, setCustomArrayText] = useState((missionState.array || []).join(', '));
  const [customMonstersText, setCustomMonstersText] = useState(
    (missionState.monsters || []).map((m) => m.power).join(', ')
  );

  useEffect(() => {
    setCustomX(String(missionState.karatsubaX || 1234));
    setCustomY(String(missionState.karatsubaY || 5678));
  }, [missionState.karatsubaX, missionState.karatsubaY]);

  useEffect(() => {
    if (missionState.array) {
      setCustomArrayText(missionState.array.join(', '));
    }
  }, [missionState.array]);

  useEffect(() => {
    if (missionState.monsters) {
      setCustomMonstersText(missionState.monsters.map((m) => m.power).join(', '));
    }
  }, [missionState.monsters]);

  // Mission 1: Randomize projectiles, dense cluster, or place at hero position
  const handleRandomizePoints = (count = 8) => {
    sound.playClick();
    onReset();
    const newPoints = [];
    for (let i = 1; i <= count; i++) {
      newPoints.push({
        id: i,
        x: Math.round(50 + Math.random() * 640),
        y: Math.round(70 + Math.random() * 270),
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

  // Mission 2: Randomize or apply custom Karatsuba numbers
  const handleRandomizeKaratsuba = (digits = 4) => {
    sound.playClick();
    onReset();
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    const newX = Math.floor(min + Math.random() * (max - min + 1));
    const newY = Math.floor(min + Math.random() * (max - min + 1));
    setMissionState((prev) => ({
      ...prev,
      karatsubaX: newX,
      karatsubaY: newY,
      karatsubaProduct: null,
    }));
  };

  const handleApplyCustomKaratsuba = (e) => {
    e.preventDefault();
    sound.playPowerup();
    onReset();
    const cleanX = parseInt(customX.replace(/\D/g, ''), 10);
    const cleanY = parseInt(customY.replace(/\D/g, ''), 10);
    if (!isNaN(cleanX) && !isNaN(cleanY) && cleanX > 0 && cleanY > 0) {
      setMissionState((prev) => ({
        ...prev,
        karatsubaX: cleanX,
        karatsubaY: cleanY,
        karatsubaProduct: null,
      }));
    }
  };

  // Mission 3: Shuffle Runes, Worst Case Reverse, or Custom Array
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

  const handleApplyCustomArray = (e) => {
    e.preventDefault();
    sound.playPowerup();
    onReset();
    const parsed = customArrayText
      .split(/[\s,]+/)
      .map((v) => parseInt(v.trim(), 10))
      .filter((v) => !isNaN(v))
      .slice(0, 10);
    if (parsed.length >= 2) {
      setMissionState((prev) => ({
        ...prev,
        array: parsed,
        inversions: 0,
      }));
    }
  };

  // Mission 4: Randomize monsters, Worst Case 10 monsters, Custom powers, or change target K
  const handleRandomizeMonsters = (count = 7) => {
    sound.playClick();
    onReset();
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
      targetK: Math.min(prev.targetK, count),
      targetFound: null,
    }));
  };

  const handleWorstCaseMonsters = () => {
    sound.playLaser();
    onReset();
    // 10 monsters in descending order (2 full blocks of 5 for BFPRT vs worst-case pivot)
    const powers = [99, 88, 77, 66, 55, 44, 33, 22, 15, 7];
    const newMonsters = powers.map((p, idx) => ({
      id: idx + 1,
      power: p,
      eliminated: false,
    }));
    setMissionState((prev) => ({
      ...prev,
      monsters: newMonsters,
      targetK: 4,
      targetFound: null,
    }));
  };

  const handleApplyCustomMonsters = (e) => {
    e.preventDefault();
    sound.playPowerup();
    onReset();
    const powers = customMonstersText
      .split(/[\s,]+/)
      .map((v) => parseInt(v.trim(), 10))
      .filter((v) => !isNaN(v) && v > 0)
      .slice(0, 10);
    if (powers.length >= 3) {
      const newMonsters = powers.map((p, idx) => ({
        id: idx + 1,
        power: p,
        eliminated: false,
      }));
      setMissionState((prev) => ({
        ...prev,
        monsters: newMonsters,
        targetK: Math.min(prev.targetK, newMonsters.length),
        targetFound: null,
      }));
    }
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
    <div className="w-full max-w-[760px] bg-[#141424] border-2 border-[#39395f] p-2.5 mt-2 flex flex-col gap-2 text-xs font-pixel">
      
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-[8px] text-[#00d2d3] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>OPÇÕES E GERADORES DA ARENA:</span>
        </div>

        {/* Mission 1 Actions */}
        {activeMission === 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleRandomizePoints(8)}
              disabled={isExecuting}
              className="pixel-btn bg-[#1f1f38] text-gray-200 hover:text-white py-1 px-2 text-[8px] flex items-center gap-1.5"
            >
              <Dices className="w-3 h-3 text-[#f9ca24]" />
              <span>8 Projéteis</span>
            </button>
            <button
              onClick={() => handleRandomizePoints(14)}
              disabled={isExecuting}
              className="pixel-btn bg-[#2a1725] text-[#f9ca24] hover:text-white py-1 px-2 text-[8px] flex items-center gap-1.5 border-[#f9ca24]"
            >
              <Sparkles className="w-3 h-3 text-[#f9ca24]" />
              <span>Enxame (14 Alvos)</span>
            </button>
            <button
              onClick={handleAddPointAtHero}
              disabled={isExecuting}
              className="pixel-btn bg-[#1a2f2b] text-[#2ed573] hover:bg-[#25453e] py-1 px-2 text-[8px] flex items-center gap-1.5 border-[#2ed573]"
            >
              <PlusCircle className="w-3 h-3" />
              <span>Colocar no Herói</span>
            </button>
          </div>
        )}

        {/* Mission 2 Actions */}
        {activeMission === 2 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleRandomizeKaratsuba(4)}
              disabled={isExecuting}
              className="pixel-btn bg-[#1f1f38] text-gray-200 hover:text-white py-1 px-2 text-[8px] flex items-center gap-1.5"
            >
              <Dices className="w-3 h-3 text-[#f9ca24]" />
              <span>Aleatório (4 Dígitos)</span>
            </button>
            <button
              onClick={() => handleRandomizeKaratsuba(6)}
              disabled={isExecuting}
              className="pixel-btn bg-[#2a1e12] text-[#f9ca24] hover:bg-[#3d2e1b] py-1 px-2 text-[8px] flex items-center gap-1.5 border-[#f9ca24]"
            >
              <Sparkles className="w-3 h-3" />
              <span>Épico (6 Dígitos)</span>
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
              onClick={() => handleRandomizeMonsters(7)}
              disabled={isExecuting}
              className="pixel-btn bg-[#1f1f38] text-gray-200 hover:text-white py-1 px-2 text-[8px] flex items-center gap-1.5"
            >
              <Dices className="w-3 h-3 text-[#f9ca24]" />
              <span>7 Monstros</span>
            </button>
            <button
              onClick={handleWorstCaseMonsters}
              disabled={isExecuting}
              className="pixel-btn bg-[#33181f] text-[#ff4757] hover:bg-[#47222c] py-1 px-2 text-[8px] flex items-center gap-1.5 border-[#ff4757]"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Pior Caso (10 Alvos / 2 Blocos)</span>
            </button>

            <div className="flex items-center gap-1 bg-[#0a0a14] px-2 py-1 border border-[#39395f]">
              <Crosshair className="w-3 h-3 text-[#f9ca24]" />
              <span className="text-[7px] text-gray-400">ALVO K:</span>
              {Array.from({ length: missionState.monsters?.length || 7 }).map((_, idx) => {
                const k = idx + 1;
                return (
                  <button
                    key={k}
                    onClick={() => handleChangeTargetK(k)}
                    disabled={isExecuting}
                    className={`px-1 py-0.5 text-[7px] ${
                      missionState.targetK === k
                        ? 'bg-[#00d2d3] text-black font-bold'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {k}º
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Custom Input Row for Missions 2, 3, and 4 */}
      {activeMission === 2 && (
        <form
          onSubmit={handleApplyCustomKaratsuba}
          className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#262645] font-retro text-sm"
        >
          <div className="flex items-center gap-1.5 text-gray-300 font-pixel text-[8px]">
            <Sliders className="w-3 h-3 text-[#f9ca24]" />
            <span>ENTRADA CUSTOMIZADA:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1 text-gray-300">
              <span className="font-pixel text-[8px] text-[#f9ca24]">X:</span>
              <input
                type="text"
                maxLength={8}
                value={customX}
                onChange={(e) => setCustomX(e.target.value)}
                disabled={isExecuting}
                className="w-24 bg-[#0a0a14] border border-[#39395f] px-2 py-0.5 text-white font-retro text-sm focus:border-[#00d2d3] outline-none"
              />
            </label>
            <span className="text-[#f9ca24] font-pixel text-[8px]">×</span>
            <label className="flex items-center gap-1 text-gray-300">
              <span className="font-pixel text-[8px] text-[#f9ca24]">Y:</span>
              <input
                type="text"
                maxLength={8}
                value={customY}
                onChange={(e) => setCustomY(e.target.value)}
                disabled={isExecuting}
                className="w-24 bg-[#0a0a14] border border-[#39395f] px-2 py-0.5 text-white font-retro text-sm focus:border-[#00d2d3] outline-none"
              />
            </label>
            <button
              type="submit"
              disabled={isExecuting}
              className="pixel-btn bg-[#00d2d3] text-black py-1 px-2 text-[8px] flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              <span>APLICAR X × Y</span>
            </button>
          </div>
        </form>
      )}

      {activeMission === 3 && (
        <form
          onSubmit={handleApplyCustomArray}
          className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#262645] font-retro text-sm"
        >
          <div className="flex items-center gap-1.5 text-gray-300 font-pixel text-[8px]">
            <Sliders className="w-3 h-3 text-[#ff4757]" />
            <span>VETOR DE RUNAS (2 a 10 itens):</span>
          </div>
          <div className="flex flex-1 max-w-md items-center gap-2">
            <input
              type="text"
              value={customArrayText}
              onChange={(e) => setCustomArrayText(e.target.value)}
              disabled={isExecuting}
              placeholder="Ex: 8, 4, 2, 1, 9, 3, 7, 5"
              className="flex-1 bg-[#0a0a14] border border-[#39395f] px-2 py-0.5 text-white font-retro text-sm focus:border-[#00d2d3] outline-none"
            />
            <button
              type="submit"
              disabled={isExecuting}
              className="pixel-btn bg-[#00d2d3] text-black py-1 px-2 text-[8px] flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              <span>APLICAR</span>
            </button>
          </div>
        </form>
      )}

      {activeMission === 4 && (
        <form
          onSubmit={handleApplyCustomMonsters}
          className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#262645] font-retro text-sm"
        >
          <div className="flex items-center gap-1.5 text-gray-300 font-pixel text-[8px]">
            <Sliders className="w-3 h-3 text-[#2ed573]" />
            <span>PODERES DOS MONSTROS (3 a 10):</span>
          </div>
          <div className="flex flex-1 max-w-md items-center gap-2">
            <input
              type="text"
              value={customMonstersText}
              onChange={(e) => setCustomMonstersText(e.target.value)}
              disabled={isExecuting}
              placeholder="Ex: 12, 45, 23, 88, 34, 67, 5"
              className="flex-1 bg-[#0a0a14] border border-[#39395f] px-2 py-0.5 text-white font-retro text-sm focus:border-[#00d2d3] outline-none"
            />
            <button
              type="submit"
              disabled={isExecuting}
              className="pixel-btn bg-[#00d2d3] text-black py-1 px-2 text-[8px] flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              <span>APLICAR</span>
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
