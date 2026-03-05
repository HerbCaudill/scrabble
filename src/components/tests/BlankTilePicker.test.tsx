import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { BlankTilePicker } from "../BlankTilePicker"

describe("BlankTilePicker", () => {
  const defaultProps = {
    open: true,
    onSelect: vi.fn(),
    onClose: vi.fn(),
  }

  it("renders nothing when closed", () => {
    const { container } = render(<BlankTilePicker {...defaultProps} open={false} />)
    expect(container.querySelector("[data-blank-picker]")).not.toBeInTheDocument()
  })

  it("renders the modal when open", () => {
    render(<BlankTilePicker {...defaultProps} />)
    expect(screen.getByText("Choose a letter")).toBeInTheDocument()
    expect(document.querySelector("[data-blank-picker]")).toBeInTheDocument()
  })

  it("renders 26 letter buttons (A-Z)", () => {
    render(<BlankTilePicker {...defaultProps} />)
    const buttons = screen.getAllByRole("button").filter(b => /^[A-Z]$/.test(b.textContent ?? ""))
    expect(buttons).toHaveLength(26)
  })

  it("calls onSelect with lowercase letter when a letter is clicked", async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(<BlankTilePicker {...defaultProps} onSelect={onSelect} />)

    await user.click(screen.getByRole("button", { name: "E" }))
    expect(onSelect).toHaveBeenCalledWith("e")
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it("calls onClose when the close button is clicked", async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<BlankTilePicker {...defaultProps} onClose={onClose} />)

    await user.click(screen.getByRole("button", { name: /close|cancel/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("calls onClose when the backdrop is clicked", async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<BlankTilePicker {...defaultProps} onClose={onClose} />)

    const backdrop = document.querySelector("[data-blank-picker]")!.firstElementChild as HTMLElement
    await user.click(backdrop)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("renders all letters from A to Z in order", () => {
    render(<BlankTilePicker {...defaultProps} />)
    const buttons = screen.getAllByRole("button").filter(b => /^[A-Z]$/.test(b.textContent ?? ""))
    const letters = buttons.map(b => b.textContent)
    const expected = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
    expect(letters).toEqual(expected)
  })
})
