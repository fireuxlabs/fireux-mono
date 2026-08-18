import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { PlaceStorage, type Place } from 'fireux-places/runtime/place/models/place.model'
import { computed, ref, shallowRef, watch, type Ref } from 'vue'
import { useKitchenChildCollection } from '../../composables/firestore/utils/paths/useKitchenChildCollection'
import type { KitchenSurface } from '../../composables/firestore/utils/view/useKitchenInterface'
import {
  ROOT_KITCHEN_COLLECTION_PATH,
  resolveKitchenScopeCollectionPath,
} from '../../composables/firestore/utils/paths/useKitchenChildCollection'
import { useDevKitchenCollection } from '../../composables/firestore/fetch/useDevKitchenCollection'
import { DishStorage } from '../../models/dish.model.ts'
import { IngredientStorage } from '../../../ingredient/models/ingredient.model.ts'
import { MenuStorage } from '../../../menu/models/menu.model.ts'
import { RecipeStorage } from '../../models/recipe.model.ts'
import { KitchenPrepItemStorage } from '../../models/prep-item.model.ts'
import type { AppKitchen, Kitchen } from '../../models/kitchen.model.ts'
import {
  KitchenDefaults as KitchenModelRuntime,
  KitchenStorage,
} from '../../models/kitchen.model.ts'
export function useKitchenDevSystem() {
  const kitchenModelRuntime = KitchenModelRuntime
  
  const { firestoreFetchCollection } = useFirestoreRead()
  
  const { appId } = useFireUXConfig()
  
  const kitchensCollection = firestoreFetchCollection<Kitchen>(KitchenStorage.collection)
  
  const placesCollection = firestoreFetchCollection<Place>(PlaceStorage.collection)
  
  const { kitchens: hydratedKitchens } = useDevKitchenCollection()
  
  const kitchensCollectionValue = computed(() => kitchensCollection.value ?? [])
  
  const placesCollectionValue = computed(() => placesCollection.value ?? [])
  
  const resolvedAppId = computed(() => String(appId || '').trim())
  
  const appSupportKitchenCollectionPath = computed(() =>
    resolvedAppId.value ? resolveKitchenScopeCollectionPath(resolvedAppId.value) : ''
  )
  
  const kitchenAppsRef = shallowRef<unknown>(null)
  
  watch(
    appSupportKitchenCollectionPath,
    (nextPath: string) => {
      kitchenAppsRef.value = nextPath ? firestoreFetchCollection<AppKitchen>(nextPath) : null
    },
    { immediate: true }
  )
  
  const kitchenApps = computed<AppKitchen[]>(() =>
    ((kitchenAppsRef.value as Ref<AppKitchen[] | undefined> | null)?.value ?? [])
  )
  
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
    runtimeModel: kitchenModelRuntime,
    driftMode: 'extras-only',
    requiredPaths: ['display_name'],
  })
  
  const hydratedById = computed(() => {
    const map = new Map<string, KitchenSurface>()
    for (const kitchen of hydratedKitchens.value ?? []) {
      if (kitchen?.id) map.set(String(kitchen.id), kitchen)
    }
    return map
  })
  
  const rawKitchenById = computed(() => {
    const map = new Map<string, Kitchen>()
    for (const kitchen of kitchensCollectionValue.value) {
      if (kitchen?.id) map.set(String(kitchen.id), kitchen)
    }
    return map
  })
  
  const placeById = computed(() => {
    const map = new Map<string, Place>()
    for (const place of placesCollectionValue.value) {
      if (place?.id) map.set(String(place.id), place)
    }
    return map
  })
  
  const kitchenAppById = computed(() => {
    const map = new Map<string, AppKitchen>()
    for (const kitchenApp of kitchenApps.value) {
      if (kitchenApp?.id) map.set(String(kitchenApp.id), kitchenApp)
    }
    return map
  })
  
  const filteredKitchensResolved = computed(() =>
    filteredKitchens.value
      .map((kitchen) => hydratedById.value.get(String(kitchen.id)))
      .filter(Boolean) as KitchenSurface[]
  )
  
  const filteredKitchensDriftPayload = buildKitchensDriftPayload({
    map: ({ doc, id, drift }) => ({
      id,
      display_name:
        (hydratedById.value.get(id) as any)?.display_name ??
        (doc as any).display_name ??
        '',
      drift,
    }),
  })
  
  const kitchensDriftCopyPayload = buildKitchensCopyPayload({
    modelPath: 'packages/extensions/fireux-kitchens/src/runtime/kitchen/models/kitchen.model.ts',
    itemsKey: KitchenStorage.collection,
    items: filteredKitchensDriftPayload,
    total: computed(() => kitchensCollectionValue.value.length),
  })
  
  const selectedKitchenId = ref('')
  
  const kitchenInspectorOptions = computed(() =>
    (hydratedKitchens.value ?? []).map((kitchen) => {
      const id = String(kitchen.id || '').trim()
      const labelBase = kitchen.name || kitchen.short_name || id
      const appSupportStatus = kitchenAppById.value.has(id) ? 'console' : 'root only'
      return {
        label: `${labelBase} · ${appSupportStatus}`,
        value: id,
      }
    })
  )
  
  watch(
    kitchenInspectorOptions,
    (options: Array<{ label: string; value: string }>) => {
      if (!options.length) {
        selectedKitchenId.value = ''
        return
      }
  
      const stillExists = options.some(
        (option: { label: string; value: string }) => option.value === selectedKitchenId.value
      )
      if (!stillExists) {
        selectedKitchenId.value = String(options[0]?.value || '')
      }
    },
    { immediate: true }
  )
  
  const rootKitchenCollectionPath = computed(() => ROOT_KITCHEN_COLLECTION_PATH)
  
  const selectedRootKitchen = computed(() => rawKitchenById.value.get(selectedKitchenId.value) ?? null)
  
  const selectedHydratedKitchen = computed(() => hydratedById.value.get(selectedKitchenId.value) ?? null)
  
  const selectedPlace = computed(() => placeById.value.get(selectedKitchenId.value) ?? null)
  
  const selectedKitchenApp = computed(() => kitchenAppById.value.get(selectedKitchenId.value) ?? null)
  
  const rootMenus = useKitchenChildCollection<Record<string, unknown>>(MenuStorage.collection, selectedKitchenId, {
    kitchenCollectionPath: rootKitchenCollectionPath,
  })
  
  const appMenus = useKitchenChildCollection<Record<string, unknown>>(MenuStorage.collection, selectedKitchenId, {
    kitchenCollectionPath: appSupportKitchenCollectionPath,
  })
  
  const rootDishes = useKitchenChildCollection<Record<string, unknown>>(DishStorage.collection, selectedKitchenId, {
    kitchenCollectionPath: rootKitchenCollectionPath,
  })
  
  const appDishes = useKitchenChildCollection<Record<string, unknown>>(DishStorage.collection, selectedKitchenId, {
    kitchenCollectionPath: appSupportKitchenCollectionPath,
  })
  
  const rootRecipes = useKitchenChildCollection<Record<string, unknown>>(RecipeStorage.collection, selectedKitchenId, {
    kitchenCollectionPath: rootKitchenCollectionPath,
  })
  
  const appRecipes = useKitchenChildCollection<Record<string, unknown>>(RecipeStorage.collection, selectedKitchenId, {
    kitchenCollectionPath: appSupportKitchenCollectionPath,
  })
  
  const rootMise = useKitchenChildCollection<Record<string, unknown>>('mise', selectedKitchenId, {
    kitchenCollectionPath: rootKitchenCollectionPath,
  })
  
  const appMise = useKitchenChildCollection<Record<string, unknown>>('mise', selectedKitchenId, {
    kitchenCollectionPath: appSupportKitchenCollectionPath,
  })

  const appPrepItems = useKitchenChildCollection<Record<string, unknown>>(KitchenPrepItemStorage.collection, selectedKitchenId, {
    kitchenCollectionPath: appSupportKitchenCollectionPath,
  })
  
  const rootIngredients = useKitchenChildCollection<Record<string, unknown>>(IngredientStorage.collection, selectedKitchenId, {
    kitchenCollectionPath: rootKitchenCollectionPath,
  })
  
  const appIngredients = useKitchenChildCollection<Record<string, unknown>>(IngredientStorage.collection, selectedKitchenId, {
    kitchenCollectionPath: appSupportKitchenCollectionPath,
  })
  
  const rootOrders = useKitchenChildCollection<Record<string, unknown>>('orders', selectedKitchenId, {
    kitchenCollectionPath: rootKitchenCollectionPath,
  })
  
  const appOrders = useKitchenChildCollection<Record<string, unknown>>('orders', selectedKitchenId, {
    kitchenCollectionPath: appSupportKitchenCollectionPath,
  })
  
  const rootSuppliers = useKitchenChildCollection<Record<string, unknown>>('suppliers', selectedKitchenId, {
    kitchenCollectionPath: rootKitchenCollectionPath,
  })
  
  const appSuppliers = useKitchenChildCollection<Record<string, unknown>>('suppliers', selectedKitchenId, {
    kitchenCollectionPath: appSupportKitchenCollectionPath,
  })
  
  const buildCollectionSnapshot = (
    path: string,
    items: Record<string, unknown>[]
  ) => ({
    path,
    count: items.length,
    ids: items
      .map((item) => String((item as any)?.id || '').trim())
      .filter(Boolean),
    items,
  })
  
  const childCollectionsSnapshot = computed(() => ({
    menus: {
      root: buildCollectionSnapshot(rootMenus.collectionPath.value, rootMenus.items.value),
      app: buildCollectionSnapshot(appMenus.collectionPath.value, appMenus.items.value),
    },
    dishes: {
      root: buildCollectionSnapshot(rootDishes.collectionPath.value, rootDishes.items.value),
      app: buildCollectionSnapshot(appDishes.collectionPath.value, appDishes.items.value),
    },
    recipes: {
      root: buildCollectionSnapshot(rootRecipes.collectionPath.value, rootRecipes.items.value),
      app: buildCollectionSnapshot(appRecipes.collectionPath.value, appRecipes.items.value),
    },
    legacyMise: {
      root: buildCollectionSnapshot(rootMise.collectionPath.value, rootMise.items.value),
      app: buildCollectionSnapshot(appMise.collectionPath.value, appMise.items.value),
    },
    prepItems: {
      root: buildCollectionSnapshot(
        `${rootKitchenCollectionPath.value}/${selectedKitchenId.value}/${KitchenPrepItemStorage.collection}`,
        []
      ),
      app: buildCollectionSnapshot(appPrepItems.collectionPath.value, appPrepItems.items.value),
    },
    ingredients: {
      root: buildCollectionSnapshot(rootIngredients.collectionPath.value, rootIngredients.items.value),
      app: buildCollectionSnapshot(appIngredients.collectionPath.value, appIngredients.items.value),
    },
    orders: {
      root: buildCollectionSnapshot(rootOrders.collectionPath.value, rootOrders.items.value),
      app: buildCollectionSnapshot(appOrders.collectionPath.value, appOrders.items.value),
    },
    suppliers: {
      root: buildCollectionSnapshot(rootSuppliers.collectionPath.value, rootSuppliers.items.value),
      app: buildCollectionSnapshot(appSuppliers.collectionPath.value, appSuppliers.items.value),
    },
  }))
  
  const migrationSignals = computed(() => {
    const rootOnlyCollections: string[] = []
    const appOnlyCollections: string[] = []
    const mirroredCollections: string[] = []
    const emptyCollections: string[] = []
  
    for (const [name, snapshot] of Object.entries(childCollectionsSnapshot.value)) {
      const rootCount = snapshot.root.count
      const appCount = snapshot.app.count
  
      if (rootCount > 0 && appCount === 0) {
        rootOnlyCollections.push(name)
        continue
      }
  
      if (appCount > 0 && rootCount === 0) {
        appOnlyCollections.push(name)
        continue
      }
  
      if (rootCount > 0 && appCount > 0) {
        mirroredCollections.push(name)
        continue
      }
  
      emptyCollections.push(name)
    }
  
    return {
      appSupportMissing: !selectedKitchenApp.value,
      rootOnlyCollections,
      appOnlyCollections,
      mirroredCollections,
      emptyCollections,
    }
  })
  
  const selectedKitchenStorageJson = computed(() => ({
    appId: resolvedAppId.value || null,
    selectedKitchenId: selectedKitchenId.value || null,
    selectedKitchenName: selectedHydratedKitchen.value?.name || selectedRootKitchen.value?.id || null,
    paths: {
      rootKitchenCollection: rootKitchenCollectionPath.value,
      appSupportKitchenCollection: appSupportKitchenCollectionPath.value || null,
      selectedRootKitchenDoc: selectedKitchenId.value
        ? `${rootKitchenCollectionPath.value}/${selectedKitchenId.value}`
        : null,
      selectedAppSupportKitchenDoc:
        selectedKitchenId.value && appSupportKitchenCollectionPath.value
          ? `${appSupportKitchenCollectionPath.value}/${selectedKitchenId.value}`
          : null,
      selectedPlaceDoc: selectedKitchenId.value ? `places/${selectedKitchenId.value}` : null,
    },
    rootKitchen: selectedRootKitchen.value,
    place: selectedPlace.value,
    hydratedKitchen: selectedHydratedKitchen.value,
    appKitchen: selectedKitchenApp.value,
    migrationSignals: migrationSignals.value,
    childCollections: childCollectionsSnapshot.value,
  }))

  return {
    kitchenModelRuntime,
    firestoreFetchCollection,
    appId,
    kitchensCollection,
    placesCollection,
    hydratedKitchens,
    kitchensCollectionValue,
    placesCollectionValue,
    resolvedAppId,
    appSupportKitchenCollectionPath,
    kitchenAppsRef,
    kitchenApps,
    kitchensDriftKind,
    setKitchensDriftKind,
    kitchensSelectedField,
    setKitchensSelectedField,
    kitchensFilterOptions,
    filteredKitchens,
    buildKitchensDriftPayload,
    buildKitchensCopyPayload,
    hydratedById,
    rawKitchenById,
    placeById,
    kitchenAppById,
    filteredKitchensResolved,
    filteredKitchensDriftPayload,
    kitchensDriftCopyPayload,
    selectedKitchenId,
    kitchenInspectorOptions,
    rootKitchenCollectionPath,
    selectedRootKitchen,
    selectedHydratedKitchen,
    selectedPlace,
    selectedKitchenApp,
    rootMenus,
    appMenus,
    rootDishes,
    appDishes,
    rootRecipes,
    appRecipes,
    rootMise,
    appMise,
    appPrepItems,
    rootIngredients,
    appIngredients,
    rootOrders,
    appOrders,
    rootSuppliers,
    appSuppliers,
    buildCollectionSnapshot,
    childCollectionsSnapshot,
    migrationSignals,
    selectedKitchenStorageJson,
  }
}
