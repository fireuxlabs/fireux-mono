import { computed } from 'vue'

type DirectoryRow = {
  key?: string
  id?: string
  name?: string
  src?: string
  text?: string
  href?: string
  ecosystem?: string
  role?: string
}

type LandingDirectoryResponse = {
  ecosystems?: DirectoryRow[]
  apps?: DirectoryRow[]
  errors?: Array<{
    ecosystem?: string
    url?: string
    status?: number
    message?: string
  }>
}

export function useLandingDirectory() {
  const { data, pending, error } = useAsyncData<LandingDirectoryResponse>(
    'fireux-landing-directory',
    () => $fetch('/api/internal/landing/directory'),
    {
      server: true,
      lazy: false,
    }
  )

  const displayedApps = computed(() =>
    Array.isArray(data.value?.apps) ? data.value!.apps! : []
  )

  const displayedEcosystems = computed(() =>
    Array.isArray(data.value?.ecosystems) ? data.value!.ecosystems! : []
  )

  const errors = computed(() =>
    Array.isArray(data.value?.errors) ? data.value!.errors! : []
  )

  return {
    appsPending: pending,
    error,
    errors,
    displayedApps,
    displayedEcosystems,
  }
}
