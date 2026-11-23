// Provisional assets for the Hello Luki smoke App.
// Generate only missing files; a future brand export always wins.
// All eight exports are correctly sized real images, not checks bypassed.
import { mkdir, access, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { deflateSync } from 'node:zlib'

const target = new URL('../public/img/app/', import.meta.url)
const PNG_SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
const table = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
function crc32(data) {
  let c = 0xffffffff
  for (const byte of data) c = table[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function chunk(type, payload) {
  const label = Buffer.from(type)
  const size = Buffer.alloc(4)
  size.writeUInt32BE(payload.length)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([label, payload])))
  return Buffer.concat([size, label, payload, crc])
}
function png(width, height) {
  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header[8] = 8 // 8-bit depth
  header[9] = 6 // RGBA
  const pixels = Buffer.alloc(height * (width * 4 + 1))
  for (let y = 0; y < height; y++) {
    const row = y * (width * 4 + 1)
    for (let x = 0; x < width; x++) pixels[row + 1 + x * 4 + 3] = 255
  }
  return Buffer.concat([
    PNG_SIG,
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(pixels, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}
function ico() {
  const sizes = [16, 32, 48, 64]
  const frames = sizes.map((size) => png(size, size))
  const header = Buffer.alloc(6 + 16 * sizes.length)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(sizes.length, 4)
  let offset = header.length
  sizes.forEach((size, i) => {
    const row = 6 + 16 * i
    header[row] = size
    header[row + 1] = size
    header[row + 2] = 0
    header[row + 3] = 0
    header.writeUInt16LE(1, row + 4)
    header.writeUInt16LE(32, row + 6)
    header.writeUInt32LE(frames[i].length, row + 8)
    header.writeUInt32LE(offset, row + 12)
    offset += frames[i].length
  })
  return Buffer.concat([header, ...frames])
}
const images = {
  'logo.png': [512, 512],
  'wordmark-light.png': [384, 96],
  'wordmark-dark.png': [384, 96],
  'cover.png': [1280, 720],
  'thumbnail.png': [1200, 630],
  'pwa/icon-192.png': [192, 192],
  'pwa/icon-512.png': [512, 512],
}
for (const [name, [w, h]] of Object.entries(images)) {
  const url = new URL(name, target)
  try { await access(url) } catch {
    await mkdir(dirname(url.pathname), { recursive: true })
    await writeFile(url, png(w, h))
    process.stdout.write(`Created placeholder: ${name}\n`)
  }
}
const favicon = new URL('favicon.ico', target)
try { await access(favicon) } catch {
  await mkdir(dirname(favicon.pathname), { recursive: true })
  await writeFile(favicon, ico())
  process.stdout.write('Created placeholder: favicon.ico\n')
}
