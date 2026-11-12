import assert from 'node:assert/strict'
import test from 'node:test'
import { createJiti } from 'jiti'
import sharp from 'sharp'
const jiti = createJiti(import.meta.url)
const { normalizePhotoImage } = await jiti.import(
  '../../../runtime/server/utils/uploads/photo-image.ts'
)
const { photoImageUrl } = await jiti.import(
  '../../../runtime/utils/photo-image-url.ts'
)
const solid = (width, height, background = '#ffffff') =>
  sharp({ create: { width, height, channels: 4, background } })
    .png()
    .toBuffer()

for (const [width, height] of [
  [768, 960],
  [960, 768],
]) {
  test(`historical padded ${width}x${height} photo retains only visible content`, async () => {
    const image = await sharp(await solid(width, height))
      .extend({
        left: (1200 - width) / 2,
        right: (1200 - width) / 2,
        top: (1200 - height) / 2,
        bottom: (1200 - height) / 2,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp({ lossless: true })
      .toBuffer()
    const before = Buffer.from(image)
    const result = await normalizePhotoImage(image)
    const metadata = await sharp(result).metadata()
    assert.equal(metadata.width, width)
    assert.equal(metadata.height, height)
    assert.equal(metadata.format, 'webp')
    assert.deepEqual(image, before)
  })
}
test('opaque uniform borders are content, natural proportions remain and small photos are not enlarged', async () => {
  for (const [width, height, expected] of [
    [200, 100, [200, 100]],
    [2400, 1600, [1200, 800]],
  ]) {
    const result = await sharp(
      await normalizePhotoImage(await solid(width, height))
    ).metadata()
    assert.deepEqual([result.width, result.height], expected)
  }
})
test('orientation is applied before measuring visible bounds', async () => {
  const input = await sharp(await solid(80, 40))
    .jpeg()
    .withMetadata({ orientation: 6 })
    .toBuffer()
  const result = await sharp(await normalizePhotoImage(input)).metadata()
  assert.deepEqual([result.width, result.height], [40, 80])
  assert.equal(result.orientation, undefined)
})
test('fully transparent images remain valid and faint alpha edges are preserved', async () => {
  const transparent = await solid(30, 20, { r: 0, g: 0, b: 0, alpha: 0 })
  const result = await sharp(await normalizePhotoImage(transparent)).metadata()
  assert.deepEqual([result.width, result.height], [30, 20])
  const faint = await solid(30, 20, { r: 255, g: 255, b: 255, alpha: 0.01 })
  const faintResult = await sharp(await normalizePhotoImage(faint)).metadata()
  assert.deepEqual([faintResult.width, faintResult.height], [30, 20])
})
test('invalid and oversized input reject without poisoning later requests', async () => {
  for (const input of [
    Buffer.from('not an image'),
    Buffer.alloc(10 * 1024 * 1024 + 1),
  ]) {
    await assert.rejects(normalizePhotoImage(input), { statusCode: 415 })
  }
  assert.ok((await normalizePhotoImage(await solid(2, 2))).length)
})
test('photo URL selects explicit derivation and preserves encoded token and local assets', () => {
  const source = 'https://example.com/photo.png?token=a&alt=media'
  const result = new URL(photoImageUrl(source), 'https://app.example')
  assert.equal(result.searchParams.get('url'), source)
  assert.equal(result.searchParams.get('variant'), 'photo')
  assert.equal(photoImageUrl('/img/app/photo.png'), '/img/app/photo.png')
  assert.equal(photoImageUrl(null), '')
})

test('a twelve-photo grid queues before acquisition and releases capacity on failure', async () => {
  const { deliverPhotoImage } = await jiti.import(
    '../../../runtime/server/utils/uploads/photo-image.ts'
  )
  const input = await solid(20, 30)
  let active = 0,
    peak = 0
  const results = await Promise.all(
    Array.from({ length: 12 }, () =>
      deliverPhotoImage(async () => {
        active++
        peak = Math.max(peak, active)
        await new Promise((resolve) => setTimeout(resolve, 5))
        active--
        return input
      })
    )
  )
  assert.equal(results.length, 12)
  assert.equal(peak, 2)
  await assert.rejects(
    deliverPhotoImage(async () => {
      throw Object.assign(new Error('denied'), { statusCode: 403 })
    }),
    { statusCode: 403 }
  )
  assert.ok((await deliverPhotoImage(async () => input)).length)
})

test('proxy leaves default bytes unchanged, transforms only explicit photos and rejects unknown variants', async () => {
  const { readFileSync } = await import('node:fs')
  const { stripTypeScriptTypes } = await import('node:module')
  const { compileFunction } = await import('node:vm')
  const source = readFileSync(
    new URL('../../../runtime/server/api/proxy/image.get.ts', import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace('export default ', 'const handler = ')
  let transforms = 0,
    fetches = 0
  const original = Buffer.from('original'),
    derived = Buffer.from('derived')
  const dependencies = {
    createError: (value) =>
      Object.assign(new Error(value.statusMessage), value),
    defineEventHandler: (value) => value,
    getQuery: (event) => event.query,
    send: (_event, data) => data,
    setResponseHeaders: (event, headers) => {
      event.headers = headers
    },
    fetchPublicRasterImage: async () => {
      fetches++
      return { buffer: original, contentType: 'image/png' }
    },
    cachedPhotoDelivery: (_source, load) => load(),
    deliverPhotoImage: async (load) => {
      transforms++
      assert.equal(await load(), original)
      return derived
    },
  }
  const handler = compileFunction(
    `${stripTypeScriptTypes(source)}; return handler`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  const ordinary = { query: { url: 'https://example.com/photo' } }
  assert.equal(await handler(ordinary), original)
  assert.equal(transforms, 0)
  assert.equal(ordinary.headers['Content-Type'], 'image/png')
  const photo = { query: { ...ordinary.query, variant: 'photo' } }
  assert.equal(await handler(photo), derived)
  assert.equal(transforms, 1)
  assert.equal(photo.headers['Content-Type'], 'image/webp')
  await assert.rejects(
    handler({ query: { ...ordinary.query, variant: 'other' } }),
    { statusCode: 400 }
  )
  assert.equal(fetches, 2)
})
