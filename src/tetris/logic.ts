import { BOARD_WIDTH, BOARD_HEIGHT, SHAPES, PIECES, TetrominoType } from './constants';

export type Cell = TetrominoType | null;
export type Board = Cell[][];

export interface ActivePiece {
  type: TetrominoType;
  shape: number[][];
  x: number;
  y: number;
}

export const createBoard = (): Board =>
  Array.from({ length: BOARD_HEIGHT }, () => new Array<Cell>(BOARD_WIDTH).fill(null));

export const randomType = (): TetrominoType =>
  PIECES[Math.floor(Math.random() * PIECES.length)];

export const spawnPiece = (type: TetrominoType): ActivePiece => {
  const shape = SHAPES[type];
  return {
    type,
    shape,
    x: Math.floor((BOARD_WIDTH - shape[0].length) / 2),
    y: 0,
  };
};

// Clockwise rotation
export const rotateCW = (shape: number[][]): number[][] => {
  const rows = shape.length;
  const cols = shape[0].length;
  return Array.from({ length: cols }, (_, c) =>
    Array.from({ length: rows }, (_, r) => shape[rows - 1 - r][c])
  );
};

export const isValid = (
  board: Board,
  shape: number[][],
  x: number,
  y: number,
): boolean => {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nx = x + c;
      const ny = y + r;
      if (nx < 0 || nx >= BOARD_WIDTH || ny >= BOARD_HEIGHT) return false;
      if (ny >= 0 && board[ny][nx] !== null) return false;
    }
  }
  return true;
};

export const ghostY = (board: Board, piece: ActivePiece): number => {
  let dy = 0;
  while (isValid(board, piece.shape, piece.x, piece.y + dy + 1)) dy++;
  return piece.y + dy;
};

export const lockPiece = (board: Board, piece: ActivePiece): Board => {
  const next = board.map(row => [...row]) as Board;
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (!piece.shape[r][c]) continue;
      const ny = piece.y + r;
      const nx = piece.x + c;
      if (ny >= 0 && ny < BOARD_HEIGHT) next[ny][nx] = piece.type;
    }
  }
  return next;
};

export const clearLines = (board: Board): { board: Board; count: number } => {
  const kept = board.filter(row => row.some(cell => cell === null));
  const count = BOARD_HEIGHT - kept.length;
  const empty = Array.from({ length: count }, () => new Array<Cell>(BOARD_WIDTH).fill(null));
  return { board: [...empty, ...kept] as Board, count };
};
