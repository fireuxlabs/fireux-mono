import { computed } from 'vue'
import type { useKitchenOfferings } from '../../offerings/useKitchenOfferings'
import { useKitchenOfferingNow } from '../../useKitchenOfferingNow'
import { resolveServiceHours } from '../../../utils/service-hours'
import { serviceOverviewSnapshot } from '../../../utils/service-overview'
import { foodServiceSummary } from '../../../utils/food-service-summary'
import { requireMenuWorkspace } from './state'

/** The group constructs service projections once from its existing acquisitions. */
export function createMenuServices(
  source: ReturnType<typeof useKitchenOfferings>
) {
  const {
    kitchenId,
    offerings,
    menus,
    outcome,
    menusOutcome,
    placeOutcome,
    kitchenHours,
    canWrite,
  } = source
  const { now } = useKitchenOfferingNow()
  const failed = computed(() =>
    [outcome.value, menusOutcome.value, placeOutcome.value].includes('error')
  )
  const pending = computed(
    () =>
      !failed.value &&
      [outcome.value, menusOutcome.value, placeOutcome.value].some((value) =>
        ['idle', 'pending'].includes(value)
      )
  )
  const ready = computed(() =>
    Boolean(
      kitchenId.value &&
        ['ready', 'empty'].includes(outcome.value) &&
        ['ready', 'empty'].includes(menusOutcome.value) &&
        placeOutcome.value === 'ready'
    )
  )
  const rows = computed(() =>
    ready.value
      ? foodServiceSummary(
          resolveServiceHours(offerings.value, kitchenHours.value),
          menus.value,
          now.value
        )
      : []
  )
  const setup = computed(() =>
    serviceOverviewSnapshot({
      kitchenId: kitchenId.value,
      outcome: outcome.value,
      menusOutcome: menusOutcome.value,
      canWrite: canWrite.value,
      offerings: offerings.value,
      menus: menus.value,
    })
  )
  return { rows, setup, ready, pending, failed }
}

export function useKitchenWorkspaceMenuServices() {
  const { rows, pending, failed } = requireMenuWorkspace().overview.services
  return { rows, pending, failed }
}
