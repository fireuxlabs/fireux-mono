import { computed, isRef } from 'vue'
import {
  normalizeConsoleString as normalizeString,
  resolveConsoleRootCollection,
  useConsole,
  type ConsoleMode,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { targetHasOperator } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleAuthority'
import {
  usePublishConsoleHeader,
  type ConsoleHeaderData,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsoleHeader'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  useSupplierCollection,
  type SupplierCollectionFilter,
} from '../../firestore/supplier/fetch/useSupplierCollection'
import { useSupplierFetch } from '../../firestore/supplier/fetch/useSupplierFetch'
import { type SupplierSurface } from '../../firestore/supplier/utils/view/useSupplierInterface'
import type { Ref } from 'vue'

type SupplierConsoleMode = ConsoleMode
type UseSupplierConsoleOptions = {
  filter?: SupplierCollectionFilter | Ref<SupplierCollectionFilter | null | undefined> | null
}

/**
 * FireUX stack family: Console-backed root entity.
 * Entity: Supplier.
 * Canon:
 * - docs/fireux-canon.md
 * - packages/core/fireux-docs/src/runtime/concepts/stacks/README.md
 * Contract:
 * - packages/extensions/fireux-suppliers/docs/contract.md
 *
 * This file adapts Supplier root/app authority sources into the private /console/supplier selected runtime.
 * It should not own Supplier catalogue or product operation records; those live under console/supplier/operations.
 */
export function useSupplierConsole(
  options: UseSupplierConsoleOptions = {}
) {
  const { uid } = useAuth()
  const userId = computed(() => normalizeString(uid.value))
  const liveFilter = computed<SupplierCollectionFilter>(() => {
    const explicitFilter = isRef(options.filter)
      ? options.filter.value ?? {}
      : options.filter ?? {}

    return {
      ...explicitFilter,
      operatorId: userId.value,
    }
  })
  const { suppliers: liveSuppliers } = useSupplierCollection({
    filter: liveFilter,
  })
  const { suppliers: allDemoSuppliers } = useSupplierCollection({ source: 'demo' })
  const demoSuppliers = computed(() =>
    allDemoSuppliers.value.filter(
      (supplier) =>
        normalizeString((supplier as SupplierSurface).app_scope_state) !== 'root_only'
    )
  )
  const { supplier: testSupplier } = useSupplierFetch(userId, { source: 'test' })

  const {
    selectedMode,
    selectedEntity,
    selectEntity,
    clearSelection,
  } = useConsole<SupplierSurface, SupplierSurface, SupplierSurface>('supplier', {
    liveItems: liveSuppliers,
    demoItems: demoSuppliers,
    testItem: testSupplier,
    getId: (supplier) => normalizeString((supplier as SupplierSurface)?.id),
  })

  const selectedSupplier = computed<SupplierSurface | null>(
    () => selectedEntity.value as SupplierSurface | null
  )
  const supplierId = computed(() => normalizeString(selectedSupplier.value?.id))
  const rootCollection = computed(() =>
    resolveConsoleRootCollection('suppliers', selectedMode.value)
  )
  const canWrite = computed(() => {
    if (selectedMode.value === 'demo') return false
    if (selectedMode.value === 'test') return Boolean(userId.value && supplierId.value === userId.value)
    return targetHasOperator(selectedSupplier.value, userId.value)
  })

  const header = computed<ConsoleHeaderData>(() => {
    const target = selectedSupplier.value as Record<string, unknown> | null
    if (!target) return null

    if (selectedMode.value === 'test') {
      return {
        title: 'Test Supplier',
        subtitle: normalizeString(target.tagline) || undefined,
        imageUrl: normalizeString(target.supplier_image) || undefined,
      }
    }

    return {
      title: normalizeString(target.supplier_organization_name),
      subtitle: normalizeString(target.tagline) || undefined,
      imageUrl: normalizeString(target.supplier_image) || undefined,
    }
  })

  usePublishConsoleHeader('supplier', header)

  const clearSelectedSupplier = () => {
    clearSelection()
  }

  const selectSupplier = (supplierId: string, mode: SupplierConsoleMode = 'live') => {
    selectEntity(supplierId, mode)
  }

  return {
    liveSuppliers,
    demoSuppliers,
    testSupplier,
    selectedSupplier,
    selectedMode,
    supplierId,
    rootCollection,
    canWrite,
    clearSelectedSupplier,
    selectSupplier,
  }
}
