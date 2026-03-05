import { createEmptyBoard } from "../board/createEmptyBoard"
import type { BoardState, Move } from "../board/types"
import type { GameState, MoveRecord } from "../game/types"
import type { ScoredMove } from "../movegen/types"
import type { Tile } from "../types"
import { analyzeTurn } from "./analyzeTurn"
import type { GameAnalysis, PlayerSummary, TurnAnalysis } from "./types"

/** Default number of top moves to return per turn. */
const DEFAULT_TOP_N = 5

/** Threshold for counting a turn as a "worst miss". */
const WORST_MISS_THRESHOLD = 20

/**
 * Analyze a completed game by replaying each turn. For each human turn,
 * reconstructs the board state and rack, runs the move generator to find
 * top available moves, and compares with the actual move played.
 */
export const analyzeGame = (
  /** The final game state (must contain moveHistory and player info) */
  gameState: GameState,
  /** How many top moves to include per turn */
  topN: number = DEFAULT_TOP_N,
): GameAnalysis => {
  const { moveHistory, players } = gameState

  if (moveHistory.length === 0) {
    return {
      turns: [],
      playerSummaries: players.map(p => ({
        playerName: p.name,
        totalDifferential: 0,
        averageDifferential: 0,
        bestMoveCount: 0,
        worstMissCount: 0,
      })),
    }
  }

  // Reconstruct rack snapshots for each turn by working backwards
  const rackSnapshots = reconstructRacks(gameState)

  // Replay the board state forward, analyzing each turn
  let board: BoardState = createEmptyBoard()
  const cumulativeDifferentials = new Map<string, number>()
  for (const p of players) {
    cumulativeDifferentials.set(p.name, 0)
  }

  const turns: TurnAnalysis[] = []

  for (let i = 0; i < moveHistory.length; i++) {
    const record = moveHistory[i]
    const rack = rackSnapshots[i]
    const cumBefore = cumulativeDifferentials.get(record.player) ?? 0

    // Build the ScoredMove for what was actually played
    const movePlayed = buildScoredMove(record)

    const turnAnalysis = analyzeTurn(board, rack, movePlayed, i + 1, record.player, topN, cumBefore)

    cumulativeDifferentials.set(record.player, turnAnalysis.cumulativeDifferential)
    turns.push(turnAnalysis)

    // Advance the board state
    if (record.move) {
      board = applyMove(board, record.move)
    }
  }

  const playerSummaries = buildPlayerSummaries(
    turns,
    players.map(p => p.name),
  )

  return { turns, playerSummaries }
}

/**
 * Reconstruct the rack (as string[]) each player had at each turn by working
 * backwards from the final game state. Returns an array parallel to moveHistory.
 */
const reconstructRacks = (
  /** The final game state */
  gameState: GameState,
): string[][] => {
  const { moveHistory, players, tileBag } = gameState

  // Current rack state per player (we'll mutate copies as we work backwards)
  const currentRacks = new Map<string, string[]>()
  for (const p of players) {
    currentRacks.set(
      p.name,
      p.rack.map(t => t.letter),
    )
  }

  // Tiles remaining in the bag at the end (we'll push drawn tiles back)
  const bag = tileBag.map(t => t.letter)

  // Work backwards through moves to find rack at each turn
  const rackSnapshots: string[][] = new Array(moveHistory.length)

  for (let i = moveHistory.length - 1; i >= 0; i--) {
    const record = moveHistory[i]
    const rack = currentRacks.get(record.player)!

    if (record.actionType === "place" && record.move) {
      const tilesPlayed = record.move.map(t => t.tile)
      const tilesDrawn = tilesPlayed.length

      // The tiles drawn after this move are the last `tilesDrawn` tiles added to the rack.
      // We need to figure out which tiles were drawn. The drawn tiles replaced the played tiles.
      // After the move: rack = (rack_before - played) + drawn
      // So: rack_before = (rack - drawn) + played
      // The drawn tiles are the ones that came from the bag.
      // We remove `tilesDrawn` tiles from the current rack that aren't part of the
      // "pre-move rack minus played tiles" — we push them back to the bag.

      // Strategy: the drawn tiles are the newest additions. Since we don't track order,
      // we approximate by removing tiles from the rack that match what would have been drawn.
      // The tiles drawn = current rack - (pre-move rack - played tiles)
      // Since we don't know the pre-move rack, we use the bag to figure it out.

      // Simpler approach: remove `tilesDrawn` tiles from the end of bag (they were drawn),
      // then add the played tiles back to the rack.
      // Actually, working backwards: before this move, the bag had `tilesDrawn` more tiles
      // (the ones that were drawn after the move). Those tiles are now in the player's rack.
      // We need to identify which tiles in the current rack were drawn after this move.

      // Since tiles are drawn from the bag in order (first tiles in bag = first drawn),
      // and we're going backwards, the last tiles drawn are at the "top" of the bag.
      // We put tiles back: take `tilesDrawn` tiles from the rack and put them back in bag.

      // Which tiles to return to bag? The ones not part of the pre-existing rack.
      // We know the played tiles should be added back. So the pre-move rack is:
      // rack + played - drawn. We need to identify `drawn`.

      // For simplicity: the drawn tiles were the last ones added.
      // We remove from rack the tiles that match what would have been at the top of the bag.
      // But we don't know the bag order perfectly going backwards.

      // Pragmatic approach: just remove `tilesDrawn` count of tiles from rack
      // (preferring to remove tiles not in the played set), then add played tiles back.

      const rackCopy = [...rack]

      // Return drawn tiles to bag: remove `tilesDrawn` tiles from current rack
      // These are tiles that weren't in the rack before the move
      let remaining = tilesDrawn
      const removedIndices = new Set<number>()

      // First pass: remove tiles that weren't played (these are likely drawn)
      const playedSet = [...tilesPlayed]
      for (let j = rackCopy.length - 1; j >= 0 && remaining > 0; j--) {
        const idx = playedSet.indexOf(rackCopy[j])
        if (idx === -1) {
          // This tile wasn't played, so it might be a drawn replacement
          bag.push(rackCopy[j])
          removedIndices.add(j)
          remaining--
        } else {
          // Remove from playedSet so we don't double-match
          playedSet.splice(idx, 1)
        }
      }

      // If we still need to remove more (all remaining rack tiles matched played tiles)
      for (let j = rackCopy.length - 1; j >= 0 && remaining > 0; j--) {
        if (!removedIndices.has(j)) {
          bag.push(rackCopy[j])
          removedIndices.add(j)
          remaining--
        }
      }

      // Build the pre-move rack: remove drawn tiles, add back played tiles
      const preMoveRack = rackCopy.filter((_, j) => !removedIndices.has(j))
      preMoveRack.push(...tilesPlayed)

      rackSnapshots[i] = preMoveRack
      currentRacks.set(record.player, preMoveRack)
    } else {
      // Pass or exchange: rack didn't change (for pass)
      rackSnapshots[i] = [...rack]
    }
  }

  return rackSnapshots
}

/** Build a ScoredMove from a MoveRecord, or null for passes. */
const buildScoredMove = (
  /** The move record to convert */
  record: MoveRecord,
): ScoredMove | null => {
  if (record.actionType !== "place" || !record.move) {
    return null
  }
  // ScoredMove is Move (array) with score and words properties
  const move = [...record.move] as ScoredMove
  ;(move as any).score = record.score
  ;(move as any).words = record.words
  return move
}

/** Apply a move to the board, returning a new board. */
const applyMove = (
  /** The current board state */
  board: BoardState,
  /** The move to apply */
  move: Move,
): BoardState => {
  const newBoard = board.map(row => [...row])
  for (const { row, col, tile } of move) {
    newBoard[row][col] = tile
  }
  return newBoard
}

/** Build player summaries from the turn analyses. */
const buildPlayerSummaries = (
  /** All turn analyses */
  turns: TurnAnalysis[],
  /** Player names in order */
  playerNames: string[],
): PlayerSummary[] =>
  playerNames.map(name => {
    const playerTurns = turns.filter(t => t.playerName === name)
    const totalDifferential = playerTurns.reduce((sum, t) => sum + t.scoreDifferential, 0)
    const turnCount = playerTurns.length
    const averageDifferential = turnCount > 0 ? totalDifferential / turnCount : 0
    const bestMoveCount = playerTurns.filter(t => t.scoreDifferential === 0).length
    const worstMissCount = playerTurns.filter(
      t => t.scoreDifferential > WORST_MISS_THRESHOLD,
    ).length

    return {
      playerName: name,
      totalDifferential,
      averageDifferential,
      bestMoveCount,
      worstMissCount,
    }
  })
