import { useState, useCallback, useRef, useEffect } from "react"
import { chooseMove } from "@/ai/chooseMove"
import type { Difficulty } from "@/ai/chooseMove"
import type { BoardState } from "@/board/types"
import type { ScoredMove } from "@/movegen/types"

/** Orchestrate the computer's turn: thinking delay, move computation, and tile-by-tile reveal. */
export const useComputerTurn = (
  /** The current board state */
  board: BoardState,
  /** Array of tile letters in the computer's rack */
  rack: string[],
  /** Difficulty level for move selection */
  difficulty: Difficulty,
  /** Called with the chosen move (or null) after all tiles are revealed */
  onComplete: (move: ScoredMove | null) => void,
) => {
  const [isThinking, setIsThinking] = useState(false)
  const [currentMove, setCurrentMove] = useState<ScoredMove | null>(null)
  const [revealedTiles, setRevealedTiles] = useState<RevealedTile[]>([])
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  /** Clear all pending timers. */
  const clearTimers = useCallback(() => {
    for (const timer of timersRef.current) {
      clearTimeout(timer)
    }
    timersRef.current = []
  }, [])

  /** Clean up timers on unmount. */
  useEffect(() => {
    return () => clearTimers()
  }, [clearTimers])

  /** Kick off the computer's turn sequence. */
  const triggerTurn = useCallback(() => {
    clearTimers()
    setIsThinking(true)
    setCurrentMove(null)
    setRevealedTiles([])

    // Thinking delay
    const thinkingTimer = setTimeout(() => {
      const move = chooseMove(board, rack, difficulty)
      setCurrentMove(move)
      setIsThinking(false)

      if (move === null || move.length === 0) {
        // No move: wait 500ms then complete
        const completeTimer = setTimeout(() => {
          onCompleteRef.current(null)
        }, 500)
        timersRef.current.push(completeTimer)
        return
      }

      // Reveal first tile immediately
      setRevealedTiles([{ row: move[0].row, col: move[0].col, tile: move[0].tile }])

      // Reveal remaining tiles at 200ms intervals
      for (let i = 1; i < move.length; i++) {
        const revealTimer = setTimeout(() => {
          setRevealedTiles(prev => [
            ...prev,
            { row: move[i].row, col: move[i].col, tile: move[i].tile },
          ])
        }, i * 200)
        timersRef.current.push(revealTimer)
      }

      // Call onComplete 500ms after last tile
      const completeTimer = setTimeout(
        () => {
          onCompleteRef.current(move)
        },
        (move.length - 1) * 200 + 500,
      )
      timersRef.current.push(completeTimer)
    }, 800)
    timersRef.current.push(thinkingTimer)
  }, [board, rack, difficulty, clearTimers])

  return { isThinking, currentMove, revealedTiles, triggerTurn }
}

/** A tile that has been revealed during the computer's turn animation. */
type RevealedTile = {
  /** Row index */
  row: number
  /** Column index */
  col: number
  /** The tile letter */
  tile: string
}
