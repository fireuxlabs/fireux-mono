import { computed, watchEffect } from 'vue'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { appSubscriptionCapacity } from 'fireux-core/runtime/app/utils/app-subscription-capacity'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import {
  useTest,
  type TestPacket,
  type TestStatus,
} from 'fireux-core/runtime/composables/fireux/workspace/useTest'
import { useProjectWorkspace } from 'fireux-core/runtime/project/composables/workspace/core/useProjectWorkspace'

export function useProjectWorkspaceTest() {
  const { currentUser, hasAuthState } = useAuth()
  const app = useAppSession()
  const config = useFireUXConfig()
  const workspace = useProjectWorkspace()
  const pageState = useWorkspacePageState('project')
  const projectId = workspace.id
  const endpoint = computed(
    () =>
      `/api/internal/control/projects/${encodeURIComponent(projectId.value)}/tests`
  )
  const auth = async () => ({
    authorization: `Bearer ${await currentUser.value!.getIdToken()}`,
  })
  const collectionPath = computed(() =>
    projectId.value ? `projects/${projectId.value}/tests` : ''
  )
  const { firestoreFetchCollection } = useFirestoreRead({
    databaseId: computed(() => readRuntimeFirestoreDatabaseId() || ''),
  })
  const liveRecords = firestoreFetchCollection<TestPacket>(collectionPath)
  const records = computed(() => liveRecords.value ?? [])
  const status = computed<TestStatus>(() => {
    if (
      !hasAuthState.value ||
      app.pending.value ||
      workspace.outcome.value === 'pending' ||
      liveRecords.value === undefined
    )
      return 'loading'
    if (app.error.value || workspace.outcome.value === 'error') return 'error'
    if (!currentUser.value) return 'idle'
    if (!projectId.value) return 'empty'
    return workspace.data.value ? 'ready' : 'error'
  })
  const test = useTest({
    capabilityId: 'project.test',
    entityId: projectId.value,
    records,
    status,
    limit: computed(() =>
      appSubscriptionCapacity(
        config.subscriptionCapacity,
        'project.test',
        app.appUser.value?.subscription || 'free'
      )
    ),
    canWrite: computed(() => status.value === 'ready'),
    primitives: {
      async create(value) {
        const result = await $fetch<{ test: TestPacket }>(endpoint.value, {
          method: 'POST',
          headers: await auth(),
          body: { value },
        })
        return result.test
      },
      async update(id, value) {
        await $fetch(`${endpoint.value}/${encodeURIComponent(id)}`, {
          method: 'PATCH',
          headers: await auth(),
          body: { value },
        })
      },
      async delete(id) {
        await $fetch(`${endpoint.value}/${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: await auth(),
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
