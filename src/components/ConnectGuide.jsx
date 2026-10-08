import { useState } from 'react'
import { DEFAULT_PORT, tunnelCommand, validPort } from '../lib/target.js'
import { CLOUDFLARED_DOWNLOADS_URL } from '../config.js'
import { btnPrimary, focus } from './ui.js'
import CopyField from './CopyField.jsx'
import TunnelDiagram from './TunnelDiagram.jsx'
import { ChevronIcon } from './icons.jsx'

const OS_TABS = [
  { id: 'windows', label: 'Windows' },
  { id: 'macos', label: 'macOS' },
  { id: 'linux', label: 'Linux' },
]

const INSTALL = {
  windows: {
    where: 'PowerShell or Command Prompt',
    cmd: 'winget install --id Cloudflare.cloudflared',
    note: 'Then close and reopen the terminal so the new command is found. No Cloudflare account is needed.',
  },
  macos: {
    where: 'Terminal',
    cmd: 'brew install cloudflared',
    note: 'No Cloudflare account is needed.',
  },
  linux: {
    where: 'a terminal',
    cmd: null,
    note: 'Use your package manager or download the binary from the official page below. No Cloudflare account is needed.',
  },
}

function Step({ n, title, children }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-indigo-600 text-xs font-semibold text-white">{n}</span>
      <div className="min-w-0 flex-1 space-y-2">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{title}</h3>
        {children}
      </div>
    </li>
  )
}

function Trouble({ title, children }) {
  return (
    <details className="group rounded-lg border border-zinc-200 dark:border-zinc-800">
      <summary className={`flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-800 dark:text-zinc-200 ${focus}`}>
        {title}
        <ChevronIcon className="shrink-0 text-zinc-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-2 border-t border-zinc-200 px-3 py-2.5 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">{children}</div>
    </details>
  )
}

const ic = 'rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200'

export default function ConnectGuide({ port, onPort, tunnelValue, onTunnelChange, onConnect, error }) {
  const [os, setOs] = useState('windows')
  const install = INSTALL[os]
  const shownPort = validPort(port) ? port : DEFAULT_PORT

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 text-sm text-zinc-700 dark:text-zinc-300">
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Why do I need a tunnel?</h2>
        <p className="leading-relaxed">
          This tool runs on Vercel, while your website runs on your laptop. Vercel cannot reach your laptop&apos;s{' '}
          <span className={ic}>localhost</span>. A tunnel creates a temporary, secure HTTPS address that forwards requests to your local
          development server, and this tool loads that address inside the device preview.
        </p>
        <TunnelDiagram port={shownPort} />
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Connect localhost</h2>
          <div role="tablist" aria-label="Operating system" className="inline-flex rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-800">
            {OS_TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                type="button"
                aria-selected={os === t.id}
                onClick={() => setOs(t.id)}
                className={`h-7 cursor-pointer rounded-md px-3 text-xs font-medium transition-colors ${focus} ${
                  os === t.id
                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-600 dark:text-white'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <ol className="space-y-5 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <Step n="1" title="Run your website">
            <p>
              In your project folder, in {install.where}, start your dev server and leave it running. Note the port it prints
              (Vite uses <span className={ic}>5173</span>).
            </p>
            <CopyField text="npm run dev" />
          </Step>

          <Step n="2" title="Start the tunnel">
            <label className="flex items-center gap-2">
              <span className="text-zinc-600 dark:text-zinc-400">Local port</span>
              <input
                type="text"
                inputMode="numeric"
                value={port}
                maxLength={5}
                onChange={(e) => onPort(e.target.value.replace(/\D/g, ''))}
                aria-invalid={port !== '' && !validPort(port)}
                className="h-8 w-20 rounded-md border border-zinc-300 bg-white px-2 font-mono text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
            <p>Open a second terminal window and run:</p>
            <CopyField text={tunnelCommand(port)} label="Copy command" />
            <p>
              After a few seconds it prints an address like <span className={ic}>https://random-name.trycloudflare.com</span>. Keep this
              window open while you preview.
            </p>

            <details className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-950/60">
              <summary className={`cursor-pointer rounded text-sm font-medium text-indigo-700 dark:text-indigo-300 ${focus}`}>
                Don&apos;t have cloudflared?
              </summary>
              <div className="mt-2 space-y-2">
                {install.cmd && <CopyField text={install.cmd} />}
                <p>{install.note}</p>
                <a
                  className="font-medium text-indigo-700 underline underline-offset-2 dark:text-indigo-300"
                  href={CLOUDFLARED_DOWNLOADS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Official Cloudflare download and install docs
                </a>
              </div>
            </details>
          </Step>

          <Step n="3" title="Paste the HTTPS tunnel URL">
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                onConnect()
              }}
            >
              <label htmlFor="guide-tunnel-url" className="sr-only">
                Tunnel URL
              </label>
              <input
                id="guide-tunnel-url"
                type="text"
                spellCheck={false}
                autoComplete="off"
                value={tunnelValue}
                onChange={(e) => onTunnelChange(e.target.value)}
                placeholder="https://xxxx.trycloudflare.com"
                aria-invalid={Boolean(error)}
                className={`h-9 min-w-0 flex-1 rounded-md border bg-white px-3 font-mono text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 dark:bg-zinc-950 ${
                  error ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'
                }`}
              />
              <button type="submit" className={btnPrimary}>
                Connect
              </button>
            </form>
            {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Other tunnel tools work the same way (ngrok, localhost.run, and so on). Any normal HTTPS URL is fine.
            </p>
          </Step>
        </ol>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">If something looks wrong</h2>

        <Trouble title="The preview says “Blocked request. This host is not allowed” (Vite)">
          <p>
            Newer Vite versions only answer requests for hosts they know. Allow the tunnel domain in your project&apos;s{' '}
            <span className={ic}>vite.config.js</span>, then restart <span className={ic}>npm run dev</span>:
          </p>
          <CopyField text="server: { allowedHosts: ['.trycloudflare.com'] }" />
          <p>The leading dot allows every random subdomain, so you only do this once.</p>
        </Trouble>

        <Trouble title="Cloudflare error page, or “Bad gateway” (502 / 1033)">
          <p>
            The tunnel is up but cannot reach your site. Check that <span className={ic}>npm run dev</span> is still running and that the
            port in the command matches the one it prints.
          </p>
          <p>
            On Windows, <span className={ic}>localhost</span> sometimes points at IPv6 while your server listens on IPv4. Try{' '}
            <span className={ic}>cloudflared tunnel --url http://127.0.0.1:{shownPort}</span>, or start the server with{' '}
            <span className={ic}>npm run dev -- --host</span>.
          </p>
        </Trouble>

        <Trouble title="The preview is blank or says “refused to connect”">
          <p>
            Your site is probably sending <span className={ic}>X-Frame-Options</span> or a Content-Security-Policy{' '}
            <span className={ic}>frame-ancestors</span> header, which tells browsers not to show it inside another site. Plain Vite and
            Create React App do not send these. Next.js or security middleware (for example helmet) may. Allow this tool&apos;s address
            in your development server only.
          </p>
          <p>Browsers do not tell a web page why an iframe stayed blank, so use the “Blank preview?” link in the status bar for details.</p>
        </Trouble>

        <Trouble title="Live reload (HMR) does not update inside the preview">
          <p>
            Usually it works through the tunnel. If it does not, set the Vite HMR port to the tunnel&apos;s HTTPS port:
          </p>
          <CopyField text="server: { hmr: { clientPort: 443 } }" />
        </Trouble>

        <Trouble title="The tunnel URL stopped working">
          <p>
            Quick Tunnel addresses are temporary and change every time you start cloudflared. Run the command again and paste the new
            URL.
          </p>
        </Trouble>
      </section>
    </div>
  )
}
