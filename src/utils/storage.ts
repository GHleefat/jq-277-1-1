import type { GameRecord } from '@/types/chess';

const STORAGE_KEY = 'xiangqi_games_v1';

export function getAllGames(): GameRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('读取棋谱失败', e);
    return [];
  }
}

export function getGameById(id: string): GameRecord | undefined {
  return getAllGames().find(g => g.id === id);
}

export function saveGame(game: GameRecord): boolean {
  try {
    const games = getAllGames();
    const idx = games.findIndex(g => g.id === game.id);
    game.updatedAt = Date.now();
    if (idx >= 0) {
      games[idx] = game;
    } else {
      game.createdAt = Date.now();
      games.unshift(game);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
    return true;
  } catch (e) {
    console.error('保存棋谱失败', e);
    return false;
  }
}

export function deleteGame(id: string): void {
  const games = getAllGames().filter(g => g.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

export function duplicateGame(id: string): GameRecord | undefined {
  const original = getGameById(id);
  if (!original) return undefined;
  const copy: GameRecord = {
    ...original,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: `${original.title} (副本)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    moves: JSON.parse(JSON.stringify(original.moves)),
  };
  saveGame(copy);
  return copy;
}
