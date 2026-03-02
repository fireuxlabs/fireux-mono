import { computed } from 'vue'
import { useFireUXConfig } from '../FireUXConfig'
import { useAppFetch } from '../../firestore/core/app/fetch/useAppFetch'

export function useRuntimeApp() {
  const cfg = useFireUXConfig()

  const id = computed(() => String(cfg.appId || '').trim())
  const ecosystem = computed(() => String(cfg.ecosystem || '').trim())
  const role = computed(() => cfg.role)
  const modules = computed(() => cfg.modules ?? [])

  const { app, pending } = useAppFetch(id)

  const isLoading = computed(() => Boolean(pending.value))
  const isReady = computed(
    () => Boolean(id.value) && Boolean(app.value) && !isLoading.value
  )

  const name = computed(() =>
    String(app.value?.app_name || cfg.appName || '').trim()
  )
  const shortName = computed(() =>
    String(app.value?.app_short_name || cfg.appShortName || '').trim()
  )

  return {
    id,
    ecosystem,
    role,
    modules,
    app,
    isLoading,
    isReady,
    name,
    shortName,
  }
}
