import { cn } from "@/lib/utils"
import type { Player, MoveRecord } from "@/game/types"

/** Compact horizontal score display with player scores, tiles remaining, and last move info. */
export const ScoreDisplay = ({ players, currentPlayerIndex, tilesInBag, lastMove }: Props) => {
  return (
    <div className="flex flex-col items-center gap-1">
      {/* Player scores + tiles remaining in a single row */}
      <div className="flex items-center gap-4">
        {players.map((player, i) => (
          <div
            key={player.name}
            data-player-row={player.name}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1",
              i === currentPlayerIndex ?
                "bg-neutral-100 font-bold text-neutral-900"
              : "text-neutral-500",
            )}
          >
            <span data-player={player.name}>{player.name}</span>
            <span data-score={player.name}>{player.score}</span>
          </div>
        ))}
        <span className="text-sm text-neutral-400">{tilesInBag} tiles remaining</span>
      </div>

      {/* Last move info */}
      {lastMove && <p className="text-sm text-neutral-500">{formatLastMove(lastMove)}</p>}
    </div>
  )
}

/** Format a MoveRecord into a human-readable string. */
const formatLastMove = (
  /** The move record to format */
  move: MoveRecord,
): string => {
  switch (move.actionType) {
    case "place":
      return `${move.player}: ${move.words.join(", ")} for ${move.score} pts`
    case "pass":
      return `${move.player} passed`
    case "swap":
      return `${move.player} swapped tiles`
    default:
      return ""
  }
}

type Props = {
  /** The players in the game */
  players: Player[]
  /** Index of the player whose turn it is */
  currentPlayerIndex: number
  /** Number of tiles remaining in the bag */
  tilesInBag: number
  /** The last move made, if any */
  lastMove?: MoveRecord
}
