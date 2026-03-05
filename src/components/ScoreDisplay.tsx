import { cn } from "@/lib/utils"
import type { Player, MoveRecord } from "@/game/types"

/** Running score display with player scores, tiles remaining, and last move info. */
export const ScoreDisplay = ({ players, currentPlayerIndex, tilesInBag, lastMove }: Props) => {
  return (
    <div className="space-y-3">
      {/* Player scores */}
      <div className="space-y-1">
        {players.map((player, i) => (
          <div
            key={player.name}
            data-player-row={player.name}
            className={cn(
              "flex items-center justify-between rounded-md px-3 py-2",
              i === currentPlayerIndex ?
                "bg-amber-700/50 font-bold text-amber-100"
              : "text-amber-300",
            )}
          >
            <span data-player={player.name}>{player.name}</span>
            <span data-score={player.name}>{player.score}</span>
          </div>
        ))}
      </div>

      {/* Tiles remaining */}
      <p className="text-sm text-amber-400">{tilesInBag} tiles remaining</p>

      {/* Last move info */}
      {lastMove && <p className="text-sm text-amber-300">{formatLastMove(lastMove)}</p>}
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
    case "exchange":
      return `${move.player} exchanged tiles`
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
