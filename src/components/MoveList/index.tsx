import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { MessageSquare, Edit3, Check, X } from 'lucide-react';

export const MoveList: React.FC = () => {
  const { moves, currentMoveIndex, jumpToMove, addComment } = useGameStore();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const activeEl = container.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentMoveIndex]);

  const handleStartEdit = (idx: number, currentComment?: string) => {
    setEditingIndex(idx);
    setCommentText(currentComment || '');
  };

  const handleSaveComment = () => {
    if (editingIndex !== null) {
      addComment(editingIndex, commentText.trim());
      setEditingIndex(null);
      setCommentText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setCommentText('');
  };

  const pairs: Array<{ idx: number; red?: typeof moves[0]; black?: typeof moves[0] }> = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      idx: Math.floor(i / 2),
      red: moves[i],
      black: moves[i + 1],
    });
  }

  return (
    <div className="flex flex-col h-full bg-stone-50 rounded-lg border border-stone-200 shadow-inner overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-stone-800 to-stone-700 text-amber-50 font-semibold text-sm flex items-center justify-between">
        <span>走法记录</span>
        <span className="text-xs opacity-75">共 {moves.length} 步</span>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-2 py-2 space-y-1"
      >
        {moves.length === 0 && (
          <div className="flex items-center justify-center h-32 text-stone-400 text-sm italic">
            暂无走法，在棋盘上开始对弈
          </div>
        )}

        {pairs.map(({ idx, red, black }) => (
          <div key={idx} className="flex items-stretch text-sm">
            <div className="w-10 flex items-center justify-center text-stone-400 font-mono text-xs shrink-0">
              {idx + 1}.
            </div>

            {[red, black].map((move, i) => {
              if (!move) return <div key={i} className="flex-1" />;
              const moveIdx = idx * 2 + i;
              const isActive = moveIdx === currentMoveIndex;
              const side = i === 0 ? 'red' : 'black';
              const isEditing = editingIndex === moveIdx;

              return (
                <div key={i} className="flex-1 group px-1">
                  <div
                    data-active={isActive}
                    onClick={() => jumpToMove(moveIdx)}
                    className={`
                      px-3 py-2 rounded-md cursor-pointer transition-all duration-200 flex items-center gap-2
                      ${side === 'red'
                        ? isActive
                          ? 'bg-red-700 text-white shadow-md ring-2 ring-amber-400'
                          : 'bg-red-50 hover:bg-red-100 text-red-900 border border-red-100'
                        : isActive
                          ? 'bg-stone-800 text-white shadow-md ring-2 ring-amber-400'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200'
                      }
                    `}
                  >
                    <span className="font-bold font-serif tracking-wide">{move.notation}</span>
                    {move.capturedPiece && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${isActive ? 'bg-white/20' : 'bg-amber-100 text-amber-800'}`}>
                        吃{move.capturedPiece}
                      </span>
                    )}
                    <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(moveIdx, move.comment);
                        }}
                        className={`p-1 rounded ${isActive ? 'hover:bg-white/20' : 'hover:bg-black/10'}`}
                        title="添加注释"
                      >
                        <MessageSquare size={13} />
                      </button>
                    </div>
                  </div>

                  {move.comment && !isEditing && (
                    <div className={`text-xs px-3 py-1.5 mt-0.5 rounded italic border-l-2 ${side === 'red' ? 'bg-red-50/50 border-red-400 text-red-800' : 'bg-stone-50 border-stone-500 text-stone-700'}`}>
                      💬 {move.comment}
                    </div>
                  )}

                  {isEditing && (
                    <div className="mt-1 p-2 bg-amber-50 rounded border border-amber-300">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="w-full text-xs p-2 rounded border border-amber-200 focus:outline-none focus:border-amber-500 resize-none"
                        rows={2}
                        placeholder="输入这一步的注释..."
                        autoFocus
                      />
                      <div className="flex justify-end gap-1 mt-1">
                        <button
                          onClick={handleCancelEdit}
                          className="px-2 py-1 text-xs rounded bg-stone-200 hover:bg-stone-300 text-stone-700 flex items-center gap-1"
                        >
                          <X size={12} /> 取消
                        </button>
                        <button
                          onClick={handleSaveComment}
                          className="px-2 py-1 text-xs rounded bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1"
                        >
                          <Check size={12} /> 保存
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
