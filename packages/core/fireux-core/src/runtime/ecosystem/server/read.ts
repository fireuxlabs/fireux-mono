import { getRuntimeIdentityFirestore } from '../../server/utils/getRuntimeFirestore'
import type { Ecosystem } from '../models/ecosystem.model'

export async function readEcosystem(id: string): Promise<Ecosystem | null> {
  const snapshot = await getRuntimeIdentityFirestore().collection('ecosystems').doc(id).get()
  if (!snapshot.exists) return null
  const { context: _context, ...publicSource } = snapshot.data() || {}
  return { ...publicSource, id: snapshot.id } as Ecosystem
}
