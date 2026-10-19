import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useLiveAsyncData, type LiveAsyncData } from './useLiveAsyncData'

/** Live counterpart for a mutable, same-origin server GET projection. */
export function useLiveFetch<T>(
  request: MaybeRefOrGetter<string>,
  options: Record<string, any> = {}
): LiveAsyncData<T> {
  const {
    key,
    server,
    lazy,
    immediate,
    default: defaults,
    transform,
    pick,
    watch: sources,
    ...fetchOptions
  } = options
  const url = computed(() => toValue(request))
  const resolvedOptions = computed(() =>
    Object.fromEntries(
      Object.entries(fetchOptions).map(([name, value]) => [
        name,
        toValue(value),
      ])
    )
  )
  return useLiveAsyncData<T>(
    key || computed(() => `live:${url.value}`),
    (liveFetch) => liveFetch<T>(url.value, resolvedOptions.value),
    {
      server,
      lazy,
      immediate,
      default: defaults,
      transform,
      pick,
      watch:
        sources === false
          ? undefined
          : [url, resolvedOptions, ...(sources || [])],
    }
  )
}
