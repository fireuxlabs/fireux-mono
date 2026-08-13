import { computed, type Ref } from 'vue'
import type { AppAssetReadiness } from 'fireux-core/runtime/server/utils/appAssetReadiness'

export async function useTemplateOneAppAssetReadiness(
  appId: Ref<string>,
  enabled: Ref<boolean>
) {
  const { data, pending, error } = await useAsyncData(
    'template-one-app-asset-readiness',
    () => enabled.value
      ? $fetch<AppAssetReadiness>('/api/templates/template-one/assets', {
          query: { appId: appId.value },
        })
      : null,
    { watch: [appId] }
  )

  return {
    readiness: data,
    pending,
    error: computed(() => error.value?.statusMessage || error.value?.message || ''),
  }
}
