import { useFireUXConfig } from './config/FireUXConfig'
import { mutateAppMembership } from '../../user/composables/firestore/utils/appMembershipMutation'

/** Safely remove an AppUser while protecting the final administrator. */
export function useAppUserDelete() {
  async function deleteAppUser(appId: string, userId: string) {
    const app = String(appId || '').trim()
    const user = String(userId || '').trim()
    if (!app || !user) throw new Error('App id and User id are required.')
    if (app !== useFireUXConfig().appId) {
      throw new Error('Safe AppUser deletion is available only in its owning App runtime.')
    }
    return await mutateAppMembership({ action: 'remove-member', userId: user })
  }
  return { deleteAppUser }
}
