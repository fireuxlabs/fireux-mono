import { computed } from 'vue'
import { useGlobalUserCollection } from '../../../fireux/firestore/core/user/fetch/useGlobalUserCollection'
import { useDevCollectionShapeHealth } from './useDevCollectionShapeHealth'
import { USER_MODEL_KEYS, USER_MODEL_REQUIRED_KEYS } from '../../../../models/core/user.model'

export function useDevUsersCollectionShapeHealth() {
  const { users } = useGlobalUserCollection()

  const items = computed(() => users.value ?? [])

  return useDevCollectionShapeHealth({
    id: 'users-collection-shape',
    label: 'Users · Collection shape',
    description:
      'Flags missing required fields and unexpected legacy keys on /users documents.',
    scope: 'users',
    items,
    requiredKeys: USER_MODEL_REQUIRED_KEYS as unknown as string[],
    allowedKeys: USER_MODEL_KEYS as unknown as string[],
    getId: (user: any) => user?.id ?? '(missing id)',
  })
}
