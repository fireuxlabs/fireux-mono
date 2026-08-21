import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import {
  PlaceStorage,
  type Place,
} from 'fireux-places/runtime/place/models/place.model'
import { computed, ref, watch } from 'vue'
import { useDevKitchenCollection } from '../../composables/firestore/fetch/useDevKitchenCollection'
import { useKitchenChildCollection } from '../../composables/firestore/utils/paths/useKitchenChildCollection'
import type { KitchenSurface } from '../../composables/firestore/utils/view/useKitchenInterface'
import { DishStorage } from '../../models/dish.model.ts'
import { IngredientStorage } from '../../../ingredient/models/ingredient.model.ts'
import { MenuStorage } from '../../../menu/models/menu.model.ts'
import { RecipeStorage } from '../../models/recipe.model.ts'
import {
  KitchenDefaults,
  KitchenStorage,
  type Kitchen,
} from '../../models/kitchen.model.ts'

export function useKitchenDevSystem() {
  const { firestoreFetchCollection } = useFirestoreRead()
  const kitchensCollection = firestoreFetchCollection<Kitchen>(
    KitchenStorage.collection
  )
  const placesCollection = firestoreFetchCollection<Place>(
    PlaceStorage.collection
  )
  const { kitchens: hydratedKitchens } = useDevKitchenCollection()
  const kitchensCollectionValue = computed(() => kitchensCollection.value ?? [])
  const placesCollectionValue = computed(() => placesCollection.value ?? [])

  const {
    driftKind: kitchensDriftKind,
    setDriftKind: setKitchensDriftKind,
    selectedField: kitchensSelectedField,
    setSelectedField: setKitchensSelectedField,
    filterOptions: kitchensFilterOptions,
    filteredCollection: filteredKitchens,
    buildDriftPayload: buildKitchensDriftPayload,
    buildCopyPayload: buildKitchensCopyPayload,
  } = useDevDriftFilter({
    collection: kitchensCollectionValue,
    runtimeModel: KitchenDefaults,
    driftMode: 'extras-only',
    requiredPaths: ['identity.display_name'],
  })

  const hydratedById = computed(
    () =>
      new Map(
        (hydratedKitchens.value ?? [])
          .filter((kitchen) => kitchen?.id)
          .map((kitchen) => [String(kitchen.id), kitchen])
      )
  )
  const rawKitchenById = computed(
    () =>
      new Map(
        kitchensCollectionValue.value
          .filter((kitchen) => kitchen?.id)
          .map((kitchen) => [String(kitchen.id), kitchen])
      )
  )
  const placeById = computed(
    () =>
      new Map(
        placesCollectionValue.value
          .filter((place) => place?.id)
          .map((place) => [String(place.id), place])
      )
  )
  const filteredKitchensResolved = computed(
    () =>
      filteredKitchens.value
        .map((kitchen) => hydratedById.value.get(String(kitchen.id)))
        .filter(Boolean) as KitchenSurface[]
  )
  const filteredKitchensDriftPayload = buildKitchensDriftPayload({
    map: ({ id, drift }) => ({
      id,
      display_name:
        hydratedById.value.get(id)?.display_name ??
        rawKitchenById.value.get(id)?.identity.display_name ??
        '',
      drift,
    }),
  })
  const kitchensDriftCopyPayload = buildKitchensCopyPayload({
    modelPath:
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/models/kitchen.model.ts',
    itemsKey: KitchenStorage.collection,
    items: filteredKitchensDriftPayload,
    total: computed(() => kitchensCollectionValue.value.length),
  })

  const selectedKitchenId = ref('')
  const kitchenInspectorOptions = computed(() =>
    (hydratedKitchens.value ?? []).map((kitchen) => ({
      label: kitchen.name || kitchen.short_name || String(kitchen.id),
      value: String(kitchen.id),
    }))
  )
  watch(
    kitchenInspectorOptions,
    (options) => {
      if (!options.some((option) => option.value === selectedKitchenId.value)) {
        selectedKitchenId.value = options[0]?.value || ''
      }
    },
    { immediate: true }
  )

  const kitchenCollectionPath = computed(() => KitchenStorage.collection)
  const child = (collection: string) =>
    useKitchenChildCollection<Record<string, unknown>>(
      collection,
      selectedKitchenId,
      { kitchenCollectionPath }
    )
  const childCollections = {
    menus: child(MenuStorage.collection),
    dishes: child(DishStorage.collection),
    recipes: child(RecipeStorage.collection),
    ingredients: child(IngredientStorage.collection),
    mise: child('mise'),
    orders: child('orders'),
    suppliers: child('suppliers'),
    team: child('team'),
  }
  const selectedKitchenStorageJson = computed(() => ({
    selectedKitchenId: selectedKitchenId.value || null,
    paths: {
      kitchen: selectedKitchenId.value
        ? `${KitchenStorage.collection}/${selectedKitchenId.value}`
        : null,
      place: selectedKitchenId.value
        ? `${PlaceStorage.collection}/${selectedKitchenId.value}`
        : null,
    },
    kitchen: rawKitchenById.value.get(selectedKitchenId.value) ?? null,
    place: placeById.value.get(selectedKitchenId.value) ?? null,
    hydratedKitchen: hydratedById.value.get(selectedKitchenId.value) ?? null,
    operations: Object.fromEntries(
      Object.entries(childCollections).map(([name, collection]) => [
        name,
        {
          path: collection.collectionPath.value,
          count: collection.items.value.length,
          items: collection.items.value,
        },
      ])
    ),
  }))

  return {
    kitchenModelRuntime: KitchenDefaults,
    kitchensDriftKind,
    setKitchensDriftKind,
    kitchensSelectedField,
    setKitchensSelectedField,
    kitchensFilterOptions,
    filteredKitchensResolved,
    kitchensDriftCopyPayload,
    selectedKitchenId,
    kitchenInspectorOptions,
    selectedRootKitchen: computed(
      () => rawKitchenById.value.get(selectedKitchenId.value) ?? null
    ),
    selectedPlace: computed(
      () => placeById.value.get(selectedKitchenId.value) ?? null
    ),
    selectedKitchenStorageJson,
  }
}
