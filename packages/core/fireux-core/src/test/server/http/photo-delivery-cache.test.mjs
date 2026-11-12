import assert from 'node:assert/strict'
import test from 'node:test'
import { createJiti } from 'jiti'
const { createPhotoDeliveryCache } = await createJiti(import.meta.url).import(
  '../../../runtime/server/utils/http/photo-delivery-cache.ts'
)

test('warm and concurrent requests reuse one delivery, with exact token/query separation', async () => {
  const get = createPhotoDeliveryCache()
  let count = 0
  const load = async () => {
    count++
    return Buffer.from('photo')
  }
  const values = await Promise.all(
    Array.from({ length: 12 }, () => get('https://image?token=a&x=1', load))
  )
  assert.equal(count, 1)
  assert.ok(values.every((value) => value === values[0]))
  await get('https://image?token=a&x=1', load)
  assert.equal(count, 1)
  await get('https://image?token=b&x=1', load)
  await get('https://image?token=a&x=2', load)
  assert.equal(count, 3)
})
test('failed delivery is shared only while in flight and can be retried', async () => {
  const get = createPhotoDeliveryCache()
  let count = 0
  const fail = async () => {
    count++
    throw new Error('upstream')
  }
  const results = await Promise.allSettled([get('url', fail), get('url', fail)])
  assert.ok(results.every((result) => result.status === 'rejected'))
  assert.equal(count, 1)
  assert.equal(
    (await get('url', async () => Buffer.from('ok'))).toString(),
    'ok'
  )
})
test('TTL, byte budget and LRU entry limits bound retained output', async () => {
  let time = 0,
    reads = 0
  const get = createPhotoDeliveryCache({
    maxBytes: 6,
    maxEntries: 2,
    ttlMs: 10,
    now: () => time,
  })
  const load = async () => {
    reads++
    return Buffer.from('123')
  }
  await get('a', load)
  await get('b', load)
  await get('a', load)
  await get('c', load)
  await get('b', load)
  assert.equal(reads, 4)
  time = 11
  await get('b', load)
  assert.equal(reads, 5)
  let oversized = 0
  const large = async () => {
    oversized++
    return Buffer.alloc(7)
  }
  await get('large', large)
  await get('large', large)
  assert.equal(oversized, 2)
})
test('unique pending work is bounded while duplicates still coalesce', async () => {
  const get = createPhotoDeliveryCache()
  let release
  const gate = new Promise((resolve) => {
    release = resolve
  })
  const load = async () => {
    await gate
    return Buffer.from('x')
  }
  const requests = Array.from({ length: 34 }, (_, i) => get(String(i), load))
  const duplicate = get('0', load)
  await assert.rejects(get('overflow', load), { statusCode: 429 })
  release()
  await Promise.all([...requests, duplicate])
})
