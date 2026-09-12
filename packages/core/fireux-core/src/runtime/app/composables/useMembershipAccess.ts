import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useFirestoreRead } from '../../composables/fireux/firestore/operations/useFirestoreRead'
import {
  readMembershipAccessIds,
  type MembershipAccess,
} from '../utils/membership-access'
import type { AppUser } from '../models/app-user.model'

/** The domain supplies its path; Core owns the live read and membership-lifetime check. */
export function useMembershipAccess(
  collectionPath: MaybeRefOrGetter<string>,
  userId: MaybeRefOrGetter<string | null | undefined>,
  membership: MaybeRefOrGetter<AppUser | null | undefined>
) {
  const path = computed(() => toValue(collectionPath))
  const id = computed(() => (toValue(membership) ? toValue(userId) : null))
  const { firestoreFetchDoc } = useFirestoreRead()
  const source = firestoreFetchDoc<MembershipAccess>(path, id)
  const parsed = computed(() => {
    if (
      !id.value ||
      source.outcome.value === 'idle' ||
      source.pending.value ||
      source.error.value
    )
      return { ids: [] as string[], error: undefined }
    try {
      return {
        ids: readMembershipAccessIds(source.value, toValue(membership)),
        error: undefined,
      }
    } catch (error) {
      return { ids: [] as string[], error: error as Error }
    }
  })
  const error = computed(() =>
    id.value ? source.error.value || parsed.value.error : undefined
  )
  const outcome = computed(() => {
    if (!id.value) return 'idle' as const
    if (error.value) return 'error' as const
    if (source.outcome.value === 'idle' || source.pending.value)
      return 'pending' as const
    return parsed.value.ids.length ? ('ready' as const) : ('empty' as const)
  })
  return {
    ids: computed(() => parsed.value.ids),
    pending: computed(() => outcome.value === 'pending'),
    error,
    outcome,
  }
}
