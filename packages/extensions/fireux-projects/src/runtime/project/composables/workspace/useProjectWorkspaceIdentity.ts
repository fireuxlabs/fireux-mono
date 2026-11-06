import { useProjectUpdate } from '../useProjectUpdate'
import { useWorkspaceIdentity } from 'fireux-core/runtime/workspace/composables/useWorkspaceIdentity'
import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/normalize-string'
import { useProjectAccess } from '../useProjectAccess'
import { useProjectWorkspace } from './useProjectWorkspace'

export function useProjectWorkspaceIdentity() {
  const workspace = useProjectWorkspace()
  const { updateProject } = useProjectUpdate([workspace.id])
  const access = useProjectAccess()
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
  }))
  const { canWrite, availableActions, scopeKey, readState } =
    useWorkspaceIdentity({
      id: workspace.id,
      fields,
      status: workspace.outcome,
      canWrite: authorized,
    })
  async function update(input: {
    projectId: string
    name: string
    description: string
    imageUrl: string
  }) {
    if (!canWrite.value)
      throw new Error('Project management access is required to edit Identity.')
    if (input.projectId !== workspace.id.value)
      throw new Error(
        'The selected Project changed. Reopen the editor for the current Project.'
      )
    const name = input.name.trim().replace(/\s+/g, ' ')
    const description = input.description.trim()
    const image_url = input.imageUrl.trim()
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
    await updateProject({
      projectId: input.projectId,
      changes: { name, description, image_url },
    })
  }
  const intro = computed(() => ({
    title: 'Project Identity',
    purpose: 'Read and edit the identity of the selected workspace.',
    data: 'The selected Project’s name, description and image URL.',
    boundaries: 'Saving updates these three fields on the selected Project.',
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
        description: 'Review the name, description and HTTPS image URL, then save. Clear the image URL to remove it.',
        available: canWrite.value,
      },
    ],
  }))
  return {
    availableActions,
    readState,
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
  }
}

export type ProjectWorkspaceIdentityState = ReturnType<
  typeof useProjectWorkspaceIdentity
>
