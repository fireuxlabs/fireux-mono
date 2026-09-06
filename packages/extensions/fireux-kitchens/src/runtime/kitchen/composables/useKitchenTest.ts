import type { TestAIIntent } from 'fireux-core/runtime/composables/fireux/useTestAI'
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
} from 'fireux-core/runtime/composables/fireux/useTest'
import { useKitchenChildCollection } from './firestore/utils/paths/useKitchenChildCollection'
import { useKitchenWorkspace } from './workspace/core/useKitchenWorkspace'

export function useKitchenTest() {
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
    if (source.error.value) return 'error'
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
  async function auth() {
    const user = currentUser.value
    if (!user) throw new Error('Sign in again to manage Tests.')
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      const token = await Promise.race([
        user.getIdToken(),
        new Promise<never>((_, reject) => {
          timer = setTimeout(
            () =>
              reject(
                new Error(
                  'Sign-in verification timed out. Check your connection and try again.'
                )
              ),
            10_000
          )
        }),
      ])
      return { authorization: `Bearer ${token}` }
    } finally {
      if (timer) clearTimeout(timer)
    }
  }
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
        const headers = await auth()
        const result = await $fetch<{ test: TestPacket }>(
          '/api/workspace/kitchen/tests',
          {
            method: 'POST',
            timeout: 20_000,
            retry: 0,
            headers,
            body: { kitchenId: kitchenId.value, value },
          }
        ).catch((cause) => {
          if (
            cause?.cause?.name === 'TimeoutError' ||
            cause?.cause?.name === 'AbortError'
          ) {
            throw new Error(
              'The server took too long to confirm this Test. Close this dialog and check your records before trying again; it may have been saved.'
            )
          }
          throw cause
        })
        return result.test
      },
      async update(id, value) {
        await $fetch(`/api/workspace/kitchen/tests/${encodeURIComponent(id)}`, {
          method: 'PATCH',
          timeout: 20_000,
          retry: 0,
          headers: await auth(),
          body: { kitchenId: kitchenId.value, value },
        })
      },
      async delete(id) {
        await $fetch(`/api/workspace/kitchen/tests/${encodeURIComponent(id)}`, {
          method: 'DELETE',
          timeout: 20_000,
          retry: 0,
          headers: await auth(),
          body: { kitchenId: kitchenId.value },
        })
      },
    },
  })
  const context = computed(() => ({
    workspace: { id: kitchenId.value },
    collection: { records: test.state.value.tests },
    selected:
      test.state.value.tests.find(
        (record) => record.id === test.state.value.selectedTestId
      ) ?? null,
    derived: test.derived.value,
  }))
  watchEffect(() => pageState.publish(context.value))
  async function requestAI(prompt: string): Promise<TestAIIntent> {
    return $fetch('/api/workspace/kitchen/tests/intent', {
      method: 'POST',
      headers: await auth(),
      body: {
        prompt,
        selectedId: context.value.selected?.id ?? '',
        records: context.value.collection.records.slice(0, 100),
        availableActions: context.value.derived.capability.availableActions,
      },
    })
  }
  return { ...test, context, requestAI }
}
