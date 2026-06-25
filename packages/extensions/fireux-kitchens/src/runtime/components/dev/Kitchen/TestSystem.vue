<template>
  <section class="space-y-4">
    <UCard>
      <template #header>
        <div class="space-y-2">
          <p class="text-sm font-semibold text-highlighted">
            Demo -> Test kitchen
          </p>
          <p class="text-xs text-dimmed">
            Demo is read-only. This copies the local demo scenario into a
            writable simulation kitchen.
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
            @click="syncDemoToTestKitchen"
          >
            Sync demo to test
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
      title="Demo test kitchen sync"
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
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { getDefaultDemoKitchen } from '../../../composables/fireux/demo/kitchen/scenarios'
import { DishStorage } from '../../../models/dish.model'
import { KitchenStorage, type Kitchen } from '../../../models/kitchen.model'
import { MenuStorage } from '../../../models/menu/menu.model'
import { RecipeStorage } from '../../../models/recipe.model'

defineOptions({ name: 'DevTestKitchenSystem' })

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

type SyncSummary = {
  kitchenId: string
  written: number
  pruned: number
}

const collectionOrder: KitchenCollectionName[] = [
  'mise',
  RecipeStorage.collection,
  DishStorage.collection,
  MenuStorage.collection,
  'stations',
  'team',
  'suppliers',
  'purchases',
  'orders',
]
const demoKitchenScenario = getDefaultDemoKitchen()
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
const defaultTargetKitchenId = computed(() => String(uid.value || '').trim())
const sourceRows = computed(() => [
  { label: 'Mise', count: demoKitchenScenario.menuStack.miseTasks.length },
  { label: 'Recipes', count: demoKitchenScenario.menuStack.recipes.length },
  { label: 'Dishes', count: demoKitchenScenario.menuStack.dishes.length },
  { label: 'Menus', count: demoKitchenScenario.menuStack.menus.length },
  { label: 'Stations', count: demoKitchenScenario.menuStack.stations.length },
  { label: 'Team', count: demoKitchenScenario.menuStack.team.length },
  { label: 'Suppliers', count: demoKitchenScenario.procurementStack.suppliers.length },
  { label: 'Purchases', count: demoKitchenScenario.procurementStack.purchases.length },
  { label: 'Orders', count: demoKitchenScenario.serviceStack.incomingOrders.length },
])
const debug = computed(() => ({
  source: {
    id: demoKitchenScenario.kitchen.id,
    name: demoKitchenScenario.kitchen.name,
    mode: 'read-only demo scenario',
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

const resolveTestKitchenName = (displayName: unknown, kitchenId: string) => {
  const name = String(displayName || '').trim()
  const firstName = name.split(/\s+/).find(Boolean)
  return `${firstName || `User ${kitchenId.slice(0, 6)}`}'s Test Kitchen`
}

const buildTestKitchenDoc = (kitchenId: string): Kitchen => {
  const displayName = resolveTestKitchenName(
    currentUser.value?.displayName,
    kitchenId
  )

  return {
    id: kitchenId,
    place_id: kitchenId,
    slug: normalizeSlug(displayName) || 'user-test-kitchen',
    display_name: displayName,
    display_image_url: String(currentUser.value?.photoURL || '').trim() || undefined,
    is_test_kitchen: true,
    simulation_kind: 'test',
    can_write: true,
    created: { at: {} },
    updated: { at: {} },
  } as unknown as Kitchen
}

const buildCollections = (kitchenId: string) => ({
  mise: withKitchenId(asDocs(demoKitchenScenario.menuStack.miseTasks), kitchenId),
  [RecipeStorage.collection]: withKitchenId(
    asDocs(demoKitchenScenario.menuStack.recipes),
    kitchenId
  ),
  [DishStorage.collection]: withKitchenId(
    asDocs(demoKitchenScenario.menuStack.dishes),
    kitchenId
  ),
  [MenuStorage.collection]: withKitchenId(
    asDocs(demoKitchenScenario.menuStack.menus),
    kitchenId
  ),
  stations: withKitchenId(asDocs(demoKitchenScenario.menuStack.stations), kitchenId),
  team: withKitchenId(asDocs(demoKitchenScenario.menuStack.team), kitchenId),
  suppliers: withKitchenId(
    asDocs(demoKitchenScenario.procurementStack.suppliers),
    kitchenId
  ),
  purchases: withKitchenId(
    asDocs(demoKitchenScenario.procurementStack.purchases),
    kitchenId
  ),
  orders: withKitchenId(
    asDocs(demoKitchenScenario.serviceStack.incomingOrders),
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
    await setDocument<Kitchen>(
      KitchenStorage.rootCollection,
      kitchenId,
      buildTestKitchenDoc(kitchenId),
      { app: true, creator: true }
    )

    const collections = buildCollections(kitchenId)
    let totalWritten = 0
    let totalPruned = 0

    for (const name of collectionOrder) {
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
    syncError.value = String(
      error?.message || error || 'Failed to sync demo scenario to test kitchen.'
    )
  } finally {
    isSyncing.value = false
  }
}
</script>
