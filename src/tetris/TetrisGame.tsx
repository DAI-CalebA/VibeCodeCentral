import React, { useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, SafeAreaView, StatusBar,
} from 'react-native';
import { useTetris } from './useTetris';
import { COLORS, SHAPES, TetrominoType, BOARD_WIDTH, BOARD_HEIGHT } from './constants';

const { width: W, height: H } = Dimensions.get('window');

// Cell size: fit board within 85% of screen height, 55% of screen width, max 50px
const CELL_SIZE = Math.min(
  Math.floor((H * 0.85) / BOARD_HEIGHT),
  Math.floor((W * 0.55) / BOARD_WIDTH),
  50,
);
const MINI = Math.round(CELL_SIZE * 0.65);
const BOARD_PX_W = CELL_SIZE * BOARD_WIDTH;
const BOARD_PX_H = CELL_SIZE * BOARD_HEIGHT;
const SIDE_W = CELL_SIZE * 5;
const BTN = Math.round(CELL_SIZE * 1.6);

type DisplayCell = { color: string; ghost?: boolean } | null;

// ─── Preview box for held / next piece ──────────────────────────────────────
const PiecePreview = ({
  type, label, dimmed,
}: { type: TetrominoType | null; label: string; dimmed?: boolean }) => {
  const shape = type ? SHAPES[type] : null;
  const color = type ? COLORS[type] : null;
  const offsetR = shape ? Math.floor((4 - shape.length) / 2) : 0;
  const offsetC = shape ? Math.floor((4 - shape[0].length) / 2) : 0;

  return (
    <View style={preview.box}>
      <Text style={preview.label}>{label}</Text>
      <View style={{ width: MINI * 4, height: MINI * 4 }}>
        {Array.from({ length: 4 }).map((_, r) => (
          <View key={r} style={{ flexDirection: 'row' }}>
            {Array.from({ length: 4 }).map((_, c) => {
              const pr = r - offsetR;
              const pc = c - offsetC;
              const filled =
                shape &&
                pr >= 0 && pr < shape.length &&
                pc >= 0 && pc < shape[pr].length &&
                shape[pr][pc] === 1;
              return (
                <View
                  key={c}
                  style={{
                    width: MINI,
                    height: MINI,
                    backgroundColor: filled && color
                      ? (dimmed ? `${color}55` : color)
                      : 'transparent',
                    borderWidth: filled ? 1 : 0,
                    borderColor: '#ffffff33',
                  }}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

// ─── Main game component ────────────────────────────────────────────────────
export const TetrisGame: React.FC = () => {
  const {
    board, current, next, held, canHold,
    score, lines, level, gameOver, started, ghost,
    startGame, moveLeft, moveRight, rotate, softDrop, hardDrop, holdPiece,
  } = useTetris();

  // Merge board + ghost + current into a single display grid
  const displayBoard = useMemo<DisplayCell[][]>(() => {
    const d: DisplayCell[][] = board.map(row =>
      row.map(cell => (cell ? { color: COLORS[cell] } : null))
    );

    // Ghost
    if (current && ghost !== null && ghost !== current.y) {
      current.shape.forEach((row, r) =>
        row.forEach((v, c) => {
          if (!v) return;
          const ny = ghost + r;
          const nx = current.x + c;
          if (ny >= 0 && ny < BOARD_HEIGHT && nx >= 0 && nx < BOARD_WIDTH && !d[ny][nx])
            d[ny][nx] = { color: COLORS[current.type], ghost: true };
        })
      );
    }

    // Current piece
    if (current) {
      current.shape.forEach((row, r) =>
        row.forEach((v, c) => {
          if (!v) return;
          const ny = current.y + r;
          const nx = current.x + c;
          if (ny >= 0 && ny < BOARD_HEIGHT && nx >= 0 && nx < BOARD_WIDTH)
            d[ny][nx] = { color: COLORS[current.type] };
        })
      );
    }

    return d;
  }, [board, current, ghost]);

  return (
    <SafeAreaView style={s.root}>
      <StatusBar hidden />

      <View style={s.gameArea}>

        {/* ── Left panel: HOLD + stats ── */}
        <View style={[s.side, { width: SIDE_W }]}>
          <PiecePreview type={held} label="HOLD" dimmed={!canHold} />
          <View style={s.stats}>
            <Text style={s.statLabel}>SCORE</Text>
            <Text style={s.statValue}>{score}</Text>
            <Text style={s.statLabel}>LEVEL</Text>
            <Text style={s.statValue}>{level}</Text>
            <Text style={s.statLabel}>LINES</Text>
            <Text style={s.statValue}>{lines}</Text>
          </View>
        </View>

        {/* ── Board ── */}
        <View style={{ position: 'relative' }}>
          <View style={[s.board, { width: BOARD_PX_W, height: BOARD_PX_H }]}>
            {displayBoard.map((row, r) => (
              <View key={r} style={{ flexDirection: 'row' }}>
                {row.map((cell, c) => (
                  <View
                    key={c}
                    style={{
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      backgroundColor: cell
                        ? `${cell.color}${cell.ghost ? '40' : 'FF'}`
                        : '#0d0d1a',
                      borderWidth: 0.5,
                      borderColor: cell && !cell.ghost ? '#ffffff1a' : '#ffffff08',
                    }}
                  />
                ))}
              </View>
            ))}
          </View>

          {(!started || gameOver) && (
            <View style={s.overlay}>
              <Text style={s.overlayTitle}>{gameOver ? 'GAME OVER' : 'TETRIS'}</Text>
              {gameOver && <Text style={s.overlayScore}>Score: {score}</Text>}
              <TouchableOpacity style={s.startBtn} onPress={startGame}>
                <Text style={s.startBtnText}>{gameOver ? 'PLAY AGAIN' : 'START GAME'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── Right panel: NEXT + controls ── */}
        <View style={[s.side, { width: SIDE_W }]}>
          <PiecePreview type={next} label="NEXT" />

          <View style={s.controls}>
            {/* Row 1: move left | rotate | move right */}
            <View style={s.row}>
              <Btn label="◄" onPress={moveLeft} size={BTN} />
              <Btn label="↻" onPress={rotate} size={BTN} />
              <Btn label="►" onPress={moveRight} size={BTN} />
            </View>

            {/* Row 2: soft drop | hard drop */}
            <View style={s.row}>
              <Btn label="▼" onPress={softDrop} size={BTN} />
              <Btn label="⤓ DROP" onPress={hardDrop} size={BTN * 2.1} accent />
            </View>

            {/* Row 3: hold */}
            <View style={s.row}>
              <Btn
                label="HOLD"
                onPress={holdPiece}
                size={BTN * 3.3}
                disabled={!canHold}
              />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

// ─── Small button component ─────────────────────────────────────────────────
const Btn = ({
  label, onPress, size, accent, disabled,
}: {
  label: string;
  onPress: () => void;
  size: number;
  accent?: boolean;
  disabled?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={{
      width: size,
      height: BTN,
      backgroundColor: accent ? '#3355cc' : '#1e1e3a',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: accent ? '#5577ff' : '#333355',
      justifyContent: 'center',
      alignItems: 'center',
      opacity: disabled ? 0.35 : 1,
    }}
  >
    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>{label}</Text>
  </TouchableOpacity>
);

// ─── Styles ─────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#080814',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameArea: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  side: {
    alignItems: 'center',
    gap: 20,
    paddingTop: 4,
  },
  board: {
    borderWidth: 2,
    borderColor: '#33334a',
    backgroundColor: '#0d0d1a',
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#080814CC',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  overlayTitle: {
    color: '#ffffff',
    fontSize: 40,
    fontWeight: 'bold',
    letterSpacing: 6,
  },
  overlayScore: {
    color: '#aaaacc',
    fontSize: 22,
  },
  startBtn: {
    backgroundColor: '#3355cc',
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#5577ff',
  },
  startBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  stats: {
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    color: '#5555aa',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  statValue: {
    color: '#eeeeff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  controls: {
    gap: 10,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
});

const preview = StyleSheet.create({
  box: {
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#33334a',
    borderRadius: 6,
    backgroundColor: '#0d0d1a',
    width: SIDE_W - 8,
  },
  label: {
    color: '#5555aa',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
});
