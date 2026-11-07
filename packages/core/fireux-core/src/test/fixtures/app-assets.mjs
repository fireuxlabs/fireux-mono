import { createRequire } from 'node:module'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

const sharp = createRequire(import.meta.url)('sharp')
export const testPng = (width, height, background = '#123456') =>
  sharp({ create: { width, height, channels: 4, background } })
    .png()
    .toBuffer()

export async function testIcon(sizes = [16, 32, 48, 64]) {
  const images = await Promise.all(sizes.map((size) => testPng(size, size)))
  const directory = Buffer.alloc(6 + sizes.length * 16)
  directory.writeUInt16LE(1, 2)
  directory.writeUInt16LE(sizes.length, 4)
  let offset = directory.length
  sizes.forEach((size, index) => {
    const entry = 6 + index * 16
    directory[entry] = directory[entry + 1] = size === 256 ? 0 : size
    directory.writeUInt16LE(1, entry + 4)
    directory.writeUInt16LE(32, entry + 6)
    directory.writeUInt32LE(images[index].length, entry + 8)
    directory.writeUInt32LE(offset, entry + 12)
    offset += images[index].length
  })
  return Buffer.concat([directory, ...images])
}

export async function writeAppAssetFixture(publicDir) {
  const files = {
    'logo.png': [512, 512],
    'wordmark-light.png': [1200, 300],
    'wordmark-dark.png': [1200, 300],
    'thumbnail.png': [1200, 630],
    'cover.png': [1280, 720],
    'pwa/icon-192.png': [192, 192],
    'pwa/icon-512.png': [512, 512],
  }
  for (const [name, dimensions] of Object.entries(files)) {
    const path = join(publicDir, 'img/app', name)
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, await testPng(...dimensions))
  }
  await writeFile(join(publicDir, 'img/app/favicon.ico'), await testIcon())
}
