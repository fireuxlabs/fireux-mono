import { createScopeConsole } from 'fireux-core/runtime/composables/fireux/app/console/createScopeConsole'
import { useRuntimeConsoleBase } from 'fireux-core/runtime/composables/fireux/app/console/useRuntimeConsoleBase'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useConsoleEntryState } from 'fireux-core/runtime/composables/fireux/app/ui/useConsoleEntryState'
import { useNav } from 'fireux-core/runtime/composables/fireux/app/ui/nav/useNav'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { computed } from 'vue'
import { useSupplierFetch } from '../../firestore/supplier/fetch/useSupplierFetch'
import { useSupplierInterface } from '../../firestore/supplier/utils/view/useSupplierInterface'
import type { ConsoleSupplier, Supplier } from '../../../models/supplier/Supplier.model'
import { getReadOnlySupplierScenarios } from './read-only-scenarios'
import { useRuntimeSupplierSelection } from './state'
import { useRuntimeSupplier } from './useRuntimeSupplier'

/**
 * Canon supplier console shell.
 * Wraps the console seam with nav, stats, and overview surface data.
 */
export function useRuntimeSupplierConsole() {
  const runtime = useRuntimeSupplier()
  const { appId } = useFireUXConfig()
  const { uid } = useConsoleEntryState()
  const { canOwnMultipleConsoles } = useUser()
  const nav = useNav(['console'])
  const { firestoreFetchCollection } = useFirestoreRead()
  const { setRuntimeSupplier } = useRuntimeSupplierSelection()
  const { interface: supplierInterface } = useSupplierInterface()
  const { coreSuppliers, pending } = useSupplierFetch()
  const supplierOverlays = appId
    ? firestoreFetchCollection<ConsoleSupplier>(`apps/${appId}/suppliers`)
    : null
  const readOnlyScenarios = computed(() => getReadOnlySupplierScenarios())

  const accessibleSupplierIds = computed(() => {
    const currentUid = String(uid.value || '').trim()
    if (!currentUid) return new Set<string>()

    const ids = new Set<string>()

    for (const overlay of supplierOverlays?.value ?? []) {
      const id = String((overlay as any)?.id || '').trim()
      if (!id) continue
      if ((overlay as any)?.console_enabled === false) continue

      const adminIds = Array.isArray((overlay as any)?.admin_ids)
        ? (overlay as any).admin_ids
            .map((value: unknown) => String(value || '').trim())
            .filter(Boolean)
        : []

      if (adminIds.includes(currentUid)) {
        ids.add(id)
      }
    }

    return ids
  })

  const ownedSuppliers = computed(() =>
    coreSuppliers.value.filter((entry) =>
      accessibleSupplierIds.value.has(String((entry as any)?.id || '').trim())
    )
  )

  const ownedSupplierPills = computed(() =>
    ownedSuppliers.value
      .map((entry) => supplierInterface(entry))
      .filter((entry): entry is NonNullable<ReturnType<typeof supplierInterface>> => Boolean(entry))
  )

  const readOnlySupplierPills = computed(() =>
    readOnlyScenarios.value
      .map((entry) =>
        supplierInterface({
          ...(entry.supplier ?? {}),
          id: String((entry.supplier as any)?.id || '').trim() || String(entry.id || '').trim(),
        } as Supplier)
      )
      .filter((entry): entry is NonNullable<ReturnType<typeof supplierInterface>> => Boolean(entry))
  )

  const navItems = computed(() =>
    nav.items.value.filter((item) => item.to.startsWith('/console/supplier'))
  )

  const selection = useRuntimeConsoleBase({
    runtime,
    owned: ownedSuppliers,
    readOnly: readOnlyScenarios,
    canOwnMultiple: canOwnMultipleConsoles,
    ownedId: (entry) => String((entry as any)?.id || '').trim(),
    readOnlyId: (entry) => String(entry.id || '').trim(),
    ownedItem: (entry) => entry,
    readOnlyItem: (entry) => entry.supplier ?? null,
  })

  const hasActiveSupplier = selection.hasActiveItem
  const activeSupplier = selection.activeItem

  const activeSupplierPill = computed(() =>
    activeSupplier.value ? supplierInterface(activeSupplier.value as Supplier) : null
  )
  const canSelectMultipleLive = selection.canSelectMultipleLive
  const canSelectMultipleReadOnly = selection.canSelectMultipleReadOnly
  const showSelector = selection.showSelector
  const isOperatorOverview = selection.isOperatorOverview

  const ownershipPending = computed(
    () => pending.value || (Boolean(appId) && supplierOverlays?.value === undefined)
  )

  const overview = computed(() =>
    isOperatorOverview.value
      ? [
          {
            key: 'suppliers',
            label: 'Suppliers',
            count: runtime.isReadOnly.value ? readOnlyScenarios.value.length : ownedSuppliers.value.length,
          },
          {
            key: 'console',
            label: 'Console memberships',
            count: runtime.isReadOnly.value
              ? readOnlyScenarios.value.filter((entry) => Boolean(entry.consoleSupplier)).length
              : ownedSuppliers.value.length,
          },
          {
            key: 'directory',
            label: 'Known suppliers',
            count: coreSuppliers.value.length,
          },
        ]
      : [
          { key: 'root', label: 'Root supplier', count: runtime.coreSupplier.value ? 1 : 0 },
          { key: 'console', label: 'App console', count: runtime.appSupplier.value ? 1 : 0 },
          { key: 'directory', label: 'Known suppliers', count: coreSuppliers.value.length },
        ]
  )

  const stats = computed(() => ({
    suppliers: isOperatorOverview.value
      ? runtime.isReadOnly.value
        ? readOnlyScenarios.value.length
        : ownedSuppliers.value.length
      : coreSuppliers.value.length,
    hasRootSupplier: Boolean(runtime.coreSupplier.value),
    hasAppConsole: Boolean(runtime.appSupplier.value),
    pending: ownershipPending.value || runtime.pending.value,
  }))

  const actions = {
    openOverviewTo: '/console/supplier/overview',
    browseSuppliersTo: '/suppliers',
    openWorkspaceTo: '/console/supplier/overview',
  } as const

  const setActiveOwnedSupplier = (supplierId: string) => {
    const resolvedId = String(supplierId || '').trim()
    if (!resolvedId) return
    setRuntimeSupplier({
      supplierId: resolvedId,
      mode: runtime.isReadOnly.value ? 'read-only' : 'live',
    })
  }

  return createScopeConsole({
    runtime,
    navItems,
    stats,
    actions,
    extra: {
      supplier: runtime,
      overview,
      coreSuppliers,
      ownedSuppliers,
      ownedSupplierPills,
      readOnlyScenarios,
      readOnlySupplierPills,
      activeSupplier,
      activeSupplierPill,
      hasActiveSupplier,
      canOwnMultipleConsoles,
      canSelectMultipleLive,
      canSelectMultipleReadOnly,
      showSelector,
      isOperatorOverview,
      ownershipPending,
      setActiveOwnedSupplier,
      pending,
    },
  })
}
