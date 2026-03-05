import { Tile } from "./Tile"
import type { Tile as TileType } from "@/types"

/** Player's rack displaying up to 7 tiles in a horizontal row. */
export const Rack = ({
  tiles,
  swapMode = false,
  selectedIndices = [],
  onTileSelect,
  onDragStart,
  onDragEnd,
  onTouchDragStart,
  onTouchDragMove,
  onTouchDragEnd,
}: Props) => {
  /** Wrap onDragStart to set the tile index in dataTransfer. */
  const handleDragStart = (index: number, e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer?.setData("text/plain", String(index))
    if (e.dataTransfer) e.dataTransfer.effectAllowed = "move"
    onDragStart?.(e)
  }

  /** Handle touch start on a tile for mobile drag. */
  const handleTouchStart = (index: number, e: React.TouchEvent<HTMLDivElement>) => {
    if (swapMode) return
    const touch = e.touches[0]
    onTouchDragStart?.(index, touch.clientX, touch.clientY)
  }

  /** Handle touch move for mobile drag. Prevents scroll during drag. */
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (swapMode) return
    if (onTouchDragMove) {
      e.preventDefault()
    }
    const touch = e.touches[0]
    onTouchDragMove?.(touch.clientX, touch.clientY)
  }

  /** Handle touch end for mobile drag drop. */
  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (swapMode) return
    const touch = e.changedTouches[0]
    onTouchDragEnd?.(touch.clientX, touch.clientY)
  }

  return (
    <div data-rack data-testid="rack" className="flex gap-1">
      {tiles.map((tile, index) => (
        <div
          key={index}
          onClick={swapMode ? () => onTileSelect?.(index) : undefined}
          onTouchStart={e => handleTouchStart(index, e)}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Tile
            tile={tile}
            mode={swapMode ? "static" : "draggable"}
            size="md"
            selected={selectedIndices.includes(index)}
            onDragStart={e => handleDragStart(index, e)}
            onDragEnd={onDragEnd}
          />
        </div>
      ))}
    </div>
  )
}

type Props = {
  /** The tiles currently on the player's rack. */
  tiles: TileType[]
  /** When true, tiles are clickable to toggle selection instead of draggable. */
  swapMode?: boolean
  /** Indices of tiles currently selected for swap. */
  selectedIndices?: number[]
  /** Called when a tile is clicked in swap mode. */
  onTileSelect?: (index: number) => void
  /** Drag start handler forwarded to each tile. */
  onDragStart?: React.DragEventHandler<HTMLDivElement>
  /** Drag end handler forwarded to each tile. */
  onDragEnd?: React.DragEventHandler<HTMLDivElement>
  /** Called when a touch drag starts on a tile (mobile). */
  onTouchDragStart?: (index: number, x: number, y: number) => void
  /** Called when touch moves during a drag (mobile). */
  onTouchDragMove?: (x: number, y: number) => void
  /** Called when touch ends during a drag (mobile). */
  onTouchDragEnd?: (x: number, y: number) => void
}
