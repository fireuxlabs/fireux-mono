import { doc, getDoc, writeBatch } from 'firebase/firestore'
import type { ConsoleRootCreateResult } from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleCreate'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { stampDoc } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { resolveFireuxAppScopeStateForRole } from 'fireux-core/runtime/utils/app-scope-state'
import {
  readRuntimeSimulationFirestoreDatabaseId,
  useFirestore,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { computed } from 'vue'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { PlaceStorage, type Place } from 'fireux-places/runtime/models/place.model'
import {
  KitchenStorage,
  type AppKitchen,
  type Kitchen,
} from '../../../../../models/kitchen.model'

type KitchenTestCreateInput = {
  id?: string
  displayName?: string
  display_name?: string
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

function resolveTestKitchenName(displayName: unknown, uid: unknown) {
  const name = normalizeString(displayName)
  const firstName = name.split(/\s+/).find(Boolean)
  if (firstName) return `${firstName}'s Test Kitchen`

  const userId = normalizeString(uid)
  return `${userId ? `User ${userId.slice(0, 6)}` : 'User'}'s Test Kitchen`
}

function resolveTestKitchenSlug(displayName: unknown, uid: unknown) {
  return normalizeSlug(resolveTestKitchenName(displayName, uid)) || 'user-test-kitchen'
}

const requireSimulationDatabaseId = () => {
  const databaseId = readRuntimeSimulationFirestoreDatabaseId()
  if (!databaseId) {
    throw new Error(
      'Missing firebase.simulationDatabaseId for kitchen test-mode writes.'
    )
  }
  return databaseId
}

export function useKitchenTestCreate() {
  const simulationDatabaseId = computed(
    () => requireSimulationDatabaseId()
  )
  const simulationDb = useFirestore(simulationDatabaseId)
  const { uid, currentUser } = useAuth()
  const { appId, role } = useFireUXConfig()

  async function createTestKitchen(
    input: KitchenTestCreateInput = {}
  ): Promise<ConsoleRootCreateResult> {
    const testId = normalizeString(input.id) || normalizeString(uid.value)
    const displayName =
      normalizeString(input.displayName) ||
      normalizeString(currentUser.value?.displayName)
    const name =
      normalizeString(input.display_name) ||
      resolveTestKitchenName(displayName, uid.value)
    if (!testId) {
      throw new Error('Test kitchen id is required')
    }

    const slug = resolveTestKitchenSlug(displayName, uid.value)
    if (!slug) {
      throw new Error('Test kitchen slug is required')
    }
    const scopeState = resolveFireuxAppScopeStateForRole(role)
    const actorId = normalizeString(uid.value)
    if (!scopeState || !actorId) {
      throw new Error('A signed-in App member is required for a Test Kitchen.')
    }

    const kitchenRef = doc(simulationDb, KitchenStorage.rootCollection, testId)
    const placeRef = doc(simulationDb, PlaceStorage.collection, testId)
    const supportRef = doc(
      simulationDb,
      `apps/${appId}/${KitchenStorage.scopeCollection}`,
      testId
    )
    const existed = (await getDoc(kitchenRef)).exists()
    const kitchen = await stampDoc<Partial<Kitchen>>({
      place_id: testId,
      slug,
      app_scope: {
        state: scopeState,
        app_id: appId,
      },
      visibility: {
        show: false,
        active: true,
        is_test: true,
      },
    }, { creator: true })
    const place = await stampDoc<Partial<Place>>({
      name,
      short_name: name,
      place_type: 'non_physical',
      timezone: 'Europe/Zurich',
      default_currency_code: 'CHF',
      source: 'manual',
      slug,
      types: ['restaurant'],
      tags: ['test'],
      entity_families: ['kitchen'],
    }, { creator: true })
    const support = await stampDoc<Omit<AppKitchen, 'id' | 'created' | 'updated'>>({
      operator_ids: [actorId],
      team_ids: [actorId],
      join_requests: [],
    }, { creator: true, app: true })
    const batch = writeBatch(simulationDb)
    batch.set(placeRef, place)
    batch.set(kitchenRef, kitchen)
    batch.set(supportRef, support)
    await batch.commit()

    return { id: testId, created: !existed }
  }

  return { createTestKitchen }
}
