import { serverCreate } from '../../server/utils/firestore-mutations/server-create'
import { FIRESTORE_MUTATION_TARGETS } from '../../utils/firestore-mutations/targets'
import type { Ecosystem } from '../models/ecosystem.model'

export async function createEcosystem(input: Ecosystem): Promise<void> {
  await serverCreate(FIRESTORE_MUTATION_TARGETS.ecosystems, input.id, input)
}
