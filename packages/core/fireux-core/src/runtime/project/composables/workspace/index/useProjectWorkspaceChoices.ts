import {
  computed,
  ref,
  toValue,
  watch,
  type ComputedRef,
  type MaybeRefOrGetter,
} from 'vue'
import { useAuth } from '../../../../composables/fireux/firebase/useAuth'
import type { Project } from '../../../models/project.model'

type ProjectChoicesResponse = {
  items: Project[]
}

export function useProjectWorkspaceChoices(
  enabled: MaybeRefOrGetter<boolean>,
  projectIds: MaybeRefOrGetter<readonly string[]>
): {
  projects: ComputedRef<Project[]>
  refresh: () => Promise<void>
} {
  const { currentUser, hasAuthState } = useAuth()
  const projects = ref<Project[]>([])
  let requestSequence = 0

  const load = async () => {
    const user = currentUser.value
    if (
      !import.meta.client ||
      !toValue(enabled) ||
      !hasAuthState.value ||
      !user
    ) {
      projects.value = []
      return
    }
    const sequence = ++requestSequence
    const response = await $fetch<ProjectChoicesResponse>(
      '/api/internal/control/projects',
      { headers: { Authorization: `Bearer ${await user.getIdToken()}` } }
    )
    if (sequence === requestSequence) {
      const allowedIds = new Set(toValue(projectIds))
      projects.value = [
        ...new Map(
          response.items
            .filter((item) => allowedIds.has(item.id))
            .map((item) => [item.id, item])
        ).values(),
      ]
    }
  }

  watch(
    [
      currentUser,
      hasAuthState,
      () => toValue(enabled),
      () => toValue(projectIds).join('\u0000'),
    ],
    () => void load(),
    { immediate: true }
  )

  return { projects: computed(() => projects.value), refresh: load }
}
