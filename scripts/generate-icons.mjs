import { createCanvas } from '@napi-rs/canvas'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

function drawIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  const s = size / 120 // scale factor (designed at 120x120)

  // White background with rounded rect
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.roundRect(0, 0, size, size, 24 * s)
  ctx.fill()

  // Subtle border
  ctx.strokeStyle = '#e5e5e5'
  ctx.lineWidth = 1 * s
  ctx.beginPath()
  ctx.roundRect(0.5 * s, 0.5 * s, size - 1 * s, size - 1 * s, 24 * s)
  ctx.stroke()

  // Hanger hook (small circle at top)
  ctx.strokeStyle = '#0a0a0a'
  ctx.lineWidth = 2.5 * s
  ctx.beginPath()
  ctx.arc(60 * s, 27 * s, 4 * s, 0, Math.PI * 2)
  ctx.stroke()

  // Hanger stem
  ctx.lineWidth = 3 * s
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(60 * s, 31 * s)
  ctx.lineTo(60 * s, 40 * s)
  ctx.stroke()

  // Hanger triangle
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(60 * s, 40 * s)
  ctx.lineTo(30 * s, 65 * s)
  ctx.lineTo(90 * s, 65 * s)
  ctx.closePath()
  ctx.stroke()

  // Cloud
  ctx.fillStyle = '#94a3b8'
  ctx.beginPath()
  ctx.ellipse(60 * s, 80 * s, 22 * s, 10 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(45 * s, 82 * s, 12 * s, 8 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(75 * s, 82 * s, 12 * s, 8 * s, 0, 0, Math.PI * 2)
  ctx.fill()

  // Rain drops
  ctx.strokeStyle = '#60a5fa'
  ctx.lineWidth = 2 * s
  ctx.lineCap = 'round'
  const drops = [48, 60, 72]
  for (const x of drops) {
    ctx.beginPath()
    ctx.moveTo(x * s, 92 * s)
    ctx.lineTo((x - 2) * s, 100 * s)
    ctx.stroke()
  }

  return canvas
}

const sizes = [
  { size: 512, name: 'logo512.png' },
  { size: 192, name: 'logo192.png' },
  { size: 180, name: 'logo180.png' },
]

for (const { size, name } of sizes) {
  const canvas = drawIcon(size)
  const buffer = canvas.toBuffer('image/png')
  writeFileSync(join(publicDir, name), buffer)
  console.log(`Generated ${name} (${size}x${size})`)
}

// Favicon: 32x32 PNG saved as .ico (modern browsers support PNG favicons)
const faviconCanvas = drawIcon(32)
const faviconBuffer = faviconCanvas.toBuffer('image/png')
writeFileSync(join(publicDir, 'favicon.ico'), faviconBuffer)
console.log('Generated favicon.ico (32x32)')
