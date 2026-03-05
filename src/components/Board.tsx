import { cn } from "@/lib/utils"
import { Square } from "./Square"
import type { BoardState, HighlightType, Position } from "@/board/types"
import type { Tile } from "@/types"

/** 15x15 Scrabble board grid showing multiplier squares and placed tiles. */
export const Board = ({
  board,
  onSquareClick,
  highlightedSquares,
  squareHighlights,
  pendingTiles,
  dragOverSquare,
  touchDragOverSquare,
  onDragOver,
  onDragLeave,
  onDrop,
}: Props) => {
  /** Set of "row-col" keys for O(1) highlight lookup. */
  const highlightSet = new Set(highlightedSquares?.map(({ row, col }) => `${row}-${col}`))

  return (
    <div
      className={cn(
        "@container grid aspect-square w-full max-w-[min(100vw,100vh)]",
        "grid-cols-[repeat(15,1fr)] grid-rows-[repeat(15,1fr)]",
        "bg-khaki-300 gap-[0.25cqw] overflow-hidden rounded-md p-[0.25cqw]",
      )}
    >
      {board.map((row, rowIndex) =>
        row.map((tile, colIndex) => {
          const key = `${rowIndex}-${colIndex}`
          const isPending = pendingTiles?.has(key) ?? false
          const isDragOver = dragOverSquare === key || touchDragOverSquare === key
          return (
            <Square
              key={key}
              row={rowIndex}
              col={colIndex}
              tile={tile}
              highlighted={highlightSet.has(key)}
              highlightType={squareHighlights?.get(key)}
              pending={isPending}
              dragOver={isDragOver}
              onClick={
                onSquareClick ? () => onSquareClick({ row: rowIndex, col: colIndex }) : undefined
              }
              onDragOver={
                onDragOver ? e => onDragOver(e, { row: rowIndex, col: colIndex }) : undefined
              }
              onDragLeave={onDragLeave}
              onDrop={onDrop ? e => onDrop(e, { row: rowIndex, col: colIndex }) : undefined}
            />
          )
        }),
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
  /** Map of "row-col" -> HighlightType for typed analysis highlights. */
  squareHighlights?: Map<string, HighlightType>
  /** Map of "row-col" -> Tile for pending placements (shown with different styling). */
  pendingTiles?: Map<string, Tile>
  /** Key of the square currently being dragged over ("row-col" or null). */
  dragOverSquare?: string | null
  /** Key of the square currently being touch-dragged over ("row-col" or null). */
  touchDragOverSquare?: string | null
  /** Drag over handler for squares, receives the position. */
  onDragOver?: (e: React.DragEvent<HTMLDivElement>, position: Position) => void
  /** Drag leave handler for squares. */
  onDragLeave?: React.DragEventHandler<HTMLDivElement>
  /** Drop handler for squares, receives the position. */
  onDrop?: (e: React.DragEvent<HTMLDivElement>, position: Position) => void
}
