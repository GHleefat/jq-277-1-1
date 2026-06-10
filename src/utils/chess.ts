import type { Piece, Position, PieceType, Side, Move, GameRecord } from '@/types/chess';
import { isRedPiece, isBlackPiece } from '@/types/chess';

let idCounter = 0;
export function generateId(): string {
  return `${Date.now()}-${++idCounter}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createInitialBoard(): Piece[] {
  const pieces: Piece[] = [];
  const redBackRow: PieceType[] = ['车', '马', '相', '仕', '帅', '仕', '相', '马', '车'];
  const blackBackRow: PieceType[] = ['車', '馬', '象', '士', '將', '士', '象', '馬', '車'];

  for (let col = 0; col < 9; col++) {
    pieces.push({
      id: generateId(),
      type: blackBackRow[col],
      side: 'black',
      position: { col, row: 0 }
    });
    pieces.push({
      id: generateId(),
      type: redBackRow[col],
      side: 'red',
      position: { col, row: 9 }
    });
  }

  pieces.push({ id: generateId(), type: '砲', side: 'black', position: { col: 1, row: 2 } });
  pieces.push({ id: generateId(), type: '砲', side: 'black', position: { col: 7, row: 2 } });
  pieces.push({ id: generateId(), type: '炮', side: 'red', position: { col: 1, row: 7 } });
  pieces.push({ id: generateId(), type: '炮', side: 'red', position: { col: 7, row: 7 } });

  for (let col = 0; col < 9; col += 2) {
    pieces.push({ id: generateId(), type: '卒', side: 'black', position: { col, row: 3 } });
    pieces.push({ id: generateId(), type: '兵', side: 'red', position: { col, row: 6 } });
  }

  return pieces;
}

export function getPieceAt(pieces: Piece[], pos: Position): Piece | undefined {
  return pieces.find(p => p.position.col === pos.col && p.position.row === pos.row);
}

export function isInBoard(pos: Position): boolean {
  return pos.col >= 0 && pos.col <= 8 && pos.row >= 0 && pos.row <= 9;
}

export function isInPalace(side: Side, pos: Position): boolean {
  if (pos.col < 3 || pos.col > 5) return false;
  if (side === 'red') return pos.row >= 7 && pos.row <= 9;
  return pos.row >= 0 && pos.row <= 2;
}

export function hasCrossedRiver(side: Side, pos: Position): boolean {
  return side === 'red' ? pos.row <= 4 : pos.row >= 5;
}

function posEquals(a: Position, b: Position): boolean {
  return a.col === b.col && a.row === b.row;
}

function getLineMoves(
  piece: Piece,
  pieces: Piece[],
  directions: [number, number][]
): Position[] {
  const moves: Position[] = [];
  for (const [dc, dr] of directions) {
    let col = piece.position.col + dc;
    let row = piece.position.row + dr;
    while (isInBoard({ col, row })) {
      const target = getPieceAt(pieces, { col, row });
      if (!target) {
        moves.push({ col, row });
      } else {
        if (target.side !== piece.side) moves.push({ col, row });
        break;
      }
      col += dc;
      row += dr;
    }
  }
  return moves;
}

function getCannonMoves(
  piece: Piece,
  pieces: Piece[]
): Position[] {
  const moves: Position[] = [];
  const directions: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];

  for (const [dc, dr] of directions) {
    let col = piece.position.col + dc;
    let row = piece.position.row + dr;
    let jumped = false;

    while (isInBoard({ col, row })) {
      const target = getPieceAt(pieces, { col, row });
      if (!jumped) {
        if (!target) {
          moves.push({ col, row });
        } else {
          jumped = true;
        }
      } else {
        if (target) {
          if (target.side !== piece.side) moves.push({ col, row });
          break;
        }
      }
      col += dc;
      row += dr;
    }
  }
  return moves;
}

function getHorseMoves(piece: Piece, pieces: Piece[]): Position[] {
  const moves: Position[] = [];
  const candidates: [number, number, number, number][] = [
    [-2, -1, -1, 0], [-2, 1, -1, 0],
    [2, -1, 1, 0], [2, 1, 1, 0],
    [-1, -2, 0, -1], [1, -2, 0, -1],
    [-1, 2, 0, 1], [1, 2, 0, 1],
  ];

  for (const [dc, dr, bc, br] of candidates) {
    const target = { col: piece.position.col + dc, row: piece.position.row + dr };
    const block = { col: piece.position.col + bc, row: piece.position.row + br };
    if (!isInBoard(target)) continue;
    if (getPieceAt(pieces, block)) continue;
    const targetPiece = getPieceAt(pieces, target);
    if (!targetPiece || targetPiece.side !== piece.side) {
      moves.push(target);
    }
  }
  return moves;
}

function getElephantMoves(piece: Piece, pieces: Piece[]): Position[] {
  const moves: Position[] = [];
  const candidates: [number, number, number, number][] = [
    [-2, -2, -1, -1], [2, -2, 1, -1],
    [-2, 2, -1, 1], [2, 2, 1, 1],
  ];

  for (const [dc, dr, bc, br] of candidates) {
    const target = { col: piece.position.col + dc, row: piece.position.row + dr };
    const block = { col: piece.position.col + bc, row: piece.position.row + br };
    if (!isInBoard(target)) continue;
    if (hasCrossedRiver(piece.side, target)) continue;
    if (getPieceAt(pieces, block)) continue;
    const targetPiece = getPieceAt(pieces, target);
    if (!targetPiece || targetPiece.side !== piece.side) {
      moves.push(target);
    }
  }
  return moves;
}

function getAdvisorMoves(piece: Piece, pieces: Piece[]): Position[] {
  const moves: Position[] = [];
  const directions: [number, number][] = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
  for (const [dc, dr] of directions) {
    const target = { col: piece.position.col + dc, row: piece.position.row + dr };
    if (!isInPalace(piece.side, target)) continue;
    const targetPiece = getPieceAt(pieces, target);
    if (!targetPiece || targetPiece.side !== piece.side) {
      moves.push(target);
    }
  }
  return moves;
}

function getKingMoves(piece: Piece, pieces: Piece[]): Position[] {
  const moves: Position[] = [];
  const directions: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
  for (const [dc, dr] of directions) {
    const target = { col: piece.position.col + dc, row: piece.position.row + dr };
    if (!isInPalace(piece.side, target)) continue;
    const targetPiece = getPieceAt(pieces, target);
    if (!targetPiece || targetPiece.side !== piece.side) {
      moves.push(target);
    }
  }

  const otherSide: Side = piece.side === 'red' ? 'black' : 'red';
  const otherKing = pieces.find(
    p => (p.type === '帅' || p.type === '將') && p.side === otherSide
  );
  if (otherKing && otherKing.position.col === piece.position.col) {
    const minRow = Math.min(piece.position.row, otherKing.position.row);
    const maxRow = Math.max(piece.position.row, otherKing.position.row);
    let blocked = false;
    for (let r = minRow + 1; r < maxRow; r++) {
      if (getPieceAt(pieces, { col: piece.position.col, row: r })) {
        blocked = true;
        break;
      }
    }
    if (!blocked) moves.push(otherKing.position);
  }

  return moves;
}

function getPawnMoves(piece: Piece, pieces: Piece[]): Position[] {
  const moves: Position[] = [];
  const forward = piece.side === 'red' ? -1 : 1;
  const forwardPos = { col: piece.position.col, row: piece.position.row + forward };
  if (isInBoard(forwardPos)) {
    const target = getPieceAt(pieces, forwardPos);
    if (!target || target.side !== piece.side) moves.push(forwardPos);
  }

  if (hasCrossedRiver(piece.side, piece.position)) {
    for (const dc of [-1, 1]) {
      const sidePos = { col: piece.position.col + dc, row: piece.position.row };
      if (isInBoard(sidePos)) {
        const target = getPieceAt(pieces, sidePos);
        if (!target || target.side !== piece.side) moves.push(sidePos);
      }
    }
  }
  return moves;
}

export function getValidMoves(piece: Piece, pieces: Piece[]): Position[] {
  let moves: Position[];
  switch (piece.type) {
    case '车':
    case '車':
      moves = getLineMoves(piece, pieces, [[0, -1], [0, 1], [-1, 0], [1, 0]]);
      break;
    case '马':
    case '馬':
      moves = getHorseMoves(piece, pieces);
      break;
    case '相':
    case '象':
      moves = getElephantMoves(piece, pieces);
      break;
    case '仕':
    case '士':
      moves = getAdvisorMoves(piece, pieces);
      break;
    case '帅':
    case '將':
      moves = getKingMoves(piece, pieces);
      break;
    case '炮':
    case '砲':
      moves = getCannonMoves(piece, pieces);
      break;
    case '兵':
    case '卒':
      moves = getPawnMoves(piece, pieces);
      break;
    default:
      moves = [];
  }
  return moves;
}

const RED_NUM = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
const BLACK_NUM = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

function getColNotation(side: Side, col: number): string {
  const idx = side === 'red' ? 8 - col : col;
  return side === 'red' ? RED_NUM[idx] : BLACK_NUM[idx];
}

function getActionNotation(
  pieceType: PieceType,
  side: Side,
  from: Position,
  to: Position
): { action: string; num: string } {
  const isPawn = pieceType === '兵' || pieceType === '卒';
  const isHorse = pieceType === '马' || pieceType === '馬';
  const isElephant = pieceType === '相' || pieceType === '象';
  const isAdvisor = pieceType === '仕' || pieceType === '士';
  const diagonalPiece = isHorse || isElephant || isAdvisor;

  const forward = side === 'red' ? -1 : 1;
  let action: string;
  let num: string;

  if (from.row === to.row) {
    action = '平';
    num = getColNotation(side, to.col);
  } else if ((to.row - from.row) * forward > 0) {
    action = '进';
    if (isPawn || diagonalPiece) {
      num = getColNotation(side, to.col);
    } else {
      const steps = Math.abs(to.row - from.row);
      num = side === 'red' ? RED_NUM[steps - 1] : BLACK_NUM[steps - 1];
    }
  } else {
    action = '退';
    if (isPawn || diagonalPiece) {
      num = getColNotation(side, to.col);
    } else {
      const steps = Math.abs(to.row - from.row);
      num = side === 'red' ? RED_NUM[steps - 1] : BLACK_NUM[steps - 1];
    }
  }

  return { action, num };
}

export function generateNotation(
  pieceType: PieceType,
  side: Side,
  from: Position,
  to: Position
): string {
  const piece = pieceType;
  const col = getColNotation(side, from.col);
  const { action, num } = getActionNotation(pieceType, side, from, to);
  return `${piece}${col}${action}${num}`;
}

export function makeMove(
  pieces: Piece[],
  from: Position,
  to: Position
): { pieces: Piece[]; captured?: Piece; moved: Piece } {
  const newPieces = pieces.map(p => ({ ...p, position: { ...p.position } }));
  const movingPiece = newPieces.find(p => posEquals(p.position, from));
  const capturedPiece = newPieces.find(p => posEquals(p.position, to));

  if (!movingPiece) throw new Error('No piece at from position');

  const resultPieces = capturedPiece
    ? newPieces.filter(p => p.id !== capturedPiece.id)
    : newPieces;

  const finalPieces = resultPieces.map(p =>
    p.id === movingPiece.id ? { ...p, position: { ...to } } : p
  );

  const moved = finalPieces.find(p => p.id === movingPiece.id)!;

  return {
    pieces: finalPieces,
    captured: capturedPiece,
    moved
  };
}

export function exportToText(record: GameRecord): string {
  const lines: string[] = [];
  lines.push(`[标题] ${record.title}`);
  lines.push(`[红方] ${record.redPlayer}`);
  lines.push(`[黑方] ${record.blackPlayer}`);
  if (record.event) lines.push(`[赛事] ${record.event}`);
  if (record.date) lines.push(`[日期] ${record.date}`);
  if (record.result) lines.push(`[结果] ${record.result}`);
  lines.push('');

  let moveText = '';
  record.moves.forEach((move, idx) => {
    const step = Math.floor(idx / 2) + 1;
    if (idx % 2 === 0) {
      moveText += `${step}. ${move.notation} `;
    } else {
      moveText += `${move.notation}  `;
    }
    if (move.comment) {
      moveText += `{${move.comment}} `;
    }
    if ((idx + 1) % 6 === 0) {
      lines.push(moveText.trim());
      moveText = '';
    }
  });
  if (moveText.trim()) lines.push(moveText.trim());

  return lines.join('\n');
}

export function exportToPGN(record: GameRecord): string {
  const lines: string[] = [];
  lines.push(`[Event "${record.event || '个人对局'}"]`);
  lines.push(`[Site "本地"]`);
  lines.push(`[Date "${record.date || new Date(record.createdAt).toISOString().slice(0, 10)}"]`);
  lines.push(`[Round "1"]`);
  lines.push(`[White "${record.redPlayer}"]`);
  lines.push(`[Black "${record.blackPlayer}"]`);
  const resultMap: Record<string, string> = { '红胜': '1-0', '黑胜': '0-1', '和棋': '1/2-1/2', '': '*' };
  lines.push(`[Result "${resultMap[record.result] || '*'}"]`);
  lines.push('');

  let moveText = '';
  record.moves.forEach((move, idx) => {
    const step = Math.floor(idx / 2) + 1;
    if (idx % 2 === 0) {
      moveText += `${step}. ${move.notation} `;
    } else {
      moveText += `${move.notation}  `;
    }
    if (move.comment) {
      moveText += `{${move.comment}} `;
    }
  });
  moveText += resultMap[record.result] || '*';
  lines.push(moveText.trim());

  return lines.join('\n');
}

export function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export { isRedPiece, isBlackPiece, posEquals };
