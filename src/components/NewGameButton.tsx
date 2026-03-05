import { cn } from "@/lib/utils"

/** Button to start a new game. */
export const NewGameButton = ({ onNewGame }: Props) => {
  return (
    <button
      onClick={onNewGame}
      className={cn(
        "rounded-md px-4 py-2 font-medium",
        "bg-amber-600 text-white hover:bg-amber-500",
      )}
    >
      New game
    </button>
  )
}

type Props = {
  /** Callback when the user clicks the button. */
  onNewGame: () => void
}
