import { create } from 'zustand';
import type { Piece, PieceType, Position, Move, GameRecord, Side, GameResult, CurrentBranch, Branch } from '@/types/chess';
import { isKingPiece } from '@/types/chess';
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
  currentMainIndex: number;
  currentBranch: CurrentBranch | null;
  selectedPiece: Piece | null;
  validMoves: Position[];
  lastMove: { from: Position; to: Position } | null;
  gameRecord: GameRecord | null;
  isReplayMode: boolean;
  replaySpeed: number;
  isCreatingVariation: boolean;
  gameOver: boolean;

  resetGame: () => void;
  loadGame: (id: string) => void;
  selectPiece: (piece: Piece | null) => void;
  movePiece: (to: Position) => boolean;
  undoMove: () => void;
  redoMove: () => void;
  jumpToMainLine: (index: number) => void;
  jumpToBranch: (parentIndex: number, branchIndex: number, moveIndex: number) => void;
  goBackToMainLine: () => void;
  startVariation: () => void;
  cancelVariation: () => void;
  addComment: (moveId: string, comment: string) => void;
  setGameInfo: (info: Partial<Pick<GameRecord, 'title' | 'redPlayer' | 'blackPlayer' | 'event' | 'date' | 'result'>>) => void;
  saveCurrentGame: () => boolean;
  setReplayMode: (mode: boolean) => void;
  setReplaySpeed: (speed: number) => void;
  setResult: (result: GameResult) => void;
  getCurrentMovesPath: () => Move[];
  getCurrentMoveIndex: () => number;
  getTotalMovesInCurrentPath: () => number;
  getCurrentMove: () => Move | null;
  stepForward: () => void;
  stepBackward: () => void;
  stepToStart: () => void;
  stepToEnd: () => void;
}

function createEmptyMove(piece: Piece, from: Position, to: Position, notation: string, stepNum: number, captured?: PieceType): Move {
  return {
    id: generateId(),
    stepNumber: stepNum,
    side: piece.side,
    pieceType: piece.type,
    from,
    to,
    notation,
    capturedPiece: captured,
    variations: [],
  };
}

function rebuildBoard(
  moves: Move[],
  currentMainIndex: number,
  currentBranch: CurrentBranch | null
): { pieces: Piece[]; lastMove: GameState['lastMove']; side: Side } {
  let pieces = createInitialBoard();
  let lastMove: GameState['lastMove'] = null;
  let side: Side = 'red';

  for (let i = 0; i <= currentMainIndex && i < moves.length; i++) {
    const move = moves[i];
    const result = makeMove(pieces, move.from, move.to);
    pieces = result.pieces;
    lastMove = { from: move.from, to: move.to };
    side = move.side === 'red' ? 'black' : 'red';
  }

  if (currentBranch) {
    const parent = moves[currentBranch.parentMainIndex];
    if (parent && parent.variations[currentBranch.branchIndex]) {
      const branch = parent.variations[currentBranch.branchIndex];
      for (let i = 0; i <= currentBranch.moveIndex && i < branch.moves.length; i++) {
        const move = branch.moves[i];
        const result = makeMove(pieces, move.from, move.to);
        pieces = result.pieces;
        lastMove = { from: move.from, to: move.to };
        side = move.side === 'red' ? 'black' : 'red';
      }
    }
  }

  return { pieces, lastMove, side };
}

export const useGameStore = create<GameState>((set, get) => ({
  pieces: createInitialBoard(),
  currentSide: 'red',
  moves: [],
  currentMainIndex: -1,
  currentBranch: null,
  selectedPiece: null,
  validMoves: [],
  lastMove: null,
  gameRecord: null,
  isReplayMode: false,
  replaySpeed: 1,
  isCreatingVariation: false,
  gameOver: false,

  getCurrentMovesPath: () => {
    const state = get();
    const path: Move[] = [];
    for (let i = 0; i <= state.currentMainIndex && i < state.moves.length; i++) {
      path.push(state.moves[i]);
    }
    if (state.currentBranch) {
      const parent = state.moves[state.currentBranch.parentMainIndex];
      if (parent && parent.variations[state.currentBranch.branchIndex]) {
        const branch = parent.variations[state.currentBranch.branchIndex];
        for (let i = 0; i <= state.currentBranch.moveIndex && i < branch.moves.length; i++) {
          path.push(branch.moves[i]);
        }
      }
    }
    return path;
  },

  getCurrentMoveIndex: () => {
    const state = get();
    if (state.currentBranch) {
      return state.currentBranch.parentMainIndex + 1 + state.currentBranch.moveIndex;
    }
    return state.currentMainIndex;
  },

  getTotalMovesInCurrentPath: () => {
    return get().getCurrentMovesPath().length - 1;
  },

  getCurrentMove: () => {
    const path = get().getCurrentMovesPath();
    const idx = get().getCurrentMoveIndex();
    return idx >= 0 && idx < path.length ? path[idx] : null;
  },

  resetGame: () => {
    const now = Date.now();
    set({
      pieces: createInitialBoard(),
      currentSide: 'red',
      moves: [],
      currentMainIndex: -1,
      currentBranch: null,
      selectedPiece: null,
      validMoves: [],
      lastMove: null,
      isReplayMode: false,
      isCreatingVariation: false,
      gameOver: false,
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
    const { pieces, lastMove, side } = rebuildBoard(record.moves, record.moves.length - 1, null);
    set({
      pieces,
      currentSide: side,
      moves: record.moves,
      currentMainIndex: record.moves.length - 1,
      currentBranch: null,
      selectedPiece: null,
      validMoves: [],
      lastMove,
      gameRecord: record,
      isReplayMode: true,
      isCreatingVariation: false,
      gameOver: record.result !== '',
    });
  },

  selectPiece: (piece) => {
    const state = get();
    if (state.gameOver) return;
    if (state.isReplayMode && !state.isCreatingVariation) return;
    if (!piece) {
      set({ selectedPiece: null, validMoves: [] });
      return;
    }
    if (piece.side !== state.currentSide) return;
    const moves = getValidMoves(piece, state.pieces);
    set({ selectedPiece: piece, validMoves: moves });
  },

  movePiece: (to) => {
    const state = get();
    if (state.gameOver) return false;
    if (state.isReplayMode && !state.isCreatingVariation) return false;
    if (!state.selectedPiece) return false;

    const isValid = state.validMoves.some(m => posEquals(m, to));
    if (!isValid) return false;

    const piece = state.selectedPiece;
    const from = piece.position;
    const moveResult = makeMove(state.pieces, from, to);
    const notation = generateNotation(piece.type, piece.side, from, to);

    const path = state.getCurrentMovesPath();
    const newStep = path.length + 1;
    const newMove = createEmptyMove(piece, from, to, notation, newStep, moveResult.captured?.type);

    let newMoves = [...state.moves];
    let newMainIndex = state.currentMainIndex;
    let newBranch: CurrentBranch | null = state.currentBranch;

    if (state.isCreatingVariation && state.currentBranch) {
      const parentIdx = state.currentBranch.parentMainIndex;
      const branchIdx = state.currentBranch.branchIndex;
      const moveIdx = state.currentBranch.moveIndex + 1;

      newMoves = [...newMoves];
      const parent = { ...newMoves[parentIdx] };
      parent.variations = [...parent.variations];
      const branch = { ...parent.variations[branchIdx] };
      branch.moves = [...branch.moves];
      branch.moves.push(newMove);
      parent.variations[branchIdx] = branch;
      newMoves[parentIdx] = parent;

      newBranch = {
        parentMainIndex: parentIdx,
        branchIndex: branchIdx,
        moveIndex: moveIdx,
      };
    } else if (state.isCreatingVariation && !state.currentBranch) {
      const parentIdx = state.currentMainIndex;
      const parent = { ...newMoves[parentIdx] };
      const branchIdx = parent.variations.length;
      const newBranchObj: Branch = {
        id: generateId(),
        name: `变着 ${branchIdx + 1}`,
        moves: [newMove],
      };
      parent.variations = [...parent.variations, newBranchObj];
      newMoves[parentIdx] = parent;

      newBranch = {
        parentMainIndex: parentIdx,
        branchIndex: branchIdx,
        moveIndex: 0,
      };
    } else {
      const truncateTo = state.currentMainIndex + 1;
      newMoves = state.currentMainIndex < state.moves.length - 1
        ? state.moves.slice(0, truncateTo)
        : [...state.moves];
      newMoves.push(newMove);
      newMainIndex = newMoves.length - 1;
      newBranch = null;
    }

    let gameOver = state.gameOver;
    let gameResult: GameResult = state.gameRecord?.result || '';
    if (newMove.capturedPiece && isKingPiece(newMove.capturedPiece)) {
      gameOver = true;
      gameResult = newMove.side === 'red' ? '红胜' : '黑胜';
    }

    const { pieces: newPieces, lastMove, side } = rebuildBoard(newMoves, newMainIndex, newBranch);

    set({
      pieces: newPieces,
      currentSide: side,
      moves: newMoves,
      currentMainIndex: newMainIndex,
      currentBranch: newBranch,
      selectedPiece: null,
      validMoves: [],
      lastMove,
      gameOver,
      isCreatingVariation: false,
      gameRecord: state.gameRecord ? { ...state.gameRecord, result: gameResult } : null,
    });

    return true;
  },

  undoMove: () => {
    const state = get();
    if (state.gameOver) return;
    if (state.isReplayMode) return;
    if (state.currentBranch) return;
    if (state.currentMainIndex < 0) return;

    const newIndex = state.currentMainIndex - 1;
    const { pieces, lastMove, side } = rebuildBoard(state.moves, newIndex, null);
    set({
      pieces,
      currentSide: side,
      currentMainIndex: newIndex,
      selectedPiece: null,
      validMoves: [],
      lastMove,
    });
  },

  redoMove: () => {
    const state = get();
    if (state.gameOver) return;
    if (state.isReplayMode) return;
    if (state.currentBranch) return;
    if (state.currentMainIndex >= state.moves.length - 1) return;

    const newIndex = state.currentMainIndex + 1;
    const { pieces, lastMove, side } = rebuildBoard(state.moves, newIndex, null);
    set({
      pieces,
      currentSide: side,
      currentMainIndex: newIndex,
      selectedPiece: null,
      validMoves: [],
      lastMove,
    });
  },

  jumpToMainLine: (index) => {
    const state = get();
    if (index < -1 || index >= state.moves.length) return;
    const { pieces, lastMove, side } = rebuildBoard(state.moves, index, null);
    set({
      pieces,
      currentSide: side,
      currentMainIndex: index,
      currentBranch: null,
      selectedPiece: null,
      validMoves: [],
      lastMove,
      isCreatingVariation: false,
    });
  },

  jumpToBranch: (parentIndex, branchIndex, moveIndex) => {
    const state = get();
    const parent = state.moves[parentIndex];
    if (!parent || !parent.variations[branchIndex]) return;
    const branch = parent.variations[branchIndex];
    if (moveIndex < -1 || moveIndex >= branch.moves.length) return;

    if (moveIndex < 0) {
      state.jumpToMainLine(parentIndex);
      return;
    }

    const { pieces, lastMove, side } = rebuildBoard(
      state.moves,
      parentIndex,
      { parentMainIndex: parentIndex, branchIndex, moveIndex }
    );
    set({
      pieces,
      currentSide: side,
      currentMainIndex: parentIndex,
      currentBranch: { parentMainIndex: parentIndex, branchIndex, moveIndex },
      selectedPiece: null,
      validMoves: [],
      lastMove,
      isCreatingVariation: false,
    });
  },

  goBackToMainLine: () => {
    const state = get();
    if (state.currentBranch) {
      state.jumpToMainLine(state.currentBranch.parentMainIndex);
    }
  },

  startVariation: () => {
    const state = get();
    if (!state.isReplayMode) return;
    if (state.currentBranch) return;

    set({
      isCreatingVariation: true,
      selectedPiece: null,
      validMoves: [],
    });
  },

  cancelVariation: () => {
    set({ isCreatingVariation: false, selectedPiece: null, validMoves: [] });
  },

  stepForward: () => {
    const state = get();
    if (state.currentBranch) {
      const branch = state.moves[state.currentBranch.parentMainIndex]?.variations[state.currentBranch.branchIndex];
      if (branch && state.currentBranch.moveIndex < branch.moves.length - 1) {
        state.jumpToBranch(
          state.currentBranch.parentMainIndex,
          state.currentBranch.branchIndex,
          state.currentBranch.moveIndex + 1
        );
      }
    } else {
      if (state.currentMainIndex < state.moves.length - 1) {
        state.jumpToMainLine(state.currentMainIndex + 1);
      }
    }
  },

  stepBackward: () => {
    const state = get();
    if (state.currentBranch) {
      if (state.currentBranch.moveIndex > 0) {
        state.jumpToBranch(
          state.currentBranch.parentMainIndex,
          state.currentBranch.branchIndex,
          state.currentBranch.moveIndex - 1
        );
      } else {
        state.jumpToMainLine(state.currentBranch.parentMainIndex);
      }
    } else {
      if (state.currentMainIndex >= 0) {
        state.jumpToMainLine(state.currentMainIndex - 1);
      }
    }
  },

  stepToStart: () => {
    get().jumpToMainLine(-1);
  },

  stepToEnd: () => {
    const state = get();
    if (state.currentBranch) {
      const branch = state.moves[state.currentBranch.parentMainIndex]?.variations[state.currentBranch.branchIndex];
      if (branch) {
        state.jumpToBranch(
          state.currentBranch.parentMainIndex,
          state.currentBranch.branchIndex,
          branch.moves.length - 1
        );
      }
    } else {
      state.jumpToMainLine(state.moves.length - 1);
    }
  },

  addComment: (moveId, comment) => {
    const state = get();

    const updateMoveInMoves = (movesArr: Move[]): Move[] => {
      return movesArr.map(m => {
        if (m.id === moveId) {
          return { ...m, comment };
        }
        if (m.variations.length > 0) {
          return {
            ...m,
            variations: m.variations.map(branch => ({
              ...branch,
              moves: updateMoveInMoves(branch.moves)
            }))
          };
        }
        return m;
      });
    };

    const newMoves = updateMoveInMoves(state.moves);
    set({ moves: newMoves });
  },

  setGameInfo: (info) => {
    const state = get();
    if (!state.gameRecord) return;
    set({ gameRecord: { ...state.gameRecord, ...info } });
  },

  saveCurrentGame: (): boolean => {
    const state = get();
    if (!state.gameRecord) return false;
    const record: GameRecord = {
      ...state.gameRecord,
      moves: state.moves,
    };
    const success = saveGame(record);
    if (success) {
      set({ gameRecord: record });
    }
    return success;
  },

  setReplayMode: (mode) => {
    const state = get();
    if (mode && state.moves.length === 0) return;

    if (mode && state.gameOver) {
      const { pieces, lastMove, side } = rebuildBoard(state.moves, -1, null);
      set({
        isReplayMode: mode,
        isCreatingVariation: false,
        selectedPiece: null,
        validMoves: [],
        currentMainIndex: -1,
        currentBranch: null,
        pieces,
        lastMove,
        currentSide: side,
      });
    } else {
      set({
        isReplayMode: mode,
        isCreatingVariation: false,
        selectedPiece: null,
        validMoves: [],
      });
    }
  },

  setReplaySpeed: (speed) => set({ replaySpeed: speed }),

  setResult: (result) => {
    const state = get();
    if (!state.gameRecord) return;
    set({
      gameRecord: { ...state.gameRecord, result },
      gameOver: result !== '',
    });
  },
}));
