import { computed, watch, watchEffect } from 'vue'
import { useToast } from '#imports'
import { useAppSession } from '../../../../app/composables/useAppSession'
import { useFireUXConfig } from '../../../../app/composables/config/FireUXConfig'
import { appSubscriptionCapacity } from '../../../../app/utils/app-subscription-capacity'
import { useAuth } from '../../../../composables/fireux/firebase/useAuth'
import { useWorkspace } from '../../../../composables/fireux/workspace/useWorkspace'
import { useProjectWorkspaceChoices } from '../index/useProjectWorkspaceChoices'

export function useProjectWorkspaceNavigation() {
  const appSession = useAppSession()
  const fireux = useFireUXConfig()
  const { currentUser } = useAuth()
  const workspace = useWorkspace('project')
  const projectIds = computed(() => appSession.appUser.value?.projects || [])
  const canSelectMultiple = computed(
    () =>
      appSubscriptionCapacity(
        fireux.subscriptionCapacity,
        'project',
        appSession.appUser.value?.subscription || 'free'
      ) === null
  )
  const shouldLoadChoices = computed(
    () => canSelectMultiple.value || projectIds.value.length > 1
  )
  const choices = useProjectWorkspaceChoices(shouldLoadChoices, projectIds)
  const toast = useToast()
  const project = computed(() => ({
    id: workspace.activeId.value,
    name: workspace.activeName.value,
    tagline: workspace.activeDescription.value,
    url: workspace.activeImage.value,
  }))

  watchEffect(() => {
    workspace.setChoices(
      choices.projects.value.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        image: item.image_url,
      }))
    )
  })

  watch(workspace.requestedId, async (projectId: string) => {
    if (!projectId) return
    const user = currentUser.value
    try {
      if (!user) return
      const response = await $fetch<{ updated?: true }>(
        '/api/internal/control/projects/primary',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${await user.getIdToken()}` },
          body: { projectId },
        }
      )
      if (response.updated) {
        return
      }
      toast.add({
        title: 'Primary Project change requested',
        description: 'An App administrator has been notified.',
      })
    } finally {
      workspace.clearRequestedActivation()
    }
  })

  return { project, workspace }
}
