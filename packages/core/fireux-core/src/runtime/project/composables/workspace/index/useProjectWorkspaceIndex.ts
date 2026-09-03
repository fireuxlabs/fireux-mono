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
import { defineWorkspaceCapabilityContext } from '../../../../composables/fireux/workspace/workspaceCapabilityContext'
import { normalizeString } from '../../../../utils/string'
import { resolveWorkspaceCanCreate } from '../../../../utils/workspace-policy'
import { useProjectDetail } from '../../useProjectDetail'

export type ProjectWorkspaceIndexState = {
  user: {
    id: string
    anonymous: boolean
  }
  appUser: {
    projects: string[]
    primaryProject: string
  }
  project: { id: string; name: string; tagline: string; url: string }
}

export type ProjectWorkspaceIndexDerived = {
  status: 'idle' | 'loading' | 'error' | 'empty' | 'ready'
  capability: ReturnType<typeof defineWorkspaceCapabilityContext>
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
      },
      appUser: {
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
    const limit = appSubscriptionCapacity(
      fireux.subscriptionCapacity,
      'project',
      subscription
    )
    const count = projects.length
    let status: ProjectWorkspaceIndexDerived['status'] = 'idle'
    if (!mounted.value || !hasAuthState.value || appContext.pending.value)
      status = 'loading'
    else if (appContext.error.value || current.error.value) status = 'error'
    else if (!currentUser.value) status = 'idle'
    else if (!primaryProjectId.value) status = 'empty'
    else if (current.pending.value) status = 'loading'
    else status = current.project.value ? 'ready' : 'error'

    const createAllowed =
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
        count
      )
    return {
      status,
      capability: defineWorkspaceCapabilityContext({
        id: 'project',
        subject: 'Project',
        primitives: {
          create: { available: createAllowed, limit },
          read: { available: count > 0, count },
          update: { available: false },
          delete: { available: false },
        },
        natives: [],
      }),
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
      appUser: state.value.appUser,
      project: state.value.project,
      derived: derived.value,
    })
  })

  watch(
    () =>
      [
        derived.value.status,
        primaryProjectId.value,
        state.value.project,
      ] as const,
    ([outcome, primaryId, project]: readonly [
      ProjectWorkspaceIndexDerived['status'],
      string,
      ProjectWorkspaceIndexState['project'],
    ]) => {
      if (outcome === 'loading') return
      if (!primaryId || project.id !== primaryId) {
        if (!primaryId) workspace.clearActive()
        return
      }
      workspace.activate(project.id, project.name, project.tagline, project.url)
      workspace.setActiveStatus(current.project.value?.status || '')
    },
    { immediate: true }
  )

  return { state, derived, primitives: {}, natives: { refresh } }
}
