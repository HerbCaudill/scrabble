import { cn } from "@/lib/utils"
import { getSquareType } from "@/board/getSquareType"
import { tileValues } from "@/board/tileValues"
import type { HighlightType } from "@/board/types"

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
        "aspect-square overflow-visible text-center",
        onClick && "cursor-pointer",

        // Background: word multipliers are darker, letter/normal are lighter
        !hasTile && isWordMultiplier && "bg-neutral-300",
        !hasTile && !isWordMultiplier && "bg-neutral-200",

        // When tile is placed
        hasTile && !pending && "bg-neutral-50",

        // Pending tile (placed but not yet committed)
        pending && "border border-neutral-400 bg-neutral-100",

        // Typed highlights (analysis view)
        highlightType === "actual" && "ring-2 ring-neutral-500 ring-inset",
        highlightType === "best" && "ring-2 ring-neutral-400 ring-inset",
        highlightType === "both" && "ring-2 ring-neutral-500 ring-inset",

        // Legacy highlight
        !highlightType && highlighted && "ring-2 ring-neutral-400 ring-inset",

        // Drag-over visual feedback
        dragOver && "bg-neutral-200 ring-2 ring-neutral-400 ring-inset",
      )}
    >
      {hasTile ?
        <TileDisplay letter={tile} />
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

/** Displays a placed tile letter and its point value. */
const TileDisplay = ({ letter }: { letter: string }) => {
  const value = tileValues[letter.toUpperCase()] ?? 0
  return (
    <>
      <span className="text-[1.2em] leading-none font-bold text-neutral-900">{letter}</span>
      <span className="absolute right-[8%] bottom-[2%] text-[0.45em] font-semibold text-neutral-500">
        {value}
      </span>
    </>
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
          className={cn("size-[0.8cqw] rounded-full", light ? "bg-neutral-400" : "bg-white")}
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
const getRotation = (row: number, col: number): string => {
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
