import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { NewGameButton } from "../NewGameButton"

describe("NewGameButton", () => {
  it("renders with 'New game' label", () => {
    render(<NewGameButton onNewGame={() => {}} />)
    expect(screen.getByRole("button", { name: "New game" })).toBeInTheDocument()
  })

  it("calls onNewGame when clicked", () => {
    const onNewGame = vi.fn()
    render(<NewGameButton onNewGame={onNewGame} />)
    fireEvent.click(screen.getByRole("button", { name: "New game" }))
    expect(onNewGame).toHaveBeenCalledOnce()
  })
})
