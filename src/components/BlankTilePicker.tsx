import { cn } from "@/lib/utils"

/** Modal overlay for choosing which letter a blank tile represents. */
export const BlankTilePicker = ({ open, onSelect, onClose }: Props) => {
  if (!open) return null

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

  return (
    <div data-blank-picker className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Dialog */}
      <div
        className={cn(
          "relative z-10 w-80 rounded-lg bg-white p-5 shadow-xl",
          "flex flex-col items-center gap-4",
        )}
      >
        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-900">Choose a letter</h2>

        {/* Letter grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {letters.map(letter => (
            <button
              key={letter}
              type="button"
              onClick={() => onSelect(letter.toLowerCase())}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded",
                "bg-neutral-100 font-bold text-neutral-900",
                "hover:bg-neutral-200 active:bg-neutral-300",
                "transition-colors",
              )}
            >
              {letter}
            </button>
          ))}
        </div>

        {/* Cancel button */}
        <button
          type="button"
          aria-label="Cancel"
          onClick={onClose}
          className={cn(
            "mt-1 rounded px-4 py-1.5 text-sm font-medium",
            "text-gray-600 hover:bg-gray-100 active:bg-gray-200",
            "transition-colors",
          )}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

type Props = {
  /** Whether the modal is open. */
  open: boolean
  /** Called with the chosen letter (lowercase) when a letter is selected. */
  onSelect: (letter: string) => void
  /** Called when the modal is dismissed without selecting a letter. */
  onClose: () => void
}
