// Single source of truth for every device the tool can preview.
// width/height are the CSS viewport in portrait (what the page inside the iframe sees).

export const CATEGORIES = [
  { id: 'mobile', label: 'Mobile' },
  { id: 'tablet', label: 'Tablet' },
  { id: 'desktop', label: 'Desktop' },
]

export const devices = {
  mobile: [
    { id: 'iphone-se', name: 'iPhone SE', type: 'mobile', width: 375, height: 667, aspect: '375 / 667' },
    { id: 'iphone-16', name: 'iPhone 16', type: 'mobile', width: 393, height: 852, aspect: '393 / 852' },
    { id: 'iphone-16-pro-max', name: 'iPhone 16 Pro Max', type: 'mobile', width: 440, height: 956, aspect: '440 / 956' },
  ],
  tablet: [
    { id: 'ipad-mini', name: 'iPad Mini', type: 'tablet', width: 768, height: 1024, aspect: '3 / 4' },
    { id: 'ipad-pro', name: 'iPad Pro', type: 'tablet', width: 1024, height: 1366, aspect: '3 / 4' },
    { id: 'surface-pro', name: 'Surface Pro', type: 'tablet', width: 912, height: 1368, aspect: '2 / 3' },
  ],
  desktop: [
    { id: 'laptop', name: 'Laptop', type: 'desktop', width: 1280, height: 800, aspect: '16 / 10' },
    { id: 'desktop', name: 'Desktop', type: 'desktop', width: 1440, height: 900, aspect: '16 / 10' },
    { id: 'full-hd', name: 'Full HD', type: 'desktop', width: 1920, height: 1080, aspect: '16 / 9' },
  ],
}

export const DEFAULT_DEVICE_IDS = {
  mobile: 'iphone-16',
  tablet: 'ipad-mini',
  desktop: 'desktop',
}

// Visual bezel thickness and corner radius (px, before scaling) per device type.
export const FRAME_STYLE = {
  mobile: { bezel: 12, radius: 46 },
  tablet: { bezel: 14, radius: 30 },
  desktop: { bezel: 8, radius: 14 },
}

export function findDevice(category, id) {
  const list = devices[category] ?? devices.mobile
  return list.find((d) => d.id === id) ?? list[0]
}

// Landscape swaps width and height. Desktop never rotates.
export function viewportFor(device, landscape) {
  const rotate = landscape && device.type !== 'desktop'
  return rotate
    ? { width: device.height, height: device.width }
    : { width: device.width, height: device.height }
}
