import { refreshNuxtData } from 'nuxt/app'
import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { useRoute } from '#imports'
import { useAuth } from '../fireux/firebase/useAuth'
import { useAppSession } from '../../app/composables/useAppSession'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import { useCommandScope } from '../fireux/commands/useCommandScope'

/** Scoped text editing transport; each endpoint owns authorization and storage. */
export function useRecordContext(
  endpoint: MaybeRefOrGetter<string>,
  scope: MaybeRefOrGetter<Record<string, string> | null>
) {
  const { currentUser } = useAuth()
  const session = useAppSession()
  const config = useFireUXConfig()
  const route = useRoute()
  const context = ref('')
  const savedContext = ref('')
  const pending = ref(false)
  const saving = ref(false)
  const ready = ref(false)
  const error = ref('')
  const revisionKey = computed(() =>
    JSON.stringify([
      config.appId,
      currentUser.value?.uid,
      session.appUser.value?.created,
      route.path,
      toValue(endpoint),
      toValue(scope),
    ])
  )
  const capture = useCommandScope([revisionKey])
  const message = (failure: unknown) => {
    const value = failure as {
      data?: { statusMessage?: string }
      message?: string
    }
    return (
      value?.data?.statusMessage ||
      value?.message ||
      'Context could not be updated.'
    )
  }
  async function request(
    method: 'GET' | 'PATCH',
    content?: string,
    previous?: string
  ) {
    const selected = toValue(scope)
    const user = currentUser.value
    if (!selected || !user) return
    const body = JSON.parse(JSON.stringify(selected)) as Record<string, string>
    const isCurrent = capture()
    const token = await user.getIdToken()
    if (!isCurrent()) return
    const result = await $fetch<{ context: string }>(toValue(endpoint), {
      onResponse: async ({ options, response }) => {
        if (
          response.ok &&
          !['GET', 'HEAD'].includes(
            String(options.method || 'GET').toUpperCase()
          )
        )
          await refreshNuxtData()
      },
      method,
      headers: { Authorization: `Bearer ${token}` },
      ...(method === 'GET'
        ? { query: body }
        : { body: { ...body, context: content, previous } }),
    })
    return isCurrent() ? result.context : undefined
  }
  async function load() {
    const isCurrent = capture()
    pending.value = true
    error.value = ''
    try {
      const saved = await request('GET')
      if (isCurrent() && typeof saved === 'string') {
        context.value = saved
        savedContext.value = saved
        ready.value = true
      }
    } catch (failure) {
      if (isCurrent()) error.value = message(failure)
    } finally {
      if (isCurrent()) pending.value = false
    }
  }
  async function update(next: string) {
    if (!ready.value || saving.value || pending.value) return
    const isCurrent = capture()
    saving.value = true
    error.value = ''
    // Retain the edit if a request fails. Never replace it with an empty record.
    context.value = next
    try {
      const saved = await request('PATCH', next, savedContext.value)
      if (isCurrent() && typeof saved === 'string') {
        context.value = saved
        savedContext.value = saved
      }
    } catch (failure) {
      if (isCurrent()) error.value = message(failure)
    } finally {
      if (isCurrent()) saving.value = false
    }
  }
  watch(
    revisionKey,
    () => {
      context.value = ''
      savedContext.value = ''
      ready.value = false
      saving.value = false
      pending.value = false
      error.value = ''
      if (toValue(scope) && currentUser.value) void load()
    },
    { immediate: true, flush: 'sync' }
  )
  return {
    context,
    pending,
    saving,
    ready,
    error,
    load,
    update,
    scopeKey: revisionKey,
  }
}
