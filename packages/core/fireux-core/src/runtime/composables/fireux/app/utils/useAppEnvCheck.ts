import { useFetch } from '#imports'
interface EnvCheckResponse {
  ok: boolean
  message?: string
}

export async function useAppEnvCheck() {
  return useFetch<EnvCheckResponse>('/api/app/env-check', {
    method: 'GET',
  })
}
