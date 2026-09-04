import { serverCreate } from '../../server/utils/firestore-mutations/server-create'
import { FIRESTORE_MUTATION_TARGETS } from '../../utils/firestore-mutations/targets'
import type { AppCreateInput } from '../composables/useAppCreate'

export async function createApp(input: AppCreateInput): Promise<void> {
  if (Object.hasOwn(input, 'ecosystem_id')) {
    throw new Error('App–Ecosystem relationships require a separate relationship write.')
  }
  await serverCreate(FIRESTORE_MUTATION_TARGETS.runtimeApps, input.id, input)
}
