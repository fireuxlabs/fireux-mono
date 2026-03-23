import { createScopeConsole } from 'fireux-core/runtime/composables/fireux/app/console/createScopeConsole'
import { useNav } from 'fireux-core/runtime/composables/fireux/app/ui/nav/useNav'
import { computed } from 'vue'
import { useSupplierFetch } from '../../../supplier/useSupplierFetch'

export function useRuntimeSupplierConsole() {
  const nav = useNav(['console'])
  const { coreSuppliers, pending } = useSupplierFetch()

  const navItems = computed(() =>
    nav.items.value.filter((item) => item.to.startsWith('/console/supplier'))
  )

  const stats = computed(() => ({
    suppliers: coreSuppliers.value.length,
    pending: pending.value,
  }))

  const actions = {
    openOverviewTo: '/console/supplier/overview',
    browseSuppliersTo: '/suppliers',
    openWorkspaceTo: '/dashboard/supplier',
  } as const

  return createScopeConsole({
    runtime: null,
    navItems,
    stats,
    actions,
    extra: {
      coreSuppliers,
      pending,
    },
  })
}
