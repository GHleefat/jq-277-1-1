import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { getPieceAt, posEquals } from '@/utils/chess';
import { ChessPiece } from './ChessPiece';

const CELL_SIZE = 58;
const PADDING = 32;
const COLS = 9;
const ROWS = 10;
const BOARD_WIDTH = (COLS - 1) * CELL_SIZE + PADDING * 2;
const BOARD_HEIGHT = (ROWS - 1) * CELL_SIZE + PADDING * 2;

export const ChessBoard: React.FC = () => {
  const {
    pieces,
    selectedPiece,
    validMoves,
    lastMove,
    selectPiece,
    movePiece,
    currentSide,
    isReplayMode,
    gameOver,
    isCreatingVariation,
    gameRecord,
  } = useGameStore();

  const handleCellClick = (col: number, row: number) => {
    if (gameOver) return;
    if (isReplayMode && !isCreatingVariation) return;
    const piece = getPieceAt(pieces, { col, row });

    if (selectedPiece) {
      if (piece && piece.id === selectedPiece.id) {
        selectPiece(null);
        return;
      }
      if (piece && piece.side === currentSide) {
        selectPiece(piece);
        return;
      }
      movePiece({ col, row });
    } else {
      if (piece && piece.side === currentSide) {
        selectPiece(piece);
      }
    }
  };

  const renderGrid = () => {
    const lines: React.ReactNode[] = [];

    for (let r = 0; r < ROWS; r++) {
      lines.push(
        <line
          key={`h-${r}`}
          x1={PADDING}
          y1={PADDING + r * CELL_SIZE}
          x2={PADDING + (COLS - 1) * CELL_SIZE}
          y2={PADDING + r * CELL_SIZE}
          stroke="#4a3520"
          strokeWidth="1.2"
        />
      );
    }

    for (let c = 0; c < COLS; c++) {
      if (c === 0 || c === COLS - 1) {
        lines.push(
          <line
            key={`v-${c}`}
            x1={PADDING + c * CELL_SIZE}
            y1={PADDING}
            x2={PADDING + c * CELL_SIZE}
            y2={PADDING + (ROWS - 1) * CELL_SIZE}
            stroke="#4a3520"
            strokeWidth="1.2"
          />
        );
      } else {
        lines.push(
          <line
            key={`v-top-${c}`}
            x1={PADDING + c * CELL_SIZE}
            y1={PADDING}
            x2={PADDING + c * CELL_SIZE}
            y2={PADDING + 4 * CELL_SIZE}
            stroke="#4a3520"
            strokeWidth="1.2"
          />
        );
        lines.push(
          <line
            key={`v-bottom-${c}`}
            x1={PADDING + c * CELL_SIZE}
            y1={PADDING + 5 * CELL_SIZE}
            x2={PADDING + c * CELL_SIZE}
            y2={PADDING + (ROWS - 1) * CELL_SIZE}
            stroke="#4a3520"
            strokeWidth="1.2"
          />
        );
      }
    }

    lines.push(
      <line
        key="palace-bl-1"
        x1={PADDING + 3 * CELL_SIZE}
        y1={PADDING}
        x2={PADDING + 5 * CELL_SIZE}
        y2={PADDING + 2 * CELL_SIZE}
        stroke="#4a3520"
        strokeWidth="1.2"
      />
    );
    lines.push(
      <line
        key="palace-bl-2"
        x1={PADDING + 5 * CELL_SIZE}
        y1={PADDING}
        x2={PADDING + 3 * CELL_SIZE}
        y2={PADDING + 2 * CELL_SIZE}
        stroke="#4a3520"
        strokeWidth="1.2"
      />
    );
    lines.push(
      <line
        key="palace-rd-1"
        x1={PADDING + 3 * CELL_SIZE}
        y1={PADDING + 7 * CELL_SIZE}
        x2={PADDING + 5 * CELL_SIZE}
        y2={PADDING + 9 * CELL_SIZE}
        stroke="#4a3520"
        strokeWidth="1.2"
      />
    );
    lines.push(
      <line
        key="palace-rd-2"
        x1={PADDING + 5 * CELL_SIZE}
        y1={PADDING + 7 * CELL_SIZE}
        x2={PADDING + 3 * CELL_SIZE}
        y2={PADDING + 9 * CELL_SIZE}
        stroke="#4a3520"
        strokeWidth="1.2"
      />
    );

    return lines;
  };

  const renderRiver = () => (
    <text
      x={BOARD_WIDTH / 2}
      y={PADDING + 4.5 * CELL_SIZE}
      textAnchor="middle"
      fontSize="26"
      fontFamily="'Noto Serif SC', 'Source Han Serif CN', serif"
      fontWeight="bold"
      fill="#6b4423"
      letterSpacing="32"
      style={{ userSelect: 'none' }}
    >
      楚 河　　　漢 界
    </text>
  );

  const renderValidMoves = () => {
    return validMoves.map((pos, idx) => {
      const cx = PADDING + pos.col * CELL_SIZE;
      const cy = PADDING + pos.row * CELL_SIZE;
      const target = getPieceAt(pieces, pos);
      if (target) {
        return (
          <circle
            key={`vm-${idx}`}
            cx={cx}
            cy={cy}
            r={CELL_SIZE * 0.48}
            fill="none"
            stroke="#DAA520"
            strokeWidth="2.5"
            opacity="0.8"
            style={{ pointerEvents: 'none' }}
          />
        );
      }
      return (
        <circle
          key={`vm-${idx}`}
          cx={cx}
          cy={cy}
          r={CELL_SIZE * 0.14}
          fill="#DAA520"
          opacity="0.7"
          style={{ pointerEvents: 'none' }}
        />
      );
    });
  };

  const renderLastMove = () => {
    if (!lastMove) return null;
    return [lastMove.from, lastMove.to].map((pos, idx) => (
      <rect
        key={`lm-${idx}`}
        x={PADDING + pos.col * CELL_SIZE - CELL_SIZE * 0.42}
        y={PADDING + pos.row * CELL_SIZE - CELL_SIZE * 0.42}
        width={CELL_SIZE * 0.84}
        height={CELL_SIZE * 0.84}
        fill="rgba(218, 165, 32, 0.18)"
        rx="4"
        style={{ pointerEvents: 'none' }}
      />
    ));
  };

  const renderClickableAreas = () => {
    const areas: React.ReactNode[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        areas.push(
          <rect
            key={`cell-${c}-${r}`}
            x={PADDING + c * CELL_SIZE - CELL_SIZE / 2}
            y={PADDING + r * CELL_SIZE - CELL_SIZE / 2}
            width={CELL_SIZE}
            height={CELL_SIZE}
            fill="transparent"
            onClick={() => handleCellClick(c, r)}
            style={{ cursor: gameOver ? 'not-allowed' : (isReplayMode && !isCreatingVariation) ? 'default' : 'pointer' }}
          />
        );
      }
    }
    return areas;
  };

  const renderPositionMarks = () => {
    const marks: React.ReactNode[] = [];
    const positions = [
      { col: 1, row: 2 }, { col: 7, row: 2 },
      { col: 0, row: 3 }, { col: 2, row: 3 }, { col: 4, row: 3 }, { col: 6, row: 3 }, { col: 8, row: 3 },
      { col: 1, row: 7 }, { col: 7, row: 7 },
      { col: 0, row: 6 }, { col: 2, row: 6 }, { col: 4, row: 6 }, { col: 6, row: 6 }, { col: 8, row: 6 },
    ];
    const s = 6;
    const gap = 4;

    positions.forEach(({ col, row }, i) => {
      const cx = PADDING + col * CELL_SIZE;
      const cy = PADDING + row * CELL_SIZE;
      const drawL = (ox: number, oy: number, sx: number, sy: number) => {
        marks.push(
          <line
            key={`mk-${i}-${ox}-${oy}-h`}
            x1={cx + ox * gap}
            y1={cy + oy * gap}
            x2={cx + ox * (gap + s * sx)}
            y2={cy + oy * gap}
            stroke="#5a4020"
            strokeWidth="1.2"
          />
        );
        marks.push(
          <line
            key={`mk-${i}-${ox}-${oy}-v`}
            x1={cx + ox * gap}
            y1={cy + oy * gap}
            x2={cx + ox * gap}
            y2={cy + oy * (gap + s * sy)}
            stroke="#5a4020"
            strokeWidth="1.2"
          />
        );
      };

      if (col > 0) drawL(-1, -1, -1, -1), drawL(-1, 1, -1, 1);
      if (col < 8) drawL(1, -1, 1, -1), drawL(1, 1, 1, 1);
    });
    return marks;
  };

  return (
    <div className="inline-block relative"
    >
      <div className="rounded-lg shadow-2xl p-2"
        style={{
          background: 'linear-gradient(135deg, #d4a574 0%, #c19560 50%, #a87f48 100%)',
        }}
      >
        <svg
          width={BOARD_WIDTH}
          height={BOARD_HEIGHT}
          style={{
            background: 'radial-gradient(ellipse at center, #F5DEB3 0%, #E8D098 60%, #D4B87A 100%)',
            borderRadius: '6px',
            display: 'block',
          }}
        >
        <defs>
          <pattern id="woodGrain" patternUnits="userSpaceOnUse" width="100" height="100">
            <rect width="100" height="100" fill="transparent" />
            <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(139,90,43,0.06)" strokeWidth="2" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(139,90,43,0.05)" strokeWidth="1.5" />
            <line x1="0" y1="80" x2="100" y2="80" stroke="rgba(139,90,43,0.06)" strokeWidth="2" />
          </pattern>
        </defs>
        <rect width={BOARD_WIDTH} height={BOARD_HEIGHT} fill="url(#woodGrain)" />

        <rect
          x={PADDING - 10}
          y={PADDING - 10}
          width={(COLS - 1) * CELL_SIZE + 20}
          height={(ROWS - 1) * CELL_SIZE + 20}
          fill="none"
          stroke="#4a3520"
          strokeWidth="3"
          rx="2"
        />

        {renderGrid()}
        {renderPositionMarks()}
        {renderRiver()}
        {renderLastMove()}
        {renderValidMoves()}
        {renderClickableAreas()}

        {pieces.map(piece => (
          <ChessPiece
            key={piece.id}
            piece={piece}
            isSelected={selectedPiece?.id === piece.id}
            onClick={() => handleCellClick(piece.position.col, piece.position.row)}
            cellSize={CELL_SIZE}
          />
        ))}
      </svg>
      </div>

      {gameOver && (
        <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center backdrop-blur-sm">
          <div className="text-center p-8 bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl shadow-2xl border-4 border-amber-400 transform animate-bounce">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-stone-800 mb-2" style={{ fontFamily: "'Noto Serif SC', serif" }}>
              对局结束
            </h2>
            <p className={`text-2xl font-bold ${
              gameRecord?.result === '红胜' ? 'text-red-700' :
              gameRecord?.result === '黑胜' ? 'text-stone-800' :
              'text-amber-700'
            }`}>
              {gameRecord?.result || ''}
            </p>
            <p className="text-sm text-stone-500 mt-3">
              已自动锁定棋盘，不能继续走棋
            </p>
          </div>
        </div>
      )}

      {isCreatingVariation && !gameOver && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium flex items-center gap-2 animate-pulse">
          <span className="w-2 h-2 bg-white rounded-full animate-ping" />
          添加变着模式 - 在棋盘上走棋
        </div>
      )}
    </div>
  );
};
