import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { useRoute } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'

type ContextScope = {
  kitchenId: string
  subject: 'kitchen' | 'venue' | 'menu'
  menuId?: string
}

export function useKitchenRecordContext(
  scope: MaybeRefOrGetter<ContextScope | null>
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
    if (!selected || !user || !session.appUser.value) return
    const body = JSON.parse(JSON.stringify(selected)) as ContextScope
    const isCurrent = capture()
    const token = await user.getIdToken()
    if (!isCurrent()) return
    const result = await $fetch<{ context: string }>(
      '/api/workspace/kitchen/context',
      {
        method,
        headers: { Authorization: `Bearer ${token}` },
        ...(method === 'GET'
          ? { query: body }
          : { body: { ...body, context: content, previous } }),
      }
    )
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
      if (toValue(scope) && currentUser.value && session.appUser.value)
        void load()
    },
    { immediate: true, flush: 'sync' }
  )
  return { context, pending, saving, ready, error, load, update }
}
