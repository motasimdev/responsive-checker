import { btn, focus, iconBtn, panel } from './ui.js'
import {
  CheckIcon,
  CopyIcon,
  ExternalIcon,
  LandscapeIcon,
  MaximizeIcon,
  MinimizeIcon,
  MinusIcon,
  PlusIcon,
  PortraitIcon,
  RefreshIcon,
} from './icons.jsx'

function Orientation({ landscape, onChange }) {
  const item = (isLandscape, Icon, label) => {
    const active = landscape === isLandscape
    return (
      <button
        type="button"
        aria-pressed={active}
        aria-label={label}
        title={`${label} (O)`}
        onClick={() => onChange(isLandscape)}
        className={`grid size-7 cursor-pointer place-items-center rounded transition-colors ${focus} ${
          active
            ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-600 dark:text-white'
            : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
        }`}
      >
        <Icon />
      </button>
    )
  }
  return (
    <div role="group" aria-label="Orientation" className="inline-flex rounded-md bg-zinc-100 p-0.5 dark:bg-zinc-800">
      {item(false, PortraitIcon, 'Portrait')}
      {item(true, LandscapeIcon, 'Landscape')}
    </div>
  )
}

export default function PreviewToolbar({
  device,
  viewport,
  scale,
  isFit,
  landscape,
  onLandscape,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onRefresh,
  onOpen,
  onCopy,
  copied,
  hasUrl,
  fullscreen,
  onToggleFullscreen,
}) {
  const pct = Math.round(scale * 100)

  return (
    <div className={`flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b px-4 py-2 ${panel}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{device.name}</span>
        <span
          className="rounded-md bg-zinc-100 px-2 py-1 font-mono text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          title="Viewport the page inside the iframe receives"
        >
          {viewport.width} × {viewport.height}
        </span>
        <span
          className="rounded-md bg-indigo-50 px-2 py-1 font-mono text-xs text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200"
          title={isFit ? 'Auto-fit to window' : 'Manual zoom'}
        >
          {pct}%{isFit ? ' fit' : ''}
        </span>
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        {device.type !== 'desktop' && <Orientation landscape={landscape} onChange={onLandscape} />}

        <div className="flex items-center gap-1" role="group" aria-label="Zoom">
          <button type="button" className={iconBtn} onClick={onZoomOut} aria-label="Zoom out" title="Zoom out">
            <MinusIcon />
          </button>
          <button type="button" className={iconBtn} onClick={onZoomIn} aria-label="Zoom in" title="Zoom in">
            <PlusIcon />
          </button>
          <button
            type="button"
            className={btn}
            onClick={onZoomReset}
            disabled={isFit}
            title="Reset zoom (fit to window)"
          >
            Reset
          </button>
        </div>

        <div className="flex items-center gap-1" role="group" aria-label="Page actions">
          <button type="button" className={iconBtn} onClick={onRefresh} disabled={!hasUrl} aria-label="Reload preview" title="Reload preview (R)">
            <RefreshIcon />
          </button>
          <button type="button" className={iconBtn} onClick={onOpen} disabled={!hasUrl} aria-label="Open in new tab" title="Open in new tab">
            <ExternalIcon />
          </button>
          <button type="button" className={iconBtn} onClick={onCopy} disabled={!hasUrl} aria-label="Copy URL" title="Copy URL">
            {copied ? <CheckIcon className="text-emerald-500" /> : <CopyIcon />}
          </button>
        </div>

        <button
          type="button"
          onClick={onToggleFullscreen}
          title={fullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen preview (F)'}
          className={fullscreen ? `${btn} !border-indigo-500 !bg-indigo-600 !text-white hover:!bg-indigo-500` : btn}
        >
          {fullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
          {fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        </button>
      </div>
    </div>
  )
}
