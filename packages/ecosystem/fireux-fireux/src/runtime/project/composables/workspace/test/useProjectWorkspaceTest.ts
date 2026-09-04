import { computed, watch, watchEffect } from 'vue'
import { useCurrentAppContext } from 'fireux-core/runtime/app/composables/useCurrentAppContext'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { appSubscriptionCapacity } from 'fireux-core/runtime/app/utils/app-subscription-capacity'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import {
  useTest,
  type TestPacket,
  type TestStatus,
} from 'fireux-core/runtime/composables/fireux/workspace/useTest'
import { useProjectDetail } from 'fireux-core/runtime/project/composables/useProjectDetail'
import { normalizeString } from 'fireux-core/runtime/utils/string'

export function useProjectWorkspaceTest() {
  const { currentUser, hasAuthState } = useAuth()
  const app = useCurrentAppContext()
  const config = useFireUXConfig()
  const workspace = useWorkspace('project')
  const pageState = useWorkspacePageState('project')
  const projectId = computed(() => app.membership.value?.primary_project || '')
  const project = useProjectDetail(projectId)
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
      project.pending.value ||
      liveRecords.value === undefined
    )
      return 'loading'
    if (app.error.value || project.error.value) return 'error'
    if (!currentUser.value) return 'idle'
    if (!projectId.value) return 'empty'
    return project.project.value ? 'ready' : 'error'
  })
  const test = useTest({
    capabilityId: 'project.test',
    records,
    status,
    limit: computed(() =>
      appSubscriptionCapacity(
        config.subscriptionCapacity,
        'project.test',
        app.membership.value?.subscription || 'free'
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
  watch(
    [projectId, project.project],
    ([id, current]) => {
      if (!id || current?.id !== id) {
        if (!id) workspace.clearActive()
        return
      }
      workspace.activate(
        normalizeString(current.id),
        normalizeString(current.name),
        normalizeString(current.description),
        normalizeString(current.image_url)
      )
      workspace.setActiveStatus(current.status || '')
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
