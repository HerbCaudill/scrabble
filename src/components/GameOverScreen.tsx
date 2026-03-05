import { cn } from "@/lib/utils"
import type { GameState } from "@/game/types"

/** Game over screen showing final scores, winner announcement, and navigation buttons. */
export const GameOverScreen = ({ gameState, onViewAnalysis, onPlayAgain }: Props) => {
  const highScore = Math.max(...gameState.players.map(p => p.score))
  const winners = gameState.players.filter(p => p.score === highScore)
  const isTie = winners.length > 1

  return (
    <div data-game-over className="flex flex-col items-center gap-6 rounded-lg bg-amber-900/50 p-8">
      <h2 className="text-2xl font-bold text-amber-100">Game over</h2>

      {/* Final scores */}
      <div className="w-full space-y-2">
        {gameState.players.map(player => {
          const isWinner = !isTie && player.score === highScore
          return (
            <div
              key={player.name}
              {...(isWinner ? { "data-winner": true } : {})}
              className={cn(
                "flex items-center justify-between rounded-md px-4 py-2",
                isWinner ? "bg-amber-600/50 font-bold text-amber-100" : "text-amber-300",
              )}
            >
              <span>{player.name}</span>
              <span>{player.score}</span>
            </div>
          )
        })}
      </div>

      {/* Winner announcement */}
      <p className="text-lg font-semibold text-amber-200">
        {isTie ? "It's a tie!" : `${winners[0].name} wins!`}
      </p>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onViewAnalysis}
          className={cn(
            "rounded-md px-4 py-2 font-medium",
            "bg-amber-600 text-white hover:bg-amber-500",
          )}
        >
          View analysis
        </button>
        <button
          onClick={onPlayAgain}
          className={cn(
            "rounded-md px-4 py-2 font-medium",
            "bg-amber-800 text-amber-200 hover:bg-amber-700",
          )}
        >
          Play again
        </button>
      </div>
    </div>
  )
}

type Props = {
  /** The finished game state with final scores. */
  gameState: GameState
  /** Callback to navigate to the analysis view. */
  onViewAnalysis: () => void
  /** Callback to start a new game. */
  onPlayAgain: () => void
}
