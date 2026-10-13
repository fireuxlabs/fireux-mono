import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import { ref } from 'vue'

function fixture({ supported = true, reject = false, existing = null } = {}) {
  const events = new Map()
  let mount,
    dispose,
    requests = 0,
    exits = 0
  const root = {}
  const document = {
    fullscreenEnabled: supported,
    fullscreenElement: existing,
    documentElement: root,
    addEventListener: (name, listener) => events.set(name, listener),
    removeEventListener: (name) => events.delete(name),
    async exitFullscreen() {
      exits++
      document.fullscreenElement = null
      events.get('fullscreenchange')?.()
    },
  }
  root.requestFullscreen = async () => {
    requests++
    if (reject) throw new Error('Unavailable')
    document.fullscreenElement = root
    events.get('fullscreenchange')?.()
  }
  const source = readFileSync(
    new URL(
      '../../runtime/kitchen/composables/workspace/orders/useKitchenOrderBoardFullscreen.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[^\n]+\n/, '')
    .replace('export function', 'function')
  const factory = compileFunction(
    stripTypeScriptTypes(source) + '; return useKitchenOrderBoardFullscreen',
    ['ref', 'onMounted', 'onBeforeUnmount', 'document']
  )(
    ref,
    (fn) => {
      mount = fn
    },
    (fn) => {
      dispose = fn
    },
    document
  )
  const state = factory()
  mount()
  return {
    state,
    document,
    events,
    dispose,
    requests: () => requests,
    exits: () => exits,
  }
}

test('document fullscreen keeps overlay dialogs in the same top layer and Escape restores the board', async () => {
  const f = fixture()
  await f.state.toggleFullscreen()
  assert.equal(f.document.fullscreenElement, f.document.documentElement)
  assert.equal(f.state.fullscreen.value, true)
  await f.document.exitFullscreen()
  assert.equal(f.state.fullscreen.value, false)
  assert.equal(f.state.fullscreenPending.value, false)
  f.dispose()
  assert.equal(f.events.size, 0)
})

test('unsupported or denied fullscreen retains a window-filling board with an Escape exit', async () => {
  for (const options of [{ supported: false }, { reject: true }]) {
    const f = fixture(options)
    await f.state.toggleFullscreen()
    assert.equal(f.state.fullscreen.value, true)
    f.events.get('keydown')({ key: 'Escape', defaultPrevented: true })
    assert.equal(f.state.fullscreen.value, true)
    f.events.get('keydown')({ key: 'Escape', defaultPrevented: false })
    assert.equal(f.state.fullscreen.value, false)
    f.dispose()
  }
})

test('exit and route disposal release only the fullscreen session this board owns', async () => {
  const f = fixture()
  await f.state.toggleFullscreen()
  await f.state.toggleFullscreen()
  assert.equal(f.exits(), 1)
  await f.state.toggleFullscreen()
  f.dispose()
  assert.equal(f.exits(), 2)
  const other = fixture({ existing: {} })
  await other.state.toggleFullscreen()
  await other.state.toggleFullscreen()
  other.dispose()
  assert.equal(other.requests(), 0)
  assert.equal(other.exits(), 0)
})

test('a request resolving after disposal cannot leave browser fullscreen behind', async () => {
  const f = fixture()
  let resolve
  f.document.documentElement.requestFullscreen = () =>
    new Promise((done) => {
      resolve = () => {
        f.document.fullscreenElement = f.document.documentElement
        done()
      }
    })
  const pending = f.state.toggleFullscreen()
  await f.state.toggleFullscreen()
  assert.equal(f.state.fullscreenPending.value, true)
  f.dispose()
  resolve()
  await pending
  assert.equal(f.document.fullscreenElement, null)
  assert.equal(f.state.fullscreenPending.value, false)
})
