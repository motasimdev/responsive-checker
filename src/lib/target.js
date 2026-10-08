// Everything about turning what the user typed into a preview target.
//
// Three kinds of address are kept apart on purpose:
//   public    https://example.com                      loaded directly
//   local     localhost / 127.0.0.1 / 192.168.x.x ...  NEVER loaded, needs a tunnel
//   tunnel    https://xxxx.trycloudflare.com           loaded directly

export const DEFAULT_PORT = '5173'

export function isLocalHost(hostname) {
  const h = hostname.replace(/^\[|\]$/g, '').toLowerCase()
  if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.local') || h === '::1' || h === '0.0.0.0') return true
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (m) {
    const [a, b] = [Number(m[1]), Number(m[2])]
    return a === 127 || a === 10 || a === 0 || (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31) || (a === 169 && b === 254)
  }
  return false
}

export function validPort(value) {
  return /^\d{2,5}$/.test(value) && Number(value) > 0 && Number(value) <= 65535
}

/**
 * Result kinds:
 *   { kind: 'ok', url, upgraded?, insecure? }
 *   { kind: 'local', port }     the user typed something on their own machine / network
 *   { kind: 'error', error }
 */
export function classifyTarget(raw, source) {
  const v = (raw ?? '').trim()
  if (!v) {
    return {
      kind: 'error',
      error: source === 'tunnel' ? 'Paste the HTTPS tunnel URL, for example https://xxxx.trycloudflare.com' : 'Enter a website address, for example https://example.com',
    }
  }

  // "5173" or ":5173" is clearly a local port.
  if (/^:?\d{2,5}$/.test(v)) return { kind: 'local', port: v.replace(':', '') }

  const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(v)
  let u
  try {
    u = new URL(hasScheme ? v : `https://${v}`)
  } catch {
    return { kind: 'error', error: 'That does not look like a valid URL' }
  }
  if (!/^https?:$/.test(u.protocol)) return { kind: 'error', error: 'Only http:// and https:// addresses can be previewed' }

  if (isLocalHost(u.hostname)) return { kind: 'local', port: validPort(u.port) ? u.port : '' }
  if (!u.hostname.includes('.')) return { kind: 'error', error: 'That address looks incomplete. Use a full address like example.com' }

  // Tunnel providers always hand out https. Upgrade a typed http:// instead of failing.
  if (source === 'tunnel' && u.protocol === 'http:') {
    u.protocol = 'https:'
    return { kind: 'ok', url: u.href, upgraded: true }
  }
  return { kind: 'ok', url: u.href, insecure: u.protocol === 'http:' }
}

const PROVIDERS = [
  [/\.trycloudflare\.com$/, 'Cloudflare Quick Tunnel'],
  [/\.(ngrok-free\.(app|dev)|ngrok\.(io|app|dev))$/, 'ngrok'],
  [/\.(lhr\.life|localhost\.run)$/, 'localhost.run'],
  [/\.loca\.lt$/, 'localtunnel'],
]

export function providerOf(href) {
  try {
    const host = new URL(href).hostname
    return PROVIDERS.find(([re]) => re.test(host))?.[1] ?? 'HTTPS tunnel'
  } catch {
    return 'HTTPS tunnel'
  }
}

// https://x.trycloudflare.com/ -> https://x.trycloudflare.com
export function displayUrl(href) {
  try {
    const u = new URL(href)
    return u.pathname === '/' && !u.search && !u.hash ? href.replace(/\/$/, '') : href
  } catch {
    return href
  }
}

export function shortLabel(href) {
  try {
    const u = new URL(href)
    const path = u.pathname === '/' ? '' : u.pathname
    return `${u.host}${path}${u.search}`
  } catch {
    return href
  }
}

export function isSelfOrigin(href) {
  try {
    return new URL(href).origin === window.location.origin
  } catch {
    return false
  }
}

// An https page (Vercel) cannot frame a plain-http site.
export function hasMixedContent(href) {
  try {
    return window.location.protocol === 'https:' && new URL(href).protocol === 'http:'
  } catch {
    return false
  }
}

export function tunnelCommand(port) {
  return `cloudflared tunnel --url http://localhost:${validPort(port) ? port : DEFAULT_PORT}`
}
