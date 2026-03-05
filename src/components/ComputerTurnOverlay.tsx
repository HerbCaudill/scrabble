import type { ScoredMove } from "@/movegen/types"

/** Overlay showing the computer's turn status: thinking indicator or move result. */
export const ComputerTurnOverlay = ({ isThinking, currentMove }: Props) => {
  if (!isThinking && !currentMove) return null

  return (
    <div data-computer-turn className="text-center text-sm text-amber-300">
      {isThinking && <p>Computer is thinking...</p>}
      {!isThinking && currentMove && (
        <p>
          Computer played {currentMove.words[0]} for {currentMove.score} points
        </p>
      )}
    </div>
  )
}

type Props = {
  /** Whether the computer is currently "thinking" */
  isThinking: boolean
  /** The move the computer chose (null if still thinking or no move) */
  currentMove: ScoredMove | null
}
