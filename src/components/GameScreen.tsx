import { useState, useCallback, useEffect } from "react"
import { Board } from "./Board"
import { Rack } from "./Rack"
import { ScoreDisplay } from "./ScoreDisplay"
import { playMove } from "@/game/playMove"
import { passTurn } from "@/game/passTurn"
import { swapPlayerTiles } from "@/game/swapPlayerTiles"
import { chooseMove } from "@/ai/chooseMove"
import { usePersistedGameState } from "@/hooks/usePersistedGameState"
import {
  IconCheck,
  IconArrowsExchange,
  IconPlayerSkipForward,
  IconArrowsShuffle,
  IconArrowBack,
  IconX,
} from "@tabler/icons-react"
import type { Move, Position } from "@/board/types"
import type { Tile } from "@/types"

/** Main game view: board + rack + scoreboard + action buttons. Orchestrates turn flow. */
export const GameScreen = ({ playerNames = ["You", "Computer"] }: Props) => {
  const [gameState, setGameState] = usePersistedGameState(playerNames)
  const [placedTiles, setPlacedTiles] = useState<PlacedTile[]>([])
  const [swapMode, setSwapMode] = useState(false)
  const [swapSelection, setSwapSelection] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)
  const [rackOrder, setRackOrder] = useState<number[]>(() => Array.from({ length: 7 }, (_, i) => i))

  const currentPlayer = gameState.players[gameState.currentPlayerIndex]
  const isHumanTurn = gameState.currentPlayerIndex === 0
  const isGameOver = gameState.gameStatus === "finished"

  /** Get the rack tiles in the current display order. */
  const displayedRack: Tile[] = rackOrder
    .filter(i => i < currentPlayer.rack.length)
    .map(i => currentPlayer.rack[i])

  /** Reset rack order when the rack changes (new turn). */
  useEffect(() => {
    setRackOrder(Array.from({ length: currentPlayer.rack.length }, (_, i) => i))
  }, [currentPlayer.rack])

  /** Handle the computer's turn automatically. */
  useEffect(() => {
    if (isGameOver || isHumanTurn) return

    const timer = setTimeout(() => {
      const rack = currentPlayer.rack.map(t => t.letter)
      const move = chooseMove(gameState.board, rack)
      if (move) {
        try {
          setGameState(prev => playMove(prev, move))
        } catch {
          // If move fails, pass instead
          setGameState(prev => passTurn(prev))
        }
      } else {
        setGameState(prev => passTurn(prev))
      }
      setPlacedTiles([])
      setError(null)
    }, 500)

    return () => clearTimeout(timer)
  }, [gameState.currentPlayerIndex, isGameOver, isHumanTurn])

  /** Place a tile from the rack onto a board square. */
  const handleSquareClick = useCallback(
    (position: Position) => {
      if (!isHumanTurn || swapMode || isGameOver) return
      // Can't place on occupied squares
      if (gameState.board[position.row][position.col] !== null) return
      // Can't place if already placed a tile here
      if (placedTiles.some(t => t.row === position.row && t.col === position.col)) return
      // Find next unplaced tile from rack
      const placedIndices = new Set(placedTiles.map(t => t.rackIndex))
      const nextRackIndex = rackOrder.find(
        i => i < currentPlayer.rack.length && !placedIndices.has(i),
      )
      if (nextRackIndex === undefined) return

      const tile = currentPlayer.rack[nextRackIndex]
      setPlacedTiles(prev => [
        ...prev,
        { ...position, tile: tile.letter, rackIndex: nextRackIndex },
      ])
      setError(null)
    },
    [
      isHumanTurn,
      swapMode,
      isGameOver,
      gameState.board,
      placedTiles,
      rackOrder,
      currentPlayer.rack,
    ],
  )

  /** Commit the placed tiles as a move. */
  const handlePlay = useCallback(() => {
    if (placedTiles.length === 0) {
      setError("Place tiles on the board first")
      return
    }

    const move: Move = placedTiles.map(({ row, col, tile }) => ({ row, col, tile }))
    try {
      setGameState(prev => playMove(prev, move))
      setPlacedTiles([])
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid move")
    }
  }, [placedTiles])

  /** Pass the current turn. */
  const handlePass = useCallback(() => {
    setGameState(prev => passTurn(prev))
    setPlacedTiles([])
    setError(null)
    setSwapMode(false)
    setSwapSelection([])
  }, [])

  /** Toggle swap mode. */
  const handleSwap = useCallback(() => {
    setSwapMode(true)
    setSwapSelection([])
    setPlacedTiles([])
    setError(null)
  }, [])

  /** Cancel swap mode. */
  const handleCancelSwap = useCallback(() => {
    setSwapMode(false)
    setSwapSelection([])
  }, [])

  /** Confirm the swap. */
  const handleConfirmSwap = useCallback(() => {
    if (swapSelection.length === 0) {
      setError("Select tiles to swap")
      return
    }
    try {
      setGameState(prev => swapPlayerTiles(prev, swapSelection))
      setSwapMode(false)
      setSwapSelection([])
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Swap failed")
    }
  }, [swapSelection])

  /** Toggle tile selection for swap. */
  const handleTileSelect = useCallback((index: number) => {
    setSwapSelection(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index],
    )
  }, [])

  /** Return all pending tiles from the board back to the rack. */
  const handleRecall = useCallback(() => {
    setPlacedTiles([])
    setError(null)
  }, [])

  /** Shuffle the rack order (visual only). */
  const handleShuffle = useCallback(() => {
    setRackOrder(prev => {
      const shuffled = [...prev]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled
    })
  }, [])

  /** Build the effective board with tentatively placed tiles. */
  const effectiveBoard = gameState.board.map(row => [...row])
  for (const { row, col, tile } of placedTiles) {
    effectiveBoard[row][col] = tile
  }

  /** Highlighted squares are the ones with tentatively placed tiles. */
  const highlightedSquares: Position[] = placedTiles.map(({ row, col }) => ({ row, col }))

  /** Get the tiles to display in the rack (excluding placed ones). */
  const placedIndices = new Set(placedTiles.map(t => t.rackIndex))
  const rackTiles = displayedRack.filter((_, i) => {
    const originalIndex = rackOrder[i]
    return !placedIndices.has(originalIndex)
  })

  return (
    <div className="flex h-screen items-start justify-center bg-white p-6">
      <div className="flex flex-col items-center gap-4">
        {/* Score display + tiles remaining */}
        <ScoreDisplay
          players={gameState.players}
          currentPlayerIndex={isGameOver ? -1 : gameState.currentPlayerIndex}
          tilesInBag={gameState.tileBag.length}
          lastMove={gameState.moveHistory.at(-1)}
        />

        {/* Turn indicator */}
        {!isGameOver && (
          <p className="text-center text-sm text-neutral-500">
            {isHumanTurn ?
              `${currentPlayer.name === "You" ? "Your" : `${currentPlayer.name}'s`} turn`
            : `${currentPlayer.name}'s turn...`}
          </p>
        )}

        {isGameOver && <p className="text-center text-lg font-bold text-neutral-900">Game over!</p>}

        {/* Board */}
        <Board
          board={effectiveBoard}
          onSquareClick={handleSquareClick}
          highlightedSquares={highlightedSquares}
        />

        {/* Rack */}
        {isHumanTurn && !isGameOver && (
          <div className="flex justify-center">
            <Rack
              tiles={swapMode ? displayedRack : rackTiles}
              swapMode={swapMode}
              selectedIndices={swapSelection}
              onTileSelect={swapMode ? handleTileSelect : undefined}
            />
          </div>
        )}

        {/* Error display */}
        {error && (
          <div
            role="alert"
            className="rounded-md bg-neutral-100 px-3 py-2 text-sm text-neutral-700"
          >
            {error}
          </div>
        )}

        {/* Action buttons */}
        {isHumanTurn && !isGameOver && (
          <div className="flex gap-2">
            {swapMode ?
              <>
                <button
                  onClick={handleConfirmSwap}
                  className="flex flex-col items-center gap-1 rounded-md bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-neutral-700"
                >
                  <IconCheck size={20} />
                  Confirm swap
                </button>
                <button
                  onClick={handleCancelSwap}
                  className="flex flex-col items-center gap-1 rounded-md bg-neutral-100 px-4 py-2 font-medium text-neutral-700 hover:bg-neutral-200"
                >
                  <IconX size={20} />
                  Cancel
                </button>
              </>
            : <>
                <button
                  onClick={handlePlay}
                  className="flex flex-col items-center gap-1 rounded-md bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-neutral-700"
                >
                  <IconCheck size={20} />
                  Play
                </button>
                <button
                  onClick={handleSwap}
                  className="flex flex-col items-center gap-1 rounded-md bg-neutral-100 px-4 py-2 font-medium text-neutral-700 hover:bg-neutral-200"
                >
                  <IconArrowsExchange size={20} />
                  Swap
                </button>
                <button
                  onClick={handlePass}
                  className="flex flex-col items-center gap-1 rounded-md bg-neutral-100 px-4 py-2 font-medium text-neutral-700 hover:bg-neutral-200"
                >
                  <IconPlayerSkipForward size={20} />
                  Pass
                </button>
                {placedTiles.length > 0 ?
                  <button
                    onClick={handleRecall}
                    className="flex flex-col items-center gap-1 rounded-md bg-neutral-100 px-4 py-2 font-medium text-neutral-700 hover:bg-neutral-200"
                  >
                    <IconArrowBack size={20} />
                    Recall
                  </button>
                : <button
                    onClick={handleShuffle}
                    className="flex flex-col items-center gap-1 rounded-md bg-neutral-100 px-4 py-2 font-medium text-neutral-700 hover:bg-neutral-200"
                  >
                    <IconArrowsShuffle size={20} />
                    Shuffle
                  </button>
                }
              </>
            }
          </div>
        )}
      </div>
    </div>
  )
}

/** A tile that has been placed on the board but not yet committed. */
type PlacedTile = {
  row: number
  col: number
  tile: string
  rackIndex: number
}

type Props = {
  /** The names of the players. Defaults to ["You", "Computer"]. */
  playerNames?: string[]
}
