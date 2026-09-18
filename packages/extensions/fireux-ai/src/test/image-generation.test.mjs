import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

const source = stripTypeScriptTypes(
  readFileSync(
    new URL(
      '../runtime/server/utils/image-generation.server.ts',
      import.meta.url
    ),
    'utf8'
  )
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  .replace(/^export /gm, '')
function fixture({ config = {}, response, fail } = {}) {
  let request
  const generate = compileFunction(`${source};return generateFireuxImage`, [
    'createError',
    'resolveConfig',
    'firstString',
    'fetch',
    'Buffer',
    'AbortController',
    'setTimeout',
    'clearTimeout',
    'process',
  ])(
    (input) => Object.assign(new Error(input.statusMessage), input),
    () => ({
      enabled: true,
      mode: 'app',
      provider: 'openai',
      apiKey: 'test-secret',
      ...config,
    }),
    (value) => value || undefined,
    async (url, init) => {
      request = { url, ...init }
      if (fail) throw new Error('sensitive provider detail')
      return (
        response || {
          ok: true,
          json: async () => ({
            data: [
              { b64_json: Buffer.from('RIFF0000WEBPtest').toString('base64') },
            ],
          }),
        }
      )
    },
    Buffer,
    AbortController,
    setTimeout,
    clearTimeout,
    { env: {} }
  )
  return {
    generate: (prompt = 'Carrot') => generate({}, { prompt }),
    request: () => request,
  }
}
test('image generation cannot run in disabled, simulator or unsupported provider modes', async () => {
  for (const config of [
    { enabled: false },
    { mode: 'simulator' },
    { mode: 'codex' },
    { provider: 'google' },
    { apiKey: '' },
  ]) {
    const f = fixture({ config })
    await assert.rejects(f.generate(), /not configured/)
    assert.equal(f.request(), undefined)
  }
})
test('one bounded square WebP uses the existing server credential', async () => {
  const f = fixture()
  const image = await f.generate()
  assert.equal(image.contentType, 'image/webp')
  assert.equal(f.request().headers.Authorization, 'Bearer test-secret')
  const body = JSON.parse(f.request().body)
  assert.equal(body.n, 1)
  assert.equal(body.size, '1024x1024')
  assert.equal(body.output_format, 'webp')
})
test('invalid images and provider errors cannot become stored artwork', async () => {
  for (const response of [
    { ok: false, status: 401 },
    {
      ok: true,
      json: async () => ({ data: [{ b64_json: 'bm90YW5pbWFnZQ==' }] }),
    },
  ]) {
    await assert.rejects(fixture({ response }).generate())
  }
  await assert.rejects(fixture({ fail: true }).generate(), {
    message: 'Image generation failed. Try again.',
  })
})
