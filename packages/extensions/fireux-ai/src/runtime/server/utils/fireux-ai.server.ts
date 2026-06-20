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
    model: firstString(request.model, config.model),
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
      outputJsonSchema: request.outputJsonSchema,
    },
    null,
    2
  )
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function imageDetail(value: unknown): 'low' | 'high' | 'auto' {
  return value === 'low' || value === 'high' || value === 'auto'
    ? value
    : 'auto'
}

function imagesFromInput(input: unknown) {
  const data = record(input)
  const defaultDetail = imageDetail(data.imageDetail)
  const images = [
    ...(Array.isArray(data.imageUrls)
      ? data.imageUrls.map((url) => ({ url, detail: defaultDetail }))
      : []),
    ...(Array.isArray(data.images)
      ? data.images.map((image) => {
          const row = record(image)
          return {
            url: row.url,
            detail: imageDetail(row.detail || defaultDetail),
          }
        })
      : []),
  ]
  const seen = new Set<string>()

  return images
    .map((image) => ({
      url: firstString(image.url) || '',
      detail: image.detail,
    }))
    .filter((image) => {
      if (!image.url || seen.has(image.url)) return false
      seen.add(image.url)
      return true
    })
}

function buildOpenAiUserContent(request: FireuxAiRequest) {
  const text = buildTextPrompt(request)
  const images = imagesFromInput(request.input)
  if (!images.length) return text

  return [
    {
      type: 'input_text',
      text,
    },
    ...images.map((image) => ({
      type: 'input_image',
      image_url: image.url,
      detail: image.detail,
    })),
  ]
}

function openAiTextFormat(request: FireuxAiRequest) {
  if (request.outputJsonSchema) {
    return {
      type: 'json_schema',
      name: 'fireux_ai_result',
      schema: request.outputJsonSchema,
      strict: false,
    }
  }

  return request.outputSchema ? { type: 'json_object' } : undefined
}

function textFromOpenAiPayload(payload: any) {
  const directText = firstString(payload?.output_text)
  if (directText) return directText

  const output = Array.isArray(payload?.output) ? payload.output : []
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : []
    for (const part of content) {
      const text = firstString(part?.text, part?.content)
      if (text) return text
    }
  }

  return ''
}

async function callOpenAiText(
  request: FireuxAiRequest,
  config: FireuxAiConfig
): Promise<FireuxAiResponse<string>> {
  const model = firstString(request.model, config.model) || 'gpt-4o-mini'
  const textFormat = openAiTextFormat(request)
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      ...(textFormat ? { text: { format: textFormat } } : {}),
      input: [
        {
          role: 'system',
          content:
            'You are a FireUX server-side AI adapter. Complete the requested whitelisted task. Return only the requested result. When JSON is requested, return a single valid JSON object and no prose.',
        },
        {
          role: 'user',
          content: buildOpenAiUserContent(request),
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
      model,
    }
  }

  const text = textFromOpenAiPayload(payload)

  return {
    ok: true,
    task: request.task,
    data: text,
    text,
    provider: config.provider,
    model,
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

function jsonCandidatesFromText(value: string) {
  const stripped = value
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
  const candidates = [stripped]
  const firstObject = stripped.indexOf('{')
  const lastObject = stripped.lastIndexOf('}')
  const firstArray = stripped.indexOf('[')
  const lastArray = stripped.lastIndexOf(']')

  if (firstObject >= 0 && lastObject > firstObject) {
    candidates.push(stripped.slice(firstObject, lastObject + 1))
  }
  if (firstArray >= 0 && lastArray > firstArray) {
    candidates.push(stripped.slice(firstArray, lastArray + 1))
  }

  return Array.from(new Set(candidates.filter(Boolean)))
}

function parseJsonFromText<T>(value: string): T {
  for (const candidate of jsonCandidatesFromText(value)) {
    try {
      return JSON.parse(candidate) as T
    } catch {
      // Some providers wrap valid JSON in prose. Try the next candidate.
    }
  }

  throw new Error('AI provider returned text that was not valid JSON.')
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
    const text = String(response.text || '').trim()

    try {
      return {
        ...response,
        data: parseJsonFromText<T>(text),
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
