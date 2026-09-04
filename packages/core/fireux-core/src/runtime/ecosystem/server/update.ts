import { serverUpdate } from '../../server/utils/firestore-mutations/server-update'
import { FIRESTORE_MUTATION_TARGETS } from '../../utils/firestore-mutations/targets'
import type { Ecosystem } from '../models/ecosystem.model'

export async function updateEcosystem(id: string, changes: Partial<Omit<Ecosystem, 'id'>>): Promise<void> {
  await serverUpdate(FIRESTORE_MUTATION_TARGETS.ecosystems, id, changes)
}
