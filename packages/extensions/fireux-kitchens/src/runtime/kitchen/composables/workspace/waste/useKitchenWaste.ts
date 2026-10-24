import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { computed } from 'vue'
import { useRoute } from '#imports'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/workspace/composables/useWorkspaceWriteGuard'
import { useKitchenWorkspace } from '../useKitchenWorkspace'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import {
  KitchenWasteEventStorage,
  normalizeKitchenWasteEvent,
  type KitchenWasteReason,
  type KitchenWasteSource,
} from '../../../utils/waste-event'

export type KitchenWasteDraft = {
  item_name: string
  quantity: number
  unit: string
  reason: KitchenWasteReason
  source: KitchenWasteSource
  notes?: string
}

const text = (value: unknown) => String(value ?? '').trim()

export function useKitchenWaste() {
  const { hasIdentity, currentUser } = useAuth()
  const workspace = useKitchenWorkspace()
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const kitchenId = workspace.id
  const rootCollection = computed(() => 'kitchens')
  const canWrite = computed(() => Boolean(workspace.data.value))
  const collectionPath = computed(() =>
    hasIdentity.value && kitchenId.value && rootCollection.value
      ? `${rootCollection.value}/${kitchenId.value}/${KitchenWasteEventStorage.collection}`
      : ''
  )
  const { firestoreFetchCollection } = useFirestoreRead({
    databaseId: computed(() => readRuntimeFirestoreDatabaseId() || ''),
  })
  const collection =
    firestoreFetchCollection<Record<string, unknown>>(collectionPath)
  const events = computed(() =>
    (collection.value || []).map(normalizeKitchenWasteEvent)
  )

  const route = useRoute()
  const config = useFireUXConfig()
  const { appUser } = useUserSession()
  const captureIntent = useCommandScope([kitchenId, () => currentUser.value?.uid, () => config.appId, () => JSON.stringify(appUser.value), () => route.fullPath])
  async function recordWaste(draft: KitchenWasteDraft) {
    requireWritableData()
    const id = text(kitchenId.value), uid = currentUser.value?.uid, isCurrent = captureIntent()
    const observation = { ...draft }
    if (!id) throw new Error('Select a writable Kitchen first.')
    const assertScope = () => {
      if (!uid || currentUser.value?.uid !== uid || !isCurrent())
        throw new Error('The account or Kitchen changed. Reopen Record Waste.')
    }
    const user = await useRequireUser()
    assertScope()
    if (user.uid !== uid) throw new Error('The account changed. Reopen Record Waste.')
    const token = await user.getIdToken()
    assertScope()
    requireWritableData()
    const result = await $fetch<{ id: string }>('/api/workspace/kitchen/waste', {
      method: 'POST', headers: { Authorization: `Bearer ${token}` },
      body: { kitchenId: id, observation },
    })
    if (!result?.id) throw new Error('Command response did not identify the requested record.')
    return result.id
  }

  return {
    kitchenId,
    canWrite,
    collectionPath,
    events,
    outcome: collection.outcome,
    error: collection.error,
    recordWaste,
  }
}
