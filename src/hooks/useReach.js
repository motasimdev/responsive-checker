import { useEffect, useState } from 'react'
import { hasMixedContent } from '../lib/target.js'

// Is anything answering at this address? Runs from the user's own browser straight to the
// target (no server of ours involved).
//
// What a static page can and cannot learn:
//  - A normal fetch tells us the HTTP status, but only if the site sends CORS headers.
//  - A no-cors fetch only succeeds or fails, which still separates "reachable" from
//    "DNS / connection failure" (expired or mistyped tunnel).
//  - Whether the site allows <iframe> embedding is NOT visible to a web page. Browsers
//    hide it, so we never claim to know.
async function check(url, signal) {
  try {
    const res = await fetch(url, { mode: 'cors', cache: 'no-store', credentials: 'omit', signal })
    res.body?.cancel?.()
    return { status: 'ok', http: res.status }
  } catch (e) {
    if (signal.aborted) throw e
  }
  await fetch(url, { mode: 'no-cors', cache: 'no-store', credentials: 'omit', signal })
  return { status: 'ok' }
}

export function useReach(url, reloadKey) {
  const [state, setState] = useState({ status: 'idle' })

  useEffect(() => {
    if (!url) {
      setState({ status: 'idle' })
      return
    }
    if (hasMixedContent(url)) {
      // The browser would block this request anyway; the status bar explains why.
      setState({ status: 'ok', skipped: true })
      return
    }

    let cancelled = false
    let timedOut = false
    const ctrl = new AbortController()
    const timer = setTimeout(() => {
      timedOut = true
      ctrl.abort()
    }, 12000)

    setState({ status: 'checking' })
    check(url, ctrl.signal)
      .then((r) => !cancelled && setState(r))
      .catch(() => !cancelled && setState({ status: 'unreachable', timedOut }))
      .finally(() => clearTimeout(timer))

    return () => {
      cancelled = true
      ctrl.abort()
      clearTimeout(timer)
    }
  }, [url, reloadKey])

  return state
}
