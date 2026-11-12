import { computed, inject, provide, type InjectionKey } from 'vue'
import { useKitchenStationCollection } from '../../useKitchenStationCollection'
import type { KitchenDishesContext } from './useKitchenDishesContext'

function createKitchenItemPreparation(context: KitchenDishesContext) {
  const { storageKitchenId, databaseId, rootCollection } = context
  const options = { databaseId, kitchenCollectionPath: rootCollection }
  const stations = useKitchenStationCollection(storageKitchenId, options)
  const preparationStations = computed(() =>
    stations.kitchenStations.value.filter(
      (station) => station.active && station.role !== 'coordination'
    )
  )
  return {
    preparationStations,
    stationsOutcome: stations.outcome,
    stationsError: stations.error,
  }
}
type Organisation = ReturnType<typeof createKitchenItemPreparation>
const key: InjectionKey<Organisation> = Symbol('KitchenItemPreparation')
export function provideKitchenItemPreparation(context: KitchenDishesContext) {
  const state = createKitchenItemPreparation(context)
  provide(key, state)
  return state
}
export function useKitchenItemPreparation() {
  const state = inject(key)
  if (!state) throw new Error('Kitchen Item organisation is not available.')
  return state
}
