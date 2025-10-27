// ~/composables/app/useAppComputed.ts
import { computed, watchEffect } from 'vue'
import type { Ref } from 'vue'
import type {
  App,
  AppToPillMapper,
  AppPillProps,
} from 'fireux-core/runtime/models/core/app.model.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'

export function useAppComputed(app: Ref<App | null | undefined>) {
  const { role, ecosystem } = useFireUXConfig()

  // 🔍 Optional dev watcher — helpful while bootstrapping FireUX
  if (import.meta.dev && import.meta.client) {
    watchEffect(() => {
      console.info('[fireux][useAppComputed]', {
        id: app.value?.id,
        name: app.value?.app_name,
        role,
        ecosystem,
      })
    })
  }

  const isLoading = computed(() => app.value === undefined)
  const isInitialized = computed(() => Boolean(app.value?.admin_ids?.length))

  const pillProps = computed<AppToPillMapper>(() => {
    return (a: App): AppPillProps => ({
      avatar: a.avatar_url ?? a.logo_url ?? a.wordmark_url ?? undefined,
      title: a.app_name,
      subtitle: a.ecosystem,
      to: `/apps/${a.id}`,
    })
  })

  return { isLoading, isInitialized, pillProps }
}
