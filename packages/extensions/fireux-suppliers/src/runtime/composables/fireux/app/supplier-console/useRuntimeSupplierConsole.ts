import { computed } from 'vue'
import { useNav } from 'fireux-core/runtime/composables/fireux/app/ui/nav/useNav'
import { createScopeConsole } from 'fireux-core/runtime/composables/fireux/app/console/createScopeConsole'
import { useSupplierFetch } from '../../../supplier/useSupplierFetch'

export function useRuntimeSupplierConsole() {
  const nav = useNav(['console'])
  const { coreSuppliers, appSuppliers, pending } = useSupplierFetch()

  const navItems = computed(() =>
    nav.items.value.filter((item) => item.to.startsWith('/console/supplier'))
  )

  const stats = computed(() => ({
    coreSuppliers: coreSuppliers.value.length,
    appSuppliers: appSuppliers.value.length,
    totalSuppliers: coreSuppliers.value.length + appSuppliers.value.length,
    pending: pending.value,
  }))

  const actions = {
    openOverviewTo: '/console/supplier/overview',
    browseSuppliersTo: '/suppliers',
    openProfileTo: '/dashboard/supplier/profile',
  } as const

  return createScopeConsole({
    runtime: null,
    navItems,
    stats,
    actions,
    extra: {
      coreSuppliers,
      appSuppliers,
      pending,
    },
  })
}
