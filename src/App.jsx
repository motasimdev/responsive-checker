import { useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_DEVICE_IDS, devices, findDevice, viewportFor, FRAME_STYLE } from './data/devices.js'
import { useLocalStorage } from './hooks/useLocalStorage.js'
import { useElementSize } from './hooks/useElementSize.js'
import { useReach } from './hooks/useReach.js'
import { copyText } from './lib/clipboard.js'
import { DEFAULT_PORT, classifyTarget, displayUrl, hasMixedContent, isSelfOrigin, shortLabel, validPort } from './lib/target.js'
import Header from './components/Header.jsx'
import TargetBar from './components/TargetBar.jsx'
import DeviceCategoryTabs from './components/DeviceCategoryTabs.jsx'
import DeviceTabs from './components/DeviceTabs.jsx'
import PreviewToolbar from './components/PreviewToolbar.jsx'
import DeviceFrame from './components/DeviceFrame.jsx'
import PreviewIframe from './components/PreviewIframe.jsx'
import EmptyScreen from './components/EmptyScreen.jsx'
import ProblemCard from './components/ProblemCard.jsx'
import ConnectGuide from './components/ConnectGuide.jsx'
import Dialog from './components/Dialog.jsx'
import StatusBar from './components/StatusBar.jsx'
import { panel } from './components/ui.js'

const ZOOM_STEPS = [0.25, 0.33, 0.5, 0.67, 0.75, 0.9, 1, 1.25, 1.5, 2]
const WORKSPACE_PADDING = 32 // p-4 on both sides
const EMPTY = { tunnel: '', public: '' }

const systemTheme = () => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

const STATUS_LABELS = {
  tunnel: {
    ready: 'Ready',
    connecting: 'Connecting…',
    connected: 'Tunnel URL connected',
    error: 'Unable to load tunnel URL',
    blocked: 'Website loaded but iframe embedding is blocked',
  },
  public: {
    ready: 'Ready',
    connecting: 'Connecting…',
    connected: 'Website connected',
    error: 'Unable to load website',
    blocked: 'Website loaded but iframe embedding is blocked',
  },
}

export default function App() {
  const [theme, setTheme] = useLocalStorage('rp.theme', systemTheme())
  const [category, setCategory] = useLocalStorage('rp.category', 'mobile')
  const [deviceIds, setDeviceIds] = useLocalStorage('rp.devices', DEFAULT_DEVICE_IDS)
  const [landscape, setLandscape] = useLocalStorage('rp.landscape', false)
  const [zoom, setZoom] = useLocalStorage('rp.zoom', null) // null = auto-fit
  const [port, setPort] = useLocalStorage('rp.port', DEFAULT_PORT)

  // sourceType: "tunnel" | "public". Each keeps its own typed text and loaded target, so
  // switching modes never loses the other one. A localhost address is never stored as a target.
  const [source, setSource] = useLocalStorage('rp.source', 'tunnel')
  const [drafts, setDrafts] = useLocalStorage('rp.drafts', EMPTY)
  const [targets, setTargets] = useLocalStorage('rp.targets', EMPTY)
  const [history, setHistory] = useLocalStorage('rp.history', { tunnel: [], public: [] })

  const [reloadKey, setReloadKey] = useState(0)
  const [error, setError] = useState('')
  const [problem, setProblem] = useState(null) // 'local' | 'self' | 'blocked' | null
  const [forced, setForced] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [loadedKey, setLoadedKey] = useState('')
  const [helpOpen, setHelpOpen] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [copied, setCopied] = useState(false)

  const inputRef = useRef(null)
  const workspaceRef = useRef(null)
  const workspace = useElementSize(workspaceRef)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // ---- device / viewport / scale ----------------------------------------
  const device = findDevice(category, { ...DEFAULT_DEVICE_IDS, ...deviceIds }[category])
  const viewport = viewportFor(device, landscape)
  const { bezel } = FRAME_STYLE[device.type]
  const frameW = viewport.width + bezel * 2
  const frameH = viewport.height + bezel * 2

  const ready = workspace.width > 0 && workspace.height > 0
  const fit = ready
    ? Math.max(0.1, Math.min(1, (workspace.width - WORKSPACE_PADDING) / frameW, (workspace.height - WORKSPACE_PADDING) / frameH))
    : 1
  const scale = zoom ?? fit

  // ---- target + connection status ---------------------------------------
  // Re-validate what was stored, so an old localhost value can never become a target.
  const stored = targets[source] ?? ''
  const checked = stored ? classifyTarget(stored, source) : null
  const target = checked?.kind === 'ok' && !isSelfOrigin(checked.url) ? checked.url : ''

  const reach = useReach(target, reloadKey)
  const frameKey = `${target}|${reloadKey}`
  const frameLoaded = loadedKey === frameKey

  let statusKind = 'ready'
  if (target) {
    if (blocked) statusKind = 'blocked'
    else if (reach.status === 'unreachable' && !forced) statusKind = 'error'
    else if (reach.status === 'checking' || !frameLoaded) statusKind = 'connecting'
    else statusKind = 'connected'
  }
  const status = { kind: statusKind, label: STATUS_LABELS[source][statusKind], host: target ? shortLabel(target) : '' }

  let card = problem // local / self set on submit
  if (!card && target) {
    if (blocked) card = 'blocked'
    else if (reach.status === 'unreachable' && !forced) card = 'unreachable'
  }

  const mixed = Boolean(target) && hasMixedContent(target)
  const hint = mixed
    ? 'This tool is served over HTTPS, so browsers block http:// pages inside it. Use an https:// address, or a tunnel for localhost.'
    : ''

  useEffect(() => {
    document.title = target ? `${shortLabel(target)} · Responsive Preview` : 'Responsive Preview'
  }, [target])

  // ---- actions -----------------------------------------------------------
  const resetFlags = () => {
    setError('')
    setProblem(null)
    setForced(false)
    setBlocked(false)
  }

  const submit = useCallback(() => {
    const result = classifyTarget(drafts[source], source)

    if (result.kind === 'error') {
      setProblem(null)
      setError(result.error)
      return
    }
    if (result.kind === 'local') {
      // Never loaded and never stored. Explain the tunnel instead.
      if (validPort(result.port)) setPort(result.port)
      setError('')
      setProblem('local')
      return
    }
    if (isSelfOrigin(result.url)) {
      setError('')
      setProblem('self')
      return
    }

    const shown = displayUrl(result.url)
    resetFlags()
    setHelpOpen(false)
    setDrafts((d) => ({ ...d, [source]: shown }))
    setTargets((t) => ({ ...t, [source]: result.url }))
    setHistory((h) => ({ ...h, [source]: [shown, ...(h[source] ?? []).filter((x) => x !== shown)].slice(0, 8) }))
    setReloadKey((k) => k + 1) // loading the same URL again doubles as a reload
  }, [drafts, source, setPort, setDrafts, setTargets, setHistory])

  const changeDraft = (value) => {
    setDrafts((d) => ({ ...d, [source]: value }))
    if (error) setError('')
    if (problem === 'local' || problem === 'self') setProblem(null)
  }

  const changeSource = (next) => {
    setSource(next)
    resetFlags()
  }

  const refresh = useCallback(() => {
    if (!target) {
      submit()
      return
    }
    setBlocked(false)
    setReloadKey((k) => k + 1)
  }, [target, submit])

  const rotate = useCallback(() => {
    if (device.type !== 'desktop') setLandscape((v) => !v)
  }, [device.type, setLandscape])

  const zoomIn = () => setZoom((z) => ZOOM_STEPS.find((s) => s > scale + 0.005) ?? z)
  const zoomOut = () => setZoom((z) => [...ZOOM_STEPS].reverse().find((s) => s < scale - 0.005) ?? z)

  const openInTab = () => target && window.open(target, '_blank', 'noopener,noreferrer')

  const copyUrl = async () => {
    if (target && (await copyText(target))) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  const selectDevice = (id) => setDeviceIds((prev) => ({ ...DEFAULT_DEVICE_IDS, ...prev, [category]: id }))

  // ---- keyboard shortcuts (registered once, always sees the latest actions) ----
  const actions = useRef({})
  actions.current = { submit, refresh, rotate, fullscreen, helpOpen }

  useEffect(() => {
    const onKey = (e) => {
      if (e.defaultPrevented) return
      const a = actions.current

      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        a.submit()
        return
      }
      if (e.key === 'Escape') {
        if (a.helpOpen) {
          e.preventDefault()
          setHelpOpen(false)
        } else if (a.fullscreen) {
          e.preventDefault()
          setFullscreen(false)
        }
        return
      }

      const t = e.target
      const editing = t instanceof HTMLElement && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))
      if (editing || a.helpOpen || e.ctrlKey || e.metaKey || e.altKey) return

      switch (e.key.toLowerCase()) {
        case 'r':
          a.refresh()
          break
        case 'f':
          setFullscreen((f) => !f)
          break
        case 'o':
          a.rotate()
          break
        case '/':
          e.preventDefault()
          inputRef.current?.focus()
          inputRef.current?.select()
          break
        default:
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ---- render ------------------------------------------------------------
  const showInlineGuide = source === 'tunnel' && !target && !card && !helpOpen

  const guide = (
    <ConnectGuide
      port={port}
      onPort={setPort}
      tunnelValue={drafts.tunnel}
      onTunnelChange={changeDraft}
      onConnect={submit}
      error={error}
    />
  )

  return (
    <div className="flex h-dvh flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <Header theme={theme} onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />

      <TargetBar
        source={source}
        onSource={changeSource}
        value={drafts[source]}
        onChange={changeDraft}
        onSubmit={submit}
        onRefresh={refresh}
        error={error}
        history={history[source] ?? []}
        inputRef={inputRef}
        status={status}
        port={port}
        onPort={setPort}
        onHelp={() => setHelpOpen(true)}
      />

      <div className={`flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b px-4 py-2 ${panel}`}>
        <DeviceCategoryTabs value={category} onChange={setCategory} />
        <div className="flex min-w-0 flex-1 basis-64">
          <DeviceTabs devices={devices[category]} value={device.id} onChange={selectDevice} />
        </div>
      </div>

      {/* Same element in normal and fullscreen mode, so the iframe never reloads when toggling. */}
      <section
        aria-label="Preview"
        className={fullscreen ? 'fixed inset-0 z-50 flex flex-col bg-zinc-50 dark:bg-zinc-950' : 'flex min-h-0 flex-1 flex-col'}
      >
        <PreviewToolbar
          device={device}
          viewport={viewport}
          scale={scale}
          isFit={zoom === null}
          landscape={landscape}
          onLandscape={setLandscape}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onZoomReset={() => setZoom(null)}
          onRefresh={refresh}
          onOpen={openInTab}
          onCopy={copyUrl}
          copied={copied}
          hasUrl={Boolean(target)}
          fullscreen={fullscreen}
          onToggleFullscreen={() => setFullscreen((f) => !f)}
        />

        <div
          ref={workspaceRef}
          className="canvas-grid scroll-thin flex min-h-0 flex-1 overflow-auto bg-zinc-100 p-4 dark:bg-zinc-950"
        >
          {card ? (
            <ProblemCard
              kind={card}
              source={source}
              url={target}
              port={port}
              onRetry={() => setReloadKey((k) => k + 1)}
              onForce={() => setForced(true)}
              onOpenUrl={openInTab}
              onHelp={() => setHelpOpen(true)}
              onSwitchToTunnel={() => changeSource('tunnel')}
              onBack={() => setBlocked(false)}
            />
          ) : showInlineGuide ? (
            <div className="m-auto w-full self-start">{guide}</div>
          ) : (
            <DeviceFrame device={device} width={viewport.width} height={viewport.height} scale={scale} ready={ready}>
              {target ? (
                <PreviewIframe
                  key={frameKey}
                  url={target}
                  width={viewport.width}
                  height={viewport.height}
                  scale={scale}
                  deviceName={device.name}
                  source={source}
                  onLoaded={() => setLoadedKey(frameKey)}
                />
              ) : (
                <EmptyScreen scale={scale} />
              )}
            </DeviceFrame>
          )}
        </div>
      </section>

      <StatusBar
        url={target}
        source={source}
        device={device}
        viewport={viewport}
        scale={scale}
        hint={hint}
        onHelp={() => setHelpOpen(true)}
        onBlank={() => setBlocked(true)}
        canReportBlank={Boolean(target) && !card}
      />

      {helpOpen && (
        <Dialog title="Connect localhost" onClose={() => setHelpOpen(false)}>
          {guide}
        </Dialog>
      )}
    </div>
  )
}
