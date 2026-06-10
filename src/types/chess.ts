export type RedPieceType = '帅' | '仕' | '相' | '马' | '车' | '炮' | '兵';
export type BlackPieceType = '將' | '士' | '象' | '馬' | '車' | '砲' | '卒';
export type PieceType = RedPieceType | BlackPieceType;

export type Side = 'red' | 'black';

export interface Position {
  col: number;
  row: number;
}

export interface Piece {
  id: string;
  type: PieceType;
  side: Side;
  position: Position;
}

export interface Move {
  id: string;
  stepNumber: number;
  side: Side;
  pieceType: PieceType;
  from: Position;
  to: Position;
  notation: string;
  capturedPiece?: PieceType;
  comment?: string;
  parentMoveId?: string;
  variations?: Move[][];
}

export type GameResult = '红胜' | '黑胜' | '和棋' | '';

export interface GameRecord {
  id: string;
  title: string;
  redPlayer: string;
  blackPlayer: string;
  event?: string;
  date?: string;
  result: GameResult;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  moves: Move[];
  initialBoard?: Piece[];
}

export interface BoardState {
  pieces: Piece[];
  currentSide: Side;
  moveHistory: Move[];
  currentMoveIndex: number;
  selectedPiece: Piece | null;
  validMoves: Position[];
  lastMove: { from: Position; to: Position } | null;
}

export const RED_PIECES: RedPieceType[] = ['帅', '仕', '相', '马', '车', '炮', '兵'];
export const BLACK_PIECES: BlackPieceType[] = ['將', '士', '象', '馬', '車', '砲', '卒'];

export function isRedPiece(type: PieceType): type is RedPieceType {
  return RED_PIECES.includes(type as RedPieceType);
}

export function isBlackPiece(type: PieceType): type is BlackPieceType {
  return BLACK_PIECES.includes(type as BlackPieceType);
}
