import { renderHook, act } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { useTouchDrag } from "../useTouchDrag"

describe("useTouchDrag", () => {
  it("initially has no active drag", () => {
    const { result } = renderHook(() => useTouchDrag())

    expect(result.current.isDragging).toBe(false)
    expect(result.current.dragData).toBeNull()
    expect(result.current.ghostPosition).toBeNull()
  })

  it("starts a drag with data and position", () => {
    const { result } = renderHook(() => useTouchDrag())

    act(() => {
      result.current.startDrag("2", 100, 200)
    })

    expect(result.current.isDragging).toBe(true)
    expect(result.current.dragData).toBe("2")
    expect(result.current.ghostPosition).toEqual({ x: 100, y: 200 })
  })

  it("updates ghost position on move", () => {
    const { result } = renderHook(() => useTouchDrag())

    act(() => {
      result.current.startDrag("0", 100, 200)
    })
    act(() => {
      result.current.moveDrag(150, 250)
    })

    expect(result.current.ghostPosition).toEqual({ x: 150, y: 250 })
  })

  it("ends drag and resets state", () => {
    const { result } = renderHook(() => useTouchDrag())

    act(() => {
      result.current.startDrag("0", 100, 200)
    })
    act(() => {
      result.current.endDrag()
    })

    expect(result.current.isDragging).toBe(false)
    expect(result.current.dragData).toBeNull()
    expect(result.current.ghostPosition).toBeNull()
  })

  it("moveDrag is a no-op when not dragging", () => {
    const { result } = renderHook(() => useTouchDrag())

    act(() => {
      result.current.moveDrag(150, 250)
    })

    expect(result.current.isDragging).toBe(false)
    expect(result.current.ghostPosition).toBeNull()
  })
})
