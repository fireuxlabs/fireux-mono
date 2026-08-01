import { unref, watch, type Ref } from 'vue'

type MaybeRef<T> = T | Ref<T>

export function isOfflineFirestoreError(error: unknown): boolean {
  const code = typeof (error as any)?.code === 'string' ? (error as any).code : ''
  const message = String((error as any)?.message ?? '').toLowerCase()
  return code === 'unavailable' || message.includes('client is offline')
}

export function guardFirestorePromise(
  binding: {
    error?: Ref<unknown | undefined>
    promise?: Ref<Promise<unknown> | undefined>
  },
  context: MaybeRef<string>
) {
  const resolvedContext = () => String(unref(context) || 'read')
  const handled = new WeakSet<Promise<unknown>>()
  const guard = (promise: Promise<unknown> | undefined) => {
    if (!promise || typeof promise.catch !== 'function' || handled.has(promise)) {
      return
    }
    handled.add(promise)
    if (binding.error) binding.error.value = undefined
    const promiseContext = resolvedContext()
    promise.catch((error) => {
      if (!import.meta.dev) return
      if (isOfflineFirestoreError(error)) {
        console.warn(
          `[useFirestoreRead] read unavailable while offline (${promiseContext})`,
          error
        )
        return
      }
      console.error(`[useFirestoreRead] read failed (${promiseContext})`, error)
    })
  }
  if (binding.promise) {
    watch(binding.promise, guard, { immediate: true, flush: 'sync' })
  }
}
