import { getRuntimeIdentityFirestore } from '../../server/utils/getRuntimeFirestore'
import type { User } from '../models/user.model'

export async function readUser(id: string): Promise<User | null> {
  const snapshot = await getRuntimeIdentityFirestore().collection('users').doc(id).get()
  return snapshot.exists ? ({ id: snapshot.id, ...snapshot.data() } as User) : null
}
