import { createScopeConsole } from 'fireux-core/runtime/composables/fireux/app/console/createScopeConsole'
import { useNav } from 'fireux-core/runtime/composables/fireux/app/ui/nav/useNav'
import { computed } from 'vue'
import { useSupplierFetch } from '../../../supplier/useSupplierFetch'
import { useRuntimeSupplier } from './useRuntimeSupplier'

/**
 * Canon supplier console shell.
 * Wraps the console seam with nav, stats, and overview surface data.
 */
export function useRuntimeSupplierConsole() {
  const runtime = useRuntimeSupplier()
  const nav = useNav(['console'])
  const { coreSuppliers, pending } = useSupplierFetch()

  const navItems = computed(() =>
    nav.items.value.filter((item) => item.to.startsWith('/console/supplier'))
  )

  const overview = computed(() => [
    { key: 'root', label: 'Root supplier', count: runtime.coreSupplier.value ? 1 : 0 },
    { key: 'console', label: 'App console', count: runtime.appSupplier.value ? 1 : 0 },
    { key: 'directory', label: 'Known suppliers', count: coreSuppliers.value.length },
  ])

  const stats = computed(() => ({
    suppliers: coreSuppliers.value.length,
    hasRootSupplier: Boolean(runtime.coreSupplier.value),
    hasAppConsole: Boolean(runtime.appSupplier.value),
    pending: pending.value || runtime.pending.value,
  }))

  const actions = {
    openOverviewTo: '/console/supplier/overview',
    browseSuppliersTo: '/suppliers',
    openWorkspaceTo: '/console/supplier/overview',
  } as const

  return createScopeConsole({
    runtime,
    navItems,
    stats,
    actions,
    extra: {
      supplier: runtime,
      overview,
      coreSuppliers,
      pending,
    },
  })
}
