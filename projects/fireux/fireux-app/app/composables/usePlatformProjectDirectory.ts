import type { ProjectSurface } from 'fireux-core/runtime/composables/fireux/project/useProjectInterface'

type PublicProjectDirectoryResponse = {
  ok: true
  projects: ProjectSurface[]
}

export function usePlatformProjectDirectory() {
  const request = useFetch<PublicProjectDirectoryResponse>(
    '/api/public/projects',
    {
      key: 'platform-project-directory',
      default: () => ({ ok: true, projects: [] }),
    }
  )
  const projects = computed(() => request.data.value?.projects ?? [])

  return {
    projects,
    count: computed(() => projects.value.length),
    pending: request.pending,
    error: request.error,
    refresh: request.refresh,
  }
}
