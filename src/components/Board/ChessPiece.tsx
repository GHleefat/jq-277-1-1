import React from 'react';
import type { Piece } from '@/types/chess';

interface Props {
  piece: Piece;
  isSelected: boolean;
  onClick: () => void;
  cellSize: number;
}

export const ChessPiece: React.FC<Props> = ({ piece, isSelected, onClick, cellSize }) => {
  const size = cellSize * 0.85;
  const x = piece.position.col * cellSize + cellSize / 2;
  const y = piece.position.row * cellSize + cellSize / 2;

  const isRed = piece.side === 'red';

  return (
    <g
      onClick={onClick}
      style={{ cursor: 'pointer', transition: 'transform 0.25s ease-out' }}
      transform={`translate(${x - size / 2}, ${y - size / 2})`}
    >
      {isSelected && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 + 4}
          fill="none"
          stroke="#DAA520"
          strokeWidth="3"
          className="animate-pulse"
        />
      )}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2}
        fill={isRed ? '#FFF8E7' : '#F5E6C8'}
        stroke={isRed ? '#8B2500' : '#1a1a1a'}
        strokeWidth="2"
        style={{
          filter: 'drop-shadow(2px 3px 4px rgba(0,0,0,0.35))'
        }}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2 - 5}
        fill="none"
        stroke={isRed ? '#8B2500' : '#1a1a1a'}
        strokeWidth="1.5"
      />
      <text
        x={size / 2}
        y={size / 2 + size * 0.13}
        textAnchor="middle"
        fontSize={size * 0.5}
        fontWeight="bold"
        fontFamily="'Noto Serif SC', 'Source Han Serif CN', serif"
        fill={isRed ? '#8B2500' : '#1a1a1a'}
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      >
        {piece.type}
      </text>
    </g>
  );
};
