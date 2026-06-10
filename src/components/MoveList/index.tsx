import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import type { Move, Branch } from '@/types/chess';
import { MessageSquare, Edit3, Check, X, GitBranch, ArrowLeft, Plus, Trash2 } from 'lucide-react';

interface MoveItemProps {
  move: Move;
  mainIndex: number;
  isActive: boolean;
  isInBranch: boolean;
  indentLevel: number;
  onJump: (mainIndex: number) => void;
  onStartVariation: (mainIndex: number) => void;
  onAddComment: (moveId: string, comment: string) => void;
  editingId: string | null;
  editingText: string;
  setEditingId: (id: string | null) => void;
  setEditingText: (text: string) => void;
}

const MoveItem: React.FC<MoveItemProps> = ({
  move,
  mainIndex,
  isActive,
  isInBranch,
  indentLevel,
  onJump,
  onStartVariation,
  onAddComment,
  editingId,
  editingText,
  setEditingId,
  setEditingText,
}) => {
  const isEditing = editingId === move.id;
  const isRed = move.side === 'red';

  const handleStartEdit = () => {
    setEditingId(move.id);
    setEditingText(move.comment || '');
  };

  const handleSave = () => {
    onAddComment(move.id, editingText.trim());
    setEditingId(null);
    setEditingText('');
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingText('');
  };

  return (
    <div style={{ marginLeft: indentLevel * 16 }}>
      <div
        data-active={isActive && !isInBranch}
        onClick={() => onJump(mainIndex)}
        className={`
          px-3 py-2 rounded-md cursor-pointer transition-all duration-200 flex items-center gap-2 group
          ${isRed
            ? isActive && !isInBranch
              ? 'bg-red-700 text-white shadow-md ring-2 ring-amber-400'
              : 'bg-red-50 hover:bg-red-100 text-red-900 border border-red-100'
            : isActive && !isInBranch
              ? 'bg-stone-800 text-white shadow-md ring-2 ring-amber-400'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200'
          }
        `}
      >
        <span className="font-bold font-serif tracking-wide">{move.notation}</span>
        {move.capturedPiece && (
          <span className={`text-xs px-1.5 py-0.5 rounded ${isActive && !isInBranch ? 'bg-white/20' : 'bg-amber-100 text-amber-800'}`}>
            吃{move.capturedPiece}
          </span>
        )}
        {move.variations.length > 0 && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 flex items-center gap-0.5">
            <GitBranch size={10} /> {move.variations.length}
          </span>
        )}
        <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartVariation(mainIndex);
            }}
            className={`p-1 rounded ${isActive && !isInBranch ? 'hover:bg-white/20' : 'hover:bg-black/10'}`}
            title="添加变着"
          >
            <Plus size={13} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStartEdit();
            }}
            className={`p-1 rounded ${isActive && !isInBranch ? 'hover:bg-white/20' : 'hover:bg-black/10'}`}
            title="添加注释"
          >
            <MessageSquare size={13} />
          </button>
        </div>
      </div>

      {move.comment && !isEditing && (
        <div className={`text-xs px-3 py-1.5 mt-0.5 ml-2 rounded italic border-l-2 ${isRed ? 'bg-red-50/50 border-red-400 text-red-800' : 'bg-stone-50 border-stone-500 text-stone-700'}`}>
          💬 {move.comment}
        </div>
      )}

      {isEditing && (
        <div className="mt-1 p-2 bg-amber-50 rounded border border-amber-300 ml-2">
          <textarea
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            className="w-full text-xs p-2 rounded border border-amber-200 focus:outline-none focus:border-amber-500 resize-none"
            rows={2}
            placeholder="输入这一步的注释..."
            autoFocus
          />
          <div className="flex justify-end gap-1 mt-1">
            <button
              onClick={handleCancel}
              className="px-2 py-1 text-xs rounded bg-stone-200 hover:bg-stone-300 text-stone-700 flex items-center gap-1"
            >
              <X size={12} /> 取消
            </button>
            <button
              onClick={handleSave}
              className="px-2 py-1 text-xs rounded bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1"
            >
              <Check size={12} /> 保存
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface BranchViewProps {
  branch: Branch;
  parentMainIndex: number;
  currentBranch: { parentMainIndex: number; branchIndex: number; moveIndex: number } | null;
  branchIndex: number;
  onJump: (parentIndex: number, branchIdx: number, moveIdx: number) => void;
  onBack: () => void;
  onAddComment: (moveId: string, comment: string) => void;
  editingId: string | null;
  editingText: string;
  setEditingId: (id: string | null) => void;
  setEditingText: (text: string) => void;
}

const BranchView: React.FC<BranchViewProps> = ({
  branch,
  parentMainIndex,
  currentBranch,
  branchIndex,
  onJump,
  onBack,
  onAddComment,
  editingId,
  editingText,
  setEditingId,
  setEditingText,
}) => {
  const isActive = currentBranch?.parentMainIndex === parentMainIndex && currentBranch?.branchIndex === branchIndex;
  const [editingBranchName, setEditingBranchName] = useState(false);
  const [branchName, setBranchName] = useState(branch.name);

  const pairs: Array<{ idx: number; red?: Move; black?: Move }> = [];
  for (let i = 0; i < branch.moves.length; i += 2) {
    pairs.push({
      idx: Math.floor(i / 2),
      red: branch.moves[i],
      black: branch.moves[i + 1],
    });
  }

  return (
    <div className="ml-4 mt-2 border-l-2 border-purple-300 pl-3">
      <div className={`flex items-center gap-2 mb-2 px-2 py-1.5 rounded ${isActive ? 'bg-purple-100' : 'bg-purple-50'}`}>
        <GitBranch size={14} className="text-purple-600" />
        {editingBranchName ? (
          <input
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            onBlur={() => {
              // TODO: save branch name
              setEditingBranchName(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setEditingBranchName(false);
              if (e.key === 'Escape') {
                setBranchName(branch.name);
                setEditingBranchName(false);
              }
            }}
            className="flex-1 px-1 py-0.5 text-sm rounded border border-purple-300 focus:outline-none"
            autoFocus
          />
        ) : (
          <span
            className="font-medium text-purple-800 cursor-pointer hover:underline text-sm"
            onDoubleClick={() => setEditingBranchName(true)}
          >
            {branch.name}
          </span>
        )}
        <button
          onClick={onBack}
          className="ml-auto p-1 rounded hover:bg-purple-200 text-purple-700"
          title="返回主线"
        >
          <ArrowLeft size={14} />
        </button>
      </div>

      {pairs.map(({ idx, red, black }) => (
        <div key={idx} className="flex items-stretch text-sm mb-1">
          <div className="w-8 flex items-center justify-center text-stone-400 font-mono text-xs shrink-0">
            {parentMainIndex / 2 + 1 + idx}.
          </div>

          {[red, black].map((move, i) => {
            if (!move) return <div key={i} className="flex-1" />;
            const moveIdx = idx * 2 + i;
            const isMoveActive = isActive && currentBranch?.moveIndex === moveIdx;
            const side = i === 0 ? 'red' : 'black';
            const isEditing = editingId === move.id;

            const handleStartEdit = () => {
              setEditingId(move.id);
              setEditingText(move.comment || '');
            };

            const handleSave = () => {
              onAddComment(move.id, editingText.trim());
              setEditingId(null);
              setEditingText('');
            };

            const handleCancel = () => {
              setEditingId(null);
              setEditingText('');
            };

            return (
              <div key={i} className="flex-1 group px-1">
                <div
                  data-active={isMoveActive}
                  onClick={() => onJump(parentMainIndex, branchIndex, moveIdx)}
                  className={`
                    px-3 py-2 rounded-md cursor-pointer transition-all duration-200 flex items-center gap-2
                    ${side === 'red'
                      ? isMoveActive
                        ? 'bg-red-700 text-white shadow-md ring-2 ring-amber-400'
                        : 'bg-red-50 hover:bg-red-100 text-red-900 border border-red-100'
                      : isMoveActive
                        ? 'bg-stone-800 text-white shadow-md ring-2 ring-amber-400'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200'
                    }
                  `}
                >
                  <span className="font-bold font-serif tracking-wide">{move.notation}</span>
                  {move.capturedPiece && (
                    <span className={`text-xs px-1.5 py-0.5 rounded ${isMoveActive ? 'bg-white/20' : 'bg-amber-100 text-amber-800'}`}>
                      吃{move.capturedPiece}
                    </span>
                  )}
                  <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit();
                      }}
                      className={`p-1 rounded ${isMoveActive ? 'hover:bg-white/20' : 'hover:bg-black/10'}`}
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
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="w-full text-xs p-2 rounded border border-amber-200 focus:outline-none focus:border-amber-500 resize-none"
                      rows={2}
                      placeholder="输入这一步的注释..."
                      autoFocus
                    />
                    <div className="flex justify-end gap-1 mt-1">
                      <button
                        onClick={handleCancel}
                        className="px-2 py-1 text-xs rounded bg-stone-200 hover:bg-stone-300 text-stone-700 flex items-center gap-1"
                      >
                        <X size={12} /> 取消
                      </button>
                      <button
                        onClick={handleSave}
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

      {branch.moves.length === 0 && (
        <div className="text-xs text-stone-400 italic px-2 py-2">
          变着为空，在棋盘上走棋添加变着
        </div>
      )}
    </div>
  );
};

export const MoveList: React.FC = () => {
  const {
    moves,
    currentMainIndex,
    currentBranch,
    jumpToMainLine,
    jumpToBranch,
    goBackToMainLine,
    addComment,
    startVariation,
    isCreatingVariation,
    cancelVariation,
    gameOver,
    isReplayMode,
    gameRecord,
  } = useGameStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const activeEl = container.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentMainIndex, currentBranch]);

  const pairs: Array<{ idx: number; red?: Move; black?: Move }> = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      idx: Math.floor(i / 2),
      red: moves[i],
      black: moves[i + 1],
    });
  }

  const handleStartVariation = (mainIndex: number) => {
    if (!isReplayMode) return;
    if (currentBranch) return;
    jumpToMainLine(mainIndex);
    setTimeout(() => startVariation(), 50);
  };

  const activeMainMoveId = !currentBranch && currentMainIndex >= 0 ? moves[currentMainIndex]?.id : null;

  return (
    <div className="flex flex-col h-full bg-stone-50 rounded-lg border border-stone-200 shadow-inner overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-stone-800 to-stone-700 text-amber-50 font-semibold text-sm flex items-center justify-between">
        <span>走法记录</span>
        <span className="text-xs opacity-75">
          {currentBranch ? (
            <span className="text-purple-300 flex items-center gap-1">
              <GitBranch size={12} /> 变着模式
            </span>
          ) : (
            `共 ${moves.length} 步`
          )}
        </span>
      </div>

      {isCreatingVariation && (
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Plus size={14} /> 正在添加变着...在棋盘上走棋
          </span>
          <button
            onClick={cancelVariation}
            className="px-2 py-1 rounded bg-white/20 hover:bg-white/30 text-xs"
          >
            取消
          </button>
        </div>
      )}

      {gameOver && gameRecord?.result && (
        <div className={`px-4 py-2 text-sm text-center font-semibold ${
          gameRecord.result === '红胜' ? 'bg-red-600 text-white' :
          gameRecord.result === '黑胜' ? 'bg-stone-800 text-white' :
          'bg-amber-500 text-stone-900'
        }`}>
          🏆 对局结束：{gameRecord.result}
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-2 py-2 space-y-1"
      >
        {moves.length === 0 && (
          <div className="flex items-center justify-center h-32 text-stone-400 text-sm italic">
            暂无走法，在棋盘上开始对弈
          </div>
        )}

        {!currentBranch && pairs.map(({ idx, red, black }) => (
          <div key={idx} className="flex items-stretch text-sm">
            <div className="w-10 flex items-center justify-center text-stone-400 font-mono text-xs shrink-0">
              {idx + 1}.
            </div>

            {[red, black].map((move, i) => {
              if (!move) return <div key={i} className="flex-1" />;
              const mainIndex = idx * 2 + i;
              const isActive = mainIndex === currentMainIndex && !currentBranch;

              return (
                <div key={i} className="flex-1 px-1">
                  <MoveItem
                    move={move}
                    mainIndex={mainIndex}
                    isActive={isActive}
                    isInBranch={false}
                    indentLevel={0}
                    onJump={jumpToMainLine}
                    onStartVariation={handleStartVariation}
                    onAddComment={addComment}
                    editingId={editingId}
                    editingText={editingText}
                    setEditingId={setEditingId}
                    setEditingText={setEditingText}
                  />

                  {move.variations.length > 0 && !currentBranch && (
                    <div className="mt-1 space-y-1">
                      {move.variations.map((variation, vIdx) => (
                        <div
                          key={variation.id}
                          onClick={() => jumpToBranch(mainIndex, vIdx, variation.moves.length - 1)}
                          className="ml-4 px-3 py-1.5 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs cursor-pointer border border-purple-200 flex items-center gap-2"
                        >
                          <GitBranch size={12} />
                          <span className="font-medium">{variation.name}</span>
                          <span className="text-purple-500">({variation.moves.length} 步)</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {currentBranch && (
          <div className="space-y-2">
            {currentBranch.parentMainIndex >= 0 && (
              <div className="mb-2">
                <button
                  onClick={goBackToMainLine}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-purple-100 hover:bg-purple-200 text-purple-800 text-sm font-medium transition-colors"
                >
                  <ArrowLeft size={14} />
                  返回主线（第 {Math.floor(currentBranch.parentMainIndex / 2) + 1} 回合）
                </button>
              </div>
            )}

            {pairs.slice(0, Math.floor((currentBranch.parentMainIndex + 1) / 2)).map(({ idx, red, black }) => (
              <div key={idx} className="flex items-stretch text-sm opacity-60">
                <div className="w-10 flex items-center justify-center text-stone-400 font-mono text-xs shrink-0">
                  {idx + 1}.
                </div>
                {[red, black].map((move, i) => {
                  if (!move) return <div key={i} className="flex-1" />;
                  const mainIndex = idx * 2 + i;
                  return (
                    <div key={i} className="flex-1 px-1">
                      <div className={`px-3 py-2 rounded-md border ${move.side === 'red' ? 'bg-red-50 border-red-100 text-red-500' : 'bg-stone-100 border-stone-200 text-stone-500'}`}>
                        <span className="font-serif">{move.notation}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {(() => {
              const parent = moves[currentBranch.parentMainIndex];
              if (!parent) return null;
              const variation = parent.variations[currentBranch.branchIndex];
              if (!variation) return null;
              return (
                <BranchView
                  branch={variation}
                  parentMainIndex={currentBranch.parentMainIndex}
                  currentBranch={currentBranch}
                  branchIndex={currentBranch.branchIndex}
                  onJump={jumpToBranch}
                  onBack={goBackToMainLine}
                  onAddComment={addComment}
                  editingId={editingId}
                  editingText={editingText}
                  setEditingId={setEditingId}
                  setEditingText={setEditingText}
                />
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
