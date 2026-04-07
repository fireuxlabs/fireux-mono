import { computed } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useConsoleState } from 'fireux-core/runtime/composables/fireux/console/useConsoleState'
import type { Kitchen } from '../../../models/kitchen.model'
import { getDemoKitchenScenarios } from './demo-scenarios'
import { useKitchenSelection } from './useKitchenSelection'
import { useActiveKitchen } from './useActiveKitchen'
import { useKitchenFetch } from '../../firestore/kitchen/fetch/useKitchenFetch'
import { useKitchenInterface } from '../../firestore/kitchen/utils/view/useKitchenInterface'

type UseRuntimeKitchenConsoleOptions = {
  publishHeader?: boolean
}

const normalizeString = (value: unknown): string => String(value || '').trim()
const stripTestKitchenSuffix = (value: unknown): string =>
  normalizeString(value)
    .replace(/\s+test kitchen$/i, '')
    .trim()

/**
 * Root kitchen console inputs.
 */
export function useKitchenConsole(
  options: UseRuntimeKitchenConsoleOptions = {}
) {
  const runtime = useActiveKitchen()
  const kitchenSelection = useKitchenSelection()
  const { uid, currentUser } = useAuth()
  const { interface: toKitchenCard } = useKitchenInterface()
  const { kitchens: liveKitchens } = useKitchenFetch()
  const { kitchens: testKitchens } = useKitchenFetch({
    collectionPath: 'test-kitchens',
  })
  const scenarios = computed(getDemoKitchenScenarios)
  const selectedMode = kitchenSelection.mode

  type KitchenPill = NonNullable<ReturnType<typeof toKitchenCard>>

  const buildKitchenPill = (target?: Kitchen | null): KitchenPill | null => {
    const pill = toKitchenCard(target as Kitchen | null)
    if (!pill) return null

    return selectedMode.value === 'test'
      ? {
          ...pill,
          title:
            normalizeString(currentUser.value?.displayName) ||
            stripTestKitchenSuffix(target?.name) ||
            'Your',
          subtitle: 'Test Kitchen',
        }
      : { ...pill }
  }

  const demoKitchenPills = computed(() =>
    scenarios.value
      .map((entry) => buildKitchenPill(entry.kitchen as Kitchen))
      .filter((entry): entry is KitchenPill => Boolean(entry))
  )

  const liveKitchenPills = computed(() =>
    liveKitchens.value
      .map((entry) => buildKitchenPill(entry as Kitchen))
      .filter((entry): entry is KitchenPill => Boolean(entry))
  )

  const testKitchenPills = computed(() => {
    const currentUid = normalizeString(uid.value)
    if (!currentUid) return []

    return testKitchens.value
      .filter((entry) => normalizeString(entry?.id) === currentUid)
      .map((entry) => buildKitchenPill(entry as Kitchen))
      .filter((entry): entry is KitchenPill => Boolean(entry))
  })

  const activeKitchenPill = computed(() => {
    const sourcePills =
      selectedMode.value === 'live'
        ? liveKitchenPills.value
        : selectedMode.value === 'test'
          ? testKitchenPills.value
          : demoKitchenPills.value

    return (
      sourcePills.find((item) => item.id === runtime.id.value) ??
      buildKitchenPill(runtime.kitchen.value as Kitchen | null)
    )
  })

  const headerData = computed(() =>
    activeKitchenPill.value
      ? {
          imageUrl: activeKitchenPill.value.imageUrl,
          title: activeKitchenPill.value.title,
          subtitle: activeKitchenPill.value.subtitle,
        }
      : null
  )

  const console = useConsoleState({
    family: 'kitchen',
    selectedId: runtime.id,
    mode: selectedMode,
    setMode: (mode) => {
      kitchenSelection.setRuntimeKitchen({ mode })
    },
    clearSelection: () => {
      kitchenSelection.setRuntimeKitchen({
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
    activeKitchenPill,
    headerData,
    console,
  }
}
