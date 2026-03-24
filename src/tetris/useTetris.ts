import { useState, useEffect, useCallback, useRef } from 'react';
import {
  createBoard, randomType, spawnPiece, rotateCW, isValid,
  ghostY, lockPiece, clearLines, Board, ActivePiece,
} from './logic';
import { TetrominoType, getSpeed, getLineScore } from './constants';

export interface TetrisState {
  board: Board;
  current: ActivePiece | null;
  next: TetrominoType;
  held: TetrominoType | null;
  canHold: boolean;
  score: number;
  lines: number;
  level: number;
  gameOver: boolean;
  started: boolean;
}

const init = (): TetrisState => ({
  board: createBoard(),
  current: null,
  next: randomType(),
  held: null,
  canHold: true,
  score: 0,
  lines: 0,
  level: 1,
  gameOver: false,
  started: false,
});

const lockAndSpawn = (state: TetrisState, piece: ActivePiece): TetrisState => {
  const locked = lockPiece(state.board, piece);
  const { board, count } = clearLines(locked);
  const lines = state.lines + count;
  const level = Math.min(Math.floor(lines / 10) + 1, 10);
  const score = state.score + getLineScore(count, state.level);
  const current = spawnPiece(state.next);
  const next = randomType();
  if (!isValid(board, current.shape, current.x, current.y)) {
    return { ...state, board, current: null, score, lines, level, gameOver: true };
  }
  return { ...state, board, current, next, canHold: true, score, lines, level };
};

export const useTetris = () => {
  const [state, setState] = useState<TetrisState>(init);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startGame = useCallback(() => {
    setState({
      board: createBoard(),
      current: spawnPiece(randomType()),
      next: randomType(),
      held: null,
      canHold: true,
      score: 0,
      lines: 0,
      level: 1,
      gameOver: false,
      started: true,
    });
  }, []);

  const tick = useCallback(() => {
    setState(prev => {
      if (!prev.current || prev.gameOver) return prev;
      if (isValid(prev.board, prev.current.shape, prev.current.x, prev.current.y + 1)) {
        return { ...prev, current: { ...prev.current, y: prev.current.y + 1 } };
      }
      return lockAndSpawn(prev, prev.current);
    });
  }, []);

  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (!state.started || state.gameOver) return;
    tickRef.current = setInterval(tick, getSpeed(state.level));
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.started, state.gameOver, state.level, tick]);

  const moveLeft = useCallback(() => setState(prev => {
    if (!prev.current || prev.gameOver) return prev;
    if (isValid(prev.board, prev.current.shape, prev.current.x - 1, prev.current.y))
      return { ...prev, current: { ...prev.current, x: prev.current.x - 1 } };
    return prev;
  }), []);

  const moveRight = useCallback(() => setState(prev => {
    if (!prev.current || prev.gameOver) return prev;
    if (isValid(prev.board, prev.current.shape, prev.current.x + 1, prev.current.y))
      return { ...prev, current: { ...prev.current, x: prev.current.x + 1 } };
    return prev;
  }), []);

  const rotate = useCallback(() => setState(prev => {
    if (!prev.current || prev.gameOver) return prev;
    const shape = rotateCW(prev.current.shape);
    // Try wall kicks: no kick, left, right, far left, far right
    for (const dx of [0, -1, 1, -2, 2]) {
      if (isValid(prev.board, shape, prev.current.x + dx, prev.current.y))
        return { ...prev, current: { ...prev.current, shape, x: prev.current.x + dx } };
    }
    return prev;
  }), []);

  const softDrop = useCallback(() => setState(prev => {
    if (!prev.current || prev.gameOver) return prev;
    if (isValid(prev.board, prev.current.shape, prev.current.x, prev.current.y + 1))
      return { ...prev, current: { ...prev.current, y: prev.current.y + 1 }, score: prev.score + 1 };
    return lockAndSpawn(prev, prev.current);
  }), []);

  const hardDrop = useCallback(() => setState(prev => {
    if (!prev.current || prev.gameOver) return prev;
    let dy = 0;
    while (isValid(prev.board, prev.current.shape, prev.current.x, prev.current.y + dy + 1)) dy++;
    const dropped = { ...prev.current, y: prev.current.y + dy };
    return lockAndSpawn({ ...prev, score: prev.score + dy * 2 }, dropped);
  }), []);

  const holdPiece = useCallback(() => setState(prev => {
    if (!prev.current || !prev.canHold || prev.gameOver) return prev;
    const swapType = prev.held ?? prev.next;
    const next = prev.held ? prev.next : randomType();
    const current = spawnPiece(swapType);
    if (!isValid(prev.board, current.shape, current.x, current.y)) return prev;
    return { ...prev, current, next, held: prev.current.type, canHold: false };
  }), []);

  const ghost = state.current ? ghostY(state.board, state.current) : null;

  return { ...state, ghost, startGame, moveLeft, moveRight, rotate, softDrop, hardDrop, holdPiece };
};
