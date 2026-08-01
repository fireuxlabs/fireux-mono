import { useRuntimeConfig } from '#imports'
import type { H3Event } from 'h3'
import type {
  FireuxAiConfig,
  FireuxAiProvider,
  FireuxAiRequest,
  FireuxAiResponse,
  FireuxAiTask,
} from '../../types/ai'

export const FIREUX_AI_CONFIG_TASKS = [
  'translate_text',
  'summarise_text',
  'rewrite_text',
  'extract_structured_data',
] as const satisfies readonly FireuxAiTask[]

const FIREUX_AI_TASK_SET = new Set<string>(FIREUX_AI_CONFIG_TASKS)

export function isConfiguredFireuxAiTask(task: unknown): task is FireuxAiTask {
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

export function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value !== 'string') continue
    const trimmed = value.trim()
    if (trimmed) return trimmed
  }
  return undefined
}

function numberValue(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

export function requestTimeoutMs(request: FireuxAiRequest) {
  const requested = numberValue(request.timeoutMs)
  const configured = numberValue(process.env.FIREUX_AI_TIMEOUT_MS)
  const value = requested || configured || 120_000

  return Math.min(Math.max(value, 5_000), 300_000)
}

function isProvider(value: unknown): value is FireuxAiProvider {
  return value === 'openai' || value === 'google' || value === 'anthropic'
}

export function resolveConfig(event?: H3Event): FireuxAiConfig {
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
    mode:
      mode === 'dev' || mode === 'app' || mode === 'disabled'
        ? mode
        : enabled
          ? 'dev'
          : 'disabled',
  }
}

export function disabledResponse<T>(
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
