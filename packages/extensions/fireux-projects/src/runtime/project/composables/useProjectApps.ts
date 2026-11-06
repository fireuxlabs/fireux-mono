import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useAppCollection } from 'fireux-core/runtime/app/composables/useAppCollection'

/** Project relationship; Workspace supplies its selection explicitly. */
export function useProjectApps(
  id: MaybeRefOrGetter<string | null | undefined>,
  options: { management?: boolean } = {}
) {
  const projectId = computed(() => String(toValue(id) ?? '').trim())
  const endpoint = computed(() => {
    if (!projectId.value) return ''
    const encoded = encodeURIComponent(projectId.value)
    return options.management
      ? `/api/internal/control/projects/${encoded}/apps`
      : `/api/platform/apps?projectId=${encoded}`
  })
  return { projectId, ...useAppCollection(endpoint, { authenticated: options.management }) }
}
