#!/usr/bin/env node

import sharp from 'sharp'
import { promises as fs } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// Radius settings
const RADIUS_192 = 24 // px corner radius on 192px icon
const RADIUS_512 = 64 // px corner radius on 512px icon

const apps = [
  'projects/fireux/fireux-app',
  'projects/misebox/misebox-app',
  'projects/misebox/niederhorn',
  'projects/cleanbox/cleanbox-app',
  'projects/cleanbox/richies-reinigung',
  'projects/fireux/tennant',
]

async function ensureDir(path) {
  await fs.mkdir(path, { recursive: true })
}

async function roundIcon(inputPath, size, radius) {
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="white"/></svg>`
  const mask = Buffer.from(svg)
  return sharp(inputPath)
    .resize(size, size)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer()
}

async function writeFavicon(pwaDir, icon192Rounded) {
  const icoPath = join(dirname(pwaDir), 'favicon.ico')
  await sharp(icon192Rounded)
    .resize(48, 48) // typical favicon size; sharp will generate ico properly
    .toFile(icoPath)
}

async function processApp(appRoot) {
  const pwaDir = join(appRoot, 'public/img/app/pwa')
  const icon192 = join(pwaDir, 'icon-192.png')
  const icon512 = join(pwaDir, 'icon-512.png')

  const icon192Rounded = await roundIcon(icon192, 192, RADIUS_192)
  const icon512Rounded = await roundIcon(icon512, 512, RADIUS_512)

  await sharp(icon192Rounded).toFile(icon192)
  await sharp(icon512Rounded).toFile(icon512)
  await writeFavicon(pwaDir, icon192Rounded)

  console.log(`Rounded icons written for ${appRoot}`)
}

async function main() {
  for (const app of apps) {
    await processApp(app)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
