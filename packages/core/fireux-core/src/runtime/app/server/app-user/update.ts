import { serverUpdate } from '../../../server/utils/firestore-mutations/server-update'
import { serverAppUsersTarget } from '../../../utils/firestore-mutations/targets'
import type { AppUser } from '../../models/app-user.model'

export async function updateAppUser(appId: string, userId: string, changes: Partial<Omit<AppUser, 'created' | 'updated'>>): Promise<void> {
  await serverUpdate(serverAppUsersTarget(appId), userId, changes)
}
