import { useRequireUser } from '../../composables/fireux/firebase/useRequireUser'
import type { Deletion, DeletionImpact } from '../../models/utils/deletion.model'
import { useFireUXConfig } from './config/FireUXConfig'

async function request<T>(method: 'GET' | 'DELETE', appId: string) {
  if (appId !== useFireUXConfig().appId) throw new Error('Only the configured App can be deleted here.')
  const user = await useRequireUser()
  return await $fetch<T>('/api/internal/app/deletion', {
    method,
    headers: { authorization: `Bearer ${await user.getIdToken()}` },
  })
}

/** Developer-authorized App-tree deletion with repeated impact checks. */
export function useAppDeletion(appId: () => string): Deletion {
  const impact = () => request<DeletionImpact>('GET', appId())
  const execute = () => request<void>('DELETE', appId())
  return { impact, execute }
}
