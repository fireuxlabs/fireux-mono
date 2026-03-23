import { useFetch } from '#imports'
import type { EnvCheckResponse } from './env-check.types'

export function useAppEnvCheck() {
  return useFetch<EnvCheckResponse>('/api/internal/app/env-check', {
    method: 'GET',
  })
}
