import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronsLeft,
  ChevronsRight,
  Gauge,
} from 'lucide-react';

const SPEEDS = [0.5, 1, 2, 4];

export const ReplayControls: React.FC = () => {
  const {
    moves,
    currentMoveIndex,
    jumpToMove,
    replaySpeed,
    setReplaySpeed,
    isReplayMode,
    setReplayMode,
  } = useGameStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<number | null>(null);

  const stopPlayback = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
  };

  const startPlayback = () => {
    if (currentMoveIndex >= moves.length - 1) {
      jumpToMove(-1);
    }
    setIsPlaying(true);
  };

  useEffect(() => {
    if (!isPlaying) return;
    if (currentMoveIndex >= moves.length - 1) {
      stopPlayback();
      return;
    }
    timerRef.current = window.setInterval(() => {
      const state = useGameStore.getState();
      if (state.currentMoveIndex >= state.moves.length - 1) {
        stopPlayback();
        return;
      }
      jumpToMove(state.currentMoveIndex + 1);
    }, 1200 / replaySpeed);

    return () => stopPlayback();
  }, [isPlaying, replaySpeed, moves.length]);

  useEffect(() => {
    return () => stopPlayback();
  }, []);

  if (!isReplayMode) return null;

  const totalMoves = moves.length;
  const progress = totalMoves === 0 ? 0 : ((currentMoveIndex + 1) / totalMoves) * 100;

  return (
    <div className="bg-gradient-to-r from-stone-800 via-stone-700 to-stone-800 rounded-lg shadow-lg p-4 text-amber-50">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold flex items-center gap-2">
          <Gauge size={16} className="text-amber-400" />
          回放控制
        </div>
        <div className="text-xs font-mono bg-black/30 px-2 py-1 rounded">
          {currentMoveIndex + 1} / {totalMoves}
        </div>
      </div>

      <div className="h-1.5 bg-stone-900 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => jumpToMove(-1)}
          disabled={totalMoves === 0}
          className="p-2 rounded-md bg-stone-700 hover:bg-stone-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="回到开始"
        >
          <ChevronsLeft size={18} />
        </button>

        <button
          onClick={() => jumpToMove(Math.max(-1, currentMoveIndex - 1))}
          disabled={currentMoveIndex < 0}
          className="p-2 rounded-md bg-stone-700 hover:bg-stone-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="上一步"
        >
          <SkipBack size={18} />
        </button>

        <button
          onClick={isPlaying ? stopPlayback : startPlayback}
          disabled={totalMoves === 0}
          className="p-3 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg hover:scale-105 active:scale-95"
          title={isPlaying ? '暂停' : '播放'}
        >
          {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
        </button>

        <button
          onClick={() => jumpToMove(Math.min(totalMoves - 1, currentMoveIndex + 1))}
          disabled={currentMoveIndex >= totalMoves - 1}
          className="p-2 rounded-md bg-stone-700 hover:bg-stone-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="下一步"
        >
          <SkipForward size={18} />
        </button>

        <button
          onClick={() => jumpToMove(totalMoves - 1)}
          disabled={totalMoves === 0}
          className="p-2 rounded-md bg-stone-700 hover:bg-stone-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="跳到结尾"
        >
          <ChevronsRight size={18} />
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 mt-4">
        <span className="text-xs text-stone-400">速度:</span>
        <div className="flex gap-1">
          {SPEEDS.map(s => (
            <button
              key={s}
              onClick={() => setReplaySpeed(s)}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                replaySpeed === s
                  ? 'bg-amber-500 text-stone-900 font-semibold'
                  : 'bg-stone-700 hover:bg-stone-600'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
        <button
          onClick={() => setReplayMode(false)}
          className="ml-auto text-xs px-3 py-1 rounded bg-stone-700 hover:bg-red-700 transition-colors"
        >
          退出回放
        </button>
      </div>
    </div>
  );
};
