import { serverDelete } from '../../server/utils/firestore-mutations/server-delete'
import { FIRESTORE_MUTATION_TARGETS } from '../../utils/firestore-mutations/targets'

export async function deleteUser(id: string): Promise<void> {
  await serverDelete(FIRESTORE_MUTATION_TARGETS.users, id)
}
