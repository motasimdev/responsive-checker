// Shared class strings so every control looks and behaves the same.

const focus =
  'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-500'

export const btn =
  `inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 active:bg-zinc-200 disabled:pointer-events-none disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:active:bg-zinc-600 ${focus}`

export const btnPrimary =
  `inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-40 ${focus}`

export const iconBtn = `${btn} w-8 !px-0`

export const panel = 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'

export const kbd =
  'rounded border border-zinc-300 bg-zinc-100 px-1 py-px font-mono text-[10px] text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'

export { focus }
