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
  const selectedIndex = useState<number>(
    'fireux-project-test-selected-index',
    () => -1
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
    user: {
      id: currentUser.value?.uid || '',
      anonymous: Boolean(currentUser.value?.isAnonymous),
    },
    appUser: {
      projects: membership.value?.projects || [],
      primaryProject: membership.value?.primary_project || '',
    },
    project: {
      id: normalizeString(current.project.value?.id),
      name: normalizeString(current.project.value?.name),
      tagline: normalizeString(current.project.value?.description),
      url: normalizeString(current.project.value?.image_url),
    },
    tests: tests.value,
    selectedIndex: selectedIndex.value,
    bold: bold.value,
  }))
  const derived = computed(() => {
    let status: 'idle' | 'loading' | 'error' | 'empty' | 'ready' = 'idle'
    if (!hasAuthState.value || appContext.pending.value || testsPending.value) status = 'loading'
    else if (appContext.error.value || current.error.value || testsError.value) status = 'error'
    else if (!currentUser.value) status = 'idle'
    else if (!projectId.value) status = 'empty'
    else if (current.pending.value) status = 'loading'
    else status = current.project.value ? 'ready' : 'error'

    return {
      status,
      create: {
        allowed: hasAppSubscriptionCapacity(
          fireux.subscriptionCapacity,
          'project.test',
          membership.value?.subscription || 'free',
          tests.value.length
        ),
        limit: limit.value,
      },
    }
  })

  function select(index: number) {
    selectedIndex.value = tests.value[index] ? index : -1
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
    await $fetch(`/api/internal/control/projects/${encodeURIComponent(id)}/tests`, {
      method: 'POST',
      headers: { authorization: `Bearer ${await user.getIdToken()}` },
      body: { name: value },
    })
    await refreshTests()
    selectedIndex.value = tests.value.length - 1
    return true
  }

  function update(name: string) {
    const value = name.trim()
    if (!value || !tests.value[selectedIndex.value]) return
    testResponse.value!.tests[selectedIndex.value] = {
      ...tests.value[selectedIndex.value],
      name: value,
    }
  }

  function remove() {
    if (!tests.value[selectedIndex.value]) return
    testResponse.value!.tests.splice(selectedIndex.value, 1)
    selectedIndex.value = tests.value.length ? 0 : -1
    bold.value = false
  }

  function transform(change: (name: string) => string) {
    const selected = tests.value[selectedIndex.value]
    if (!selected) return
    testResponse.value!.tests[selectedIndex.value] = {
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
    if (tests.value[selectedIndex.value]) bold.value = !bold.value
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
      remove,
      capitalize,
      uppercase,
      lowercase,
      toggleBold,
    },
  }
}
