import { useRuntimeConfig } from '#imports'
import type { H3Event } from 'h3'
import type {
  FireuxAiConfig,
  FireuxAiProvider,
  FireuxAiRequest,
  FireuxAiResponse,
  FireuxAiTask,
  FireuxAiUsageLogHook,
} from '../../types/ai'

export const FIREUX_AI_TASKS = [
  'translate_text',
  'summarise_text',
  'rewrite_text',
  'extract_structured_data',
] as const satisfies readonly FireuxAiTask[]

const FIREUX_AI_TASK_SET = new Set<string>(FIREUX_AI_TASKS)

export function isFireuxAiTask(task: unknown): task is FireuxAiTask {
  return typeof task === 'string' && FIREUX_AI_TASK_SET.has(task)
}

function envFlag(name: string): boolean | undefined {
  const raw = process.env[name]
  if (typeof raw !== 'string') return undefined
  const value = raw.trim().toLowerCase()
  if (['1', 'true', 'yes', 'on'].includes(value)) return true
  if (['0', 'false', 'no', 'off'].includes(value)) return false
  return undefined
}

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value !== 'string') continue
    const trimmed = value.trim()
    if (trimmed) return trimmed
  }
  return undefined
}

function isProvider(value: unknown): value is FireuxAiProvider {
  return value === 'openai' || value === 'google' || value === 'anthropic'
}

function resolveConfig(event?: H3Event): FireuxAiConfig {
  const rc = useRuntimeConfig(event) as any
  const raw = rc?.fireuxAi || {}
  const envEnabled = envFlag('FIREUX_AI_ENABLED')
  const provider = firstString(process.env.FIREUX_AI_PROVIDER, raw.provider)
  const mode = firstString(process.env.FIREUX_AI_MODE, raw.mode)
  const enabled =
    envEnabled ??
    (typeof raw.enabled === 'boolean' ? raw.enabled : mode !== 'disabled')

  return {
    enabled,
    provider: isProvider(provider) ? provider : 'openai',
    apiKey: firstString(process.env.FIREUX_AI_API_KEY, raw.apiKey),
    model: firstString(process.env.FIREUX_AI_MODEL, raw.model),
    mode: mode === 'dev' || mode === 'app' || mode === 'disabled'
      ? mode
      : enabled
        ? 'dev'
        : 'disabled',
  }
}

function disabledResponse<T>(
  request: FireuxAiRequest,
  config: FireuxAiConfig,
  reason: string
): FireuxAiResponse<T> {
  return {
    ok: false,
    task: request.task,
    disabled: true,
    reason,
    provider: config.provider,
    model: config.model,
  }
}

function buildTextPrompt(request: FireuxAiRequest): string {
  return JSON.stringify(
    {
      task: request.task,
      locale: request.locale,
      input: request.input,
      context: request.context,
      outputSchema: request.outputSchema,
    },
    null,
    2
  )
}

async function callOpenAiText(
  request: FireuxAiRequest,
  config: FireuxAiConfig
): Promise<FireuxAiResponse<string>> {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model || 'gpt-4o-mini',
      input: [
        {
          role: 'system',
          content:
            'You are a FireUX server-side AI adapter. Complete the requested whitelisted task. Return only the requested result.',
        },
        {
          role: 'user',
          content: buildTextPrompt(request),
        },
      ],
    }),
  })

  const payload = (await response.json().catch(() => null)) as any
  if (!response.ok) {
    return {
      ok: false,
      task: request.task,
      reason:
        payload?.error?.message ||
        `OpenAI request failed with status ${response.status}`,
      provider: config.provider,
      model: config.model,
    }
  }

  const text =
    firstString(payload?.output_text) ||
    firstString(payload?.output?.[0]?.content?.[0]?.text) ||
    ''

  return {
    ok: true,
    task: request.task,
    data: text,
    text,
    provider: config.provider,
    model: config.model,
    usage: payload?.usage,
  }
}

async function callProviderText(
  request: FireuxAiRequest,
  config: FireuxAiConfig
): Promise<FireuxAiResponse<string>> {
  if (config.provider === 'openai') return callOpenAiText(request, config)

  return {
    ok: false,
    task: request.task,
    reason: `${config.provider} provider adapter is not implemented yet.`,
    provider: config.provider,
    model: config.model,
  }
}

async function logUsage(
  hook: FireuxAiUsageLogHook | undefined,
  request: FireuxAiRequest,
  config: FireuxAiConfig,
  response: FireuxAiResponse
) {
  if (!hook) return
  await hook({
    appId: request.appId,
    task: request.task,
    provider: config.provider,
    model: config.model,
    mode: config.mode,
    ok: response.ok,
    reason: response.reason,
  })
}

export function useFireuxAi(
  event?: H3Event,
  options: { onUsage?: FireuxAiUsageLogHook } = {}
) {
  const config = resolveConfig(event)

  async function generateText(
    request: FireuxAiRequest
  ): Promise<FireuxAiResponse<string>> {
    if (!config.enabled || config.mode === 'disabled') {
      const response = disabledResponse<string>(
        request,
        config,
        'FireUX AI is disabled.'
      )
      await logUsage(options.onUsage, request, config, response)
      return response
    }

    if (!config.apiKey) {
      const response = disabledResponse<string>(
        request,
        config,
        'FireUX AI is missing server runtime config: FIREUX_AI_API_KEY.'
      )
      await logUsage(options.onUsage, request, config, response)
      return response
    }

    const response = await callProviderText(request, config)
    await logUsage(options.onUsage, request, config, response)
    return response
  }

  async function generateJson<T = unknown>(
    request: FireuxAiRequest
  ): Promise<FireuxAiResponse<T>> {
    const response = await generateText(request)
    if (!response.ok) return response as FireuxAiResponse<T>

    try {
      return {
        ...response,
        data: JSON.parse(response.text || '') as T,
      }
    } catch {
      return {
        ok: false,
        task: request.task,
        reason: 'AI provider returned text that was not valid JSON.',
        provider: response.provider,
        model: response.model,
        text: response.text,
        usage: response.usage,
      }
    }
  }

  return {
    config: {
      enabled: config.enabled,
      provider: config.provider,
      model: config.model,
      mode: config.mode,
    },
    generateJson,
    generateText,
  }
}
