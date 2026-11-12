import { useProjectUpdate } from '../useProjectUpdate'
import { useWorkspaceIdentity } from 'fireux-core/runtime/workspace/composables/useWorkspaceIdentity'
import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/normalize-string'
import type { ProjectStatus } from '../../models/project.model'
import { useProjectWorkspace } from './useProjectWorkspace'

export function useProjectWorkspaceIdentity() {
  const workspace = useProjectWorkspace()
  const { updateProject } = useProjectUpdate([workspace.id])
  const access = workspace.access
  const projectStatus = computed(() => workspace.data.value?.identity.status)
  const name = computed(() =>
    normalizeString(workspace.data.value?.identity.name)
  )
  const description = computed(() =>
    normalizeString(workspace.data.value?.identity.description)
  )
  const imageUrl = computed(
    () => workspace.data.value?.identity.image_url || ''
  )

  const authorized = computed(
    () =>
      access.ids.value.includes(workspace.id.value) &&
      workspace.outcome.value === 'ready' &&
      workspace.data.value?.id === workspace.id.value
  )
  const fields = computed(() => ({
    name: name.value,
    description: description.value,
    imageUrl: imageUrl.value,
    status: projectStatus.value,
  }))
  const { canWrite, availableActions, scopeKey } = useWorkspaceIdentity({
    id: workspace.id,
    fields,
    status: workspace.outcome,
    canWrite: authorized,
  })
  async function update(
    input: {
      projectId: string
      name: string
      description: string
      imageUrl: string
      status: ProjectStatus
    },
    isSurfaceCurrent: () => boolean = () => true
  ) {
    if (!canWrite.value)
      throw new Error('Project management access is required to edit Identity.')
    if (input.projectId !== workspace.id.value)
      throw new Error(
        'The selected Project changed. Reopen the editor for the current Project.'
      )
    const name = input.name.trim().replace(/\s+/g, ' ')
    const description = input.description.trim()
    const image_url = input.imageUrl.trim()
    const status = input.status
    if (status !== 'active' && status !== 'inactive')
      throw new Error('Choose active or inactive.')
    if (!name || name.length > 120)
      throw new Error('Enter a name of 1–120 characters.')
    if (description.length > 2000)
      throw new Error('Description must be 2,000 characters or fewer.')
    if (image_url) {
      let url: URL
      try {
        url = new URL(image_url)
      } catch {
        throw new Error('Enter a complete HTTPS image URL, or leave it empty.')
      }
      if (url.protocol !== 'https:' || url.username || url.password)
        throw new Error('Use an HTTPS image URL without credentials.')
    }
    await updateProject(
      {
        projectId: input.projectId,
        changes: { name, description, image_url, status },
      },
      isSurfaceCurrent
    )
  }
  const intro = computed(() => ({
    title: 'Project Identity',
    purpose: 'Read and edit the identity of the selected workspace.',
    data: 'The selected Project’s name, description, image URL and status.',
    boundaries:
      'Saving updates Identity on the selected Project. Active Projects appear in the public directory.',
    ai: 'Use the human editor to review and save changes. AI form preparation is not connected yet.',
    status: workspace.outcome.value,
    recordCount: workspace.data.value ? 1 : 0,
    tools: [
      {
        id: 'read',
        label: 'Read Identity',
        description: 'View the selected Project’s current identity.',
        available: Boolean(workspace.data.value),
      },
      {
        id: 'update',
        label: 'Edit Identity',
        description:
          'Review Identity and choose active or inactive, then save. Clear the image URL to remove it.',
        available: canWrite.value,
      },
    ],
  }))
  return {
    availableActions,
    scopeKey,
    canWrite,
    update,
    intro,
    selectedProject: workspace.data,
    projectId: workspace.id,
    outcome: workspace.outcome,
    name,
    description,
    imageUrl,
    projectStatus,
  }
}

export type ProjectWorkspaceIdentityState = ReturnType<
  typeof useProjectWorkspaceIdentity
>
