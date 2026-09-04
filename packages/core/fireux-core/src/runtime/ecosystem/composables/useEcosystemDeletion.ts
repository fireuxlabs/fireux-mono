import { useRequireUser } from '../../composables/fireux/firebase/useRequireUser'
import type { Deletion, DeletionImpact } from '../../models/utils/deletion.model'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'

async function request<T>(method: 'GET' | 'DELETE', ecosystemId: string) {
  if (ecosystemId !== String(useFireUXConfig().ecosystemId || '').trim()) {
    throw new Error('Only the configured Ecosystem can be deleted here.')
  }
  const user = await useRequireUser()
  return await $fetch<T>('/api/internal/ecosystem/deletion', {
    method,
    headers: { authorization: `Bearer ${await user.getIdToken()}` },
  })
}

/** Developer-authorized deletion blocked while Apps reference the Ecosystem. */
export function useEcosystemDeletion(ecosystemId: () => string): Deletion {
  const impact = () => request<DeletionImpact>('GET', ecosystemId())
  const execute = () => request<void>('DELETE', ecosystemId())
  return { impact, execute }
}
