// ~/composables/app/useAppComputed.ts
import { computed } from 'vue'
import type { Ref } from 'vue'
import type {
  App,
  AppPillProps,
} from 'fireux-core/runtime/models/core/app.model.ts'

export function useAppComputed(app: Ref<App | null | undefined>) {
  const isLoading = computed(() => app.value === undefined)
  const isInitialized = computed(() => Boolean(app.value?.admin_ids?.length))

  const pillProps = (target?: App | null): AppPillProps => ({
    avatar:
      target?.avatar_url ??
      target?.logo_url ??
      target?.wordmark_url ??
      undefined,
    title: target?.app_name ?? target?.id ?? 'App',
    subtitle: target?.ecosystem ?? '',
    to: target?.id ? `/apps/${target.id}` : '#',
  })

  return { isLoading, isInitialized, pillProps }
}
