import { Tile } from "./Tile"
import type { Tile as TileType } from "@/types"

/** Floating ghost tile shown during touch-based drag operations. */
export const DragGhost = ({ tile, x, y }: Props) => {
  return (
    <div
      data-testid="drag-ghost"
      style={{
        position: "fixed",
        left: `${x}px`,
        top: `${y}px`,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: 9999,
        opacity: 0.85,
      }}
    >
      <Tile tile={tile} size="md" variant="new" />
    </div>
  )
}

type Props = {
  /** The tile being dragged. */
  tile: TileType
  /** X coordinate (clientX) for ghost positioning. */
  x: number
  /** Y coordinate (clientY) for ghost positioning. */
  y: number
}
