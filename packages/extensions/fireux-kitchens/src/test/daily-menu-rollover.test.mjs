import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction as compileNative } from 'node:vm'
let currentReadFetch
const compileFunction = (source, args = []) => {
  const mocks = {
    $fetch: { create: () => currentReadFetch },
    setResponseHeader: () => {},
  }
  const names = Object.keys(mocks).filter((name) => !args.includes(name))
  return compileNative(source, [...names, ...args]).bind(
    null,
    ...names.map((name) => mocks[name])
  )
}
import {
  computed,
  ref,
  toValue,
  watch,
  effectScope,
  onScopeDispose,
  nextTick,
} from 'vue'

test('the mounted reader clears yesterday and refreshes once at the server date boundary, then disposes its timer', async () => {
  const scope = effectScope(),
    timers = [],
    cleared = []
  let refreshes = 0
  const state = {
    data: ref({
      kind: 'manifest',
      manifest: { content: { daily: { refreshAfterMs: 1234 } } },
    }),
    pending: ref(false),
    error: ref(null),
    then: (fn) => Promise.resolve().then(fn),
    refresh: async () => {
      refreshes++
    },
  }
  const deps = {
    computed,
    ref,
    toValue,
    watch,
    onScopeDispose,
    useRoute: () => ({ query: {} }),
    useAsyncData: () => state,
    normalizeSproochliLanguage: () => '',
    normalizeMenuRouteContext: () => 'generic',
    menuRouteIndexPath: () => '/menus',
    menuRoutePath: () => '/specials',
    menuRouteQrPath: () => '/specials/qr',
    setTimeout: (callback, delay) => {
      timers.push({ callback, delay })
      return timers.length
    },
    clearTimeout: (id) => cleared.push(id),
  }
  const source = readFileSync(
    new URL('../runtime/menu/composables/useMenu.ts', import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.client', 'true')
  const useMenu = compileFunction(
    `${stripTypeScriptTypes(source)}; return useMenu`,
    Object.keys(deps)
  )(...Object.values(deps))
  scope.run(() => useMenu('specials', { routeScope: { kind: 'tenant' } }))
  assert.equal(timers.length, 1)
  assert.equal(
    timers[0].delay,
    1334,
    'Uses server duration, not the visitor clock'
  )
  timers[0].callback()
  assert.equal(state.data.value, null)
  assert.equal(refreshes, 1)
  await nextTick()
  state.data.value = {
    kind: 'manifest',
    manifest: { content: { daily: { refreshAfterMs: 86400000 } } },
  }
  await nextTick()
  assert.equal(timers.length, 2)
  scope.stop()
  assert.ok(cleared.includes(2))
})
