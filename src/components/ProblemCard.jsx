import { btn, btnPrimary } from './ui.js'
import { AlertIcon, ExternalIcon, HelpIcon, RefreshIcon } from './icons.jsx'
import { DEFAULT_PORT, shortLabel, tunnelCommand, validPort } from '../lib/target.js'
import CopyField from './CopyField.jsx'

const ic = 'rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200'

function Check({ children }) {
  return (
    <li className="flex gap-2">
      <span className="text-emerald-600 dark:text-emerald-400" aria-hidden="true">
        ✓
      </span>
      <span>{children}</span>
    </li>
  )
}

function Local({ port, source }) {
  const p = validPort(port) ? port : DEFAULT_PORT
  return (
    <>
      <p>
        This Responsive Checker is running on Vercel, so it cannot directly access <span className={ic}>localhost</span> on your laptop.
      </p>
      <p>Start a tunnel and paste the HTTPS tunnel URL instead.</p>
      <p className="text-zinc-500 dark:text-zinc-400">
        Example: <span className="font-mono">https://xxxx.trycloudflare.com</span>
      </p>
      <p>Run this on your laptop (port {p}):</p>
      <CopyField text={tunnelCommand(p)} label="Copy command" />
      {source === 'public' && <p className="text-xs text-zinc-500 dark:text-zinc-400">You are in Public URL mode. Switch to “Localhost via tunnel” to paste the tunnel address.</p>}
    </>
  )
}

function Unreachable({ source }) {
  return source === 'tunnel' ? (
    <>
      <p className="font-medium text-zinc-900 dark:text-zinc-100">Could not reach the tunnel.</p>
      <p>Make sure:</p>
      <ul className="space-y-1">
        <Check>Your local website is running</Check>
        <Check>cloudflared is running</Check>
        <Check>The tunnel URL is copied correctly</Check>
        <Check>The tunnel has not expired</Check>
      </ul>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">Quick Tunnel addresses change every time cloudflared restarts.</p>
    </>
  ) : (
    <>
      <p className="font-medium text-zinc-900 dark:text-zinc-100">Could not reach this website.</p>
      <p>Make sure:</p>
      <ul className="space-y-1">
        <Check>The address is typed correctly</Check>
        <Check>The website is online</Check>
        <Check>It uses https:// (this tool is served over HTTPS)</Check>
      </ul>
    </>
  )
}

function Blocked() {
  return (
    <>
      <p className="font-medium text-zinc-900 dark:text-zinc-100">
        The server is reachable, but the website does not allow iframe embedding.
      </p>
      <p>
        Check <span className={ic}>X-Frame-Options</span> and <span className={ic}>Content-Security-Policy</span>{' '}
        <span className={ic}>frame-ancestors</span> on your development server. This is not a tunnel problem.
      </p>
      <p>For development only, allow this tool&apos;s address and drop <span className={ic}>X-Frame-Options</span>:</p>
      <CopyField text={`Content-Security-Policy: frame-ancestors 'self' ${window.location.origin}`} />
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Browsers do not let a web page see why an iframe stayed blank. If the preview actually works, just go back to it.
      </p>
    </>
  )
}

function SelfRef() {
  return (
    <p>
      That address is this tool itself (<span className="font-mono">{window.location.origin}</span>), so it would only embed itself. Enter
      your own website&apos;s tunnel URL instead.
    </p>
  )
}

const TITLES = {
  local: 'Localhost detected',
  unreachable: 'Unable to load the preview',
  blocked: 'Iframe embedding looks blocked',
  self: 'That is this tool’s own address',
}

export default function ProblemCard({ kind, source, url, port, onRetry, onForce, onOpenUrl, onHelp, onSwitchToTunnel, onBack }) {
  return (
    <div
      role="alert"
      className="m-auto w-full max-w-xl space-y-3 rounded-xl border border-zinc-200 bg-white p-5 text-sm leading-relaxed text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
    >
      <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
        <AlertIcon className="text-amber-500" size={18} />
        {TITLES[kind]}
      </h2>
      {url && kind !== 'local' && kind !== 'self' && <p className="truncate font-mono text-xs text-zinc-500">{shortLabel(url)}</p>}

      {kind === 'local' && <Local port={port} source={source} />}
      {kind === 'unreachable' && <Unreachable source={source} />}
      {kind === 'blocked' && <Blocked />}
      {kind === 'self' && <SelfRef />}

      <div className="flex flex-wrap gap-2 pt-1">
        {kind === 'local' && source === 'public' && (
          <button type="button" className={btnPrimary} onClick={onSwitchToTunnel}>
            Switch to tunnel mode
          </button>
        )}
        {(kind === 'local' || kind === 'unreachable') && source === 'tunnel' && (
          <button type="button" className={kind === 'local' ? btnPrimary : btn} onClick={onHelp}>
            <HelpIcon /> Setup help
          </button>
        )}
        {kind === 'unreachable' && (
          <button type="button" className={btnPrimary} onClick={onRetry}>
            <RefreshIcon /> Check again
          </button>
        )}
        {(kind === 'unreachable' || kind === 'blocked') && (
          <button type="button" className={btn} onClick={onOpenUrl}>
            <ExternalIcon /> Open in new tab
          </button>
        )}
        {kind === 'unreachable' && (
          <button type="button" className={btn} onClick={onForce} title="Show the iframe anyway. The check can be wrong for sites without CORS headers.">
            Show preview anyway
          </button>
        )}
        {kind === 'blocked' && (
          <button type="button" className={btnPrimary} onClick={onBack}>
            Back to preview
          </button>
        )}
      </div>
    </div>
  )
}
