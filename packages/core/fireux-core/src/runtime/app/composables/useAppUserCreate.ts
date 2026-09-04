import { useFireUXConfig } from './config/FireUXConfig'
import { useRequireUser } from '../../composables/fireux/firebase/useRequireUser'
import { mutateAppMembership } from '../../user/composables/firestore/utils/appMembershipMutation'

/** Create the signed-in User's AppUser through the trusted relationship workflow. */
export function useAppUserCreate() {
  async function createAppUser(appId: string, userId: string) {
    const app = String(appId || '').trim()
    const user = String(userId || '').trim()
    if (!app || !user) throw new Error('App id and User id are required.')
    if (app !== useFireUXConfig().appId) throw new Error('AppUser must be created in its owning App runtime.')
    if ((await useRequireUser()).uid !== user) throw new Error('Direct AppUser creation is limited to the signed-in User.')
    return await mutateAppMembership({ action: 'ensure-self' })
  }
  return { createAppUser }
}
