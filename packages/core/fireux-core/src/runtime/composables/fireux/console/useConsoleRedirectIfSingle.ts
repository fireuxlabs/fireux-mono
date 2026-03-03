import { navigateTo } from '#imports'
import { computed, watchEffect, type Ref } from 'vue'

/**
 * Generic redirect helper:
 * - If you have 0 consoles: do nothing (or you can show empty state)
 * - If you have 1 console: redirect to it
 * - If you have 2+: stay on hub
 *
 * Pass `enabled=false` if you only want to run client-side or after auth.
 */
export function useConsoleRedirectIfSingle(params: {
  consolePaths: Ref<string[]>
  enabled?: Ref<boolean> | boolean
}) {
  const enabled = computed(() =>
    typeof params.enabled === 'boolean' ? params.enabled : (params.enabled?.value ?? true)
  )

  const singlePath = computed(() => {
    const list = params.consolePaths.value ?? []
    return list.length === 1 ? String(list[0] || '').trim() : ''
  })

  watchEffect(() => {
    if (!enabled.value) return
    if (!singlePath.value) return
    // Nuxt will no-op if already there
    navigateTo(singlePath.value)
  })

  return { singlePath }
}
