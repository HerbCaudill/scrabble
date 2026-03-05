import { useState, useCallback } from "react"

/**
 * Manages touch-based drag state, providing the equivalent of HTML5 drag-and-drop
 * for touch devices. Tracks whether a drag is in progress, what data is being dragged,
 * and the current position for rendering a ghost element.
 */
export const useTouchDrag = () => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragData, setDragData] = useState<string | null>(null)
  const [ghostPosition, setGhostPosition] = useState<GhostPosition | null>(null)

  /** Begin a touch drag operation. */
  const startDrag = useCallback(
    (
      /** Opaque string data associated with the dragged item (e.g. rack tile index). */
      data: string,
      /** Initial touch X coordinate. */
      x: number,
      /** Initial touch Y coordinate. */
      y: number,
    ) => {
      setIsDragging(true)
      setDragData(data)
      setGhostPosition({ x, y })
    },
    [],
  )

  /** Update the ghost position during a touch move. No-op if not dragging. */
  const moveDrag = useCallback(
    (
      /** Current touch X coordinate. */
      x: number,
      /** Current touch Y coordinate. */
      y: number,
    ) => {
      setIsDragging(current => {
        if (!current) return current
        setGhostPosition({ x, y })
        return current
      })
    },
    [],
  )

  /** End the touch drag operation and reset all state. */
  const endDrag = useCallback(() => {
    setIsDragging(false)
    setDragData(null)
    setGhostPosition(null)
  }, [])

  return {
    isDragging,
    dragData,
    ghostPosition,
    startDrag,
    moveDrag,
    endDrag,
  }
}

/** Position coordinates for the floating ghost element. */
type GhostPosition = {
  /** X coordinate (clientX). */
  x: number
  /** Y coordinate (clientY). */
  y: number
}
