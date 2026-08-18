import {
  collection,
  limit as fslimit,
  query as fsq,
  where,
  type Query,
} from 'firebase/firestore'
import { computed, isRef, watch } from 'vue'
import type { Ref } from 'vue'
import { useNuxtApp } from '#imports'
import {
  readRuntimeIdentityFirestoreDatabaseId,
  useFirestore,
} from '../../../../composables/fireux/firestore/vuefire'
import { UserStorage } from '../../../models/user.model.ts'
import { useFirestoreRead } from '../../../../composables/fireux/firestore/operations/useFirestoreRead'
import { normalizeUserHandle } from '../utils/identity/useUserHandleIdentity'
import { useUserFetch } from './useUserFetch'

type HandleUserMatch = {
  id?: string
  handle?: string
}

export function useUserByHandleFetch(
  handle: string | null | undefined | Ref<string | null | undefined>
) {
  const db = useFirestore(readRuntimeIdentityFirestoreDatabaseId())
  const { firestoreQuery } = useFirestoreRead()
  const nuxtApp = useNuxtApp()
  const rawHandle = computed(() => (isRef(handle) ? handle.value : handle))
  const rawTrimmed = computed(() => String(rawHandle.value ?? '').trim())
  const normalizedHandle = computed(() => {
    const raw = rawTrimmed.value
    const withoutAt = raw.startsWith('@') ? raw.slice(1) : raw
    return normalizeUserHandle(withoutAt)
  })
  const userMatchCache = new Map<string, Ref<HandleUserMatch[] | undefined>>()

  const matchUser = (value: string) => {
    if (!userMatchCache.has(value)) {
      const q = fsq(
        collection(db, UserStorage.collection),
        where('handle', '==', value),
        fslimit(1)
      ) as Query<HandleUserMatch>
      const ref = nuxtApp.runWithContext(() =>
        firestoreQuery<HandleUserMatch>(q, `${UserStorage.collection}-by-handle-${value}`)
      ) as Ref<HandleUserMatch[] | undefined>
      userMatchCache.set(value, ref)
    }
    return userMatchCache.get(value)
  }

  watch(
    normalizedHandle,
    (value) => {
      if (!value) return
      matchUser(value)
    },
    { immediate: true }
  )

  const userMatchRows = computed<HandleUserMatch[] | undefined>(() => {
    const value = normalizedHandle.value
    if (!value) return undefined
    return matchUser(value)?.value
  })

  const matchedUser = computed(() => {
    const value = normalizedHandle.value
    if (!value) return undefined
    const rows = userMatchRows.value
    if (!rows?.length) return undefined
    return (
      rows.find((row) => normalizeUserHandle(String(row?.handle ?? '')) === value) ??
      rows[0]
    )
  })

  const uid = computed(() => {
    const value = String(matchedUser.value?.id || '').trim()
    return value || null
  })

  const refs = useUserFetch(uid)
  const resolving = computed(() => {
    const value = normalizedHandle.value
    if (!value) return false
    if (uid.value) return false
    return userMatchRows.value === undefined
  })

  const missing = computed(
    () => !resolving.value && !refs.pending.value && (!uid.value || !refs.user.value)
  )

  return {
    ...refs,
    uid,
    handle: normalizedHandle,
    resolving,
    missing,
  }
}
