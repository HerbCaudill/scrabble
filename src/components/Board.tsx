import { cn } from "@/lib/utils"
import { Square } from "./Square"
import type { BoardState, Position } from "@/board/types"

/** 15x15 Scrabble board grid showing multiplier squares and placed tiles. */
export const Board = ({ board, onSquareClick, highlightedSquares }: Props) => {
  /** Set of "row-col" keys for O(1) highlight lookup. */
  const highlightSet = new Set(highlightedSquares?.map(({ row, col }) => `${row}-${col}`))

  return (
    <div
      className={cn(
        "grid aspect-square w-full max-w-[min(100vw,100vh)]",
        "grid-cols-[repeat(15,1fr)] grid-rows-[repeat(15,1fr)]",
        "overflow-hidden rounded-md border-2 border-amber-900/40 bg-amber-900/30",
      )}
    >
      {board.map((row, rowIndex) =>
        row.map((tile, colIndex) => (
          <Square
            key={`${rowIndex}-${colIndex}`}
            row={rowIndex}
            col={colIndex}
            tile={tile}
            highlighted={highlightSet.has(`${rowIndex}-${colIndex}`)}
            onClick={
              onSquareClick ? () => onSquareClick({ row: rowIndex, col: colIndex }) : undefined
            }
          />
        )),
      )}
    </div>
  )
}

type Props = {
  /** The current board state (15x15 grid of letters or nulls). */
  board: BoardState
  /** Handler called when a square is clicked. */
  onSquareClick?: (position: Position) => void
  /** Squares to visually highlight (e.g. for showing the last move). */
  highlightedSquares?: Position[]
}
