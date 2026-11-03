import { getRuntimeIdentityFirestore } from '../../server/utils/getRuntimeFirestore'
import type { Ecosystem } from '../models/ecosystem.model'
import { readEcosystemDocument } from './identity/read'

export async function readEcosystem(id: string): Promise<Ecosystem | null> {
  const snapshot = await getRuntimeIdentityFirestore().collection('ecosystems').doc(id).get()
  if (!snapshot.exists) return null
  return readEcosystemDocument(snapshot.id, snapshot.data(), false)
}
