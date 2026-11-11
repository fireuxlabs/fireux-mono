import { computed, inject, provide, type InjectionKey } from 'vue'
import { useKitchenChildCollection } from '../../useKitchenChildCollection'
import { useKitchenStationCollection } from '../../useKitchenStationCollection'
import { normalizeKitchenItemGroup } from '../../../utils/item-organisation'
import type { KitchenItemGroup } from '../../../models/item-group.model'
import type { KitchenDishesContext } from './useKitchenDishesContext'

function createKitchenItemOrganisation(context: KitchenDishesContext) {
  const { storageKitchenId, databaseId, rootCollection } = context
  const options = { databaseId, kitchenCollectionPath: rootCollection }
  const source = useKitchenChildCollection<KitchenItemGroup>(
    'item-groups',
    storageKitchenId,
    options
  )
  const stations = useKitchenStationCollection(storageKitchenId, options)
  const groups = computed(() =>
    source.items.value
      .map(normalizeKitchenItemGroup)
      .sort(
        (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)
      )
  )
  const preparationStations = computed(() =>
    stations.kitchenStations.value.filter(
      (station) => station.active && station.role !== 'coordination'
    )
  )
  return {
    groups,
    groupsOutcome: source.outcome,
    groupsError: source.error,
    preparationStations,
    stationsOutcome: stations.outcome,
    stationsError: stations.error,
  }
}
type Organisation = ReturnType<typeof createKitchenItemOrganisation>
const key: InjectionKey<Organisation> = Symbol('KitchenItemOrganisation')
export function provideKitchenItemOrganisation(context: KitchenDishesContext) {
  const state = createKitchenItemOrganisation(context)
  provide(key, state)
  return state
}
export function useKitchenItemOrganisation() {
  const state = inject(key)
  if (!state) throw new Error('Kitchen Item organisation is not available.')
  return state
}
