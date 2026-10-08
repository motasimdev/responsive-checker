import { REPO_URL } from '../config.js'
import { btn, iconBtn, panel } from './ui.js'
import { GithubIcon, LogoIcon, MoonIcon, SunIcon } from './icons.jsx'

export default function Header({ theme, onToggleTheme }) {
  return (
    <header className={`flex h-12 shrink-0 items-center justify-between gap-3 border-b px-4 ${panel}`}>
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-indigo-600 text-white">
          <LogoIcon size={16} />
        </span>
        <h1 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Responsive Preview</h1>
        <span className="hidden truncate text-sm text-zinc-500 sm:inline dark:text-zinc-400">
          Test your localhost site across devices
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className={iconBtn}
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
        <a className={btn} href={REPO_URL} target="_blank" rel="noopener noreferrer">
          <GithubIcon />
          <span className="hidden sm:inline">GitHub</span>
        </a>
      </div>
    </header>
  )
}
