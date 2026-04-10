"use client"

import { useState, useRef, useEffect, useCallback } from "react"

interface UseDrawerResizeOptions {
  storageKey: string
  defaultWidth: number
  minWidth: number
  maxFraction: number
}

interface UseDrawerResizeReturn {
  width: number
  onMouseDown: (e: React.MouseEvent) => void
}

export function useDrawerResize({
  storageKey,
  defaultWidth,
  minWidth,
  maxFraction,
}: UseDrawerResizeOptions): UseDrawerResizeReturn {
  const [width, setWidth] = useState(defaultWidth)
  const isDragging = useRef(false)

  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    const parsed = stored ? parseInt(stored, 10) : NaN
    if (!isNaN(parsed)) {
      setWidth(Math.max(minWidth, Math.min(parsed, window.innerWidth * maxFraction)))
    }
  }, [storageKey, minWidth, maxFraction])

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      isDragging.current = true
      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"

      function onMouseMove(ev: MouseEvent) {
        if (!isDragging.current) return
        setWidth(Math.max(minWidth, Math.min(window.innerWidth - ev.clientX, window.innerWidth * maxFraction)))
      }

      function onMouseUp() {
        isDragging.current = false
        document.body.style.cursor = ""
        document.body.style.userSelect = ""
        setWidth((w) => {
          localStorage.setItem(storageKey, String(w))
          return w
        })
        document.removeEventListener("mousemove", onMouseMove)
        document.removeEventListener("mouseup", onMouseUp)
      }

      document.addEventListener("mousemove", onMouseMove)
      document.addEventListener("mouseup", onMouseUp)
    },
    [storageKey, minWidth, maxFraction]
  )

  return { width, onMouseDown }
}
