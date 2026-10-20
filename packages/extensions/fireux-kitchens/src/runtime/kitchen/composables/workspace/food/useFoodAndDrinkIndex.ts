import { computed, watchEffect, onScopeDispose } from 'vue'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import { useFoodCatalogueSummary } from './useFoodCatalogueSummary'
import { useKitchenOfferings } from '../../offerings/useKitchenOfferings'
import { useKitchenOfferingNow } from '../../useKitchenOfferingNow'
import { resolveServiceHours } from '../../../utils/service-hours'
import { serviceOverviewSnapshot } from '../../../utils/service-overview'
import { foodServiceSummary } from '../../../utils/food-service-summary'

/** One read-only overview shared by child surfaces, KitchenAI and page JSON. */
export function useFoodAndDrinkIndex() {
  const {
    kitchenId,
    storageKitchenId,
    offerings,
    menus,
    outcome,
    menusOutcome,
    placeOutcome,
    kitchenHours,
    canWrite,
  } = useKitchenOfferings()
  const catalogue = useFoodCatalogueSummary(
    storageKitchenId,
    menus,
    menusOutcome
  )
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
  const overview = computed(() => ({
    subject: 'Food & drink',
    catalogue: catalogue.value,
    availableActions: [],
    setup: ready.value ? setup.value.services : [],
    services: rows.value,
    menus: ready.value
      ? menus.value.map((menu) => ({
          id: menu.id,
          name: menu.name,
          internal_name: menu.internal_name,
          status: menu.status,
        }))
      : [],
  }))
  const page = useWorkspacePageState('kitchen')
  watchEffect(() =>
    page.publish({
      selected: { kitchenId: kitchenId.value },
      overview: overview.value,
      derived: {
        outcome: failed.value
          ? 'error'
          : pending.value
            ? 'pending'
            : ready.value
              ? 'ready'
              : 'empty',
      },
    })
  )
  onScopeDispose(() => page.publish({ derived: { outcome: 'idle' } }))

  return { kitchenId, catalogue, rows, pending, failed, ready, overview }
}
