import { CATEGORIES } from '../data/devices.js'
import { CATEGORY_ICONS } from './icons.jsx'
import { focus } from './ui.js'

export default function DeviceCategoryTabs({ value, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Device category"
      className="inline-flex shrink-0 rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-800"
    >
      {CATEGORIES.map(({ id, label }) => {
        const Icon = CATEGORY_ICONS[id]
        const active = id === value
        return (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(id)}
            className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors ${focus} ${
              active
                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-600 dark:text-white'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        )
      })}
    </div>
  )
}
