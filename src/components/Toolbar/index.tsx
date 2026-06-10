import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import {
  Plus,
  Save,
  Undo2,
  Redo2,
  PlayCircle,
  Download,
  Home,
  Trophy,
  Users,
  Calendar,
  FileText,
} from 'lucide-react';
import { exportToText, exportToPGN, downloadFile } from '@/utils/chess';

export const Toolbar: React.FC = () => {
  const navigate = useNavigate();
  const {
    resetGame,
    saveCurrentGame,
    undoMove,
    redoMove,
    currentMoveIndex,
    moves,
    gameRecord,
    setGameInfo,
    setResult,
    isReplayMode,
    setReplayMode,
  } = useGameStore();

  const handleExport = (format: 'txt' | 'pgn') => {
    if (!gameRecord) return;
    const record = { ...gameRecord, moves };
    const content = format === 'pgn' ? exportToPGN(record) : exportToText(record);
    const filename = `${gameRecord.title || '棋谱'}.${format === 'pgn' ? 'pgn' : 'txt'}`;
    const mime = format === 'pgn' ? 'application/x-chess-pgn' : 'text/plain';
    downloadFile(content, filename, mime);
  };

  const handleToggleReplay = () => {
    if (moves.length === 0) return;
    setReplayMode(!isReplayMode);
  };

  if (!gameRecord) {
    return (
      <div className="bg-gradient-to-r from-stone-800 to-stone-700 rounded-lg p-4 text-amber-50 shadow-lg">
        <div className="flex items-center gap-2">
          <Plus size={18} />
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold rounded-md transition-colors"
          >
            开始新对局
          </button>
          <button
            onClick={() => navigate('/')}
            className="ml-auto flex items-center gap-1 px-3 py-2 rounded-md bg-stone-700 hover:bg-stone-600 transition-colors"
          >
            <Home size={16} /> 棋谱列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-r from-stone-800 to-stone-700 rounded-lg p-3 text-amber-50 shadow-lg">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={resetGame}
            className="flex items-center gap-1 px-3 py-2 rounded-md bg-stone-700 hover:bg-red-700 transition-colors text-sm"
            title="新建对局"
          >
            <Plus size={16} /> 新建
          </button>

          <button
            onClick={saveCurrentGame}
            className="flex items-center gap-1 px-3 py-2 rounded-md bg-emerald-700 hover:bg-emerald-600 transition-colors text-sm"
            title="保存棋谱"
          >
            <Save size={16} /> 保存
          </button>

          <div className="w-px h-6 bg-stone-600 mx-1" />

          <button
            onClick={undoMove}
            disabled={isReplayMode || currentMoveIndex < 0}
            className="flex items-center gap-1 px-3 py-2 rounded-md bg-stone-700 hover:bg-stone-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
            title="悔棋"
          >
            <Undo2 size={16} /> 悔棋
          </button>

          <button
            onClick={redoMove}
            disabled={isReplayMode || currentMoveIndex >= moves.length - 1}
            className="flex items-center gap-1 px-3 py-2 rounded-md bg-stone-700 hover:bg-stone-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
            title="撤销悔棋"
          >
            <Redo2 size={16} /> 撤销
          </button>

          <div className="w-px h-6 bg-stone-600 mx-1" />

          <button
            onClick={handleToggleReplay}
            disabled={moves.length === 0}
            className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors text-sm ${
              isReplayMode
                ? 'bg-amber-500 text-stone-900 hover:bg-amber-400'
                : 'bg-stone-700 hover:bg-stone-600 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
            title={isReplayMode ? '退出回放' : '进入回放模式'}
          >
            <PlayCircle size={16} /> {isReplayMode ? '编辑中' : '回放'}
          </button>

          <div className="w-px h-6 bg-stone-600 mx-1" />

          <button
            onClick={() => handleExport('txt')}
            disabled={moves.length === 0}
            className="flex items-center gap-1 px-3 py-2 rounded-md bg-stone-700 hover:bg-stone-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
            title="导出为文本"
          >
            <FileText size={16} /> TXT
          </button>

          <button
            onClick={() => handleExport('pgn')}
            disabled={moves.length === 0}
            className="flex items-center gap-1 px-3 py-2 rounded-md bg-stone-700 hover:bg-stone-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
            title="导出为PGN"
          >
            <Download size={16} /> PGN
          </button>

          <button
            onClick={() => navigate('/')}
            className="ml-auto flex items-center gap-1 px-3 py-2 rounded-md bg-stone-700 hover:bg-stone-600 transition-colors text-sm"
          >
            <Home size={16} /> 列表
          </button>
        </div>
      </div>

      <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 shadow-sm">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="flex items-center gap-1 text-xs text-stone-600 mb-1">
              <Trophy size={12} className="text-red-700" /> 红方
            </label>
            <input
              type="text"
              value={gameRecord.redPlayer}
              onChange={(e) => setGameInfo({ redPlayer: e.target.value })}
              className="w-full px-2 py-1 text-sm rounded border border-stone-300 focus:outline-none focus:border-amber-500 bg-red-50 text-red-900"
            />
          </div>
          <div>
            <label className="flex items-center gap-1 text-xs text-stone-600 mb-1">
              <Trophy size={12} className="text-stone-800" /> 黑方
            </label>
            <input
              type="text"
              value={gameRecord.blackPlayer}
              onChange={(e) => setGameInfo({ blackPlayer: e.target.value })}
              className="w-full px-2 py-1 text-sm rounded border border-stone-300 focus:outline-none focus:border-amber-500 bg-stone-100 text-stone-900"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <label className="flex items-center gap-1 text-xs text-stone-600 mb-1">
              <FileText size={12} /> 标题
            </label>
            <input
              type="text"
              value={gameRecord.title}
              onChange={(e) => setGameInfo({ title: e.target.value })}
              className="w-full px-2 py-1 text-sm rounded border border-stone-300 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="flex items-center gap-1 text-xs text-stone-600 mb-1">
              <Calendar size={12} /> 日期
            </label>
            <input
              type="date"
              value={gameRecord.date || ''}
              onChange={(e) => setGameInfo({ date: e.target.value })}
              className="w-full px-2 py-1 text-sm rounded border border-stone-300 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
        <div className="mt-2">
          <label className="flex items-center gap-1 text-xs text-stone-600 mb-1">
            <Users size={12} /> 对局结果
          </label>
          <div className="flex gap-1">
            {(['', '红胜', '黑胜', '和棋'] as const).map(r => (
              <button
                key={r}
                onClick={() => setResult(r)}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  gameRecord.result === r
                    ? 'bg-amber-500 text-stone-900 font-semibold'
                    : 'bg-stone-200 hover:bg-stone-300 text-stone-700'
                }`}
              >
                {r || '未结束'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
