// Concurrent edit — 2026-07-20 17:27 CEST — Demo Data Spine pass: add strict deferred read-only workspace fixture loading.
import {
  computed,
  shallowRef,
  toValue,
  watch,
  type ComputedRef,
  type MaybeRefOrGetter,
} from 'vue'

export type WorkspaceDemoDataOutcome =
  | 'idle'
  | 'pending'
  | 'error'
  | 'empty'
  | 'ready'

type UseWorkspaceDemoDataOptions<T> = {
  active: MaybeRefOrGetter<boolean>
  loader: () => Promise<T>
  isEmpty?: (value: T) => boolean
}

type UseWorkspaceDemoDataReturn<T> = {
  readonly data: ComputedRef<T | undefined>
  readonly pending: ComputedRef<boolean>
  readonly error: ComputedRef<unknown | undefined>
  readonly outcome: ComputedRef<WorkspaceDemoDataOutcome>
  readonly retry: () => void
}

function defaultIsEmpty(value: unknown): boolean {
  return value == null || (Array.isArray(value) && value.length === 0)
}

export function useWorkspaceDemoData<T>(
  options: UseWorkspaceDemoDataOptions<T>
): UseWorkspaceDemoDataReturn<T> {
  const cachedData = shallowRef<T>()
  const loadPending = shallowRef(false)
  const loadError = shallowRef<unknown>()
  let loaded = false
  let inFlight: Promise<void> | undefined

  const active = computed(() => Boolean(toValue(options.active)))
  const data = computed<T | undefined>(() => cachedData.value)
  const pending = computed(() => active.value && loadPending.value)
  const error = computed<unknown | undefined>(() => loadError.value)
  const outcome = computed<WorkspaceDemoDataOutcome>(() => {
    if (!active.value) return 'idle'
    if (pending.value) return 'pending'
    if (error.value) return 'error'
    // Activation and its watcher can be observed in the same render turn.
    // Treat that pre-load instant as pending so selection validation cannot
    // mistake an unstarted provider for an authoritative empty result.
    if (!loaded) return 'pending'

    const value = data.value
    if (value === undefined) return 'empty'

    const isEmpty = options.isEmpty ?? defaultIsEmpty
    return isEmpty(value) ? 'empty' : 'ready'
  })

  const load = () => {
    if (!active.value || loaded || inFlight) return

    loadPending.value = true
    loadError.value = undefined

    const attempt = (async () => {
      try {
        cachedData.value = await options.loader()
        loaded = true
      } catch (cause) {
        loadError.value = cause
      } finally {
        loadPending.value = false
      }
    })()

    inFlight = attempt
    void attempt.finally(() => {
      if (inFlight === attempt) inFlight = undefined
    })
  }

  watch(active, (isActive: boolean) => {
    if (isActive) load()
  }, { immediate: true })

  const retry = () => {
    if (!active.value || inFlight) return
    cachedData.value = undefined
    loadError.value = undefined
    loaded = false
    load()
  }

  return {
    data,
    pending,
    error,
    outcome,
    retry,
  }
}
