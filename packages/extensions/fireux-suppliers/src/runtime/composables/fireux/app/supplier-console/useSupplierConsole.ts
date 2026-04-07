import { computed } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useConsoleState } from 'fireux-core/runtime/composables/fireux/console/useConsoleState'
import type { Supplier } from '../../../models/supplier/Supplier.model'
import { getDemoSupplierScenarios } from './demo-scenarios'
import { useSupplierSelection } from './useSupplierSelection'
import { useActiveSupplier } from './useActiveSupplier'
import { useSupplierCollection } from '../../firestore/supplier/fetch/useSupplierCollection'
import { useSupplierInterface } from '../../firestore/supplier/utils/view/useSupplierInterface'

type UseRuntimeSupplierConsoleOptions = {
  publishHeader?: boolean
}

const normalizeString = (value: unknown): string => String(value || '').trim()
const stripTestSupplierSuffix = (value: unknown): string =>
  normalizeString(value)
    .replace(/\s+test supplier$/i, '')
    .trim()

/**
 * Root supplier console inputs.
 */
export function useSupplierConsole(
  options: UseRuntimeSupplierConsoleOptions = {}
) {
  const runtime = useActiveSupplier()
  const supplierSelection = useSupplierSelection()
  const { uid, currentUser } = useAuth()
  const { interface: toSupplierCard } = useSupplierInterface()
  const { coreSuppliers: liveSuppliers } = useSupplierCollection()
  const { coreSuppliers: testSuppliers } = useSupplierCollection({
    collectionPath: 'test-suppliers',
  })
  const scenarios = computed(getDemoSupplierScenarios)
  const selectedMode = supplierSelection.mode

  type SupplierPill = NonNullable<ReturnType<typeof toSupplierCard>>

  const buildSupplierPill = (
    target?: Supplier | null,
    imageUrl?: unknown
  ): SupplierPill | null => {
    const pill = toSupplierCard(target as Supplier | null)
    if (!pill) return null

    return {
      ...pill,
      avatarUrl: normalizeString(imageUrl) || pill.avatarUrl,
      title:
        selectedMode.value === 'test'
          ? normalizeString(currentUser.value?.displayName) ||
            stripTestSupplierSuffix(target?.supplier_organization_name) ||
            stripTestSupplierSuffix((target as any)?.name) ||
            'Your'
          : pill.title,
      subtitle: selectedMode.value === 'test' ? 'Test Supplier' : pill.subtitle,
    }
  }

  const demoSupplierPills = computed(() =>
    scenarios.value
      .map((entry) =>
        buildSupplierPill(entry.supplier as Supplier, entry.image_url)
      )
      .filter((entry): entry is SupplierPill => Boolean(entry))
  )

  const liveSupplierPills = computed(() =>
    liveSuppliers.value
      .map((entry) => buildSupplierPill(entry as Supplier))
      .filter((entry): entry is SupplierPill => Boolean(entry))
  )

  const testSupplierPills = computed(() => {
    const currentUid = normalizeString(uid.value)
    if (!currentUid) return []

    return testSuppliers.value
      .filter((entry) => normalizeString(entry?.id) === currentUid)
      .map((entry) => buildSupplierPill(entry as Supplier))
      .filter((entry): entry is SupplierPill => Boolean(entry))
  })

  const activeSupplierPill = computed(() => {
    const sourcePills =
      selectedMode.value === 'live'
        ? liveSupplierPills.value
        : selectedMode.value === 'test'
          ? testSupplierPills.value
          : demoSupplierPills.value

    return (
      sourcePills.find((item) => item.id === runtime.id.value) ??
      buildSupplierPill(
        runtime.supplier.value as Supplier | null,
        runtime.scenario.value?.image_url
      )
    )
  })

  const headerData = computed(() =>
    activeSupplierPill.value
      ? {
          imageUrl: activeSupplierPill.value.avatarUrl,
          title: activeSupplierPill.value.title,
          subtitle: activeSupplierPill.value.subtitle,
        }
      : null
  )

  const console = useConsoleState({
    family: 'supplier',
    selectedId: runtime.id,
    mode: selectedMode,
    setMode: (mode) => {
      supplierSelection.setRuntimeSupplier({ mode })
    },
    clearSelection: () => {
      supplierSelection.setRuntimeSupplier({
        selectedId: '',
        mode: selectedMode.value,
      })
    },
    header: headerData,
    publishHeader: options.publishHeader,
  })

  return {
    runtime,
    scenarios,
    activeSupplierPill,
    headerData,
    console,
  }
}
