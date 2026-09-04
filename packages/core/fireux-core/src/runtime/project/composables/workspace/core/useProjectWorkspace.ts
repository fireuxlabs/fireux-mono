import { computed, watch, watchEffect } from 'vue'
import { useToast } from '#imports'
import { useWorkspace } from '../../../../composables/fireux/workspace/useWorkspace'
import { useAuth } from '../../../../composables/fireux/firebase/useAuth'
import { normalizeString } from '../../../../utils/string'
import { useProjectCollection } from '../../useProjectCollection'
import type { ProjectSurface } from '../../useProjectInterface'
import { useProjectUpdate } from '../../useProjectUpdate'
import { useProjectDelete } from '../../useProjectDelete'
import { useProjectWorkspaceCreate } from '../index/useProjectWorkspaceCreate'

export function useProjectWorkspace() {
  const workspace = useWorkspace('project')
  const { currentUser } = useAuth()
  const collection = useProjectCollection()
  const toast = useToast()
  const creation = useProjectWorkspaceCreate()
  const mutation = useProjectUpdate(workspace.selectedId)
  const removal = useProjectDelete(workspace.selectedId)
  const project = computed<ProjectSurface | null>(
    () =>
      collection.projects.value.find(
        (item) => normalizeString(item.id) === workspace.selectedId.value
      ) ?? null
  )

  watch(
    [collection.primaryProject, collection.projects],
    ([primaryProjectId, projects]: [string, ProjectSurface[]]) => {
      const primaryProject = projects.find(
        (item) => normalizeString(item.id) === normalizeString(primaryProjectId)
      )
      if (!primaryProject) {
        if (!primaryProjectId) workspace.clear()
        return
      }
      workspace.select(normalizeString(primaryProject.id))
    },
    { immediate: true }
  )

  watch(
    project,
    (selectedProject: ProjectSurface | null) => {
      if (!selectedProject) return
      workspace.select(normalizeString(selectedProject.id))
    },
    { immediate: true }
  )

  watch(
    [workspace.selectedId, project, collection.outcome],
    (values: [string, unknown, string]) => {
      const [id, activeEntity, outcome] = values
      if (!id || activeEntity || (outcome !== 'ready' && outcome !== 'empty'))
        return
      workspace.clear()
    },
    { immediate: true }
  )

  const outcome = computed(() => {
    if (collection.outcome.value === 'pending') return 'pending' as const
    if (collection.outcome.value === 'error') return 'error' as const
    if (!workspace.selectedId.value) return collection.outcome.value
    return project.value ? ('ready' as const) : ('missing' as const)
  })

  watchEffect(() => {
    workspace.setChoices(
      collection.projects.value.map((item) => ({
        id: normalizeString(item.id),
        name: normalizeString(item.name),
        description: normalizeString(item.description),
        image: normalizeString(item.image_url),
      }))
    )
  })

  async function select(id: string) {
    const requestedId = normalizeString(id)
    if (!requestedId) {
      workspace.clear()
      return
    }
    const user = currentUser.value
    if (!user) throw new Error('Sign in to select a Project.')
    const response = await $fetch<{ updated?: true }>(
      '/api/internal/control/projects/primary',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${await user.getIdToken()}` },
        body: { projectId: requestedId },
      }
    )
    if (!response.updated) {
      toast.add({
        title: 'Primary Project change requested',
        description: 'An App administrator has been notified.',
      })
    }
  }

  return {
    data: project,
    choices: workspace.choices,
    selectedId: workspace.selectedId,
    select,
    outcome,
    create: creation.createProject,
    update: mutation.updateProject,
    delete: removal.deleteProject,
  }
}
