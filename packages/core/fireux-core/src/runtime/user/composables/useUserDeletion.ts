import { useRequireUser } from '../../composables/fireux/firebase/useRequireUser'
import type { Deletion, DeletionImpact } from '../../models/utils/deletion.model'

async function request<T>(method: 'GET' | 'DELETE', userId: string) {
  const user = await useRequireUser()
  if (user.uid !== userId) throw new Error('Users may delete only their own User record.')
  return await $fetch<T>('/api/internal/user/deletion', {
    method,
    headers: { authorization: `Bearer ${await user.getIdToken()}` },
  })
}

/** Self deletion, blocked by App relationships and leaving Firebase Auth intact. */
export function useUserDeletion(userId: () => string): Deletion {
  const impact = () => request<DeletionImpact>('GET', userId())
  const execute = () => request<void>('DELETE', userId())
  return { impact, execute }
}
