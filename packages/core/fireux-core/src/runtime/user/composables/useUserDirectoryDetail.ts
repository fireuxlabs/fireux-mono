import { useAsyncData } from 'nuxt/app'
import { resolveHttpDocumentOutcome } from '../../utils/http-document-outcome'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import { normalizeUserHandle } from '../utils/user-handle'
import type { DetailResponse } from '../../models/utils/directory'
import type { User } from '../models/user.model'

/** Public directory detail follows the server's App eligibility and projection. */
export function useUserDirectoryDetail(handle: MaybeRefOrGetter<string>) {
  const config = useFireUXConfig()
  const normalized = computed(() =>
    normalizeUserHandle(
      String(toValue(handle) || '')
        .trim()
        .replace(/^@/, '')
    )
  )
  const key = computed(() =>
    JSON.stringify([
      'user-directory-detail',
      config.appId,
      config.role,
      normalized.value,
    ])
  )
  const state = useAsyncData<{ key: string; user: User } | null>(
    key,
    async (_nuxtApp, { signal }) => {
      const fetchRead = $fetch.create({ signal, cache: 'no-store' })

      if (!normalized.value) return null
      const requestKey = key.value
      const response = await fetchRead<DetailResponse<User>>(
        `/api/users/${encodeURIComponent(normalized.value)}`
      )
      return { key: requestKey, user: response.item }
    },
    { watch: [normalized] }
  )
  const outcome = computed(() => {
    if (!normalized.value) return 'idle'
    if (state.data.value && state.data.value.key !== key.value) return 'pending'
    return resolveHttpDocumentOutcome({
      enabled: Boolean(normalized.value),
      pending: state.pending.value,
      error: state.error.value,
      present: state.data.value?.user.handle === normalized.value,
    })
  })
  return {
    user: computed(() =>
      outcome.value === 'ready' ? (state.data.value?.user ?? null) : null
    ),
    outcome,
    pending: computed(() => outcome.value === 'pending'),
    error: state.error,
    refresh: state.refresh,
    ready: state.then(() => undefined),
  }
}
