import { computed, inject, provide, type InjectionKey } from 'vue'
import {
  KitchenStationStorage,
  normalizeKitchenStation,
  type KitchenStation,
} from '../../../../utils/station.ts'
import { useKitchenChildCollection } from '../../../useKitchenChildCollection'
import { useKitchenWorkspace } from '../../useKitchenWorkspace'

function readStations() {
  const { data: kitchen, outcome: kitchenOutcome } = useKitchenWorkspace()
  const kitchenId = computed(() => kitchen.value?.id ?? '')
  const collection = useKitchenChildCollection<KitchenStation>(
    KitchenStationStorage.collection,
    kitchenId
  )
  const outcome = computed(() =>
    kitchenOutcome.value === 'ready'
      ? collection.outcome.value
      : kitchenOutcome.value
  )
  const stations = computed(() =>
    outcome.value === 'ready'
      ? collection.items.value.map(normalizeKitchenStation)
      : []
  )

  return { kitchenId, stations, outcome }
}

const stationsKey: InjectionKey<ReturnType<typeof readStations>> = Symbol(
  'fireux-kitchen-workspace-stations'
)

export function provideKitchenWorkspacePrepStationsRead() {
  const stations = readStations()
  provide(stationsKey, stations)
  return stations
}

export function useKitchenWorkspacePrepStationsRead() {
  const stations = inject(stationsKey)
  if (!stations) {
    throw new Error('Stations children require their workspace owner.')
  }
  return stations
}
