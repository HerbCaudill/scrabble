import { cn } from "@/lib/utils"
import { isBlankTile } from "@/board/isBlankTile"
import type { Tile as TileType } from "@/types"

/** Letter tile showing letter and point value, used on both the rack and board. */
export const Tile = ({
  tile,
  mode = "static",
  selected = false,
  size = "md",
  variant = "existing",
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
  const isExisting = variant === "existing"

  return (
    <div
      data-tile={letter}
      data-testid={`tile-${letter}`}
      draggable={mode === "draggable" ? true : undefined}
      onDragStart={mode === "draggable" ? onDragStart : undefined}
      onDragEnd={mode === "draggable" ? onDragEnd : undefined}
      className={cn(
        "@container relative inline-flex items-center justify-center rounded-[2%] font-bold shadow-sm select-none",

        // Color: existing tiles are amber, new tiles are teal
        isExisting ? "bg-amber-100" : "bg-teal-300",

        // Size variants for non-board contexts (rack, preview)
        size === "sm" && "h-7 w-7",
        size === "md" && "h-10 w-10",
        size === "lg" && "h-14 w-14",

        // Board tiles fill their container
        size === "board" && "h-full w-full",

        // Selected state
        selected && "ring-2 ring-amber-500 ring-offset-1",

        // Draggable cursor
        mode === "draggable" && "cursor-grab active:cursor-grabbing",
      )}
    >
      {/* Letter */}
      <span
        data-letter
        className={cn(
          "text-[55cqw] leading-none font-bold",
          blank ? "text-yellow-600"
          : isExisting ? "text-khaki-800"
          : "text-teal-800",
          assignedBlank && "opacity-40",
        )}
      >
        {displayLetter}
      </span>

      {/* Point value (hidden for blank tiles) */}
      {!blank && (
        <span
          data-value
          className={cn(
            "absolute right-[6%] bottom-[3%] text-[25cqw] leading-none font-semibold",
            isExisting ? "text-khaki-600" : "text-teal-600",
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
  /** Size variant: 'sm' for compact, 'md' for rack, 'lg' for preview, 'board' for board squares. */
  size?: "sm" | "md" | "lg" | "board"
  /** Color variant: 'existing' for placed tiles (amber), 'new' for just-placed tiles (teal). */
  variant?: "existing" | "new"
  /** Drag start handler (only used in draggable mode). */
  onDragStart?: React.DragEventHandler<HTMLDivElement>
  /** Drag end handler (only used in draggable mode). */
  onDragEnd?: React.DragEventHandler<HTMLDivElement>
}
