import { ArrowDownIcon, ArrowRightIcon } from './icons.jsx'

function Node({ title, sub, tone }) {
  const tones = {
    laptop: 'border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/10',
    tunnel: 'border-amber-500/40 bg-amber-50 dark:bg-amber-500/10',
    vercel: 'border-indigo-500/40 bg-indigo-50 dark:bg-indigo-500/10',
  }
  return (
    <div className={`min-w-0 flex-1 rounded-lg border px-3 py-2 text-center ${tones[tone]}`}>
      <p className="truncate font-mono text-xs font-medium text-zinc-900 dark:text-zinc-100">{title}</p>
      <p className="text-[11px] text-zinc-600 dark:text-zinc-400">{sub}</p>
    </div>
  )
}

function Arrow() {
  return (
    <span className="grid shrink-0 place-items-center text-zinc-400">
      <ArrowRightIcon className="hidden sm:block" />
      <ArrowDownIcon className="sm:hidden" />
    </span>
  )
}

export default function TunnelDiagram({ port }) {
  return (
    <div
      role="img"
      aria-label={`Your website on localhost port ${port} connects through cloudflared to an HTTPS tunnel URL, which the Responsive Checker on Vercel loads.`}
      className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center"
    >
      <Node tone="laptop" title={`localhost:${port}`} sub="your website, on your laptop" />
      <Arrow />
      <Node tone="laptop" title="cloudflared" sub="runs on your laptop" />
      <Arrow />
      <Node tone="tunnel" title="https://xxxx.trycloudflare.com" sub="temporary HTTPS address" />
      <Arrow />
      <Node tone="vercel" title="Responsive Checker" sub="hosted on Vercel" />
    </div>
  )
}
