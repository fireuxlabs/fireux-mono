import { computed, type Ref } from 'vue'
import { useRoute } from '#imports'
import type { AppSearchDemand } from '../../../../config/app/search-demand'

/** Select App-authored research, independently of enabled runtime Workspaces. */
export function useAppResearchScope(root: Ref<AppSearchDemand | null>) {
  const route = useRoute()
  const scope = computed(() =>
    typeof route.query.scope === 'string' ? route.query.scope : ''
  )
  const demand = computed(() => {
    if (
      route.query.scope !== undefined &&
      typeof route.query.scope !== 'string'
    )
      return null
    if (!scope.value) return root.value
    const related = root.value?.related_research
    return related && Object.hasOwn(related, scope.value)
      ? related[scope.value]!
      : null
  })
  const briefs = computed(() =>
    root.value
      ? [
          {
            label: root.value.reconciliation?.workspace ?? root.value.domain,
            to: { path: route.path },
            active: !scope.value,
          },
          ...Object.entries(root.value.related_research ?? {}).map(
            ([key, brief]) => ({
              label: brief.reconciliation?.workspace ?? brief.domain,
              to: { path: route.path, query: { scope: key } },
              active: scope.value === key,
            })
          ),
        ]
      : []
  )
  function researchRoute(path: string) {
    return { path, query: scope.value ? { scope: scope.value } : {} }
  }
  return { demand, briefs, researchRoute }
}
