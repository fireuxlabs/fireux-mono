import {
  ref,
  computed,
  watch,
  onMounted,
  toValue,
  type MaybeRefOrGetter,
  type UnwrapNestedRefs,
} from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import type { MenuExpressRequest } from '../../shared/types/menu-express'

export function useMenuExpressRequest(
  requestId: MaybeRefOrGetter<string>,
  operator = false
) {
  const { currentUser } = useAuth()
  const request = ref<MenuExpressRequest | null>(null)
  const messages = ref<
    Array<{ id: string; sender_name: string; body: string }>
  >([])
  const token = ref(''),
    busy = ref(false),
    error = ref('')
  const mounted = ref(false)
  onMounted(() => {
    mounted.value = true
  })
  const id = computed(() => toValue(requestId))
  const captureIntent = useCommandScope([id, () => currentUser.value, token])
  const storageKey = () => `misebox:menu-express:${id.value}`
  const reset = () => {
    request.value = null
    messages.value = []
    busy.value = false
    error.value = ''
  }
  watch(token, reset, { flush: 'sync' })
  watch(
    [id, () => currentUser.value, mounted],
    () => {
      if (!mounted.value) return
      reset()
      if (!import.meta.client || !id.value) return
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey()) || 'null')
        token.value =
          saved?.expiresAt > Date.now() ? String(saved.token || '') : ''
        if (!token.value) localStorage.removeItem(storageKey())
      } catch {
        token.value = ''
        localStorage.removeItem(storageKey())
      }
      if (operator || token.value) void run(load)
    },
    { immediate: true, flush: 'sync' }
  )

  async function headers() {
    const user = currentUser.value
    return user && !user.isAnonymous
      ? { authorization: `Bearer ${await user.getIdToken()}` }
      : undefined
  }
  async function call<T>(
    path: string,
    body: Record<string, unknown>,
    responseType?: 'blob'
  ) {
    const isCurrent = captureIntent(),
      input = { ...body }
    const auth = await headers()
    if (!isCurrent())
      throw new Error('This request context changed. Reload before continuing.')
    const result = await $fetch<T>(path, {
      method: 'POST',
      body: input,
      headers: auth,
      ...(responseType ? { responseType } : {}),
    } as any)
    if (!isCurrent())
      throw new Error(
        'This request context changed. Reload to see the committed result.'
      )
    return result
  }
  async function run(
    work: (isCurrent: () => boolean) => Promise<void>
  ): Promise<boolean> {
    if (busy.value) return false
    const isCurrent = captureIntent()
    busy.value = true
    error.value = ''
    try {
      await work(isCurrent)
      return isCurrent()
    } catch (cause: any) {
      if (isCurrent())
        error.value =
          cause?.data?.statusMessage ||
          cause?.message ||
          'The request could not be completed.'
      return false
    } finally {
      if (isCurrent()) busy.value = false
    }
  }
  async function load() {
    const result = await call<{
      request: MenuExpressRequest
      messages: typeof messages.value
    }>(`/api/menu-express/${id.value}`, { token: token.value, operator })
    request.value = result.request
    messages.value = result.messages
  }
  const reload = () => run(load)
  async function refreshAfterSave(isCurrent: () => boolean) {
    if (!isCurrent()) return
    try {
      await load()
    } catch {
      if (isCurrent())
        error.value =
          'Your change was saved, but the latest request could not be loaded. Refresh the request; do not submit it again.'
    }
  }
  const recover = () =>
    run(async (isCurrent) => {
      await load()
      if (isCurrent() && !operator)
        localStorage.setItem(
          storageKey(),
          JSON.stringify({
            token: token.value,
            expiresAt: Date.parse(request.value!.createdAt) + 30 * 86400_000,
          })
        )
    })
  const act = (action: string, details: Record<string, unknown> = {}) =>
    run(async (isCurrent) => {
      await call(`/api/menu-express/${id.value}/action`, {
        ...details,
        action,
        token: token.value,
        operator,
        revision: request.value?.review?.revision,
      })
      await refreshAfterSave(isCurrent)
    })
  const checkout = () =>
    run(async (isCurrent) => {
      const response = await call<{ url: string }>(
        `/api/menu-express/${id.value}/checkout`,
        { token: token.value }
      )
      if (!response.url.startsWith('https://checkout.stripe.com/'))
        throw new Error('Checkout URL is unavailable.')
      if (isCurrent()) window.location.assign(response.url)
    })
  const send = (body: string) =>
    run(async (isCurrent) => {
      await call('/api/chat/message', {
        conversation_id: id.value,
        token: token.value,
        body,
      })
      await refreshAfterSave(isCurrent)
    })
  const upload = (file: File) =>
    run(async (isCurrent) => {
      const body = new FormData()
      body.append('token', token.value)
      body.append('file', file)
      await $fetch(`/api/menu-express/${id.value}/source`, {
        method: 'POST',
        body,
      })
      await refreshAfterSave(isCurrent)
    })
  const download = (sourceId: string, name: string) =>
    run(async (isCurrent) => {
      const blob = await call<Blob>(
        `/api/menu-express/${id.value}/source-read`,
        { token: token.value, operator, sourceId },
        'blob'
      )
      if (!isCurrent()) return
      const url = URL.createObjectURL(blob),
        anchor = document.createElement('a')
      anchor.href = url
      anchor.download = name
      anchor.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    })
  return {
    request,
    messages,
    token,
    busy,
    error,
    reload,
    recover,
    act,
    checkout,
    send,
    upload,
    download,
  }
}

export type MenuExpressRequestView = UnwrapNestedRefs<
  ReturnType<typeof useMenuExpressRequest>
>
