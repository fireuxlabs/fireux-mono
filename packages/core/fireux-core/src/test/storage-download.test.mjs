import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { Readable } from 'node:stream'

const source = stripTypeScriptTypes(
  readFileSync(
    new URL('../runtime/server/utils/uploads/storage.ts', import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
)
const createError = (value) =>
  Object.assign(new Error(value.statusMessage), value)
function fixture({
  size = 3,
  generation = '42',
  chunks = [Buffer.from('pdf')],
} = {}) {
  const calls = []
  let stream
  const bucket = {
    file(path, options) {
      calls.push({ path, options })
      return {
        async getMetadata() {
          return [{ size, generation }]
        },
        async download() {
          return [Buffer.from('old')]
        },
        createReadStream(options) {
          calls.push({ stream: options })
          stream = Readable.from(chunks)
          return stream
        },
      }
    },
  }
  const download = compileFunction(source + ';return downloadStorageFile', [
    'useRuntimeConfig',
    'createError',
    'getStorage',
    'getAdminApp',
  ])(
    () => ({
      public: { firebaseEcosystem: { firebase: { storageBucket: 'bucket' } } },
    }),
    createError,
    () => ({ bucket: () => bucket }),
    () => ({})
  )
  return { download, calls, stream: () => stream }
}

test('unbounded existing callers keep the ordinary download behavior', async () => {
  const f = fixture()
  assert.deepEqual(await f.download({ objectPath: 'file' }), {
    buffer: Buffer.from('old'),
    bucketName: 'bucket',
    objectPath: 'file',
  })
  assert.equal(f.calls.length, 1)
})

test('bounded downloads pin metadata generation before reading bytes and disable transparent decompression', async () => {
  const f = fixture()
  assert.equal(
    (await f.download({ objectPath: 'file', maxBytes: 3 })).buffer.toString(),
    'pdf'
  )
  assert.deepEqual(f.calls, [
    { path: 'file', options: undefined },
    { path: 'file', options: { generation: '42' } },
    { stream: { decompress: false } },
  ])
  assert.equal(f.stream().destroyed, true)
})

test('oversized or unknown-size metadata prevents a byte read', async () => {
  for (const size of [4, undefined, 'bad', -1]) {
    const f = fixture({ size: size === undefined ? 'unknown' : size })
    await assert.rejects(f.download({ objectPath: 'file', maxBytes: 3 }), {
      statusCode: 413,
    })
    assert.equal(f.stream(), undefined)
  }
})

test('stream size cap stops excess bytes even if metadata lies', async () => {
  const f = fixture({ chunks: [Buffer.from('pdf'), Buffer.from('more')] })
  await assert.rejects(f.download({ objectPath: 'file', maxBytes: 3 }), {
    statusCode: 413,
  })
  assert.equal(f.stream().destroyed, true)
})

test('requested generation is retained and mismatched or absent metadata generation fails closed', async () => {
  const valid = fixture()
  const result = await valid.download({
    objectPath: 'file',
    maxBytes: 3,
    generation: '42',
  })
  assert.equal(result.generation, '42')
  assert.deepEqual(valid.calls[0].options, { generation: '42' })
  for (const generation of ['', 'abc', '43']) {
    const f = fixture({ generation })
    await assert.rejects(
      f.download({ objectPath: 'file', maxBytes: 3, generation: '42' }),
      { statusCode: 409 }
    )
    assert.equal(f.stream(), undefined)
  }
})
