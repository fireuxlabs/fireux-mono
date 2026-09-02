import { computed, nextTick, watch, watchEffect } from 'vue'
import { useAsyncData, useState } from '#imports'
import { useCurrentAppContext } from 'fireux-core/runtime/app/composables/useCurrentAppContext'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import {
  appSubscriptionCapacity,
  hasAppSubscriptionCapacity,
} from 'fireux-core/runtime/app/utils/app-subscription-capacity'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import { defineWorkspaceCapabilityContext } from 'fireux-core/runtime/composables/fireux/workspace/workspaceCapabilityContext'
import { useProjectDetail } from 'fireux-core/runtime/project/composables/useProjectDetail'
import type { Project } from 'fireux-core/runtime/project/models/project.model'
import { normalizeString } from 'fireux-core/runtime/utils/string'

export type ProjectTest = { id: string; name: string }

type ProjectTestsResponse = {
  ok: true
  project_id: string
  tests: ProjectTest[]
}

export function useProjectWorkspaceTest() {
  const { currentUser, hasAuthState } = useAuth()
  const appContext = useCurrentAppContext()
  const workspace = useWorkspace('project')
  const pageState = useWorkspacePageState('project')
  const fireux = useFireUXConfig()
  const membership = appContext.membership
  const projectId = computed(() => membership.value?.primary_project || '')
  const current = useProjectDetail(projectId)
  const selectedTestId = useState<string>(
    'fireux-project-test-selected-id',
    () => ''
  )
  const bold = useState<boolean>('fireux-project-test-bold', () => false)

  const requestKey = computed(
    () =>
      `project-tests-${currentUser.value?.uid || 'anonymous'}-${projectId.value || 'none'}`
  )
  const {
    data: testResponse,
    pending: testsPending,
    error: testsError,
    refresh: refreshTests,
  } = useAsyncData<ProjectTestsResponse>(
    requestKey,
    async () => {
      const user = currentUser.value
      const id = projectId.value
      if (!user || !id) return { ok: true, project_id: id, tests: [] }
      return $fetch<ProjectTestsResponse>(
        `/api/internal/control/projects/${encodeURIComponent(id)}/tests`,
        { headers: { authorization: `Bearer ${await user.getIdToken()}` } }
      )
    },
    { server: false, watch: [currentUser, hasAuthState, projectId] }
  )
  const tests = computed(() => testResponse.value?.tests ?? [])

  watchEffect(() => {
    if (tests.value.some((test) => test.id === selectedTestId.value)) return
    selectedTestId.value = tests.value[0]?.id || ''
  })

  watch(
    [projectId, current.project],
    ([primaryProjectId, project]: [string, Project | null]) => {
      if (!primaryProjectId || project?.id !== primaryProjectId) {
        if (!primaryProjectId) workspace.clearActive()
        return
      }
      workspace.activate(
        normalizeString(project.id),
        normalizeString(project.name),
        normalizeString(project.description),
        normalizeString(project.image_url)
      )
      workspace.setActiveStatus(project.status || '')
    },
    { immediate: true }
  )

  const limit = computed(() => {
    return appSubscriptionCapacity(
      fireux.subscriptionCapacity,
      'project.test',
      membership.value?.subscription || 'free'
    )
  })

  const state = computed(() => ({
    tests: tests.value,
    selectedTestId: selectedTestId.value,
    bold: bold.value,
  }))
  const derived = computed(() => {
    let status: 'idle' | 'loading' | 'error' | 'empty' | 'ready' = 'idle'
    if (!hasAuthState.value || appContext.pending.value || testsPending.value)
      status = 'loading'
    else if (appContext.error.value || current.error.value || testsError.value)
      status = 'error'
    else if (!currentUser.value) status = 'idle'
    else if (!projectId.value) status = 'empty'
    else if (current.pending.value) status = 'loading'
    else status = current.project.value ? 'ready' : 'error'

    const createAllowed = hasAppSubscriptionCapacity(
      fireux.subscriptionCapacity,
      'project.test',
      membership.value?.subscription || 'free',
      tests.value.length
    )
    const hasSelection = tests.value.some(
      (test) => test.id === selectedTestId.value
    )
    return {
      status,
      capability: defineWorkspaceCapabilityContext({
        id: 'project.test',
        subject: 'Test',
        primitives: {
          create: { available: createAllowed, limit: limit.value },
          read: {
            available: tests.value.length > 0,
            count: tests.value.length,
          },
          update: { available: hasSelection },
          delete: { available: hasSelection },
        },
        natives: [],
      }),
    }
  })

  function select(testId: string) {
    selectedTestId.value = tests.value.some((test) => test.id === testId)
      ? testId
      : ''
    bold.value = false
  }

  async function create(name: string) {
    const value = name.trim()
    const user = currentUser.value
    const id = projectId.value
    if (
      !value ||
      !user ||
      !id ||
      !hasAppSubscriptionCapacity(
        fireux.subscriptionCapacity,
        'project.test',
        membership.value?.subscription || 'free',
        tests.value.length
      )
    )
      return false
    await $fetch(
      `/api/internal/control/projects/${encodeURIComponent(id)}/tests`,
      {
        method: 'POST',
        headers: { authorization: `Bearer ${await user.getIdToken()}` },
        body: { name: value },
      }
    )
    await refreshTests()
    selectedTestId.value = tests.value.at(-1)?.id || ''
    return true
  }

  async function update(name: string) {
    const value = name.trim()
    const selected = tests.value.find((test) => test.id === selectedTestId.value)
    const user = currentUser.value
    const id = projectId.value
    if (!value || !selected || !user || !id) return false
    await $fetch(
      `/api/internal/control/projects/${encodeURIComponent(id)}/tests/${encodeURIComponent(selected.id)}`,
      {
        method: 'PATCH',
        headers: { authorization: `Bearer ${await user.getIdToken()}` },
        body: { name: value },
      }
    )
    await refreshTests()
    selectedTestId.value = selected.id
    return true
  }

  async function deleteTest() {
    const selected = tests.value.find((test) => test.id === selectedTestId.value)
    const user = currentUser.value
    const id = projectId.value
    if (!selected || !user || !id) return false
    await $fetch(
      `/api/internal/control/projects/${encodeURIComponent(id)}/tests/${encodeURIComponent(selected.id)}`,
      {
        method: 'DELETE',
        headers: { authorization: `Bearer ${await user.getIdToken()}` },
      }
    )
    await refreshTests()
    selectedTestId.value = tests.value[0]?.id || ''
    bold.value = false
    return true
  }

  function transform(change: (name: string) => string) {
    const testIndex = tests.value.findIndex(
      (test) => test.id === selectedTestId.value
    )
    const selected = tests.value[testIndex]
    if (!selected) return
    testResponse.value!.tests[testIndex] = {
      ...selected,
      name: change(selected.name),
    }
  }

  function capitalize() {
    transform((name) => name.charAt(0).toUpperCase() + name.slice(1))
  }

  function uppercase() {
    transform((name) => name.toUpperCase())
  }

  function lowercase() {
    transform((name) => name.toLowerCase())
  }

  function toggleBold() {
    if (tests.value.some((test) => test.id === selectedTestId.value))
      bold.value = !bold.value
  }

  watchEffect(() => {
    pageState.publish({
      tests: state.value.tests,
      derived: derived.value,
    })
  })

  async function refresh() {
    await appContext.refresh()
    await nextTick()
    await current.refresh()
    await refreshTests()
  }

  return {
    state,
    derived,
    actions: {
      refresh,
      create,
      select,
      update,
      delete: deleteTest,
      capitalize,
      uppercase,
      lowercase,
      toggleBold,
    },
  }
}
