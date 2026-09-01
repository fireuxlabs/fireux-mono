import { computed, nextTick, ref, watch } from 'vue'
import { useCurrentAppContext } from 'fireux-core/runtime/app/composables/useCurrentAppContext'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import {
  appSubscriptionCapacity,
  hasAppSubscriptionCapacity,
} from 'fireux-core/runtime/app/utils/app-subscription-capacity'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useProjectDetail } from 'fireux-core/runtime/project/composables/useProjectDetail'
import type { Project } from 'fireux-core/runtime/project/models/project.model'
import { normalizeString } from 'fireux-core/runtime/utils/string'

export type ProjectTest = { name: string }

export function useProjectWorkspaceTest() {
  const { currentUser, hasAuthState } = useAuth()
  const appContext = useCurrentAppContext()
  const workspace = useWorkspace('project')
  const fireux = useFireUXConfig()
  const membership = appContext.membership
  const projectId = computed(() => membership.value?.primary_project || '')
  const current = useProjectDetail(projectId)
  const tests = ref<ProjectTest[]>([])
  const selectedIndex = ref(-1)
  const bold = ref(false)

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
    let outcome: 'idle' | 'pending' | 'error' | 'empty' | 'ready' = 'idle'
    if (!hasAuthState.value || appContext.pending.value) outcome = 'pending'
    else if (appContext.error.value || current.error.value) outcome = 'error'
    else if (!currentUser.value) outcome = 'idle'
    else if (!projectId.value) outcome = 'empty'
    else if (current.pending.value) outcome = 'pending'
    else outcome = current.project.value ? 'ready' : 'error'

    return {
      outcome,
      hasSelection: Boolean(current.project.value),
      limit: limit.value,
      canCreateTest: hasAppSubscriptionCapacity(
        fireux.subscriptionCapacity,
        'project.test',
        membership.value?.subscription || 'free',
        tests.value.length
      ),
    }
  })

  function select(index: number) {
    selectedIndex.value = tests.value[index] ? index : -1
    bold.value = false
  }

  function create(name: string) {
    const value = name.trim()
    if (
      !value ||
      !hasAppSubscriptionCapacity(
        fireux.subscriptionCapacity,
        'project.test',
        membership.value?.subscription || 'free',
        tests.value.length
      )
    )
      return
    tests.value.push({ name: value })
    selectedIndex.value = tests.value.length - 1
  }

  function update(name: string) {
    const value = name.trim()
    if (!value || !tests.value[selectedIndex.value]) return
    tests.value[selectedIndex.value] = { name: value }
  }

  function remove() {
    if (!tests.value[selectedIndex.value]) return
    tests.value.splice(selectedIndex.value, 1)
    selectedIndex.value = tests.value.length ? 0 : -1
    bold.value = false
  }

  function transform(change: (name: string) => string) {
    const selected = tests.value[selectedIndex.value]
    if (!selected) return
    tests.value[selectedIndex.value] = { name: change(selected.name) }
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

  async function refresh() {
    await appContext.refresh()
    await nextTick()
    await current.refresh()
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
