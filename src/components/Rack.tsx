import { Tile } from "./Tile"
import type { Tile as TileType } from "@/types"

/** Player's rack displaying up to 7 tiles in a horizontal row. */
export const Rack = ({
  tiles,
  exchangeMode = false,
  selectedIndices = [],
  onTileSelect,
  onDragStart,
  onDragEnd,
}: Props) => {
  return (
    <div data-rack data-testid="rack" className="flex gap-1">
      {tiles.map((tile, index) => (
        <div key={index} onClick={exchangeMode ? () => onTileSelect?.(index) : undefined}>
          <Tile
            tile={tile}
            mode={exchangeMode ? "static" : "draggable"}
            size="md"
            selected={selectedIndices.includes(index)}
            onDragStart={onDragStart}
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
  exchangeMode?: boolean
  /** Indices of tiles currently selected for exchange. */
  selectedIndices?: number[]
  /** Called when a tile is clicked in exchange mode. */
  onTileSelect?: (index: number) => void
  /** Drag start handler forwarded to each tile. */
  onDragStart?: React.DragEventHandler<HTMLDivElement>
  /** Drag end handler forwarded to each tile. */
  onDragEnd?: React.DragEventHandler<HTMLDivElement>
}
