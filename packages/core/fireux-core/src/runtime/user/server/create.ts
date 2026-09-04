import { serverCreate } from '../../server/utils/firestore-mutations/server-create'
import { FIRESTORE_MUTATION_TARGETS } from '../../utils/firestore-mutations/targets'
import type { User } from '../models/user.model'

export async function createUser(input: User): Promise<void> {
  await serverCreate(FIRESTORE_MUTATION_TARGETS.users, input.id, input)
}
