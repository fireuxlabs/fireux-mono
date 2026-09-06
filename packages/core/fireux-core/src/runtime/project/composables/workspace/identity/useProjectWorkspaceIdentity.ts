import { computed, watchEffect } from 'vue'
import { useWorkspacePageState } from '../../../../composables/fireux/workspace/useWorkspacePageState'
import { normalizeString } from '../../../../utils/string'
import { useProjectTeamData } from '../team/useProjectTeamData'
import { useProjectWorkspace } from '../core/useProjectWorkspace'

export function useProjectWorkspaceIdentity() {
  const workspace = useProjectWorkspace()
  const access = useProjectTeamData()

  const name = computed(() => normalizeString(workspace.data.value?.name))
  const description = computed(() =>
    normalizeString(workspace.data.value?.description)
  )
  const imageUrl = computed(() =>
    normalizeString(workspace.data.value?.image_url)
  )

  const canWrite = computed(
    () =>
      access.canWrite.value &&
      workspace.outcome.value === 'ready' &&
      workspace.data.value?.id === workspace.id.value
  )
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
    await workspace.crud.update({ name, description, image_url })
  }
  const intro = computed(() => ({
    title: 'Project Identity',
    purpose: 'Read and edit the identity of the selected workspace.',
    data: 'The selected Project’s name, description and image URL.',
    boundaries:
      'Identity editing changes only these three Project fields. User accounts, App branding and Team access remain with their own controls.',
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
          'Review the name, description and HTTPS image URL, then save. Clear the image URL to remove it.',
        available: canWrite.value,
      },
    ],
  }))
  const pageState = useWorkspacePageState('project')
  watchEffect(() =>
    pageState.publish({
      identity: {
        id: workspace.id.value,
        name: name.value,
        description: description.value,
        imageUrl: imageUrl.value,
      },
      derived: { status: workspace.outcome.value, canUpdate: canWrite.value },
    })
  )
  return {
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
