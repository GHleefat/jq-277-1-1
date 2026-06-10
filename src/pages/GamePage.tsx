import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChessBoard } from '@/components/Board/ChessBoard';
import { MoveList } from '@/components/MoveList';
import { Toolbar } from '@/components/Toolbar';
import { ReplayControls } from '@/components/ReplayControls';
import { useGameStore } from '@/store/gameStore';

const GamePage: React.FC = () => {
  const { id } = useParams();
  const { currentSide, isReplayMode, gameRecord, resetGame, loadGame, gameOver, isCreatingVariation, currentBranch } = useGameStore();

  useEffect(() => {
    if (id) {
      loadGame(id);
    } else if (!gameRecord) {
      resetGame();
    }
  }, [id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-200 via-amber-50 to-stone-200">
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
        backgroundImage: `radial-gradient(circle at 20% 20%, rgba(139,37,0,0.05) 0%, transparent 50%),
                          radial-gradient(circle at 80% 80%, rgba(139,37,0,0.05) 0%, transparent 50%)`
      }} />
      <div className="relative max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            ♞ 对弈室
          </h1>
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold shadow-md ${
            gameOver
              ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-stone-900'
              : isCreatingVariation
                ? 'bg-gradient-to-r from-purple-700 to-purple-600 text-white'
                : currentBranch
                  ? 'bg-gradient-to-r from-purple-700 to-purple-600 text-white'
                  : currentSide === 'red'
                    ? 'bg-gradient-to-r from-red-700 to-red-600 text-white'
                    : 'bg-gradient-to-r from-stone-800 to-stone-700 text-white'
          }`}>
            {gameOver ? (
              <>🏆 对局结束：{gameRecord?.result || ''}</>
            ) : isCreatingVariation ? (
              <>🌿 添加变着中...</>
            ) : currentBranch ? (
              <>🌿 浏览变着</>
            ) : isReplayMode ? (
              <>▶ 回放模式</>
            ) : (
              <>当前走棋：{currentSide === 'red' ? '红方' : '黑方'}</>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr_320px] gap-5">
          <div className="space-y-4">
            <Toolbar />
          </div>

          <div className="flex flex-col items-center justify-start">
            <ChessBoard />
            <div className="mt-4 w-full max-w-lg">
              <ReplayControls />
            </div>
          </div>

          <div className="h-[calc(100vh-140px)] min-h-[600px]">
            <MoveList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
