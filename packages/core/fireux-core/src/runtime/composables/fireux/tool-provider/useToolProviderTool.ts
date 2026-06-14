import { computed, ref, unref, watch, type ComputedRef, type Ref } from 'vue'
import { useFireUXConfig } from '../app/FireUXConfig'

type Input<T> = T | Ref<T> | ComputedRef<T>

type ToolProviderResponse = {
  path?: unknown
  toolUrl?: unknown
  message?: unknown
}

export type UseToolProviderToolOptions = {
  providerBaseUrl: Input<string>
  tool: Input<string>
  payload?: Input<Record<string, unknown> | null | undefined>
  title?: Input<string | null | undefined>
  authToken?: Input<string | null | undefined>
  messageSource?: Input<string | null | undefined>
  includeFireUXContext?: Input<boolean | null | undefined>
}

const text = (value: unknown) => String(value ?? '').trim()

const providerUrl = (value: unknown) => text(value).replace(/\/+$/, '')

const toolKey = (value: unknown) =>
  text(value).toLowerCase().replace(/[^a-z0-9-]+/g, '-')

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

export function useToolProviderTool(options: UseToolProviderToolOptions) {
  const fireux = useFireUXConfig()
  const providerBaseUrl = computed(() => providerUrl(unref(options.providerBaseUrl)))
  const tool = computed(() => toolKey(unref(options.tool)))
  const title = computed(() =>
    text(options.title ? unref(options.title) : '') || `Tool: ${tool.value}`
  )
  const authToken = computed(() => text(options.authToken ? unref(options.authToken) : ''))
  const messageSource = computed(() =>
    text(options.messageSource ? unref(options.messageSource) : '')
  )
  const includeFireUXContext = computed(() =>
    options.includeFireUXContext === undefined
      ? true
      : Boolean(unref(options.includeFireUXContext))
  )
  const fireuxContext = computed(() => ({
    appId: fireux.appId,
    appName: fireux.appName,
    appShortName: fireux.appShortName,
    ecosystem: fireux.ecosystem,
    role: fireux.role,
    siteUrl: fireux.siteUrl || '',
  }))
  const payload = computed(() => {
    const source = record(options.payload ? unref(options.payload) : {})
    if (!includeFireUXContext.value) return source

    return {
      ...source,
      consumer: {
        ...record(source.consumer),
        fireux: fireuxContext.value,
      },
    }
  })
  const providerModeLabel = computed(() =>
    providerBaseUrl.value.includes('localhost') ||
    providerBaseUrl.value.includes('127.0.0.1')
      ? 'local dev'
      : 'deployed'
  )
  const toolUrl = ref('')
  const toolError = ref('')
  const pending = ref(false)
  let requestId = 0

  async function loadTool() {
    const currentRequestId = ++requestId
    toolUrl.value = ''
    toolError.value = ''

    if (!import.meta.client || !providerBaseUrl.value || !tool.value) {
      pending.value = false
      return
    }

    pending.value = true

    try {
      const response = await fetch(
        `${providerBaseUrl.value}/api/tools/${encodeURIComponent(tool.value)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload.value),
        }
      )
      const body = await response.json().catch(() => ({})) as ToolProviderResponse

      if (currentRequestId !== requestId) return

      if (!response.ok) {
        throw new Error(text(body.message) || `Tool provider returned ${response.status}.`)
      }

      const returnedUrl = text(body.toolUrl)
      const returnedPath = text(body.path)

      if (returnedUrl) {
        toolUrl.value = returnedUrl
        return
      }

      if (returnedPath) {
        toolUrl.value = new URL(returnedPath, providerBaseUrl.value).toString()
        return
      }

      throw new Error('Tool provider did not return a tool URL.')
    } catch (error) {
      if (currentRequestId !== requestId) return

      toolError.value = error instanceof Error
        ? error.message
        : 'The provider tool could not be loaded.'
    } finally {
      if (currentRequestId === requestId) pending.value = false
    }
  }

  watch(
    () => ({
      providerBaseUrl: providerBaseUrl.value,
      tool: tool.value,
      payload: JSON.stringify(payload.value),
    }),
    loadTool,
    { immediate: true }
  )

  return {
    providerBaseUrl,
    tool,
    title,
    authToken,
    messageSource,
    payload,
    providerModeLabel,
    pending,
    toolUrl,
    toolError,
    loadTool,
  }
}
