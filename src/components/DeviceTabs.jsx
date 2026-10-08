import { focus } from './ui.js'

export default function DeviceTabs({ devices, value, onChange }) {
  return (
    <div role="tablist" aria-label="Device" className="scroll-thin flex min-w-0 gap-1 overflow-x-auto">
      {devices.map((d) => {
        const active = d.id === value
        return (
          <button
            key={d.id}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(d.id)}
            className={`flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm transition-colors ${focus} ${
              active
                ? 'border-indigo-500/60 bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200'
                : 'border-transparent text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            {d.name}
            <span className="hidden font-mono text-[11px] opacity-60 md:inline">
              {d.width}×{d.height}
            </span>
          </button>
        )
      })}
    </div>
  )
}
