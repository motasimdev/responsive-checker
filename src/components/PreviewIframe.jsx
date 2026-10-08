import { useEffect, useState } from 'react'

// The real page, rendered live and fully interactive. Parent gives it a new `key` to force a
// reload. Size is the exact device viewport. `onLoaded` fires when the browser reports the
// frame loaded, which on its own proves nothing about embedding being allowed.
export default function PreviewIframe({ url, width, height, scale, deviceName, source, onLoaded }) {
  const [loaded, setLoaded] = useState(false)
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    if (loaded) return
    const t = setTimeout(() => setSlow(true), 8000)
    return () => clearTimeout(t)
  }, [loaded])

  return (
    <>
      <iframe
        src={url}
        title={`${deviceName} preview of ${url}`}
        width={width}
        height={height}
        onLoad={() => {
          setLoaded(true)
          onLoaded?.()
        }}
        className="block border-0 bg-white"
        style={{ width, height }}
        data-testid="preview-iframe"
      />
      {!loaded && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-white/80">
          {/* Counter-scale so the spinner stays readable when the device is shrunk. */}
          <div
            className="flex flex-col items-center gap-3 text-zinc-600"
            style={{ transform: `scale(${1 / scale})`, transformOrigin: 'center' }}
          >
            <span className="size-6 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-600" />
            <span className="text-sm">
              {slow ? (source === 'tunnel' ? 'Still loading. Is cloudflared running?' : 'Still loading…') : 'Connecting…'}
            </span>
          </div>
        </div>
      )}
    </>
  )
}
