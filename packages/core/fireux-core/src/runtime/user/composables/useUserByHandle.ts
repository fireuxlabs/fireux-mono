import {
  collection,
  limit as fslimit,
  query as fsq,
  where,
  type Query,
} from 'firebase/firestore'
import { computed, isRef } from 'vue'
import type { Ref } from 'vue'
import {
  readRuntimeIdentityFirestoreDatabaseId,
  useFirestore,
} from '../../composables/fireux/firestore/vuefire'
import { useFirestoreRead } from '../../composables/fireux/firestore/operations/useFirestoreRead'
import { normalizeUserHandle } from './firestore/utils/identity/useUserHandleIdentity'
import { useUserRead } from './useUserRead'

type HandleUserMatch = {
  id?: string
  handle?: string
}

export function useUserByHandle(
  handle: string | null | undefined | Ref<string | null | undefined>
) {
  const db = useFirestore(readRuntimeIdentityFirestoreDatabaseId())
  const { firestoreQuery } = useFirestoreRead()
  const rawHandle = computed(() => (isRef(handle) ? handle.value : handle))
  const rawTrimmed = computed(() => String(rawHandle.value ?? '').trim())
  const normalizedHandle = computed(() => {
    const raw = rawTrimmed.value
    const withoutAt = raw.startsWith('@') ? raw.slice(1) : raw
    return normalizeUserHandle(withoutAt)
  })
  const query = computed(() =>
    normalizedHandle.value
      ? (fsq(
          collection(db, 'users'),
          where('handle', '==', normalizedHandle.value),
          fslimit(2)
        ) as Query<HandleUserMatch>)
      : null
  )
  const matches = firestoreQuery<HandleUserMatch>(query)
  const userMatchRows = computed(() => matches.value)

  const matchedUser = computed(() => {
    const value = normalizedHandle.value
    if (!value) return undefined
    const rows = userMatchRows.value
    if (matches.pending.value || matches.error.value || rows?.length !== 1)
      return undefined
    return rows.find(
      (row) => normalizeUserHandle(String(row?.handle ?? '')) === value
    )
  })

  const uid = computed(() => {
    const value = String(matchedUser.value?.id || '').trim()
    return value || null
  })

  const refs = useUserRead(uid)
  const resolving = computed(() => {
    const value = normalizedHandle.value
    if (!value) return false
    if (uid.value) return false
    return matches.pending.value && !matches.error.value
  })

  const pending = computed(() => matches.pending.value || refs.pending.value)
  const error = computed(
    () =>
      matches.error.value ||
      ((userMatchRows.value?.length ?? 0) > 1
        ? new Error('User identity is not unique')
        : null) ||
      refs.error.value
  )
  const outcome = computed(() => {
    if (!normalizedHandle.value) return 'idle' as const
    if (error.value) return 'error' as const
    if (pending.value) return 'pending' as const
    return refs.user.value && uid.value
      ? ('ready' as const)
      : ('missing' as const)
  })
  const missing = computed(() => outcome.value === 'missing')

  return {
    ...refs,
    pending,
    error,
    outcome,
    uid,
    handle: normalizedHandle,
    resolving,
    missing,
  }
}
