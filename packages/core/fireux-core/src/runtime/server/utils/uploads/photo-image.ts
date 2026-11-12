import { createError } from 'h3'
import sharp from 'sharp'

let activeTransforms = 0
const waiting: Array<() => void> = []

async function photoSlot<T>(work: () => Promise<T>): Promise<T> {
  if (activeTransforms >= 2) {
    if (waiting.length >= 32) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Image processing is busy; try again shortly.',
      })
    }
    await new Promise<void>((resolve, reject) => {
      const resume = () => {
        clearTimeout(timer)
        resolve()
      }
      const timer = setTimeout(() => {
        const index = waiting.indexOf(resume)
        if (index >= 0) waiting.splice(index, 1)
        reject(
          createError({
            statusCode: 503,
            statusMessage: 'Image processing queue timed out.',
          })
        )
      }, 30_000)
      waiting.push(resume)
    })
  } else {
    activeTransforms++
  }
  try {
    return await work()
  } finally {
    const next = waiting.shift()
    if (next) next()
    else activeTransforms--
  }
}

/** Photo content keeps its proportions; only completely transparent borders go. */
export async function normalizePhotoImage(data: Buffer): Promise<Buffer> {
  return photoSlot(() => transformPhotoImage(data))
}

/** Reserve capacity before fetching, so a gallery does not exhaust proxy slots. */
export async function deliverPhotoImage(
  load: () => Promise<Buffer>
): Promise<Buffer> {
  return photoSlot(async () => transformPhotoImage(await load()))
}

async function transformPhotoImage(data: Buffer): Promise<Buffer> {
  try {
    if (data.byteLength > 10 * 1024 * 1024) throw new Error('Image too large')
    const source = sharp(data, {
      failOn: 'error',
      limitInputPixels: 40_000_000,
    })
    const metadata = await source.metadata()
    if (
      !['jpeg', 'png', 'webp'].includes(metadata.format || '') ||
      (metadata.pages || 1) > 1
    ) {
      throw new Error('Unsupported photo format')
    }
    const { data: pixels, info } = await source
      .rotate()
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
    let left = info.width,
      top = info.height,
      right = -1,
      bottom = -1
    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        if (
          pixels[(y * info.width + x) * info.channels + info.channels - 1] !== 0
        ) {
          left = Math.min(left, x)
          right = Math.max(right, x)
          top = Math.min(top, y)
          bottom = y
        }
      }
    }
    // An entirely transparent image remains readable as transparent content.
    const bounds =
      right < 0
        ? { left: 0, top: 0, width: info.width, height: info.height }
        : { left, top, width: right - left + 1, height: bottom - top + 1 }
    return await sharp(pixels, { raw: info })
      .extract(bounds)
      .resize({
        width: 1200,
        height: 1200,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 88, alphaQuality: 100, effort: 4 })
      .toBuffer()
  } catch {
    throw createError({
      statusCode: 415,
      statusMessage:
        'Use a valid JPEG, PNG or WebP photo up to 10 MB and 40 megapixels.',
    })
  }
}
