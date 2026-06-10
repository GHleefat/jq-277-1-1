import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Trash2,
  Copy,
  Search,
  Plus,
  Calendar,
  Hash,
  Trophy,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { getAllGames, deleteGame, duplicateGame } from '@/utils/storage';
import type { GameRecord } from '@/types/chess';
import { useGameStore } from '@/store/gameStore';

export const GameList: React.FC = () => {
  const navigate = useNavigate();
  const { resetGame, loadGame } = useGameStore();
  const [games, setGames] = useState<GameRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    setGames(getAllGames());
  }, []);

  const refresh = () => setGames(getAllGames());

  const handleNewGame = () => {
    resetGame();
    navigate('/game');
  };

  const handleOpen = (game: GameRecord) => {
    loadGame(game.id);
    navigate('/game');
  };

  const handleDelete = (id: string) => {
    deleteGame(id);
    setConfirmDelete(null);
    refresh();
  };

  const handleDuplicate = (id: string) => {
    duplicateGame(id);
    refresh();
  };

  const filtered = games.filter(g =>
    g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.redPlayer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.blackPlayer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 font-serif" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            中国象棋棋谱库
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            共 {games.length} 个对局记录 · 点击卡片打开查看与回放
          </p>
        </div>
        <button
          onClick={handleNewGame}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 text-white font-semibold rounded-lg shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95"
        >
          <Plus size={18} /> 开始新对局
        </button>
      </div>

      <div className="mb-6 relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          placeholder="搜索棋谱标题、棋手..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all bg-white"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-stone-50 rounded-xl border-2 border-dashed border-stone-200">
          <div className="text-6xl mb-4">♟</div>
          <h3 className="text-lg font-semibold text-stone-600 mb-2">
            {games.length === 0 ? '还没有棋谱记录' : '没有匹配的棋谱'}
          </h3>
          <p className="text-sm text-stone-400 mb-4">
            {games.length === 0 ? '点击上方按钮开始你的第一局对弈' : '试试其他搜索关键词'}
          </p>
          {games.length === 0 && (
            <button
              onClick={handleNewGame}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
            >
              <Play size={16} /> 立即开始
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(game => (
            <div
              key={game.id}
              className="group bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-xl hover:border-amber-300 transition-all duration-300 cursor-pointer"
            >
              <div
                onClick={() => handleOpen(game)}
                className="p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-stone-800 text-lg line-clamp-1 flex-1 pr-2" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                    {game.title}
                  </h3>
                  {game.result && (
                    <span className={`shrink-0 px-2 py-0.5 text-xs font-semibold rounded ${
                      game.result === '红胜' ? 'bg-red-100 text-red-700' :
                      game.result === '黑胜' ? 'bg-stone-800 text-white' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {game.result}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-3 text-sm">
                  <span className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-800 rounded font-medium">
                    <Trophy size={12} /> {game.redPlayer}
                  </span>
                  <span className="text-stone-400 font-bold">VS</span>
                  <span className="flex items-center gap-1 px-2 py-1 bg-stone-100 text-stone-800 rounded font-medium">
                    <Trophy size={12} /> {game.blackPlayer}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-stone-500">
                  <span className="flex items-center gap-1">
                    <Hash size={12} /> {game.moves.length} 步
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> {formatDate(game.createdAt)}
                  </span>
                </div>
              </div>

              <div
                onClick={() => handleOpen(game)}
                className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-50 to-stone-50 text-amber-700 font-medium text-sm border-t border-stone-100 group-hover:from-amber-100 group-hover:to-amber-50 transition-colors"
              >
                查看与回放 <ChevronRight size={16} />
              </div>

              <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicate(game.id);
                  }}
                  className="pointer-events-auto p-1.5 rounded-md bg-white/90 hover:bg-amber-100 text-stone-600 hover:text-amber-700 shadow-md transition-colors"
                  title="复制棋谱"
                >
                  <Copy size={14} />
                </button>
                {confirmDelete === game.id ? (
                  <div className="pointer-events-auto flex items-center gap-1 px-2 py-1 rounded-md bg-red-600 text-white text-xs shadow-md">
                    <AlertTriangle size={12} />
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(game.id); }} className="hover:underline">确认</button>
                    <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(null); }} className="hover:underline">取消</button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDelete(game.id);
                    }}
                    className="pointer-events-auto p-1.5 rounded-md bg-white/90 hover:bg-red-100 text-stone-600 hover:text-red-700 shadow-md transition-colors"
                    title="删除棋谱"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
