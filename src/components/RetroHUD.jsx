import React from 'react';
import { Volume2, VolumeX, Shield, Zap, Sparkles, BookOpen } from 'lucide-react';
import { sound } from '../audio/soundEffects';

export default function RetroHUD({
  activeMission,
  setActiveMission,
  hp,
  maxHp,
  mana,
  maxMana,
  score,
  isMuted,
  onToggleMute,
  onOpenDoc,
}) {
  const missions = [
    { id: 1, name: '1. Par Mais Próximo', sub: 'O(n log n)', icon: '🎯' },
    { id: 2, name: '2. Ponte Skyline', sub: 'O(n log n)', icon: '🏰' },
    { id: 3, name: '3. Altar do Caos', sub: 'O(n log n)', icon: '✨' },
    { id: 4, name: '4. Sniper QuickSelect', sub: 'O(n)', icon: '🏹' },
  ];

  return (
    <header className="w-full bg-[#141424] border-b-4 border-[#39395f] p-3 shadow-pixel z-20">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Title & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#00d2d3] border-2 border-white flex items-center justify-center text-xl shadow-pixel-sm animate-pulse">
            ⚔️
          </div>
          <div>
            <h1 className="font-pixel text-xs sm:text-sm text-[#00d2d3] tracking-wider uppercase">
              Pixel Conquer
            </h1>
            <p className="font-retro text-base text-gray-400">
              Dividir & Conquistar RPG Lab
            </p>
          </div>
        </div>

        {/* Mission Selectors */}
        <nav className="flex flex-wrap items-center gap-2">
          {missions.map((m) => {
            const isActive = activeMission === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  sound.playClick();
                  setActiveMission(m.id);
                }}
                className={`pixel-btn flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#00d2d3] text-black border-white shadow-pixel-glow-cyan'
                    : 'bg-[#1f1f38] text-gray-300 hover:text-white border-[#39395f]'
                }`}
              >
                <span>{m.icon}</span>
                <div className="text-left">
                  <div className="font-pixel text-[9px]">{m.name}</div>
                  <div className="font-retro text-xs opacity-80">{m.sub}</div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Stats & Actions */}
        <div className="flex items-center gap-4">
          {/* HP Hearts */}
          <div className="flex items-center gap-1 bg-[#0d0d1a] px-3 py-1.5 border-2 border-[#39395f]">
            <span className="text-red-500 text-xs">♥</span>
            <div className="flex gap-0.5">
              {Array.from({ length: maxHp }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 ${
                    i < hp ? 'bg-red-500 shadow-sm' : 'bg-gray-700'
                  }`}
                  style={{ clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 50% 75%, 18% 100%, 0% 38%)' }}
                />
              ))}
            </div>
          </div>

          {/* Mana Bar */}
          <div className="flex items-center gap-1.5 bg-[#0d0d1a] px-3 py-1.5 border-2 border-[#39395f]">
            <Zap className="w-3.5 h-3.5 text-[#00d2d3]" />
            <div className="w-16 h-3 bg-gray-800 border border-black overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-[#00d2d3] transition-all duration-300"
                style={{ width: `${(mana / maxMana) * 100}%` }}
              />
            </div>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleMute();
              sound.playClick();
            }}
            title={isMuted ? 'Desmutar Som' : 'Mutar Som'}
            className="p-2 bg-[#1f1f38] border-2 border-[#39395f] text-gray-300 hover:text-white shadow-pixel-sm"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#2ed573]" />}
          </button>

          {/* Doc button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenDoc();
            }}
            title="Grimório dos Algoritmos"
            className="p-2 bg-[#241c12] border-2 border-[#f9ca24] text-[#f9ca24] hover:bg-[#3d2e1b] shadow-pixel-sm flex items-center gap-1"
          >
            <BookOpen className="w-4 h-4" />
            <span className="font-pixel text-[8px] hidden md:inline">TEORIA</span>
          </button>
        </div>

      </div>
    </header>
  );
}
