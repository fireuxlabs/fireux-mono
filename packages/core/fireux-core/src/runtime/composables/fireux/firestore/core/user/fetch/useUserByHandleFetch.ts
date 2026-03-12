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
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'
import { normalizeUserHandle } from '../utils/identity/useUserHandleIdentity'
import { useUserFetch } from './useUserFetch'
import { useUser } from '../useUser'

type HandleUserMatch = {
  id?: string
  handle?: string
}

function looksLikeUid(value: string): boolean {
  const v = String(value || '').trim()
  if (!v) return false
  if (v.includes('@') || v.includes('/')) return false
  return /^[a-zA-Z0-9]{20,64}$/.test(v)
}

export function useUserByHandleFetch(
  handle: string | null | undefined | Ref<string | null | undefined>
) {
  const db = useFirestore()
  const { firestoreQuery } = useFirestoreRead()
  const nuxtApp = useNuxtApp()
  const { user: sessionUser } = useUser()
  const rawHandle = computed(() => (isRef(handle) ? handle.value : handle))
  const rawTrimmed = computed(() => String(rawHandle.value ?? '').trim())
  const normalizedHandle = computed(() => {
    const raw = rawTrimmed.value
    const withoutAt = raw.startsWith('@') ? raw.slice(1) : raw
    return normalizeUserHandle(withoutAt)
  })
  const uidDirect = computed(() => {
    const raw = rawTrimmed.value
    if (!raw || raw.startsWith('@')) return null
    return looksLikeUid(raw) ? raw : null
  })
  const userMatchCache = new Map<string, Ref<HandleUserMatch[] | undefined>>()

  const ensureUserMatch = (value: string) => {
    if (!userMatchCache.has(value)) {
      const q = fsq(
        collection(db, 'users'),
        where('handle', '==', value),
        fslimit(1)
      ) as Query<HandleUserMatch>
      const ref = nuxtApp.runWithContext(() =>
        firestoreQuery<HandleUserMatch>(q, `users-by-handle-${value}`)
      ) as Ref<HandleUserMatch[] | undefined>
      userMatchCache.set(value, ref)
    }
    return userMatchCache.get(value)
  }

  watch(
    normalizedHandle,
    (value) => {
      if (!value) return
      if (uidDirect.value) return
      ensureUserMatch(value)
    },
    { immediate: true }
  )

  const userMatchRows = computed<HandleUserMatch[] | undefined>(() => {
    const value = normalizedHandle.value
    if (!value || uidDirect.value) return undefined
    return ensureUserMatch(value)?.value
  })

  const matchedUser = computed(() => {
    const value = normalizedHandle.value
    if (!value || uidDirect.value) return undefined
    const rows = userMatchRows.value
    if (!rows?.length) return undefined
    return (
      rows.find((row) => normalizeUserHandle(String(row?.handle ?? '')) === value) ??
      rows[0]
    )
  })

  const uid = computed(() => {
    if (uidDirect.value) return uidDirect.value
    const value = String(matchedUser.value?.id || '').trim()
    return value || null
  })

  const refs = useUserFetch(uid)
  const shouldSuggestCanonicalUid = computed(() => {
    const raw = uidDirect.value
    const sessionId = String(sessionUser.value?.id ?? '').trim()
    if (!raw || !sessionId) return false
    return raw.toLowerCase() === sessionId.toLowerCase() && raw !== sessionId
  })
  const canonicalUid = computed(() => {
    if (!shouldSuggestCanonicalUid.value) return null
    return String(sessionUser.value?.id ?? '').trim() || null
  })
  const resolving = computed(() => {
    const value = normalizedHandle.value
    if (!value) return false
    if (uidDirect.value) return false
    if (uid.value) return false
    return userMatchRows.value === undefined
  })

  const missing = computed(
    () => !resolving.value && !refs.pending.value && (!uid.value || !refs.user.value)
  )

  return {
    ...refs,
    uid,
    canonicalUid,
    shouldSuggestCanonicalUid,
    handle: computed(() =>
      uidDirect.value ? rawTrimmed.value : normalizedHandle.value
    ),
    resolving,
    missing,
  }
}
