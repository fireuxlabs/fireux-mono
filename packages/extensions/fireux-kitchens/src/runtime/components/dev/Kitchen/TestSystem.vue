<template>
  <section class="space-y-10">
    <UCard>
      <template #header>
        <div class="space-y-2">
          <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Demo -> Test sync
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Copy the local demo scenario into a writable simulation test kitchen.
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
            @click="syncDemoToTestKitchen"
          >
            Sync Demo -> Test
          </UButton>
        </div>

        <div class="flex flex-wrap gap-2 text-xs text-dimmed">
          <UBadge variant="soft">Mise: {{ syncCounts.mise }}</UBadge>
          <UBadge variant="soft">Recipes: {{ syncCounts.recipes }}</UBadge>
          <UBadge variant="soft">Dishes: {{ syncCounts.dishes }}</UBadge>
          <UBadge variant="soft">Menus: {{ syncCounts.menus }}</UBadge>
          <UBadge variant="soft">Stations: {{ syncCounts.stations }}</UBadge>
          <UBadge variant="soft">Team: {{ syncCounts.team }}</UBadge>
          <UBadge variant="soft">Suppliers: {{ syncCounts.suppliers }}</UBadge>
          <UBadge variant="soft">Purchases: {{ syncCounts.purchases }}</UBadge>
          <UBadge variant="soft">Orders: {{ syncCounts.orders }}</UBadge>
        </div>

        <p v-if="syncError" class="text-xs text-error">
          {{ syncError }}
        </p>

        <p v-else-if="syncSummary" class="text-xs text-dimmed">
          Synced {{ syncSummary.written }} docs to
          <code>{{ simulationDatabaseId }}/kitchens/{{ syncSummary.kitchenId }}</code>
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
              Browse test kitchens in the simulation database and filter by model drift.
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
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore'
import { computed, ref, watch } from 'vue'
import {
  readRuntimeSimulationFirestoreDatabaseId,
  useFirestore,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { getDefaultDemoKitchen } from '../../../composables/fireux/demo/kitchen/scenarios'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { DishStorage } from '../../../models/dish.model'
import { MenuStorage } from '../../../models/menu/menu.model'
import { RecipeStorage } from '../../../models/recipe.model'
import type { Kitchen } from '../../../models/kitchen.model'
import {
  KitchenModel as KitchenModelRuntime,
  KitchenStorage,
} from '../../../models/kitchen.model'

defineOptions({ name: 'DevTestKitchenSystem' })

const kitchenModelRuntime = KitchenModelRuntime
const demoKitchenScenario = getDefaultDemoKitchen()
const requireSimulationDatabaseId = () => {
  const databaseId = readRuntimeSimulationFirestoreDatabaseId()
  if (!databaseId) {
    throw new Error(
      'Missing firebase.simulationDatabaseId for kitchen test sync.'
    )
  }
  return databaseId
}
const simulationDatabaseId = computed(
  () => requireSimulationDatabaseId()
)
const db = useFirestore(simulationDatabaseId)
const { setDocument } = useFirestoreCreate({ databaseId: simulationDatabaseId })
const { uid, currentUser: authUser } = useAuth()
const { avatarSrc } = useUser()

const { firestoreFetchCollection } = useFirestoreRead({
  databaseId: simulationDatabaseId,
})
const kitchensCollection = firestoreFetchCollection<Kitchen>(KitchenStorage.rootCollection)

const kitchensCollectionValue = computed(() => kitchensCollection.value ?? [])
const hydratedKitchens = computed(() => kitchensCollectionValue.value)

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
  itemsKey: 'testKitchens',
  items: filteredKitchensDriftPayload,
  total: computed(() => kitchensCollectionValue.value.length),
})

type KitchenCollectionName =
  | 'mise'
  | typeof RecipeStorage.collection
  | typeof DishStorage.collection
  | typeof MenuStorage.collection
  | 'stations'
  | 'team'
  | 'suppliers'
  | 'purchases'
  | 'orders'

const defaultTargetKitchenId = computed(() => String(uid.value || '').trim())
const targetKitchenId = ref('')
const pruneMissing = ref(true)
const isSyncing = ref(false)
const syncError = ref('')
const syncSummary = ref<{ kitchenId: string; written: number; pruned: number } | null>(null)

watch(
  defaultTargetKitchenId,
  (nextKitchenId) => {
    if (String(targetKitchenId.value || '').trim()) return
    targetKitchenId.value = String(nextKitchenId || '').trim()
  },
  { immediate: true }
)

const syncCounts = computed(() => ({
  mise: demoKitchenScenario.menuStack.miseTasks.length,
  recipes: demoKitchenScenario.menuStack.recipes.length,
  dishes: demoKitchenScenario.menuStack.dishes.length,
  menus: demoKitchenScenario.menuStack.menus.length,
  stations: demoKitchenScenario.menuStack.stations.length,
  team: demoKitchenScenario.menuStack.team.length,
  suppliers: demoKitchenScenario.procurementStack.suppliers.length,
  purchases: demoKitchenScenario.procurementStack.purchases.length,
  orders: demoKitchenScenario.serviceStack.incomingOrders.length,
}))

const resolveCollectionPath = (kitchenId: string, name: KitchenCollectionName) =>
  `${KitchenStorage.rootCollection}/${kitchenId}/${name}`

const resolveTestKitchenName = (displayName: unknown, kitchenId: string) => {
  const name = String(displayName || '').trim()
  const firstName = name.split(/\s+/).find(Boolean)
  return `${firstName || `User ${kitchenId.slice(0, 6)}`}'s Test Kitchen`
}

const withKitchenId = <T extends Record<string, unknown>>(docs: T[], kitchenId: string) =>
  docs.map((doc) => ({
    ...doc,
    id: String(doc.id || '').trim(),
    kitchen_id: kitchenId,
  }))

const buildTestKitchenDoc = (kitchenId: string): Kitchen => {
  const existingKitchen = hydratedById.value.get(kitchenId)
  const existingImageUrl = String((existingKitchen as any)?.display_image_url || '').trim()
  const userAvatarUrl =
    String(avatarSrc.value || '').trim() ||
    String(authUser.value?.photoURL || '').trim()
  const displayName = resolveTestKitchenName(authUser.value?.displayName, kitchenId)

  return {
    id: kitchenId,
    place_id: String(existingKitchen?.place_id || kitchenId).trim(),
    slug: normalizeSlug(displayName) || 'user-test-kitchen',
    display_name: displayName,
    display_image_url: existingImageUrl || userAvatarUrl || undefined,
    is_test_kitchen: true,
    simulation_kind: 'test',
    can_write: true,
    created: (existingKitchen as any)?.created || { at: {} },
    updated: { at: {} },
  } as Kitchen
}

const asDocs = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value) ? (value as Record<string, unknown>[]) : []

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

const syncDemoToTestKitchen = async () => {
  if (isSyncing.value) return

  const kitchenId = String(targetKitchenId.value || '').trim()
  if (!kitchenId) {
    syncError.value = 'Target test kitchen id is required.'
    return
  }

  isSyncing.value = true
  syncError.value = ''

  try {
    const kitchenDoc = buildTestKitchenDoc(kitchenId)

    await setDocument<Kitchen>(KitchenStorage.rootCollection, kitchenId, kitchenDoc, {
      app: true,
      creator: true,
    })

    const collections: Record<KitchenCollectionName, Record<string, unknown>[]> = {
      mise: withKitchenId(asDocs(demoKitchenScenario.menuStack.miseTasks), kitchenId),
      [RecipeStorage.collection]: withKitchenId(asDocs(demoKitchenScenario.menuStack.recipes), kitchenId),
      [DishStorage.collection]: withKitchenId(asDocs(demoKitchenScenario.menuStack.dishes), kitchenId),
      [MenuStorage.collection]: withKitchenId(asDocs(demoKitchenScenario.menuStack.menus), kitchenId),
      stations: withKitchenId(asDocs(demoKitchenScenario.menuStack.stations), kitchenId),
      team: withKitchenId(asDocs(demoKitchenScenario.menuStack.team), kitchenId),
      suppliers: withKitchenId(asDocs(demoKitchenScenario.procurementStack.suppliers), kitchenId),
      purchases: withKitchenId(asDocs(demoKitchenScenario.procurementStack.purchases), kitchenId),
      orders: withKitchenId(asDocs(demoKitchenScenario.serviceStack.incomingOrders), kitchenId),
    }

    let totalWritten = 0
    let totalPruned = 0

    for (const name of [
      'mise',
      RecipeStorage.collection,
      DishStorage.collection,
      MenuStorage.collection,
      'stations',
      'team',
      'suppliers',
      'purchases',
      'orders',
    ] as KitchenCollectionName[]) {
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
    syncError.value = String(error?.message || error || 'Failed to sync demo scenario to test kitchen.')
  } finally {
    isSyncing.value = false
  }
}
</script>
