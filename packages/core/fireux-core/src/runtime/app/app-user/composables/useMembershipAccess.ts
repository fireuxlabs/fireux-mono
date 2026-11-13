import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useFirestoreRead } from '../../../composables/fireux/firestore/operations/useFirestoreRead'
import { readMembershipAccessIds } from '../utils/membership-access'
import { resolveAppUserAccess } from '../utils/access'
import type { AppUser } from '../models/model'

/** The domain supplies its path; Core validates membership and its grant lifetime. */
export function useMembershipAccess(
  collectionPath: MaybeRefOrGetter<string>,
  userId: MaybeRefOrGetter<string | null | undefined>,
  membership: MaybeRefOrGetter<AppUser | null | undefined>,
  selectAccess: (value: unknown) => unknown = (value) => value
) {
  const path = computed(() => toValue(collectionPath))
  const id = computed(() =>
    resolveAppUserAccess(toValue(membership)).hasMembership
      ? toValue(userId)
      : null
  )
  const { firestoreFetchDoc } = useFirestoreRead()
  const source = firestoreFetchDoc<Record<string, unknown>>(path, id)
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
        ids: readMembershipAccessIds(
          selectAccess(source.value),
          toValue(membership)
        ),
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
