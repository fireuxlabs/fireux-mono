import { useRuntimeConfig } from '#imports'
import { timingSafeEqual } from 'node:crypto'
import {
  createError,
  defineEventHandler,
  getHeader,
  readBody,
  type H3Event,
} from 'h3'
import type { FireuxAiRequest } from '../../../../types/ai'
import { isFireuxAiTask, useFireuxAi } from '../../../utils/fireux-ai.server'

type Body = Partial<FireuxAiRequest> & {
  format?: 'json' | 'text'
}

function envFlag(name: string): boolean | undefined {
  const raw = process.env[name]
  if (typeof raw !== 'string') return undefined
  const value = raw.trim().toLowerCase()
  if (['1', 'true', 'yes', 'on'].includes(value)) return true
  if (['0', 'false', 'no', 'off'].includes(value)) return false
  return undefined
}

function firstString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value !== 'string') continue
    const trimmed = value.trim()
    if (trimmed) return trimmed
  }
  return ''
}

function safeEquals(value: string, expected: string): boolean {
  const left = Buffer.from(value)
  const right = Buffer.from(expected)
  return left.length === right.length && timingSafeEqual(left, right)
}

function serviceKeyFromRequest(event: H3Event): string {
  const authorization = firstString(getHeader(event, 'authorization'))
  const bearer = authorization.match(/^Bearer\s+(.+)$/i)?.[1]
  return firstString(
    getHeader(event, 'x-fireux-ai-service-key'),
    getHeader(event, 'x-fireux-internal-key'),
    bearer
  )
}

function assertAiRouteAccess(event: H3Event) {
  const runtime = useRuntimeConfig(event) as any
  const rawConfig = runtime?.fireuxAi || {}
  const enabled = envFlag('FIREUX_AI_ENABLED') ?? rawConfig.enabled === true
  const apiKey = firstString(process.env.FIREUX_AI_API_KEY, rawConfig.apiKey)
  const rawMode = firstString(process.env.FIREUX_AI_MODE, rawConfig.mode)
  const mode =
    rawMode === 'dev' || rawMode === 'app' || rawMode === 'disabled'
      ? rawMode
      : enabled
        ? 'dev'
        : 'disabled'

  if (!enabled || mode === 'disabled') {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  if (!apiKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'FireUX AI is not configured.',
    })
  }

  if (mode === 'dev') {
    if (import.meta.dev) return
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const serviceKey = firstString(
    process.env.FIREUX_AI_SERVICE_KEY,
    process.env.FIREUX_INTERNAL_API_KEY,
    rawConfig.serviceKey,
    rawConfig.internalApiKey
  )

  if (!serviceKey) {
    throw createError({
      statusCode: 403,
      statusMessage: 'FireUX AI service access is not configured.',
    })
  }

  if (!safeEquals(serviceKeyFromRequest(event), serviceKey)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized FireUX AI request.',
    })
  }
}

export default defineEventHandler(async (event) => {
  assertAiRouteAccess(event)

  const body = (await readBody(event)) as Body | null
  const task = body?.task

  if (!isFireuxAiTask(task)) {
    return {
      ok: false,
      reason: 'Unsupported FireUX AI task.',
      allowedTasks: [
        'translate_text',
        'summarise_text',
        'rewrite_text',
        'extract_structured_data',
      ],
    }
  }

  const request: FireuxAiRequest = {
    appId: typeof body?.appId === 'string' && body.appId.trim()
      ? body.appId.trim()
      : 'unknown',
    task,
    input: body?.input,
    outputSchema: body?.outputSchema,
    locale: body?.locale,
    context: body?.context,
  }

  const ai = useFireuxAi(event)
  return body?.format === 'text'
    ? ai.generateText(request)
    : ai.generateJson(request)
})
