import { getRuntimeIdentityFirestore } from '../../server/utils/getRuntimeFirestore'
import type { Ecosystem } from '../models/ecosystem.model'

export async function readEcosystem(id: string): Promise<Ecosystem | null> {
  const snapshot = await getRuntimeIdentityFirestore().collection('ecosystems').doc(id).get()
  return snapshot.exists ? ({ ...snapshot.data(), id: snapshot.id } as Ecosystem) : null
}
