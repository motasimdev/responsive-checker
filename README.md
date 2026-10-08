# Responsive Preview

A responsive preview tool that runs **on Vercel** and shows the website on **your laptop's localhost** inside phone, tablet and desktop frames, live and interactive, through an HTTPS tunnel.

You do **not** run this project locally. On your laptop you only run your own website and `cloudflared`.

```
 Your laptop                                        Internet                 Vercel
┌──────────────────────┐
│ Your website         │
│ localhost:5173       │
│        │             │
│        ▼             │      HTTPS
│ cloudflared ─────────┼──────────────▶ https://xxxx.trycloudflare.com
└──────────────────────┘                          │
                                                  ▼
                                    Responsive Preview (this project)
                                                  │
                                                  ▼
                                    iPhone / iPad / Desktop frame
```

The browser loads the tunnel URL directly in an `<iframe>`. There is no backend, no proxy and no database. Nothing about your site passes through this app's servers.

## Basic workflow

1. Start your website on your laptop.
2. Start a Cloudflare Quick Tunnel to it.
3. Paste the HTTPS URL that `cloudflared` prints into Responsive Preview and click **Connect**.
4. Switch devices, rotate, zoom and test.

## Windows setup (step by step)

**One time: install cloudflared**

Download the Windows installer from the official page, or use winget:

```powershell
winget install --id Cloudflare.cloudflared
```

Official downloads: https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/

Close and reopen the terminal afterwards. No Cloudflare account, domain, DNS or login is needed.

**Every time**

1. In your project folder, in terminal 1:

   ```powershell
   npm run dev
   ```

   Note the port it prints (Vite uses `5173`).

2. In a second terminal (terminal 2):

   ```powershell
   cloudflared tunnel --url http://localhost:5173
   ```

   After a few seconds it prints a line like `https://random-name.trycloudflare.com`. Leave this window open.

3. Open your Responsive Preview Vercel URL, stay on **Localhost via tunnel**, paste the address and click **Connect**.

The app can also build the command for you. Type your port in the **Local port** box and use **Copy command**. The app only copies text, it never runs anything.

On macOS use `brew install cloudflared`. On Linux use your package manager or the binary from the official page.

`Tunnel.bat` in this repository is an optional Windows helper that asks for a port and starts the tunnel for you.

## Cloudflare Quick Tunnel

```
cloudflared tunnel --url http://localhost:5173
```

Official docs: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/do-more-with-tunnels/trycloudflare/

## Different ports

```
cloudflared tunnel --url http://localhost:3000
cloudflared tunnel --url http://localhost:4173
```

## Other tunnel tools

Any tool that gives you a normal HTTPS URL works, for example ngrok (`ngrok http 5173`) or localhost.run. Paste the URL the same way. Cloudflare is just the recommended default. Some providers show a warning page on first visit, which you may need to click through inside the preview.

## The two modes

| Mode | Use it for | Notes |
| --- | --- | --- |
| **Localhost via tunnel** | Your own dev site | Paste the `https://` tunnel URL. |
| **Public URL** | Any site already on the internet | Existing preview behaviour. |

Each mode remembers its own URL. If you type `localhost`, `127.0.0.1`, `0.0.0.0` or a LAN address, the app **does not load it**. It explains that Vercel cannot reach your laptop and shows the tunnel steps instead. A localhost address is never saved as a preview target.

## Features

- Mobile: iPhone SE (375×667), iPhone 16 (393×852), iPhone 16 Pro Max (440×956)
- Tablet: iPad Mini (768×1024), iPad Pro (1024×1366), Surface Pro (912×1368)
- Desktop: Laptop (1280×800), Desktop (1440×900), Full HD (1920×1080)
- Portrait / landscape, zoom with auto-fit, fullscreen, refresh, open in new tab, copy URL
- The iframe always receives the exact device viewport. Scaling is visual only
- Status: Ready, Connecting, Connected, Unable to load, iframe blocked
- Saved in your browser (`localStorage`): mode, last URLs, port, device, orientation, zoom, theme. No passwords, tokens or cookies are stored

Shortcuts: `R` reload, `F` fullscreen, `O` rotate, `/` focus URL, `Ctrl/Cmd+Enter` connect, `Esc` close dialog or fullscreen.

## Important limitations

- **localhost cannot be reached from Vercel.** `localhost` always means the computer running the browser tab, so a tunnel is required.
- **Keep both running.** Your dev server and `cloudflared` must stay running while you preview.
- **Quick Tunnel URLs change** every time `cloudflared` restarts. Paste the new one. Quick Tunnels are for testing only and have no uptime guarantee.
- **Use HTTPS tunnel URLs.** This app is served over HTTPS, so browsers block `http://` pages inside it.
- **Iframe restrictions still apply.** If your site sends `X-Frame-Options: DENY` / `SAMEORIGIN` or a CSP `frame-ancestors` that excludes this app, the browser refuses to show it. That is not a tunnel problem.
- **A web page cannot see why an iframe is blank.** Browsers hide that. The app can tell whether the address answers, but not whether embedding is allowed, so it never claims to know. If the preview is blank or says "refused to connect", click **Blank preview?** in the status bar for the explanation.
- **Cloudflare error page inside the preview** (502 / 1033) means the tunnel is up but your site or `cloudflared` is not reachable. Check that `npm run dev` is still running and the port matches.
- The preview does not emulate touch input, device pixel ratio or a phone user agent. It tests layout at the right viewport size.

## Common problems with Vite

**"Blocked request. This host is not allowed"**

Newer Vite versions only answer known hosts. In **your website's** `vite.config.js`:

```js
export default defineConfig({
  server: { allowedHosts: ['.trycloudflare.com'] },
})
```

Restart `npm run dev`. The leading dot allows every random subdomain.

**Bad gateway / the tunnel cannot reach the site**

On Windows, `localhost` sometimes resolves to IPv6 while the server listens on IPv4. Try:

```
cloudflared tunnel --url http://127.0.0.1:5173
```

or start Vite with `npm run dev -- --host`. You do not need `--host` otherwise.

**Live reload does not update inside the preview**

Usually it works through the tunnel. If not, in your `vite.config.js`: `server: { hmr: { clientPort: 443 } }`.

**Iframe blocked (Express/helmet, Next.js)**

For development only, allow this app's address and drop `X-Frame-Options`:

```
Content-Security-Policy: frame-ancestors 'self' https://your-app.vercel.app
```

Plain Vite and Create React App do not send these headers.

## Security

- No server code. Nothing is proxied, logged or stored by this app, so there is no open proxy to abuse.
- The app never runs shell commands. It only generates text for you to copy.
- It never asks for Cloudflare tokens or accounts for basic use.
- It does not modify the site you preview. It only loads the URL you give it.
- Anyone who has your tunnel URL can open your dev site while the tunnel runs. Stop `cloudflared` when you are done.

## Deploy to Vercel

Import the GitHub repository in Vercel. The Vite preset is detected automatically (build command `npm run build`, output `dist`). No environment variables or server settings are needed.

Edit `REPO_URL` in `src/config.js` so the header's GitHub button points to your repository.

## Development

Only needed if you change the tool itself:

```
npm install
npm run dev     # http://localhost:5199
npm run build
```

```
src/
  App.jsx                    state: mode, targets, status, scaling, shortcuts
  config.js                  repo link, cloudflared docs link
  data/devices.js            device list and frame styling
  lib/target.js              URL classification: public / localhost / tunnel
  hooks/useReach.js          is the address answering? (browser-side, no backend)
  components/                TargetBar, ConnectGuide, TunnelDiagram, ProblemCard,
                             DeviceFrame, PreviewIframe, StatusBar, ...
```

Dependencies: React, Vite and Tailwind CSS. Icons are inline SVG.
