/** Badge displaying the score for a pending move. */
export const ScoreBadge = ({ score }: Props) => {
  return (
    <div
      data-testid="score-badge"
      className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-3 py-1 text-sm font-bold text-white"
    >
      {score}
    </div>
  )
}

type Props = {
  /** The score value to display. */
  score: number
}
