import { cn } from "@/lib/utils"
import { getSquareType } from "@/board/getSquareType"
import { tileValues } from "@/board/tileValues"
import { IconStar } from "@tabler/icons-react"
import type { SquareType } from "@/board/types"

/** A single square on the Scrabble board, showing either a premium label or a placed tile. */
export const Square = ({ row, col, tile, highlighted = false, onClick }: Props) => {
  const squareType = getSquareType(row, col)
  const hasTile = tile !== null

  return (
    <div
      data-cell={`${row}-${col}`}
      data-testid={`cell-${row}-${col}`}
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center",
        "aspect-square text-center",
        "border border-amber-900/20",
        "text-[0.5em] leading-none font-bold uppercase",
        onClick && "cursor-pointer",

        // Square type colors (when no tile is placed)
        !hasTile && squareType === "TW" && "bg-red-700 text-white",
        !hasTile && squareType === "DW" && "bg-rose-400 text-white",
        !hasTile && squareType === "TL" && "bg-blue-700 text-white",
        !hasTile && squareType === "DL" && "bg-sky-300 text-sky-900",
        !hasTile && squareType === "ST" && "bg-rose-400 text-white",
        !hasTile && squareType === null && "bg-amber-50",

        // When tile is placed
        hasTile && "border-amber-300/60 bg-gradient-to-b from-amber-100 to-amber-200",

        // Highlight
        highlighted && "ring-2 ring-yellow-400 ring-inset",
      )}
    >
      {hasTile ?
        <TileDisplay letter={tile} />
      : squareType === "ST" ?
        <IconStar size="60%" />
      : squareType !== null ?
        <span>{PREMIUM_LABELS[squareType]}</span>
      : null}
    </div>
  )
}

/** Displays a placed tile letter and its point value. */
const TileDisplay = ({ letter }: { letter: string }) => {
  const value = tileValues[letter.toUpperCase()] ?? 0
  return (
    <>
      <span className="text-[1.2em] leading-none font-bold text-amber-950">{letter}</span>
      <span className="absolute right-[8%] bottom-[2%] text-[0.45em] font-semibold text-amber-900/80">
        {value}
      </span>
    </>
  )
}

/** Map from SquareType to the premium label text shown on the board. */
const PREMIUM_LABELS: Record<NonNullable<SquareType>, string> = {
  TW: "3W",
  DW: "2W",
  TL: "3L",
  DL: "2L",
  ST: "",
}

type Props = {
  /** Row index (0-14). */
  row: number
  /** Column index (0-14). */
  col: number
  /** The tile letter placed at this position, or null if empty. */
  tile: string | null
  /** Whether this square should be visually highlighted. */
  highlighted?: boolean
  /** Click handler for this square. */
  onClick?: () => void
}
