import { serverDelete } from '../../server/utils/firestore-mutations/server-delete'
import { FIRESTORE_MUTATION_TARGETS } from '../../utils/firestore-mutations/targets'

export async function deleteEcosystem(id: string): Promise<void> {
  await serverDelete(FIRESTORE_MUTATION_TARGETS.ecosystems, id)
}
