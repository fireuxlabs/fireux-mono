import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { ref } from 'vue'

const source = readFileSync(
  new URL('../runtime/menu/composables/useMenuQrRenderer.ts', import.meta.url),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  .replace(/^export /gm, '')
  .replace("import('qr-code-styling')", 'loadQr()')
function fixture(presentation, loader) {
  let mount, dispose, changed
  const calls = []
  class QR {
    constructor(options) {
      calls.push(['create', options])
    }
    async getRawData() {
      return new Blob(['<svg xmlns="http://www.w3.org/2000/svg"></svg>'], {
        type: 'image/svg+xml',
      })
    }
    append() {
      calls.push(['append'])
    }
    update(options) {
      calls.push(['update', options])
    }
  }
  const factory = compileFunction(
    `${stripTypeScriptTypes(source)}; return useMenuQrRenderer`,
    [
      'ref',
      'nextTick',
      'onMounted',
      'onBeforeUnmount',
      'watch',
      'loadQr',
      'Blob',
    ]
  )(
    ref,
    async () => {},
    (fn) => (mount = fn),
    (fn) => (dispose = fn),
    (_get, fn) => (changed = fn),
    loader || (async () => ({ default: QR })),
    Blob
  )
  const url = ref('https://example.test/menu')
  const api = factory(url, ref(null), ref(false), presentation)
  api.qrContainer.value = {
    replaceChildren() {
      calls.push(['clear'])
    },
  }
  return {
    api,
    calls,
    mount: () => mount(),
    dispose: () => dispose(),
    change: (value) => {
      url.value = value
      changed([value, null, false])
    },
  }
}
async function settle() {
  for (let i = 0; i < 8; i++) await Promise.resolve()
}
test('public and Workspace QR consumers retain their dimensions and update existing codes', async () => {
  for (const [presentation, size, margin] of [
    [undefined, 1024, 28],
    [{ size: 176, margin: 8 }, 176, 8],
  ]) {
    const f = fixture(presentation)
    await f.mount()
    assert.equal(f.api.qrReady.value, true)
    assert.match(decodeURIComponent(f.api.qrDownloadUrl.value), /<svg/)
    const options = f.calls[0][1]
    assert.equal(options.width, size)
    assert.equal(options.height, size)
    assert.equal(options.margin, margin)
    assert.equal(options.data, 'https://example.test/menu')
    f.change('https://example.test/other')
    await settle()
    assert.equal(f.calls.filter(([kind]) => kind === 'create').length, 1)
    assert.equal(f.calls.at(-1)[1].data, 'https://example.test/other')
  }
})
test('disposal rejects an obsolete asynchronous QR load', async () => {
  let release
  const loaded = new Promise((resolve) => (release = resolve))
  const f = fixture(undefined, () => loaded)
  const mounting = f.mount()
  await settle()
  f.dispose()
  release({
    default: class {
      constructor() {
        throw Error('obsolete renderer constructed')
      }
    },
  })
  await mounting
  assert.equal(f.api.qrReady.value, false)
  assert.equal(f.api.qrError.value, false)
})
test('QR load failure reports an error instead of remaining pending', async () => {
  const f = fixture(undefined, async () => {
    throw Error('load failed')
  })
  await f.mount()
  assert.equal(f.api.qrReady.value, false)
  assert.equal(f.api.qrError.value, true)
})

test('changing the destination hides an old download and disposal clears it', async () => {
  const f = fixture()
  await f.mount()
  assert.ok(f.api.qrDownloadUrl.value)
  f.change('https://example.test/changed')
  assert.equal(f.api.qrReady.value, false)
  assert.equal(f.api.qrDownloadUrl.value, '')
  await settle()
  f.dispose()
  assert.equal(f.api.qrDownloadUrl.value, '')
  assert.equal(f.api.qrReady.value, false)
})
test('an obsolete SVG export cannot become the current download', async () => {
  let release
  const exporting = new Promise((resolve) => {
    release = resolve
  })
  class QR {
    append() {}
    update() {}
    getRawData() {
      return exporting
    }
  }
  const f = fixture(undefined, async () => ({ default: QR }))
  const mounting = f.mount()
  await settle()
  f.dispose()
  release(new Blob(['<svg/>'], { type: 'image/svg+xml' }))
  await mounting
  assert.equal(f.api.qrDownloadUrl.value, '')
  assert.equal(f.api.qrReady.value, false)
})
test('a failed SVG export reports failure without exposing a download', async () => {
  const f = fixture(undefined, async () => ({
    default: class {
      append() {}
      getRawData() {
        throw new Error('export failed')
      }
    },
  }))
  await f.mount()
  assert.equal(f.api.qrDownloadUrl.value, '')
  assert.equal(f.api.qrError.value, true)
})
