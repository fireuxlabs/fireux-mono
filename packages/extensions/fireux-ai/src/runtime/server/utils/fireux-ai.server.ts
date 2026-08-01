import type { H3Event } from 'h3'
import type {
  FireuxAiRequest,
  FireuxAiResponse,
  FireuxAiUsageLogHook,
} from '../../types/ai'
import { disabledResponse, resolveConfig } from './fireux-ai-config.server'
import { callProviderText, logUsage } from './fireux-ai-provider.server'

export {
  FIREUX_AI_CONFIG_TASKS as FIREUX_AI_TASKS,
  isConfiguredFireuxAiTask as isFireuxAiTask,
} from './fireux-ai-config.server'

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
