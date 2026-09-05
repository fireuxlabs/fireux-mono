import { computed, watchEffect } from 'vue'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { appSubscriptionCapacity } from 'fireux-core/runtime/app/utils/app-subscription-capacity'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import {
  useTest,
  type TestPacket,
  type TestStatus,
} from 'fireux-core/runtime/composables/fireux/workspace/useTest'
import { useKitchenChildCollection } from '../../firestore/utils/paths/useKitchenChildCollection'
import { useKitchenWorkspace } from '../core/useKitchenWorkspace'

export function useKitchenWorkspaceTest() {
  const { currentUser, hasAuthState } = useAuth()
  const app = useAppSession()
  const config = useFireUXConfig()
  const workspace = useKitchenWorkspace()
  const pageState = useWorkspacePageState('kitchen')
  const kitchenId = workspace.id
  const source = useKitchenChildCollection<TestPacket>('tests', kitchenId, {
    kitchenCollectionPath: 'kitchens',
    databaseId: computed(() => readRuntimeFirestoreDatabaseId() || ''),
  })
  const records = computed(() =>
    source.items.value.filter((packet) => packet.id && packet.value)
  )
  const status = computed<TestStatus>(() => {
    if (
      !hasAuthState.value ||
      app.pending.value ||
      workspace.outcome.value === 'pending' ||
      source.pending.value
    )
      return 'loading'
    if (app.error.value || workspace.outcome.value === 'error') return 'error'
    if (!currentUser.value) return 'idle'
    if (!kitchenId.value) return 'empty'
    return workspace.data.value ? 'ready' : 'error'
  })
  const auth = async () => ({
    authorization: `Bearer ${await currentUser.value!.getIdToken()}`,
  })
  const test = useTest({
    capabilityId: 'kitchen.test',
    entityId: kitchenId.value,
    records,
    status,
    limit: computed(() =>
      appSubscriptionCapacity(
        config.subscriptionCapacity,
        'kitchen.test',
        app.appUser.value?.subscription || 'free'
      )
    ),
    canWrite: computed(() => status.value === 'ready'),
    primitives: {
      async create(value) {
        const result = await $fetch<{ test: TestPacket }>(
          '/api/workspace/kitchen/tests',
          {
            method: 'POST',
            headers: await auth(),
            body: { kitchenId: kitchenId.value, value },
          }
        )
        return result.test
      },
      async update(id, value) {
        await $fetch(`/api/workspace/kitchen/tests/${encodeURIComponent(id)}`, {
          method: 'PATCH',
          headers: await auth(),
          body: { kitchenId: kitchenId.value, value },
        })
      },
      async delete(id) {
        await $fetch(`/api/workspace/kitchen/tests/${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: await auth(),
          body: { kitchenId: kitchenId.value },
        })
      },
    },
  })
  watchEffect(() =>
    pageState.publish({
      tests: test.state.value.tests,
      derived: test.derived.value,
    })
  )
  return test
}
