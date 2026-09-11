import { useLiveAsyncData } from '../../../../composables/fireux/firestore/useLiveAsyncData'
import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'
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
} {
  const { currentUser, hasAuthState } = useAuth()
  const state = useLiveAsyncData<ProjectChoicesResponse>(
    computed(
      () =>
        `project-choices:${currentUser.value?.uid || ''}:${toValue(enabled)}`
    ),
    async (liveFetch) => {
      const user = currentUser.value
      if (!toValue(enabled) || !hasAuthState.value || !user)
        return { items: [] }
      return liveFetch<ProjectChoicesResponse>(
        '/api/internal/control/projects',
        {
          headers: { Authorization: `Bearer ${await user.getIdToken()}` },
        }
      )
    },
    { server: false, watch: [hasAuthState] }
  )
  const projects = computed(() => {
    const allowed = new Set(toValue(projectIds))
    return (state.data.value?.items || []).filter((project) =>
      allowed.has(project.id)
    )
  })
  return { projects }
}
