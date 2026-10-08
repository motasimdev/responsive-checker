import { useCallback, useState } from 'react'

// useState that survives reloads. Storage can be unavailable, so every access is guarded.
export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw === null ? initial : JSON.parse(raw)
    } catch {
      return initial
    }
  })

  const set = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next
        try {
          localStorage.setItem(key, JSON.stringify(resolved))
        } catch {
          /* ignore quota / privacy-mode errors */
        }
        return resolved
      })
    },
    [key],
  )

  return [value, set]
}
