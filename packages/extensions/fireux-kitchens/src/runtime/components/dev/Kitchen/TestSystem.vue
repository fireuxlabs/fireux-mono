<template>
  <section class="space-y-10">
    <UCard>
      <template #header>
        <div class="space-y-2">
          <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Dummy -> Test sync
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Build in dummy first, then sync this exact stack into a test kitchen.
          </p>
        </div>
      </template>

      <div class="space-y-3">
        <div class="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <UInput
            v-model="targetKitchenId"
            size="sm"
            placeholder="Target test kitchen id"
          />

          <UButton
            size="sm"
            variant="soft"
            color="neutral"
            :label="pruneMissing ? 'Prune stale: on' : 'Prune stale: off'"
            @click="pruneMissing = !pruneMissing"
          />

          <UButton
            size="sm"
            :loading="isSyncing"
            icon="i-lucide-refresh-cw"
            @click="syncDummyToTestKitchen"
          >
            Sync Dummy -> Test
          </UButton>
        </div>

        <div class="flex flex-wrap gap-2 text-xs text-dimmed">
          <UBadge variant="soft">Ingredients: {{ syncCounts.ingredients }}</UBadge>
          <UBadge variant="soft">Mise: {{ syncCounts.mise }}</UBadge>
          <UBadge variant="soft">Recipes: {{ syncCounts.recipes }}</UBadge>
          <UBadge variant="soft">Dishes: {{ syncCounts.dishes }}</UBadge>
          <UBadge variant="soft">Menus: {{ syncCounts.menus }}</UBadge>
        </div>

        <p v-if="syncError" class="text-xs text-error">
          {{ syncError }}
        </p>

        <p v-else-if="syncSummary" class="text-xs text-dimmed">
          Synced {{ syncSummary.written }} docs to
          <code>test-kitchens/{{ syncSummary.kitchenId }}</code>
          <span v-if="pruneMissing">
            · Pruned {{ syncSummary.pruned }} stale docs.
          </span>
        </p>
      </div>
    </UCard>

    <UCard>
      <DevModel
        :title="'Test Kitchens · Model'"
        :model="kitchenModelRuntime"
      />
    </UCard>

    <UCard>
      <template #header>
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-3">
            <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Test kitchens collection
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Browse test kitchens resolved for this runtime and filter by model drift.
            </p>
            <DevDriftToolbar
              :drift-kind="kitchensDriftKind"
              :selected-field="kitchensSelectedField"
              :filter-options="kitchensFilterOptions"
              :copy-label="'Copy drift · Test Kitchens'"
              :copy-payload="kitchensDriftCopyPayload"
              @update:drift-kind="setKitchensDriftKind"
              @update:selected-field="setKitchensSelectedField"
            />
          </div>
        </div>
      </template>

      <KitchenCollectionManager :collection="filteredKitchensResolved" />
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore'
import { computed, ref } from 'vue'
import { useFirestore } from 'vuefire'
import {
  buildKitchenIngredient,
  dummyKitchenScenario,
} from '../../../../../../../../dummy/scenario'
import { useKitchenFetch } from '../../../composables/fireux/firestore/kitchen/fetch/useKitchenFetch'
import type { Ingredient } from '../../../models/ingredient.model'
import type { Kitchen, KitchenCollection } from '../../../models/kitchen.model'
import { KitchenCollection as KitchenModelRuntime } from '../../../models/kitchen.model'

defineOptions({ name: 'DevTestKitchenSystem' })

const kitchenModelRuntime = KitchenModelRuntime
const db = useFirestore()
const { setDocument } = useFirestoreCreate()

const { firestoreFetchCollection } = useFirestoreRead()
const kitchensCollection = firestoreFetchCollection<KitchenCollection>('test-kitchens')
const { kitchens: hydratedKitchens } = useKitchenFetch({
  collectionPath: 'test-kitchens',
})

const kitchensCollectionValue = computed(() => kitchensCollection.value ?? [])

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
  requiredPaths: ['name'],
})

const hydratedById = computed(() => {
  const map = new Map<string, Kitchen>()
  for (const kitchen of hydratedKitchens.value ?? []) {
    if (kitchen?.id) map.set(String(kitchen.id), kitchen)
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
    name: hydratedById.value.get(id)?.name ?? (doc as any).name ?? '',
    drift,
  }),
})

const kitchensDriftCopyPayload = buildKitchensCopyPayload({
  modelPath: 'packages/extensions/fireux-kitchens/src/runtime/models/kitchen.model.ts',
  itemsKey: 'testKitchens',
  items: filteredKitchensDriftPayload,
  total: computed(() => kitchensCollectionValue.value.length),
})

type KitchenCollectionName = 'ingredients' | 'mise' | 'recipes' | 'dishes' | 'menus'

const targetKitchenId = ref(String(dummyKitchenScenario.kitchen?.id || '').trim())
const pruneMissing = ref(true)
const isSyncing = ref(false)
const syncError = ref('')
const syncSummary = ref<{ kitchenId: string; written: number; pruned: number } | null>(null)

const syncCounts = computed(() => ({
  ingredients:
    (dummyKitchenScenario.globalIngredients?.length ?? 0) +
    (dummyKitchenScenario.kitchenPreparedComponents?.length ?? 0),
  mise: dummyKitchenScenario.menuStack.miseTasks.length,
  recipes: dummyKitchenScenario.menuStack.recipes.length,
  dishes: dummyKitchenScenario.menuStack.dishes.length,
  menus: dummyKitchenScenario.menuStack.menus.length,
}))

const resolveCollectionPath = (kitchenId: string, name: KitchenCollectionName) =>
  `test-kitchens/${kitchenId}/${name}`

const withKitchenId = <T extends Record<string, unknown>>(docs: T[], kitchenId: string) =>
  docs.map((doc) => ({
    ...doc,
    id: String(doc.id || '').trim(),
    kitchen_id: kitchenId,
  }))

const buildKitchenIngredientsForSync = (kitchenId: string) => {
  const map = new Map<string, Record<string, unknown>>()

  const push = (entry: Ingredient) => {
    const doc = buildKitchenIngredient(entry, kitchenId) as unknown as Record<string, unknown>
    const id = String(doc.id || '').trim()
    if (!id) return
    map.set(id, {
      ...doc,
      id,
      ingredient_id: id,
      kitchen_id: kitchenId,
    })
  }

  for (const ingredient of dummyKitchenScenario.globalIngredients ?? []) push(ingredient)
  for (const prepared of dummyKitchenScenario.kitchenPreparedComponents ?? []) {
    push(prepared as unknown as Ingredient)
  }

  return [...map.values()]
}

const upsertCollection = async (
  kitchenId: string,
  name: KitchenCollectionName,
  docs: Record<string, unknown>[]
) => {
  const collectionPath = resolveCollectionPath(kitchenId, name)
  const keepIds = new Set<string>()

  for (const entry of docs) {
    const id = String(entry.id || '').trim()
    if (!id) continue
    keepIds.add(id)
    await setDocument(collectionPath, id, entry, {
      app: true,
      creator: true,
    })
  }

  return { collectionPath, keepIds, written: keepIds.size }
}

const pruneCollection = async (collectionPath: string, keepIds: Set<string>) => {
  const snap = await getDocs(collection(db, collectionPath))
  let removed = 0

  for (const row of snap.docs) {
    if (keepIds.has(row.id)) continue
    await deleteDoc(doc(db, collectionPath, row.id))
    removed += 1
  }

  return removed
}

const syncDummyToTestKitchen = async () => {
  if (isSyncing.value) return

  const kitchenId = String(targetKitchenId.value || '').trim()
  if (!kitchenId) {
    syncError.value = 'Target test kitchen id is required.'
    return
  }

  isSyncing.value = true
  syncError.value = ''

  try {
    const kitchenDoc: KitchenCollection = {
      ...(dummyKitchenScenario.kitchen as KitchenCollection),
      id: kitchenId,
      is_test_kitchen: true,
    }

    await setDocument<KitchenCollection>('test-kitchens', kitchenId, kitchenDoc, {
      app: true,
      creator: true,
    })

    const collections: Record<KitchenCollectionName, Record<string, unknown>[]> = {
      ingredients: buildKitchenIngredientsForSync(kitchenId),
      mise: withKitchenId(dummyKitchenScenario.menuStack.miseTasks as Record<string, unknown>[], kitchenId),
      recipes: withKitchenId(dummyKitchenScenario.menuStack.recipes as Record<string, unknown>[], kitchenId),
      dishes: withKitchenId(dummyKitchenScenario.menuStack.dishes as Record<string, unknown>[], kitchenId),
      menus: withKitchenId(dummyKitchenScenario.menuStack.menus as Record<string, unknown>[], kitchenId),
    }

    let totalWritten = 0
    let totalPruned = 0

    for (const name of ['ingredients', 'mise', 'recipes', 'dishes', 'menus'] as KitchenCollectionName[]) {
      const { collectionPath, keepIds, written } = await upsertCollection(
        kitchenId,
        name,
        collections[name]
      )
      totalWritten += written

      if (pruneMissing.value) {
        totalPruned += await pruneCollection(collectionPath, keepIds)
      }
    }

    syncSummary.value = {
      kitchenId,
      written: totalWritten,
      pruned: totalPruned,
    }
  } catch (error: any) {
    syncError.value = String(error?.message || error || 'Failed to sync dummy to test kitchen.')
  } finally {
    isSyncing.value = false
  }
}
</script>
