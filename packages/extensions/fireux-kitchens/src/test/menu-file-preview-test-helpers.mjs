import assert from 'node:assert/strict'
import { computed, ref, shallowRef, toValue, watch, onScopeDispose } from 'vue'
import { loadOfferingSource as load } from './offering-test-helpers.mjs'

/** Native AsyncData boundary: cancellation, enabled, watched refresh, and disposal. */
export function menuFilePreviewDependencies(dependencies, acquisitions = []) {
  let id = 0
  const deps = {
    computed,
    ref,
    toValue,
    watch,
    onScopeDispose,
    ...dependencies,
    useId: () => String(++id),
    useAsyncData(key, handler, options) {
      assert.equal(options.server, false)
      assert.equal(options.serialize, false)
      assert.equal(options.deep, false)
      assert.equal(options.getCachedData(), undefined)
      const data = shallowRef(),
        error = shallowRef(),
        status = ref('idle')
      let controller
      function clear() {
        controller?.abort()
        controller = undefined
        data.value = error.value = undefined
        status.value = 'idle'
      }
      async function refresh() {
        if (!toValue(options.enabled)) return
        controller?.abort()
        const request = (controller = new AbortController())
        status.value = 'pending'
        try {
          const result = await handler({}, { signal: request.signal })
          if (request.signal.aborted) return
          data.value = result
          error.value = undefined
          status.value = 'success'
        } catch (cause) {
          if (request.signal.aborted) return
          error.value = cause
          status.value = 'error'
        }
      }
      watch(options.watch, () => {
        void refresh()
      })
      onScopeDispose(clear)
      const acquisition = { key, options, data, error, status, refresh, clear }
      acquisitions.push(acquisition)
      void refresh()
      return acquisition
    },
  }
  return {
    ...deps,
    ...load(
      'menu/composables/useMenuFilePreview',
      'useMenuFilePreview,menuFileRevision',
      deps,
      (source) => source.replaceAll('import.meta.client', 'true')
    ),
  }
}
