import { doc, getDoc } from 'firebase/firestore'
import type { ConsoleRootCreateResult } from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleCreate'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import {
  readRuntimeSimulationFirestoreDatabaseId,
  useFirestore,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { computed } from 'vue'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { KitchenStorage, type Kitchen } from '../../../../../models/kitchen.model'

type KitchenTestCreateInput = {
  id?: string
  displayName?: string
  name?: string
  image_url?: string
}

const normalizeString = (value: unknown) => String(value ?? '').trim()
const TEST_KITCHEN_ADDRESS = '123 Sandbox Street'

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
  const { setDocument } = useFirestoreCreate({
    databaseId: simulationDatabaseId,
  })
  const { updateDocument } = useFirestoreUpdate({
    databaseId: simulationDatabaseId,
  })
  const { uid, currentUser } = useAuth()

  async function createTestKitchen(
    input: KitchenTestCreateInput = {}
  ): Promise<ConsoleRootCreateResult> {
    const testId = normalizeString(input.id) || normalizeString(uid.value)
    const displayName =
      normalizeString(input.displayName) ||
      normalizeString(currentUser.value?.displayName)
    const name =
      normalizeString(input.name) ||
      resolveTestKitchenName(displayName, uid.value)
    const imageUrl =
      normalizeString(input.image_url) ||
      normalizeString(currentUser.value?.photoURL)

    if (!testId) {
      throw new Error('Test kitchen id is required')
    }

    const ref = doc(simulationDb, KitchenStorage.rootCollection, testId)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      const existingImageUrl = normalizeString(snap.data()?.image_url)
      await updateDocument<Kitchen>(KitchenStorage.rootCollection, testId, {
        name,
        slug: resolveTestKitchenSlug(displayName, uid.value),
        short_address: TEST_KITCHEN_ADDRESS,
        ...(existingImageUrl ? {} : { image_url: imageUrl }),
      })
      return { id: testId, created: false }
    }

    const slug = resolveTestKitchenSlug(displayName, uid.value)

    if (!slug) {
      throw new Error('Test kitchen slug is required')
    }

    await setDocument<Partial<Kitchen> & {
      slug?: string
      name?: string
      short_address?: string
      image_url?: string
      operator_ids?: string[]
      team_ids?: string[]
      simulation_kind?: string
      can_write?: boolean
      is_test_kitchen?: boolean
    }>(
      KitchenStorage.rootCollection,
      testId,
      {
        place_id: testId,
        slug,
        name,
        short_address: TEST_KITCHEN_ADDRESS,
        image_url: imageUrl,
        operator_ids: [testId],
        team_ids: [testId],
        simulation_kind: 'test',
        can_write: true,
        is_test_kitchen: true,
      },
      {
        creator: false,
      }
    )

    return { id: testId, created: true }
  }

  return { createTestKitchen }
}
