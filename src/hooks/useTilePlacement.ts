import { useState, useMemo, useCallback, useRef, useEffect } from "react"
import type { BoardState, Move, Position } from "@/board/types"
import type { Tile } from "@/types"

/**
 * Manages drag-and-drop tile placement state for pending moves.
 * Tracks tiles moved from rack to board without mutating the originals.
 */
export const useTilePlacement = (
  /** The current committed board state. */
  board: BoardState,
  /** The current rack tiles. */
  rack: Tile[],
) => {
  /** Map of "row-col" -> { tile, originalRackIndex } for pending placements. */
  const [placements, setPlacements] = useState<Map<string, PlacementEntry>>(new Map())

  /** Track previous board/rack references to reset on change. */
  const prevBoardRef = useRef(board)
  const prevRackRef = useRef(rack)

  useEffect(() => {
    if (prevBoardRef.current !== board || prevRackRef.current !== rack) {
      prevBoardRef.current = board
      prevRackRef.current = rack
      setPlacements(new Map())
    }
  }, [board, rack])

  /** Map of "row-col" -> Tile for placed tiles. */
  const placedTiles = useMemo(() => {
    const result = new Map<string, Tile>()
    for (const [key, entry] of placements) {
      result.set(key, entry.tile)
    }
    return result
  }, [placements])

  /** Board with pending placements overlaid. */
  const pendingBoard = useMemo((): BoardState => {
    const newBoard = board.map(row => [...row])
    for (const [key, entry] of placements) {
      const [row, col] = key.split("-").map(Number)
      newBoard[row][col] = entry.tile.letter
    }
    return newBoard
  }, [board, placements])

  /** Rack tiles with placed tiles removed. */
  const rackTiles = useMemo((): Tile[] => {
    /** Collect the original rack indices that have been placed. */
    const placedIndices = new Set<number>()
    for (const entry of placements.values()) {
      placedIndices.add(entry.originalRackIndex)
    }
    return rack.filter((_, i) => !placedIndices.has(i))
  }, [rack, placements])

  /** Place a tile from the current rackTiles onto the board. */
  const placeTile = useCallback(
    (
      /** Board position to place the tile. */
      position: Position,
      /** Index into the current rackTiles array (not the original rack). */
      tileIndex: number,
    ) => {
      const key = `${position.row}-${position.col}`

      /** Don't place on occupied squares or already-pending squares. */
      if (board[position.row][position.col] !== null) return
      if (placements.has(key)) return

      /** Compute remaining rack to find the actual tile at tileIndex. */
      const placedIndices = new Set<number>()
      for (const entry of placements.values()) {
        placedIndices.add(entry.originalRackIndex)
      }
      const remaining = rack
        .map((tile, i) => ({ tile, originalIndex: i }))
        .filter(({ originalIndex }) => !placedIndices.has(originalIndex))

      if (tileIndex < 0 || tileIndex >= remaining.length) return

      const { tile, originalIndex } = remaining[tileIndex]

      setPlacements(prev => {
        const next = new Map(prev)
        next.set(key, { tile, originalRackIndex: originalIndex })
        return next
      })
    },
    [board, rack, placements],
  )

  /** Recall a pending tile from the board back to the rack. */
  const recallTile = useCallback(
    (
      /** Board position to recall from. */
      position: Position,
    ) => {
      const key = `${position.row}-${position.col}`
      if (!placements.has(key)) return

      setPlacements(prev => {
        const next = new Map(prev)
        next.delete(key)
        return next
      })
    },
    [placements],
  )

  /** Recall all pending tiles back to the rack. */
  const recallAll = useCallback(() => {
    setPlacements(new Map())
  }, [])

  /** Get a Move object from the current placements, or null if none. */
  const getPendingMove = useCallback((): Move | null => {
    if (placements.size === 0) return null

    const move: Move = []
    for (const [key, entry] of placements) {
      const [row, col] = key.split("-").map(Number)
      move.push({ row, col, tile: entry.tile.letter })
    }
    return move
  }, [placements])

  return {
    placedTiles,
    pendingBoard,
    rackTiles,
    placeTile,
    recallTile,
    recallAll,
    getPendingMove,
  }
}

/** Internal tracking entry for a placed tile. */
type PlacementEntry = {
  /** The tile that was placed. */
  tile: Tile
  /** The index in the original rack array. */
  originalRackIndex: number
}
