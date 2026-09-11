import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { ref, computed, watch, toValue, effectScope, onScopeDispose } from 'vue'
const source = stripTypeScriptTypes(
  readFileSync(
    new URL(
      '../runtime/composables/fireux/firestore/useLiveAsyncData.ts',
      import.meta.url
    ),
    'utf8'
  )
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  .replace(/^export /gm, '')
  .replaceAll('import.meta.client', 'true')
const settle = async () => {
  for (let i = 0; i < 8; i++)
    await new Promise((resolve) => setImmediate(resolve))
}

for (const hydrated of [false, true])
  test(`server events update and revoke data after ${hydrated ? 'SSR hydration' : 'client loading'}`, async () => {
    let stored = [{ id: 'published' }]
    let requests = 0
    let controller
    let signal
    const mounts = []
    function useAsyncData(_key, handler) {
      const data = ref(),
        error = ref(),
        status = ref('idle')
      const execute = async (options = {}) => {
        if (hydrated && !Object.hasOwn(options, 'cachedData')) return
        status.value = 'pending'
        try {
          data.value = await handler()
          error.value = undefined
          status.value = 'success'
        } catch (failure) {
          error.value = failure
          status.value = 'error'
        }
      }
      if (hydrated) {
        data.value = structuredClone(stored)
        status.value = 'success'
      }
      const ready = hydrated
        ? Promise.resolve()
        : Promise.resolve().then(execute)
      return {
        data,
        error,
        status,
        pending: computed(() => status.value === 'pending'),
        execute,
        refresh: execute,
        then: (fn) => ready.then(fn),
      }
    }
    const dependencies = {
      useAsyncData,
      createError: (value) =>
        Object.assign(new Error(value.message || ''), value),
      getCurrentInstance: () => (hydrated ? {} : null),
      onMounted: (fn) => mounts.push(fn),
      onScopeDispose,
      toValue,
      watch,
      $fetch: async () => {
        requests++
        return structuredClone(stored)
      },
      window: { location: { origin: 'http://localhost' } },
      fetch: async (_url, options) => {
        signal = options.signal
        return {
          ok: true,
          headers: new Headers({ 'content-type': 'text/event-stream' }),
          body: new ReadableStream({
            start(value) {
              controller = value
              signal.addEventListener('abort', () =>
                value.error(new Error('aborted'))
              )
            },
          }),
        }
      },
    }
    const useLive = compileFunction(
      `${source}; return useLiveAsyncData`,
      Object.keys(dependencies)
    )(...Object.values(dependencies))
    const scope = effectScope()
    const state = scope.run(() =>
      useLive('menus', (liveFetch) => liveFetch('/api/menus'))
    )
    for (const mount of mounts) mount()
    await settle()
    assert.equal(state.data.value.length, 1)
    stored = []
    controller.enqueue(new TextEncoder().encode('data: []\n\n'))
    await settle()
    assert.deepEqual(state.data.value, [])
    assert.equal(requests, 2)
    controller.enqueue(
      new TextEncoder().encode(
        'event: read-error\ndata: {"statusCode":403,"message":"Denied"}\n\n'
      )
    )
    await settle()
    assert.equal(state.data.value, undefined)
    assert.equal(state.error.value.statusCode, 403)
    assert.equal(signal.aborted, true)
    scope.stop()
  })
