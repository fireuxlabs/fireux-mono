import { computed } from 'vue'
import { useKitchenWorkspaceMenuServices } from '../../../../composables/workspace/menu/services'

export function useKitchenWorkspaceMenuServicesOverview() {
  const {
    rows: sourceRows,
    pending,
    failed,
  } = useKitchenWorkspaceMenuServices()
  const rows = computed(() =>
    sourceRows.value.map((row) => ({
      ...row,
      badgeColor: row.open
        ? ('success' as const)
        : row.needsSetup
          ? ('warning' as const)
          : ('neutral' as const),
      badgeLabel: row.issues.length ? row.issues.join(' · ') : row.label,
      setupLabel: row.issues.length
        ? `Configure ${row.name}: ${row.issues.join(' · ')}`
        : undefined,
    }))
  )
  return { rows, pending, failed }
}
