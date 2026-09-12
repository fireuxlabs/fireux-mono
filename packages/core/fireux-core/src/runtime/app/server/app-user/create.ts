import { serverCreate } from '../../../server/utils/firestore-mutations/server-create'
import { serverAppUsersTarget } from '../../../utils/firestore-mutations/targets'
import type { AppUserCreateInput } from '../../composables/useAppUserCreate'

export async function createAppUser(
  appId: string,
  userId: string,
  input: AppUserCreateInput = {}
): Promise<void> {
  await serverCreate(serverAppUsersTarget(appId), userId, {
    role: 'user',
    subscription: 'free',
    ...input,
  })
}
