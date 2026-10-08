import { useEffect, useRef } from 'react'
import { iconBtn } from './ui.js'
import { CloseIcon } from './icons.jsx'

// Simple modal. Esc is handled by App so it can coordinate with fullscreen.
export default function Dialog({ title, onClose, children }) {
  const ref = useRef(null)

  useEffect(() => {
    const previous = document.activeElement
    ref.current?.focus()
    return () => previous instanceof HTMLElement && previous.focus()
  }, [])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 p-3 sm:p-8"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="w-full max-w-3xl rounded-2xl border border-zinc-200 bg-zinc-50 p-4 shadow-2xl outline-none sm:p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
          <button type="button" className={iconBtn} onClick={onClose} aria-label="Close help" title="Close (Esc)">
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
