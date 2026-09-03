import { computed, watch, watchEffect } from 'vue'
import { useCurrentAppContext } from 'fireux-core/runtime/app/composables/useCurrentAppContext'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { appSubscriptionCapacity } from 'fireux-core/runtime/app/utils/app-subscription-capacity'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import {
  useTest,
  type TestPacket,
  type TestStatus,
} from 'fireux-core/runtime/composables/fireux/workspace/useTest'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useKitchenChildCollection } from '../../firestore/utils/paths/useKitchenChildCollection'
import { useKitchenWorkspaceCurrent } from '../index/useKitchenWorkspaceCurrent'

export function useKitchenWorkspaceTest() {
  const { currentUser, hasAuthState } = useAuth()
  const app = useCurrentAppContext()
  const config = useFireUXConfig()
  const workspace = useWorkspace('kitchen')
  const pageState = useWorkspacePageState('kitchen')
  const kitchenId = computed(() => app.membership.value?.primary_kitchen || '')
  const kitchen = useKitchenWorkspaceCurrent(kitchenId)
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
      kitchen.pending.value ||
      source.pending.value
    )
      return 'loading'
    if (app.error.value || kitchen.error.value) return 'error'
    if (!currentUser.value) return 'idle'
    if (!kitchenId.value) return 'empty'
    return kitchen.kitchen.value ? 'ready' : 'error'
  })
  const auth = async () => ({
    authorization: `Bearer ${await currentUser.value!.getIdToken()}`,
  })
  const test = useTest({
    capabilityId: 'kitchen.test',
    records,
    status,
    limit: computed(() =>
      appSubscriptionCapacity(
        config.subscriptionCapacity,
        'kitchen.test',
        app.membership.value?.subscription || 'free'
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
  watch(
    [kitchenId, kitchen.kitchen],
    ([id, current]) => {
      if (!id || current?.id !== id) {
        if (!id) workspace.clearActive()
        return
      }
      workspace.activate(
        normalizeString(current.id),
        normalizeString(current.identity.display_name),
        normalizeString(current.identity.tagline),
        normalizeString(current.identity.image_url)
      )
    },
    { immediate: true }
  )
  watchEffect(() =>
    pageState.publish({
      tests: test.state.value.tests,
      derived: test.derived.value,
    })
  )
  return test
}
