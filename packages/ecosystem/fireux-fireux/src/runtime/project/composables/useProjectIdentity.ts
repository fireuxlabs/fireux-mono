import { useProjectUpdate } from './useProjectUpdate'
import { projectIdentityMedia } from '../utils/project-identity-media'
import { useIdentity } from 'fireux-core/runtime/composables/fireux/useIdentity'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { ProjectPublishedIdentity } from '../models/published-identity'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useProjectAccess } from './useProjectAccess'
import { useProjectWorkspace } from './workspace/useProjectWorkspace'

export function useProjectIdentity(
  options: {
    publication?: MaybeRefOrGetter<ProjectPublishedIdentity | null | undefined>
  } = {}
) {
  const workspace = useProjectWorkspace()
  const { updateProject } = useProjectUpdate()
  const access = useProjectAccess()
  const publication = computed(() => {
    const source = toValue(options.publication)
    return source?.projectId === workspace.id.value ? source : null
  })

  const name = computed(() =>
    normalizeString(workspace.data.value?.identity.name)
  )
  const description = computed(() =>
    publication.value
      ? publication.value.status === 'ready'
        ? publication.value.description
        : ''
      : normalizeString(workspace.data.value?.identity.description)
  )
  const media = computed(() =>
    projectIdentityMedia(workspace.data.value, publication.value)
  )
  const imageUrl = computed(() => media.value.imageUrl)
  const imageFit = computed(() => media.value.imageFit)
  const publicationReady = computed(
    () => !publication.value || publication.value.status === 'ready'
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
  const { canWrite, availableActions, scopeKey, readState } = useIdentity({
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
    if (
      publication.value &&
      (description !== publication.value.description ||
        image_url !== publication.value.imageUrl)
    )
      throw new Error('Description and image are managed by the connected App.')
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
      changes: publication.value ? { name } : { name, description, image_url },
    })
  }
  const intro = computed(() => ({
    title: 'Project Identity',
    purpose: 'Read and edit the identity of the selected workspace.',
    data: publication.value
      ? 'The Project name and the connected App’s published description and image.'
      : 'The selected Project’s name, description and image URL.',
    boundaries: publication.value
      ? 'Only the Project name is editable here. Description and image belong to the connected App and are not copied into the Project.'
      : 'Identity editing changes only these three Project fields. User accounts, App branding and Team access remain with their own controls.',
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
        description: publication.value
          ? 'Review the workspace name and save. Description and image are published by the connected App.'
          : 'Review the name, description and HTTPS image URL, then save. Clear the image URL to remove it.',
        available: canWrite.value,
      },
    ],
  }))
  return {
    availableActions,
    readState,
    scopeKey,
    canWrite,
    publication,
    update,
    intro,
    selectedProject: workspace.data,
    projectId: workspace.id,
    outcome: workspace.outcome,
    name,
    description,
    imageUrl,
    imageFit,
    publicationReady,
  }
}

export type ProjectIdentityState = ReturnType<typeof useProjectIdentity>
