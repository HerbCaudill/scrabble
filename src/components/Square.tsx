import { cn } from "@/lib/utils"
import { getSquareType } from "@/board/getSquareType"
import { Tile } from "./Tile"
import type { HighlightType } from "@/board/types"
import type { Tile as TileType } from "@/types"
import { getTileValue } from "@/board/getTileValue"

/** A single square on the Scrabble board, showing either dots for multipliers or a placed tile. */
export const Square = ({
  row,
  col,
  tile,
  highlighted = false,
  highlightType,
  pending = false,
  dragOver = false,
  onClick,
  onDragOver,
  onDragLeave,
  onDrop,
}: Props) => {
  const squareType = getSquareType(row, col)
  const hasTile = tile !== null
  const isWordMultiplier = squareType === "DW" || squareType === "TW" || squareType === "ST"

  return (
    <div
      data-cell={`${row}-${col}`}
      data-testid={`cell-${row}-${col}`}
      {...(highlightType ? { "data-highlight": highlightType } : {})}
      onClick={onClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "relative flex items-center justify-center",
        "aspect-square overflow-visible",
        onClick && "cursor-pointer",

        // Background: word multipliers are darker khaki, letter/normal are lighter
        !hasTile && isWordMultiplier && "bg-khaki-500",
        !hasTile && !isWordMultiplier && "bg-khaki-200",

        // When tile is placed (non-pending) -- tile component handles its own background
        hasTile && !pending && "",

        // Pending tile (placed but not yet committed)
        pending && "border-khaki-400 border",

        // Typed highlights (analysis view)
        highlightType === "actual" && "ring-khaki-700 ring-2 ring-inset",
        highlightType === "best" && "ring-khaki-500 ring-2 ring-inset",
        highlightType === "both" && "ring-khaki-700 ring-2 ring-inset",

        // Legacy highlight
        !highlightType && highlighted && "ring-khaki-500 ring-2 ring-inset",

        // Drag-over visual feedback
        dragOver && "bg-khaki-300 ring-khaki-500 ring-2 ring-inset",
      )}
    >
      {hasTile ?
        <Tile
          tile={{ letter: tile, value: getTileValue(tile) }}
          size="board"
          variant={pending ? "new" : "existing"}
        />
      : squareType === "ST" ?
        <BullsEye />
      : squareType !== null ?
        <Dots
          count={squareType === "DL" || squareType === "DW" ? 2 : 3}
          light={!isWordMultiplier}
          rotation={getRotation(row, col)}
        />
      : null}
    </div>
  )
}

/** Dots representing multiplier count, rotated to point toward center. */
const Dots = ({
  count,
  light = false,
  rotation,
}: {
  count: number
  light?: boolean
  rotation: string
}) => {
  return (
    <div className={cn("flex gap-[0.9cqw]", rotation)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn("size-[0.8cqw] rounded-full", light ? "bg-khaki-800" : "bg-white")}
        />
      ))}
    </div>
  )
}

/** Bulls-eye marker for the center/start square. */
const BullsEye = () => (
  <div className="relative flex items-center justify-center">
    <div className="flex size-[2.5cqw] items-center justify-center rounded-full border-[0.15cqw] border-white">
      <div className="size-[1cqw] rounded-full bg-white" />
    </div>
  </div>
)

/** Get the CSS rotation class for dots based on position relative to center. */
const getRotation = (
  /** Row index */
  row: number,
  /** Column index */
  col: number,
): string => {
  const center = 7
  if (row === center && col === center) return "rotate-0"
  if (row === center) return "rotate-0"
  if (col === center) return "rotate-90"
  if (row < center && col < center) return "rotate-45"
  if (row < center && col > center) return "rotate-[135deg]"
  if (row > center && col < center) return "-rotate-45"
  return "-rotate-[135deg]"
}

type Props = {
  /** Row index (0-14). */
  row: number
  /** Column index (0-14). */
  col: number
  /** The tile letter placed at this position, or null if empty. */
  tile: string | null
  /** Whether this square should be visually highlighted (legacy). */
  highlighted?: boolean
  /** The type of analysis highlight to apply to this square. */
  highlightType?: HighlightType
  /** Whether this tile is a pending placement (not yet committed). */
  pending?: boolean
  /** Whether a dragged tile is currently hovering over this square. */
  dragOver?: boolean
  /** Click handler for this square. */
  onClick?: () => void
  /** Drag over handler for drop target behavior. */
  onDragOver?: React.DragEventHandler<HTMLDivElement>
  /** Drag leave handler for drop target behavior. */
  onDragLeave?: React.DragEventHandler<HTMLDivElement>
  /** Drop handler for accepting a dragged tile. */
  onDrop?: React.DragEventHandler<HTMLDivElement>
}
