import { computed, type Ref } from 'vue'
import type { Project } from '../../../../../../../models/system/project.model'

export function useProjectComputed(
  project?: Ref<Partial<Project> | null | undefined>
) {
  const hasProject = computed(() => Boolean(project?.value?.id))
  const hasMissingName = computed(() =>
    !String(project?.value?.name || '').trim()
  )
  const isDraft = computed(() => project?.value?.status === 'draft')
  const isActive = computed(() => project?.value?.status === 'active')
  const isPaused = computed(() => project?.value?.status === 'paused')
  const isArchived = computed(() => project?.value?.status === 'archived')
  const displayStatus = computed(() => {
    if (isDraft.value) return 'Draft'
    if (isActive.value) return 'Active'
    if (isPaused.value) return 'Paused'
    if (isArchived.value) return 'Archived'
    return 'Unknown'
  })
  const displayName = computed(() =>
    String(
      project?.value?.name ||
        project?.value?.id ||
        ''
    ).trim()
  )
  const displayImageUrl = computed(() =>
    String(project?.value?.image_url || '').trim()
  )
  return {
    hasProject,
    hasMissingName,
    isDraft,
    isActive,
    isPaused,
    isArchived,
    displayStatus,
    displayName,
    displayImageUrl,
  }
}
