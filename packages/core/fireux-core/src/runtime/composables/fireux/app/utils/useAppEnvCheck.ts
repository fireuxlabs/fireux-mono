import { useFetch } from '#imports'
interface EnvCheckResponse {
  ok: boolean
  message?: string
}

export function useAppEnvCheck() {
  return useFetch<EnvCheckResponse>('/api/internal/app/env-check', {
    method: 'GET',
  })
}
