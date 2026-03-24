export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export const SHAPES: Record<TetrominoType, number[][]> = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]],
};

export const COLORS: Record<TetrominoType, string> = {
  I: '#00CFCF',
  O: '#CFAF00',
  T: '#9900CF',
  S: '#00CF00',
  Z: '#CF0000',
  J: '#2255CF',
  L: '#CF7F00',
};

export const PIECES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

export const getSpeed = (level: number): number => {
  const speeds: Record<number, number> = {
    1: 800, 2: 720, 3: 630, 4: 550, 5: 470,
    6: 380, 7: 300, 8: 220, 9: 130, 10: 100,
  };
  return speeds[Math.min(level, 10)] ?? 100;
};

export const getLineScore = (lines: number, level: number): number => {
  const base = [0, 100, 300, 500, 800][lines] ?? 0;
  return base * level;
};
