import type {
  FireuxAiConfig,
  FireuxAiRequest,
  FireuxAiResponse,
  FireuxAiUsageLogHook,
} from '../../types/ai'
import { firstString, requestTimeoutMs } from './fireux-ai-config.server'

export function buildTextPrompt(request: FireuxAiRequest): string {
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

export function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

export function imageDetail(value: unknown): 'low' | 'high' | 'auto' {
  return value === 'low' || value === 'high' || value === 'auto'
    ? value
    : 'auto'
}

export function imagesFromInput(input: unknown) {
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

export function filesFromInput(input: unknown) {
  const data = record(input)
  const files = [
    ...(Array.isArray(data.fileUrls)
      ? data.fileUrls.map((url) => ({ url, fileUrl: undefined }))
      : []),
    ...(Array.isArray(data.files)
      ? data.files.map((file) => {
          const row = record(file)
          return {
            url: row.url,
            fileUrl: row.file_url,
          }
        })
      : []),
  ]
  const seen = new Set<string>()

  return files
    .map((file) => ({
      url: firstString(file.url, file.fileUrl) || '',
    }))
    .filter((file) => {
      if (!file.url || seen.has(file.url)) return false
      seen.add(file.url)
      return true
    })
}

export function buildOpenAiUserContent(request: FireuxAiRequest) {
  const text = buildTextPrompt(request)
  const images = imagesFromInput(request.input)
  const files = filesFromInput(request.input)
  if (!images.length && !files.length) return text

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
    ...files.map((file) => ({
      type: 'input_file',
      file_url: file.url,
    })),
  ]
}

export function openAiTextFormat(request: FireuxAiRequest) {
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

export function textFromOpenAiPayload(payload: any) {
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
  const timeoutMs = requestTimeoutMs(request)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  let response: Response

  try {
    response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
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
  } catch (error) {
    return {
      ok: false,
      task: request.task,
      reason: controller.signal.aborted
        ? `OpenAI request timed out after ${Math.round(timeoutMs / 1000)} seconds.`
        : error instanceof Error
          ? error.message
          : 'OpenAI request failed.',
      provider: config.provider,
      model,
    }
  } finally {
    clearTimeout(timeout)
  }

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

export async function callProviderText(
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

export async function logUsage(
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
