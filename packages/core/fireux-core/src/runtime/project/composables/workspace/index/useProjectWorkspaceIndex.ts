import { computed, nextTick, onMounted, ref, watch, watchEffect } from 'vue'
import { useFireUXConfig } from '../../../../app/composables/config/FireUXConfig'
import { useCurrentAppContext } from '../../../../app/composables/useCurrentAppContext'
import {
  appSubscriptionCapacity,
  hasAppSubscriptionCapacity,
} from '../../../../app/utils/app-subscription-capacity'
import { useAuth } from '../../../../composables/fireux/firebase/useAuth'
import { useWorkspace } from '../../../../composables/fireux/workspace/useWorkspace'
import { useWorkspacePageState } from '../../../../composables/fireux/workspace/useWorkspacePageState'
import { normalizeString } from '../../../../utils/string'
import { resolveWorkspaceCanCreate } from '../../../../utils/workspace-policy'
import { useProjectDetail } from '../../useProjectDetail'

export type ProjectWorkspaceIndexState = {
  user: {
    id: string
    anonymous: boolean
    projects: string[]
    primaryProject: string
  }
  project: { id: string; name: string; tagline: string; url: string }
}

export type ProjectWorkspaceIndexDerived = {
  outcome: 'idle' | 'pending' | 'error' | 'empty' | 'ready'
  hasSelection: boolean
  canCreate: boolean
  canSelectMultiple: boolean
}

export function useProjectWorkspaceIndex() {
  const { currentUser, hasAuthState } = useAuth()
  const appContext = useCurrentAppContext()
  const fireux = useFireUXConfig()
  const workspace = useWorkspace('project')
  const pageState = useWorkspacePageState('project')
  const mounted = ref(false)
  const primaryProjectId = computed(
    () => appContext.membership.value?.primary_project || ''
  )
  const current = useProjectDetail(primaryProjectId)

  const state = computed<ProjectWorkspaceIndexState>(() => {
    const membership = appContext.membership.value
    const project = current.project.value
    return {
      user: {
        id: currentUser.value?.uid || '',
        anonymous: Boolean(currentUser.value?.isAnonymous),
        projects: membership?.projects || [],
        primaryProject: primaryProjectId.value,
      },
      project: {
        id: normalizeString(project?.id),
        name: normalizeString(project?.name),
        tagline: normalizeString(project?.description),
        url: normalizeString(project?.image_url),
      },
    }
  })

  const derived = computed<ProjectWorkspaceIndexDerived>(() => {
    const membership = appContext.membership.value
    const projects = membership?.projects || []
    const subscription = membership?.subscription || 'free'
    const canSelectMultiple =
      appSubscriptionCapacity(
        fireux.subscriptionCapacity,
        'project',
        subscription
      ) === null
    let outcome: ProjectWorkspaceIndexDerived['outcome'] = 'idle'
    if (!mounted.value || !hasAuthState.value || appContext.pending.value)
      outcome = 'pending'
    else if (appContext.error.value || current.error.value) outcome = 'error'
    else if (!currentUser.value) outcome = 'idle'
    else if (!primaryProjectId.value) outcome = 'empty'
    else if (current.pending.value) outcome = 'pending'
    else outcome = current.project.value ? 'ready' : 'error'

    return {
      outcome,
      hasSelection: Boolean(current.project.value),
      canSelectMultiple,
      canCreate:
        Boolean(membership) &&
        resolveWorkspaceCanCreate(
          fireux.role,
          fireux.workspaceConfig,
          'project'
        ) &&
        hasAppSubscriptionCapacity(
          fireux.subscriptionCapacity,
          'project',
          subscription,
          projects.length
        ),
    }
  })

  async function refresh() {
    await appContext.refresh()
    await nextTick()
    await current.refresh()
  }

  onMounted(() => {
    mounted.value = true
  })

  watchEffect(() => {
    pageState.publish({
      user: state.value.user,
      project: state.value.project,
      derived: derived.value,
    })
  })

  watch(
    () =>
      [derived.value.outcome, primaryProjectId.value, state.value.project] as const,
    ([outcome, primaryId, project]: readonly [
      ProjectWorkspaceIndexDerived['outcome'],
      string,
      ProjectWorkspaceIndexState['project'],
    ]) => {
      if (outcome === 'pending') return
      if (!primaryId || project.id !== primaryId) {
        if (!primaryId) workspace.clearActive()
        return
      }
      workspace.activate(project.id, project.name, project.tagline, project.url)
      workspace.setActiveStatus(current.project.value?.status || '')
    },
    { immediate: true }
  )

  watch(workspace.requestedId, async (projectId: string) => {
    if (!projectId) return
    const user = currentUser.value
    try {
      if (!user) return
      await $fetch('/api/internal/control/projects/primary', {
        method: 'POST',
        headers: { Authorization: `Bearer ${await user.getIdToken()}` },
        body: { projectId },
      })
      await refresh()
    } finally {
      workspace.clearRequestedActivation()
    }
  })

  return { state, derived, actions: { refresh } }
}
