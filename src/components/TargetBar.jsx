import { btnPrimary, focus, iconBtn, panel } from './ui.js'
import { ArrowRightIcon, HelpIcon, RefreshIcon } from './icons.jsx'
import { validPort } from '../lib/target.js'

const MODES = [
  { id: 'tunnel', label: 'Localhost via tunnel' },
  { id: 'public', label: 'Public URL' },
]

const DOT = {
  ready: 'bg-zinc-400',
  connecting: 'bg-amber-500 animate-pulse',
  connected: 'bg-emerald-500',
  error: 'bg-red-500',
  blocked: 'bg-red-500',
}

export default function TargetBar({
  source,
  onSource,
  value,
  onChange,
  onSubmit,
  onRefresh,
  error,
  history,
  inputRef,
  status,
  port,
  onPort,
  onHelp,
}) {
  const tunnel = source === 'tunnel'

  return (
    <div className={`shrink-0 border-b px-4 py-2.5 ${panel}`}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div role="tablist" aria-label="Preview source" className="inline-flex rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-800">
          {MODES.map((m) => (
            <button
              key={m.id}
              role="tab"
              type="button"
              aria-selected={source === m.id}
              onClick={() => onSource(m.id)}
              className={`h-8 cursor-pointer rounded-md px-3 text-sm font-medium transition-colors ${focus} ${
                source === m.id
                  ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-600 dark:text-white'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <p className="ml-auto flex min-w-0 items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400" role="status" aria-live="polite">
          <span className={`size-2 shrink-0 rounded-full ${DOT[status.kind]}`} />
          <span className="truncate">
            <span className="font-medium text-zinc-800 dark:text-zinc-200">{status.label}</span>
            {status.host && <span className="font-mono"> · {status.host}</span>}
          </span>
        </p>
      </div>

      <form
        className="mt-2 flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
      >
        {tunnel && (
          <>
            <label
              className="flex h-9 shrink-0 items-center rounded-md border border-zinc-300 bg-zinc-50 pl-3 pr-1.5 font-mono text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400"
              title="Your local website. Used for the cloudflared command."
            >
              <span className="sr-only">Local port of your website</span>
              <span aria-hidden="true">localhost:</span>
              <input
                type="text"
                inputMode="numeric"
                value={port}
                maxLength={5}
                onChange={(e) => onPort(e.target.value.replace(/\D/g, ''))}
                aria-invalid={port !== '' && !validPort(port)}
                className="w-12 bg-transparent text-zinc-900 outline-none dark:text-zinc-100"
              />
            </label>
            <span className="flex shrink-0 items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400" aria-hidden="true">
              <ArrowRightIcon size={14} /> cloudflared <ArrowRightIcon size={14} />
            </span>
          </>
        )}

        <label htmlFor="target-url" className="sr-only">
          {tunnel ? 'Tunnel URL' : 'Website URL'}
        </label>
        <input
          id="target-url"
          ref={inputRef}
          type="text"
          inputMode="url"
          spellCheck={false}
          autoComplete="off"
          list="url-history"
          value={value}
          placeholder={tunnel ? 'https://xxxx.trycloudflare.com' : 'https://example.com'}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? 'url-error' : undefined}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault() // also keeps the global Ctrl/Cmd+Enter handler from firing twice
              onSubmit()
            }
          }}
          className={`h-9 min-w-0 flex-1 basis-60 rounded-md border bg-white px-3 font-mono text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 dark:bg-zinc-950 dark:text-zinc-100 ${
            error ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'
          }`}
        />
        <datalist id="url-history">
          {history.map((u) => (
            <option key={u} value={u} />
          ))}
        </datalist>

        <button type="submit" className={btnPrimary}>
          {tunnel ? 'Connect' : 'Load'}
        </button>
        <button type="button" className={`${iconBtn} !h-9 !w-9`} onClick={onRefresh} aria-label="Refresh preview" title="Refresh preview (R)">
          <RefreshIcon />
        </button>
        {tunnel && (
          <button
            type="button"
            onClick={onHelp}
            className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-500/15 ${focus}`}
          >
            <HelpIcon /> Setup help
          </button>
        )}
      </form>

      {error && (
        <p id="url-error" className="mt-1.5 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
