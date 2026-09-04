import { serverUpdate } from '../../server/utils/firestore-mutations/server-update'
import { FIRESTORE_MUTATION_TARGETS } from '../../utils/firestore-mutations/targets'
import type { User } from '../models/user.model'

export async function updateUser(id: string, changes: Partial<Omit<User, 'id'>>): Promise<void> {
  await serverUpdate(FIRESTORE_MUTATION_TARGETS.users, id, changes)
}
