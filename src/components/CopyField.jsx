import { useState } from 'react'
import { copyText } from '../lib/clipboard.js'
import { btn } from './ui.js'
import { CheckIcon, CopyIcon } from './icons.jsx'

// A code line with a Copy button. The app only ever copies text. It never runs anything.
export default function CopyField({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    if (await copyText(text)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <div className="flex items-stretch gap-2">
      <code className="scroll-thin flex min-w-0 flex-1 items-center overflow-x-auto whitespace-nowrap rounded-md bg-zinc-100 px-3 py-2 font-mono text-xs text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
        {text}
      </code>
      <button type="button" className={btn} onClick={copy}>
        {copied ? <CheckIcon className="text-emerald-500" /> : <CopyIcon />}
        {copied ? 'Copied' : label}
      </button>
    </div>
  )
}
