import { serverDelete } from '../../../server/utils/firestore-mutations/server-delete'
import { serverAppUsersTarget } from '../../../utils/firestore-mutations/targets'

export async function deleteAppUser(appId: string, userId: string): Promise<void> {
  await serverDelete(serverAppUsersTarget(appId), userId)
}
