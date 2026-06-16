<template>
  <section class="space-y-10">
    <DevKitchenDemo />

    <UCard>
      <DevModel
        :title="'Kitchens · Model'"
        :model="kitchenModelRuntime"
      />
    </UCard>

    <UCard>
      <template #header>
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-3">
            <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Kitchens collection
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Browse the hydrated public kitchen view for this runtime and filter by model drift.
            </p>
            <DevDriftToolbar
              :drift-kind="kitchensDriftKind"
              :selected-field="kitchensSelectedField"
              :filter-options="kitchensFilterOptions"
              :copy-label="'Copy drift · Kitchens'"
              :copy-payload="kitchensDriftCopyPayload"
              @update:drift-kind="setKitchensDriftKind"
              @update:selected-field="setKitchensSelectedField"
            />
          </div>
        </div>
      </template>

      <KitchenCollectionManager
        :collection="filteredKitchensResolved"
        :description="'Hydrated public kitchens for this runtime. Use the storage inspector below for root, place, overlay, and child-scope truth.'"
        :dev-json-title="'Hydrated Kitchens (JSON)'"
        :dev-json-context="'dev kitchens · hydrated public kitchens'"
      />
    </UCard>

    <UCard>
      <template #header>
        <div class="space-y-3">
          <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Kitchen storage inspector
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Inspect the full storage picture for one kitchen: root doc, place doc, app overlay, and known child collections.
          </p>
          <USelect
            v-model="selectedKitchenId"
            :options="kitchenInspectorOptions"
            placeholder="Select a kitchen"
          />
        </div>
      </template>

      <div class="space-y-4">
        <div class="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          <UBadge variant="soft">
            appId: {{ resolvedAppId || 'missing' }}
          </UBadge>
          <UBadge variant="soft">
            root doc: {{ selectedRootKitchen ? 'yes' : 'no' }}
          </UBadge>
          <UBadge variant="soft">
            place doc: {{ selectedPlace ? 'yes' : 'no' }}
          </UBadge>
          <UBadge variant="soft">
            app overlay: {{ selectedKitchenApp ? 'yes' : 'no' }}
          </UBadge>
        </div>

        <div v-if="migrationSignals.rootOnlyCollections.length" class="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          Root-only child data detected:
          {{ migrationSignals.rootOnlyCollections.join(', ') }}.
          This is likely migration work for the selected kitchen.
        </div>

        <div v-if="migrationSignals.overlayOnlyCollections.length" class="rounded-lg border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900">
          Overlay-only child data detected:
          {{ migrationSignals.overlayOnlyCollections.join(', ') }}.
        </div>

        <div v-if="!selectedKitchenApp && selectedKitchenId" class="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900">
          No app overlay found at
          <code>{{ overlayKitchenCollectionPath }}/{{ selectedKitchenId }}</code>.
        </div>

        <DevJson
          title="Kitchen storage (JSON)"
          context="dev kitchens · full storage picture"
          :data="selectedKitchenStorageJson"
          :default-open="false"
          :hide-when-empty="false"
        />
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { PlaceStorage, type Place } from 'fireux-places/runtime/models/place.model'
import { computed, ref, shallowRef, watch, type Ref } from 'vue'
import { useKitchenChildCollection } from '../../../composables/fireux/firestore/kitchen/utils/paths/useKitchenChildCollection'
import {
  ROOT_KITCHEN_COLLECTION_PATH,
  resolveKitchenScopeCollectionPath,
} from '../../../composables/fireux/firestore/kitchen/utils/paths/useKitchenChildCollection'
import { useKitchenCollection } from '../../../composables/fireux/firestore/kitchen/fetch/useKitchenCollection'
import { DishStorage } from '../../../models/dish.model'
import { IngredientStorage } from '../../../models/ingredient.model'
import { MenuStorage } from '../../../models/menu/menu.model'
import { RecipeStorage } from '../../../models/recipe.model'
import type { AppKitchen, Kitchen } from '../../../models/kitchen.model'
import {
  KitchenModel as KitchenModelRuntime,
  KitchenStorage,
} from '../../../models/kitchen.model'

defineOptions({ name: 'DevKitchenSystem' })

const kitchenModelRuntime = KitchenModelRuntime

const { firestoreFetchCollection } = useFirestoreRead()
const { appId } = useFireUXConfig()
const kitchensCollection = firestoreFetchCollection<Kitchen>(KitchenStorage.rootCollection)
const placesCollection = firestoreFetchCollection<Place>(PlaceStorage.collection)
const { kitchens: hydratedKitchens } = useKitchenCollection()

const kitchensCollectionValue = computed(() => kitchensCollection.value ?? [])
const placesCollectionValue = computed(() => placesCollection.value ?? [])
const resolvedAppId = computed(() => String(appId || '').trim())
const overlayKitchenCollectionPath = computed(() =>
  resolvedAppId.value ? resolveKitchenScopeCollectionPath(resolvedAppId.value) : ''
)

const kitchenAppsRef = shallowRef<Ref<AppKitchen[] | undefined> | null>(null)

watch(
  overlayKitchenCollectionPath,
  (nextPath) => {
    kitchenAppsRef.value = nextPath ? firestoreFetchCollection<AppKitchen>(nextPath) : null
  },
  { immediate: true }
)

const kitchenApps = computed(() => kitchenAppsRef.value?.value ?? [])

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
  const map = new Map<string, Kitchen>()
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
    .filter(Boolean) as Kitchen[]
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
  modelPath: 'packages/extensions/fireux-kitchens/src/runtime/models/kitchen.model.ts',
  itemsKey: KitchenStorage.rootCollection,
  items: filteredKitchensDriftPayload,
  total: computed(() => kitchensCollectionValue.value.length),
})

const selectedKitchenId = ref('')

const kitchenInspectorOptions = computed(() =>
  (hydratedKitchens.value ?? []).map((kitchen) => {
    const id = String(kitchen.id || '').trim()
    const labelBase = kitchen.name || kitchen.short_name || id
    const overlayStatus = kitchenAppById.value.has(id) ? 'console' : 'root only'
    return {
      label: `${labelBase} · ${overlayStatus}`,
      value: id,
    }
  })
)

watch(
  kitchenInspectorOptions,
  (options) => {
    if (!options.length) {
      selectedKitchenId.value = ''
      return
    }

    const stillExists = options.some((option) => option.value === selectedKitchenId.value)
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
const overlayMenus = useKitchenChildCollection<Record<string, unknown>>(MenuStorage.collection, selectedKitchenId, {
  kitchenCollectionPath: overlayKitchenCollectionPath,
})

const rootDishes = useKitchenChildCollection<Record<string, unknown>>(DishStorage.collection, selectedKitchenId, {
  kitchenCollectionPath: rootKitchenCollectionPath,
})
const overlayDishes = useKitchenChildCollection<Record<string, unknown>>(DishStorage.collection, selectedKitchenId, {
  kitchenCollectionPath: overlayKitchenCollectionPath,
})

const rootRecipes = useKitchenChildCollection<Record<string, unknown>>(RecipeStorage.collection, selectedKitchenId, {
  kitchenCollectionPath: rootKitchenCollectionPath,
})
const overlayRecipes = useKitchenChildCollection<Record<string, unknown>>(RecipeStorage.collection, selectedKitchenId, {
  kitchenCollectionPath: overlayKitchenCollectionPath,
})

const rootMise = useKitchenChildCollection<Record<string, unknown>>('mise', selectedKitchenId, {
  kitchenCollectionPath: rootKitchenCollectionPath,
})
const overlayMise = useKitchenChildCollection<Record<string, unknown>>('mise', selectedKitchenId, {
  kitchenCollectionPath: overlayKitchenCollectionPath,
})

const rootIngredients = useKitchenChildCollection<Record<string, unknown>>(IngredientStorage.collection, selectedKitchenId, {
  kitchenCollectionPath: rootKitchenCollectionPath,
})
const overlayIngredients = useKitchenChildCollection<Record<string, unknown>>(IngredientStorage.collection, selectedKitchenId, {
  kitchenCollectionPath: overlayKitchenCollectionPath,
})

const rootOrders = useKitchenChildCollection<Record<string, unknown>>('orders', selectedKitchenId, {
  kitchenCollectionPath: rootKitchenCollectionPath,
})
const overlayOrders = useKitchenChildCollection<Record<string, unknown>>('orders', selectedKitchenId, {
  kitchenCollectionPath: overlayKitchenCollectionPath,
})

const rootSuppliers = useKitchenChildCollection<Record<string, unknown>>('suppliers', selectedKitchenId, {
  kitchenCollectionPath: rootKitchenCollectionPath,
})
const overlaySuppliers = useKitchenChildCollection<Record<string, unknown>>('suppliers', selectedKitchenId, {
  kitchenCollectionPath: overlayKitchenCollectionPath,
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
    overlay: buildCollectionSnapshot(overlayMenus.collectionPath.value, overlayMenus.items.value),
  },
  dishes: {
    root: buildCollectionSnapshot(rootDishes.collectionPath.value, rootDishes.items.value),
    overlay: buildCollectionSnapshot(overlayDishes.collectionPath.value, overlayDishes.items.value),
  },
  recipes: {
    root: buildCollectionSnapshot(rootRecipes.collectionPath.value, rootRecipes.items.value),
    overlay: buildCollectionSnapshot(overlayRecipes.collectionPath.value, overlayRecipes.items.value),
  },
  mise: {
    root: buildCollectionSnapshot(rootMise.collectionPath.value, rootMise.items.value),
    overlay: buildCollectionSnapshot(overlayMise.collectionPath.value, overlayMise.items.value),
  },
  ingredients: {
    root: buildCollectionSnapshot(rootIngredients.collectionPath.value, rootIngredients.items.value),
    overlay: buildCollectionSnapshot(overlayIngredients.collectionPath.value, overlayIngredients.items.value),
  },
  orders: {
    root: buildCollectionSnapshot(rootOrders.collectionPath.value, rootOrders.items.value),
    overlay: buildCollectionSnapshot(overlayOrders.collectionPath.value, overlayOrders.items.value),
  },
  suppliers: {
    root: buildCollectionSnapshot(rootSuppliers.collectionPath.value, rootSuppliers.items.value),
    overlay: buildCollectionSnapshot(overlaySuppliers.collectionPath.value, overlaySuppliers.items.value),
  },
}))

const migrationSignals = computed(() => {
  const rootOnlyCollections: string[] = []
  const overlayOnlyCollections: string[] = []
  const mirroredCollections: string[] = []
  const emptyCollections: string[] = []

  for (const [name, snapshot] of Object.entries(childCollectionsSnapshot.value)) {
    const rootCount = snapshot.root.count
    const overlayCount = snapshot.overlay.count

    if (rootCount > 0 && overlayCount === 0) {
      rootOnlyCollections.push(name)
      continue
    }

    if (overlayCount > 0 && rootCount === 0) {
      overlayOnlyCollections.push(name)
      continue
    }

    if (rootCount > 0 && overlayCount > 0) {
      mirroredCollections.push(name)
      continue
    }

    emptyCollections.push(name)
  }

  return {
    overlayMissing: !selectedKitchenApp.value,
    rootOnlyCollections,
    overlayOnlyCollections,
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
    overlayKitchenCollection: overlayKitchenCollectionPath.value || null,
    selectedRootKitchenDoc: selectedKitchenId.value
      ? `${rootKitchenCollectionPath.value}/${selectedKitchenId.value}`
      : null,
    selectedOverlayKitchenDoc:
      selectedKitchenId.value && overlayKitchenCollectionPath.value
        ? `${overlayKitchenCollectionPath.value}/${selectedKitchenId.value}`
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
</script>
