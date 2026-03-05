import { cn } from "@/lib/utils"
import { isBlankTile } from "@/board/isBlankTile"
import type { Tile as TileType } from "@/types"

/** Letter tile showing letter and point value, used on both the rack and board. */
export const Tile = ({
  tile,
  mode = "static",
  selected = false,
  size = "md",
  onDragStart,
  onDragEnd,
}: Props) => {
  const { letter, value } = tile
  const blank = isBlankTile(letter)
  const assignedBlank = blank && letter !== " "
  const displayLetter =
    blank ?
      assignedBlank ? letter.toUpperCase()
      : ""
    : letter

  return (
    <div
      data-tile={letter}
      data-testid={`tile-${letter}`}
      draggable={mode === "draggable" ? true : undefined}
      onDragStart={mode === "draggable" ? onDragStart : undefined}
      onDragEnd={mode === "draggable" ? onDragEnd : undefined}
      className={cn(
        // Base tile styles: classic yellow/amber Scrabble tile look
        "relative inline-flex items-end justify-center rounded-sm font-bold select-none",
        "bg-amber-100",
        "shadow-sm",
        "border border-amber-300",

        // Size variants
        size === "sm" && "h-7 w-7 pb-0.5 text-sm leading-none",
        size === "md" && "h-10 w-10 pb-1 text-lg leading-none",
        size === "lg" && "h-14 w-14 pb-1.5 text-2xl leading-none",

        // Selected state
        selected && "ring-2 ring-amber-500 ring-offset-1",

        // Draggable cursor
        mode === "draggable" && "cursor-grab active:cursor-grabbing",
      )}
    >
      {/* Letter */}
      <span data-letter className={cn("text-amber-900", assignedBlank && "opacity-40")}>
        {displayLetter}
      </span>

      {/* Point value (hidden for blank tiles) */}
      {!blank && (
        <span
          data-value
          className={cn(
            "absolute font-semibold text-amber-700",
            size === "sm" && "right-0.5 bottom-px text-[7px] leading-none",
            size === "md" && "right-1 bottom-0.5 text-[9px] leading-none",
            size === "lg" && "right-1.5 bottom-1 text-[11px] leading-none",
          )}
        >
          {value}
        </span>
      )}
    </div>
  )
}

type Props = {
  /** The tile data (letter and point value). */
  tile: TileType
  /** Display mode: 'draggable' for rack tiles, 'static' for board tiles. */
  mode?: "draggable" | "static"
  /** Whether the tile is selected (e.g. for swap mode). */
  selected?: boolean
  /** Size variant: 'sm' for board, 'md' for rack, 'lg' for preview. */
  size?: "sm" | "md" | "lg"
  /** Drag start handler (only used in draggable mode). */
  onDragStart?: React.DragEventHandler<HTMLDivElement>
  /** Drag end handler (only used in draggable mode). */
  onDragEnd?: React.DragEventHandler<HTMLDivElement>
}
