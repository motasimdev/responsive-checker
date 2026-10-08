import { FRAME_STYLE } from '../data/devices.js'

// Draws the bezel around a screen of exactly `width` x `height` CSS pixels, then scales
// the whole thing visually. The layout wrapper gets the scaled size so scrolling stays
// correct; the screen inside keeps its true size, so the page still sees the real viewport.
export default function DeviceFrame({ device, width, height, scale, ready, children }) {
  const { bezel, radius } = FRAME_STYLE[device.type]
  const frameW = width + bezel * 2
  const frameH = height + bezel * 2

  return (
    <div
      className={`m-auto shrink-0 ${ready ? '' : 'invisible'}`}
      style={{ width: frameW * scale, height: frameH * scale }}
      data-testid="frame-box"
    >
      <div
        className="bg-zinc-900 shadow-2xl shadow-black/30 ring-1 ring-black/40"
        style={{
          width: frameW,
          height: frameH,
          padding: bezel,
          borderRadius: radius,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <div
          className="relative overflow-hidden bg-white"
          style={{ width, height, borderRadius: Math.max(radius - bezel, 4) }}
          data-testid="screen"
        >
          {children}
        </div>
      </div>
    </div>
  )
}
