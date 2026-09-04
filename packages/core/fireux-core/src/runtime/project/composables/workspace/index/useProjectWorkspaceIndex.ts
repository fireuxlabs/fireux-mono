import { computed, watchEffect } from 'vue'
import { useFireUXConfig } from '../../../../app/composables/config/FireUXConfig'
import { useAppSession } from '../../../../app/composables/useAppSession'
import {
  appSubscriptionCapacity,
  hasAppSubscriptionCapacity,
} from '../../../../app/utils/app-subscription-capacity'
import { useWorkspacePageState } from '../../../../composables/fireux/workspace/useWorkspacePageState'
import { defineWorkspaceCapabilityContext } from '../../../../composables/fireux/workspace/workspaceCapabilityContext'
import { normalizeString } from '../../../../utils/string'
import { resolveWorkspaceCanCreate } from '../../../../utils/workspace-policy'
import { useProjectWorkspace } from '../core/useProjectWorkspace'

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
  const appSession = useAppSession()
  const fireux = useFireUXConfig()
  const workspace = useProjectWorkspace()
  const pageState = useWorkspacePageState('project')

  const state = computed<ProjectWorkspaceIndexState>(() => {
    const membership = appSession.appUser.value
    const project = workspace.data.value
    return {
      user: {
        id: appSession.uid.value,
        anonymous: false,
      },
      appUser: {
        projects: membership?.projects || [],
        primaryProject: workspace.selectedId.value,
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
    const membership = appSession.appUser.value
    const projects = membership?.projects || []
    const subscription = membership?.subscription || 'free'
    const limit = appSubscriptionCapacity(
      fireux.subscriptionCapacity,
      'project',
      subscription
    )
    const count = projects.length
    let status: ProjectWorkspaceIndexDerived['status'] = 'idle'
    if (appSession.pending.value || workspace.outcome.value === 'pending')
      status = 'loading'
    else if (appSession.error.value || workspace.outcome.value === 'error')
      status = 'error'
    else if (!appSession.uid.value) status = 'idle'
    else if (!workspace.selectedId.value) status = 'empty'
    else status = workspace.data.value ? 'ready' : 'error'

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

  watchEffect(() => {
    pageState.publish({
      user: state.value.user,
      appUser: state.value.appUser,
      project: state.value.project,
      derived: derived.value,
    })
  })

  return { state, derived, primitives: {}, natives: {} }
}
