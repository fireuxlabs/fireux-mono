import { useFetch } from '#imports'
import { useFireUXConfig } from '../FireUXConfig'

interface EnvCheckResponse {
  ok: boolean
  message?: string
}

export async function useAppEnvCheck() {
  const { appId } = useFireUXConfig()
  return useFetch<EnvCheckResponse>(`/api/${appId}/env-check`, {
    method: 'GET',
  })
}
