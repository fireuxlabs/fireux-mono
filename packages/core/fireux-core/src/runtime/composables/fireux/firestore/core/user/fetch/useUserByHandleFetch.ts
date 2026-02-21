import { computed, isRef, watch } from 'vue'
import type { Ref } from 'vue'
import { useNuxtApp } from '#imports'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'
import { normalizeUserHandle } from '../utils/identity/useUserHandleIdentity'
import { useUserFetch } from './useUserFetch'

type HandleRecord = {
  uid?: string
}

export function useUserByHandleFetch(
  handle: string | null | undefined | Ref<string | null | undefined>
) {
  const { firestoreFetchDoc } = useFirestoreRead()
  const nuxtApp = useNuxtApp()
  const rawHandle = computed(() => (isRef(handle) ? handle.value : handle))
  const normalizedHandle = computed(() => normalizeUserHandle(rawHandle.value ?? ''))
  const recordCache = new Map<string, Ref<HandleRecord | undefined>>()

  const ensureRecord = (value: string) => {
    if (!recordCache.has(value)) {
      const ref = nuxtApp.runWithContext(() =>
        firestoreFetchDoc<HandleRecord>('handles', value)
      ) as Ref<HandleRecord | undefined>
      recordCache.set(value, ref)
    }
    return recordCache.get(value)
  }

  watch(
    normalizedHandle,
    (value) => {
      if (!value) return
      ensureRecord(value)
    },
    { immediate: true }
  )

  const handleRecord = computed(() => {
    const value = normalizedHandle.value
    if (!value) return undefined
    return ensureRecord(value)?.value
  })

  const uid = computed(() => {
    const value = String(handleRecord.value?.uid || '').trim()
    return value || null
  })

  const refs = useUserFetch(uid)
  const missing = computed(() => !uid.value || !refs.user.value)

  return {
    ...refs,
    uid,
    handle: normalizedHandle,
    missing,
  }
}
