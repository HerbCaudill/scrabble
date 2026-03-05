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
}: Props) => {
  /** Wrap onDragStart to set the tile index in dataTransfer. */
  const handleDragStart = (index: number, e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer?.setData("text/plain", String(index))
    if (e.dataTransfer) e.dataTransfer.effectAllowed = "move"
    onDragStart?.(e)
  }

  return (
    <div data-rack data-testid="rack" className="flex gap-1">
      {tiles.map((tile, index) => (
        <div key={index} onClick={swapMode ? () => onTileSelect?.(index) : undefined}>
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
}
