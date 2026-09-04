import { getRuntimeFirestore } from '../../server/utils/getRuntimeFirestore'
import type { App } from '../models/app.model'

export async function readApp(id: string): Promise<App | null> {
  const snapshot = await getRuntimeFirestore().collection('apps').doc(id).get()
  return snapshot.exists ? ({ id: snapshot.id, ...snapshot.data() } as App) : null
}
