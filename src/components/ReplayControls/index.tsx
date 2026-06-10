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
  GitBranch,
  Plus,
  X,
} from 'lucide-react';

const SPEEDS = [0.5, 1, 2, 4];

export const ReplayControls: React.FC = () => {
  const {
    isReplayMode,
    setReplayMode,
    replaySpeed,
    setReplaySpeed,
    currentBranch,
    startVariation,
    cancelVariation,
    isCreatingVariation,
    gameOver,
    stepForward,
    stepBackward,
    stepToStart,
    stepToEnd,
    getCurrentMoveIndex,
    getTotalMovesInCurrentPath,
    getCurrentMovesPath,
  } = useGameStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<number | null>(null);

  const currentMoveIndex = getCurrentMoveIndex();
  const totalMovesInPath = getTotalMovesInCurrentPath();
  const path = getCurrentMovesPath();

  const stopPlayback = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
  };

  const startPlayback = () => {
    if (currentMoveIndex >= totalMovesInPath) {
      stepToStart();
    }
    setIsPlaying(true);
  };

  useEffect(() => {
    if (!isPlaying) return;
    timerRef.current = window.setInterval(() => {
      const state = useGameStore.getState();
      const curIdx = state.getCurrentMoveIndex();
      const total = state.getTotalMovesInCurrentPath();
      if (curIdx >= total) {
        stopPlayback();
        return;
      }
      state.stepForward();
    }, 1200 / replaySpeed);

    return () => stopPlayback();
  }, [isPlaying, replaySpeed]);

  useEffect(() => {
    return () => stopPlayback();
  }, []);

  if (!isReplayMode) return null;

  const progress = totalMovesInPath < 0 ? 0 : ((currentMoveIndex + 1) / (totalMovesInPath + 1)) * 100;
  const hasMoreSteps = currentMoveIndex < totalMovesInPath;
  const hasPrevSteps = currentMoveIndex >= 0;

  return (
    <div className="bg-gradient-to-r from-stone-800 via-stone-700 to-stone-800 rounded-lg shadow-lg p-4 text-amber-50">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold flex items-center gap-2">
          <Gauge size={16} className="text-amber-400" />
          回放控制
          {currentBranch && (
            <span className="text-xs bg-purple-500 px-2 py-0.5 rounded-full flex items-center gap-1">
              <GitBranch size={12} /> 变着
            </span>
          )}
        </div>
        <div className="text-xs font-mono bg-black/30 px-2 py-1 rounded">
          {currentMoveIndex + 1} / {totalMovesInPath + 1}
        </div>
      </div>

      {isCreatingVariation && (
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-md px-3 py-2 mb-3 flex items-center justify-between text-sm">
          <span className="flex items-center gap-1">
            <Plus size={14} /> 正在添加变着，请在棋盘上走棋
          </span>
          <button
            onClick={cancelVariation}
            className="p-1 rounded hover:bg-white/20"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {gameOver && !isCreatingVariation && (
        <div className="bg-amber-900/50 rounded-md px-3 py-2 mb-3 text-center text-sm">
          🏆 已结束对局回放模式，可逐步回看或自动播放
        </div>
      )}

      <div className="h-1.5 bg-stone-900 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          onClick={stepToStart}
          disabled={!hasPrevSteps}
          className="p-2 rounded-md bg-stone-700 hover:bg-stone-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="回到开始"
        >
          <ChevronsLeft size={18} />
        </button>

        <button
          onClick={stepBackward}
          disabled={!hasPrevSteps}
          className="p-2 rounded-md bg-stone-700 hover:bg-stone-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="上一步"
        >
          <SkipBack size={18} />
        </button>

        <button
          onClick={isPlaying ? stopPlayback : startPlayback}
          disabled={path.length === 0}
          className="p-3 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg hover:scale-105 active:scale-95"
          title={isPlaying ? '暂停' : '播放'}
        >
          {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
        </button>

        <button
          onClick={stepForward}
          disabled={!hasMoreSteps}
          className="p-2 rounded-md bg-stone-700 hover:bg-stone-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="下一步"
        >
          <SkipForward size={18} />
        </button>

        <button
          onClick={stepToEnd}
          disabled={!hasMoreSteps}
          className="p-2 rounded-md bg-stone-700 hover:bg-stone-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="跳到结尾"
        >
          <ChevronsRight size={18} />
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
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

        {!gameOver && !isCreatingVariation && !currentBranch && (
          <button
            onClick={startVariation}
            className="ml-2 flex items-center gap-1 px-3 py-1 text-xs rounded bg-purple-600 hover:bg-purple-500 transition-colors"
            title="在当前步之后添加变着"
          >
            <GitBranch size={12} /> 加变着
          </button>
        )}

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
