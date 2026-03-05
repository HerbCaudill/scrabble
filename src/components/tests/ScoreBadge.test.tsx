import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ScoreBadge } from "../ScoreBadge"

describe("ScoreBadge", () => {
  it("displays the score value", () => {
    render(<ScoreBadge score={42} />)
    expect(screen.getByText("42")).toBeInTheDocument()
  })

  it("has a data-testid for easy querying", () => {
    render(<ScoreBadge score={10} />)
    expect(screen.getByTestId("score-badge")).toBeInTheDocument()
  })

  it("renders the score as a number", () => {
    render(<ScoreBadge score={0} />)
    expect(screen.getByText("0")).toBeInTheDocument()
  })
})
