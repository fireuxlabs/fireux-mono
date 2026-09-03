import { computed, watch, watchEffect } from 'vue'
import { useAsyncData } from '#imports'
import { useCurrentAppContext } from 'fireux-core/runtime/app/composables/useCurrentAppContext'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { appSubscriptionCapacity } from 'fireux-core/runtime/app/utils/app-subscription-capacity'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import {
  useTest,
  type TestPacket,
  type TestStatus,
} from 'fireux-core/runtime/composables/fireux/workspace/useTest'
import { useProjectDetail } from 'fireux-core/runtime/project/composables/useProjectDetail'
import { normalizeString } from 'fireux-core/runtime/utils/string'

type Response = { tests: TestPacket[] }

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
  const { data, pending, error, refresh } = useAsyncData<Response>(
    computed(() => `project-tests-${projectId.value || 'none'}`),
    async () =>
      !currentUser.value || !projectId.value
        ? { tests: [] }
        : $fetch(endpoint.value, { headers: await auth() }),
    { server: false, watch: [currentUser, projectId] }
  )
  const records = computed(() => data.value?.tests ?? [])
  const status = computed<TestStatus>(() => {
    if (
      !hasAuthState.value ||
      app.pending.value ||
      project.pending.value ||
      pending.value
    )
      return 'loading'
    if (app.error.value || project.error.value || error.value) return 'error'
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
        await refresh()
        return result.test
      },
      async update(id, value) {
        await $fetch(`${endpoint.value}/${encodeURIComponent(id)}`, {
          method: 'PATCH',
          headers: await auth(),
          body: { value },
        })
        await refresh()
      },
      async delete(id) {
        await $fetch(`${endpoint.value}/${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: await auth(),
        })
        await refresh()
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
