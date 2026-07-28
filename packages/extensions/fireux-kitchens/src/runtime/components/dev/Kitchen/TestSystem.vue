<!-- Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: separate blank simulation seeding from read-only console demo data. -->
<template>
  <section class="space-y-4">
    <UCard>
      <template #header>
        <div class="space-y-2">
          <p class="text-sm font-semibold text-highlighted">
            Test fixture -> Test kitchen
          </p>
          <p class="text-xs text-dimmed">
            Creates a blank, writable Kitchen in the simulation database.
          </p>
        </div>
      </template>

      <div class="space-y-4">
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
            @click="syncTestFixtureToTestKitchen"
          >
            Sync test fixture
          </UButton>
        </div>

        <div class="flex flex-wrap gap-2 text-xs text-dimmed">
          <UBadge
            v-for="row in sourceRows"
            :key="row.label"
            variant="soft"
          >
            {{ row.label }}: {{ row.count }}
          </UBadge>
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

    <DevFireuxDebugPanel
      title="Test kitchen sync"
      scope="dev"
      :data="debug"
    />
  </section>
</template>

<script setup lang="ts">
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore'
import { computed, ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import {
  readRuntimeSimulationFirestoreDatabaseId,
  useFirestore,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { getDefaultTestKitchen } from '../../../test/kitchen/scenario'
import { DishStorage } from '../../../models/kitchen/dish.model'
import { KitchenStorage } from '../../../models/kitchen.model'
import { KitchenMenuStorage } from '../../../models/kitchen/menu/kitchen-menu.model'
import { RecipeStorage } from '../../../models/kitchen/recipe.model'
import { useKitchenTestCreate } from '../../../composables/fireux/firestore/kitchen/mutations/useKitchenTestCreate'

defineOptions({ name: 'DevTestKitchenSystem' })

type KitchenCollectionName =
  | 'mise'
  | typeof RecipeStorage.collection
  | typeof DishStorage.collection
  | typeof KitchenMenuStorage.scopeCollection
  | 'stations'
  | 'team'
  | 'suppliers'
  | 'purchases'
  | 'orders'

type SyncSummary = {
  kitchenId: string
  written: number
  pruned: number
}

const collectionOrder: KitchenCollectionName[] = [
  'mise',
  RecipeStorage.collection,
  DishStorage.collection,
  KitchenMenuStorage.scopeCollection,
  'stations',
  'team',
  'suppliers',
  'purchases',
  'orders',
]
const testKitchenScenario = getDefaultTestKitchen()
const { uid, currentUser } = useAuth()
const targetKitchenId = ref('')
const pruneMissing = ref(true)
const isSyncing = ref(false)
const syncError = ref('')
const syncSummary = ref<SyncSummary | null>(null)
const requireSimulationDatabaseId = () => {
  const databaseId = readRuntimeSimulationFirestoreDatabaseId()
  if (!databaseId) {
    throw new Error('Missing firebase.simulationDatabaseId for kitchen test sync.')
  }
  return databaseId
}
const simulationDatabaseId = computed(() => requireSimulationDatabaseId())
const db = useFirestore(simulationDatabaseId)
const { setDocument } = useFirestoreCreate({ databaseId: simulationDatabaseId })
const { createTestKitchen } = useKitchenTestCreate()
const defaultTargetKitchenId = computed(() => String(uid.value || '').trim())
const sourceRows = computed(() => [
  { label: 'Mise', count: testKitchenScenario.menuStack.miseTasks.length },
  { label: 'Recipes', count: testKitchenScenario.menuStack.recipes.length },
  { label: 'Dishes', count: testKitchenScenario.menuStack.dishes.length },
  { label: 'Menus', count: testKitchenScenario.menuStack.menus.length },
  { label: 'Stations', count: testKitchenScenario.menuStack.stations.length },
  { label: 'Team', count: testKitchenScenario.menuStack.team.length },
  { label: 'Suppliers', count: testKitchenScenario.procurementStack.suppliers.length },
  { label: 'Purchases', count: testKitchenScenario.procurementStack.purchases.length },
  { label: 'Orders', count: testKitchenScenario.serviceStack.incomingOrders.length },
])
const debug = computed(() => ({
  source: {
    id: testKitchenScenario.kitchen.id,
    name: testKitchenScenario.kitchen.identity.display_name,
    mode: 'blank simulation fixture',
    rows: sourceRows.value,
  },
  target: {
    databaseId: simulationDatabaseId.value,
    collectionPath: KitchenStorage.rootCollection,
    kitchenId: targetKitchenId.value,
    mode: 'writable simulation test kitchen',
    pruneMissing: pruneMissing.value,
  },
  result: syncSummary.value,
}))

watch(
  defaultTargetKitchenId,
  (nextKitchenId: string) => {
    if (String(targetKitchenId.value || '').trim()) return
    targetKitchenId.value = String(nextKitchenId || '').trim()
  },
  { immediate: true }
)

const asDocs = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value) ? (value as Record<string, unknown>[]) : []

const withKitchenId = (
  docs: Record<string, unknown>[],
  kitchenId: string
) =>
  docs.map((doc) => ({
    ...doc,
    id: String(doc.id || '').trim(),
    kitchen_id: kitchenId,
  }))

const resolveCollectionPath = (kitchenId: string, name: KitchenCollectionName) =>
  `${KitchenStorage.rootCollection}/${kitchenId}/${name}`

const buildCollections = (kitchenId: string) => ({
  mise: withKitchenId(asDocs(testKitchenScenario.menuStack.miseTasks), kitchenId),
  [RecipeStorage.collection]: withKitchenId(
    asDocs(testKitchenScenario.menuStack.recipes),
    kitchenId
  ),
  [DishStorage.collection]: withKitchenId(
    asDocs(testKitchenScenario.menuStack.dishes),
    kitchenId
  ),
  [KitchenMenuStorage.scopeCollection]: withKitchenId(
    asDocs(testKitchenScenario.menuStack.menus),
    kitchenId
  ),
  stations: withKitchenId(asDocs(testKitchenScenario.menuStack.stations), kitchenId),
  team: withKitchenId(asDocs(testKitchenScenario.menuStack.team), kitchenId),
  suppliers: withKitchenId(
    asDocs(testKitchenScenario.procurementStack.suppliers),
    kitchenId
  ),
  purchases: withKitchenId(
    asDocs(testKitchenScenario.procurementStack.purchases),
    kitchenId
  ),
  orders: withKitchenId(
    asDocs(testKitchenScenario.serviceStack.incomingOrders),
    kitchenId
  ),
})

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

const syncTestFixtureToTestKitchen = async () => {
  if (isSyncing.value) return

  const kitchenId = String(targetKitchenId.value || '').trim()
  if (!kitchenId) {
    syncError.value = 'Target test kitchen id is required.'
    return
  }

  isSyncing.value = true
  syncError.value = ''

  try {
    await createTestKitchen({
      id: kitchenId,
      displayName: currentUser.value?.displayName || undefined,
    })

    const collections = buildCollections(kitchenId)
    let totalWritten = 0
    let totalPruned = 0

    for (const name of collectionOrder) {
      const { collectionPath, keepIds, written } = await upsertCollection(
        kitchenId,
        name,
        collections[name] ?? []
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
    syncError.value = String(
      error?.message || error || 'Failed to sync the test fixture.'
    )
  } finally {
    isSyncing.value = false
  }
}
</script>
