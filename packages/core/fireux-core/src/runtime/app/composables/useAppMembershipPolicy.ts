import { computed, unref, type MaybeRef } from 'vue'
import { useFirestoreRead } from '../../composables/fireux/firestore/operations/useFirestoreRead'

/** Membership policy is independent of App presentation metadata. */
export function useAppMembershipPolicy(
  appId: MaybeRef<string | null | undefined>
) {
  const id = computed(() => String(unref(appId) ?? '').trim())
  const { firestoreFetchDoc } = useFirestoreRead()
  const source = firestoreFetchDoc<{ self_join_enabled?: unknown }>('apps', id)
  const canSelfJoin = computed(
    () =>
      source.outcome.value === 'ready' &&
      source.value?.self_join_enabled === true
  )
  const pending = computed(
    () =>
      Boolean(id.value) && ['idle', 'pending'].includes(source.outcome.value)
  )

  return { canSelfJoin, pending, error: source.error }
}
