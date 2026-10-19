import { onMounted, ref, watch, type Ref } from 'vue'
import type { ServiceBasketLine } from '../utils/service-basket'
import { readCollectionSession } from '../utils/collection-recovery'

/** One tab's Collection session. Catalogue and Order authority remain with their existing owners. */
export function useCollectionRecovery(input: {
  key: Ref<string>
  lines: Ref<ServiceBasketLine[]>
  name: Ref<string>
  phone: Ref<string>
  attempt: Ref<Record<string, unknown> | null>
  clear: () => void
  resume: () => void
}) {
  const error = ref('')
  let mounted = false
  let restoring = false
  let activeKey = ''
  function save() {
    if (!activeKey || restoring || activeKey !== input.key.value) return
    try {
      if (!input.lines.value.length && !input.attempt.value)
        sessionStorage.removeItem(activeKey)
      else
        sessionStorage.setItem(
          activeKey,
          JSON.stringify({
            lines: input.lines.value,
            name: input.name.value,
            phone: input.phone.value,
            attempt: input.attempt.value,
          })
        )
      error.value = ''
    } catch {
      error.value =
        'Checkout recovery is unavailable in this browser. Keep this page open.'
    }
  }
  function restore() {
    if (!mounted) return
    restoring = true
    const previousKey = activeKey
    activeKey = input.key.value
    error.value = ''
    if (previousKey) input.clear()
    try {
      const saved =
        activeKey && readCollectionSession(sessionStorage.getItem(activeKey))
      if (saved && !previousKey) input.clear()
      if (saved) {
        input.lines.value = saved.lines
        input.name.value = saved.name
        input.phone.value = saved.phone
        input.attempt.value = saved.attempt
      }
    } catch {
      error.value =
        'Checkout recovery is unavailable in this browser. Keep this page open.'
    } finally {
      restoring = false
    }
    if (input.attempt.value) input.resume()
    else if (!error.value) save()
  }
  watch(input.key, restore, { flush: 'sync' })
  watch([input.lines, input.name, input.phone, input.attempt], save, {
    deep: true,
    flush: 'sync',
  })
  onMounted(() => {
    mounted = true
    restore()
  })
  return { error }
}
