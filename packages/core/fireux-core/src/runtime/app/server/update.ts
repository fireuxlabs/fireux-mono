import { serverUpdate } from '../../server/utils/firestore-mutations/server-update'
import { FIRESTORE_MUTATION_TARGETS } from '../../utils/firestore-mutations/targets'
import type { AppUpdateInput } from '../composables/useAppUpdate'

export async function updateApp(id: string, changes: AppUpdateInput): Promise<void> {
  if (Object.hasOwn(changes, 'ecosystem_id')) {
    throw new Error('App–Ecosystem relationships require a separate relationship write.')
  }
  await serverUpdate(FIRESTORE_MUTATION_TARGETS.runtimeApps, id, changes)
}
