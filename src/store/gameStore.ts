import { create } from 'zustand';
import type { Piece, Position, Move, GameRecord, Side, GameResult } from '@/types/chess';
import {
  createInitialBoard,
  getValidMoves,
  makeMove,
  generateNotation,
  generateId,
  posEquals
} from '@/utils/chess';
import { saveGame, getGameById } from '@/utils/storage';

interface GameState {
  pieces: Piece[];
  currentSide: Side;
  moves: Move[];
  currentMoveIndex: number;
  selectedPiece: Piece | null;
  validMoves: Position[];
  lastMove: { from: Position; to: Position } | null;
  gameRecord: GameRecord | null;
  isReplayMode: boolean;
  replaySpeed: number;

  resetGame: () => void;
  loadGame: (id: string) => void;
  selectPiece: (piece: Piece | null) => void;
  movePiece: (to: Position) => boolean;
  undoMove: () => void;
  redoMove: () => void;
  jumpToMove: (index: number) => void;
  addComment: (moveIndex: number, comment: string) => void;
  setGameInfo: (info: Partial<Pick<GameRecord, 'title' | 'redPlayer' | 'blackPlayer' | 'event' | 'date' | 'result'>>) => void;
  saveCurrentGame: () => void;
  setReplayMode: (mode: boolean) => void;
  setReplaySpeed: (speed: number) => void;
  setResult: (result: GameResult) => void;
}

function rebuildBoard(moves: Move[], upToIndex: number): { pieces: Piece[]; lastMove: GameState['lastMove'] } {
  let pieces = createInitialBoard();
  let lastMove: GameState['lastMove'] = null;
  for (let i = 0; i <= upToIndex && i < moves.length; i++) {
    const move = moves[i];
    const result = makeMove(pieces, move.from, move.to);
    pieces = result.pieces;
    lastMove = { from: move.from, to: move.to };
  }
  return { pieces, lastMove };
}

export const useGameStore = create<GameState>((set, get) => ({
  pieces: createInitialBoard(),
  currentSide: 'red',
  moves: [],
  currentMoveIndex: -1,
  selectedPiece: null,
  validMoves: [],
  lastMove: null,
  gameRecord: null,
  isReplayMode: false,
  replaySpeed: 1,

  resetGame: () => {
    const now = Date.now();
    set({
      pieces: createInitialBoard(),
      currentSide: 'red',
      moves: [],
      currentMoveIndex: -1,
      selectedPiece: null,
      validMoves: [],
      lastMove: null,
      isReplayMode: false,
      gameRecord: {
        id: generateId(),
        title: '新建对局',
        redPlayer: '红方',
        blackPlayer: '黑方',
        result: '',
        createdAt: now,
        updatedAt: now,
        tags: [],
        moves: [],
      }
    });
  },

  loadGame: (id: string) => {
    const record = getGameById(id);
    if (!record) return;
    const { pieces, lastMove } = rebuildBoard(record.moves, record.moves.length - 1);
    set({
      pieces,
      currentSide: record.moves.length % 2 === 0 ? 'red' : 'black',
      moves: record.moves,
      currentMoveIndex: record.moves.length - 1,
      selectedPiece: null,
      validMoves: [],
      lastMove,
      gameRecord: record,
      isReplayMode: true,
    });
  },

  selectPiece: (piece) => {
    if (!piece) {
      set({ selectedPiece: null, validMoves: [] });
      return;
    }
    const state = get();
    if (state.isReplayMode) return;
    if (piece.side !== state.currentSide) return;
    const moves = getValidMoves(piece, state.pieces);
    set({ selectedPiece: piece, validMoves: moves });
  },

  movePiece: (to) => {
    const state = get();
    if (state.isReplayMode) return false;
    if (!state.selectedPiece) return false;

    const isValid = state.validMoves.some(m => posEquals(m, to));
    if (!isValid) return false;

    const piece = state.selectedPiece;
    const from = piece.position;
    const result = makeMove(state.pieces, from, to);
    const notation = generateNotation(piece.type, piece.side, from, to);

    const newMove: Move = {
      id: generateId(),
      stepNumber: state.moves.length + 1,
      side: piece.side,
      pieceType: piece.type,
      from,
      to,
      notation,
      capturedPiece: result.captured?.type,
    };

    const newMoves = state.currentMoveIndex < state.moves.length - 1
      ? state.moves.slice(0, state.currentMoveIndex + 1)
      : [...state.moves];
    newMoves.push(newMove);

    set({
      pieces: result.pieces,
      currentSide: state.currentSide === 'red' ? 'black' : 'red',
      moves: newMoves,
      currentMoveIndex: newMoves.length - 1,
      selectedPiece: null,
      validMoves: [],
      lastMove: { from, to },
    });
    return true;
  },

  undoMove: () => {
    const state = get();
    if (state.isReplayMode) return;
    if (state.currentMoveIndex < 0) return;
    const newIndex = state.currentMoveIndex - 1;
    const { pieces, lastMove } = rebuildBoard(state.moves, newIndex);
    set({
      pieces,
      currentSide: (newIndex + 1) % 2 === 0 ? 'red' : 'black',
      currentMoveIndex: newIndex,
      selectedPiece: null,
      validMoves: [],
      lastMove,
    });
  },

  redoMove: () => {
    const state = get();
    if (state.isReplayMode) return;
    if (state.currentMoveIndex >= state.moves.length - 1) return;
    const newIndex = state.currentMoveIndex + 1;
    const { pieces, lastMove } = rebuildBoard(state.moves, newIndex);
    set({
      pieces,
      currentSide: (newIndex + 1) % 2 === 0 ? 'red' : 'black',
      currentMoveIndex: newIndex,
      selectedPiece: null,
      validMoves: [],
      lastMove,
    });
  },

  jumpToMove: (index) => {
    const state = get();
    if (index < -1 || index >= state.moves.length) return;
    const { pieces, lastMove } = rebuildBoard(state.moves, index);
    set({
      pieces,
      currentSide: (index + 1) % 2 === 0 ? 'red' : 'black',
      currentMoveIndex: index,
      selectedPiece: null,
      validMoves: [],
      lastMove,
    });
  },

  addComment: (moveIndex, comment) => {
    const state = get();
    const newMoves = [...state.moves];
    if (newMoves[moveIndex]) {
      newMoves[moveIndex] = { ...newMoves[moveIndex], comment };
      set({ moves: newMoves });
    }
  },

  setGameInfo: (info) => {
    const state = get();
    if (!state.gameRecord) return;
    set({ gameRecord: { ...state.gameRecord, ...info } });
  },

  saveCurrentGame: () => {
    const state = get();
    if (!state.gameRecord) return;
    const record: GameRecord = {
      ...state.gameRecord,
      moves: state.moves,
    };
    saveGame(record);
    set({ gameRecord: record });
  },

  setReplayMode: (mode) => set({ isReplayMode: mode }),
  setReplaySpeed: (speed) => set({ replaySpeed: speed }),

  setResult: (result) => {
    const state = get();
    if (!state.gameRecord) return;
    set({ gameRecord: { ...state.gameRecord, result } });
  },
}));
