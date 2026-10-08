import { focus, kbd, panel } from './ui.js'
import { shortLabel } from '../lib/target.js'

const link = `cursor-pointer rounded font-medium text-indigo-700 underline underline-offset-2 dark:text-indigo-300 ${focus}`

export default function StatusBar({ url, source, device, viewport, scale, hint, onHelp, onBlank, canReportBlank }) {
  return (
    <footer className={`shrink-0 border-t px-4 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 ${panel}`}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="truncate">
          URL: <span className="font-mono text-zinc-700 dark:text-zinc-300">{url ? shortLabel(url) : 'none'}</span>
        </span>
        <span>
          Device: <span className="text-zinc-700 dark:text-zinc-300">{device.name}</span>
        </span>
        <span>
          Viewport:{' '}
          <span className="font-mono text-zinc-700 dark:text-zinc-300">
            {viewport.width} × {viewport.height}
          </span>{' '}
          at {Math.round(scale * 100)}%
        </span>
        {canReportBlank && (
          <button type="button" className={link} onClick={onBlank}>
            Blank preview?
          </button>
        )}
        {source === 'tunnel' && url && (
          <button type="button" className={link} onClick={onHelp}>
            Setup help
          </button>
        )}

        <span className="ml-auto hidden items-center gap-2 xl:flex">
          <span><kbd className={kbd}>R</kbd> reload</span>
          <span><kbd className={kbd}>F</kbd> fullscreen</span>
          <span><kbd className={kbd}>O</kbd> rotate</span>
          <span><kbd className={kbd}>/</kbd> URL</span>
          <span><kbd className={kbd}>Esc</kbd> exit</span>
        </span>
      </div>

      {hint && <p className="mt-1 text-amber-700 dark:text-amber-400">{hint}</p>}
    </footer>
  )
}
