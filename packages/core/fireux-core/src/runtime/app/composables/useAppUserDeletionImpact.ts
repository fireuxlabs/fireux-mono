import { useRequireUser } from '../../composables/fireux/firebase/useRequireUser'
import type { AppUserDeletionImpact } from '../models/app-user-deletion'

export function useAppUserDeletionImpact() {
  async function deletionImpact(userId: string) {
    const user = await useRequireUser()
    const token = await user.getIdToken()
    return await $fetch<AppUserDeletionImpact>(
      `/api/internal/app/membership-impact/${encodeURIComponent(userId)}`,
      { headers: { authorization: `Bearer ${token}` } }
    )
  }
  return { deletionImpact }
}
