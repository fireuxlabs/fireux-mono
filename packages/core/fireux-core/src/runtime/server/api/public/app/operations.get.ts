// Concurrent edit — 2026-07-21 12:44 CEST — Operations catalogue: expose route-backed app operations.
// Concurrent edit — 2026-07-21 13:07 CEST — Operation detail surfaces: expose validated public slugs.
import { useRuntimeConfig } from '#imports'
import { defineEventHandler, setResponseHeaders, type H3Event } from 'h3'
import type {
  FireuxMetaContent,
  FireuxMetaOperation,
  FireuxMetaOperationConsole,
} from '../../../../../config/app/meta-content'

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function asSlug(value: unknown): string | undefined {
  const slug = asString(value)
  return slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? slug : undefined
}

function normalizeConsole(value: unknown): FireuxMetaOperationConsole | undefined {
  if (!isRecord(value)) return undefined

  const id = asString(value.id)
  const name = asString(value.name)
  const to = asString(value.to)
  if (!id || !name || !to?.startsWith('/console/')) return undefined

  return { id, name, to }
}

function normalizeOperation(value: unknown): FireuxMetaOperation | undefined {
  if (!isRecord(value)) return undefined

  const id = asString(value.id)
  const title = asString(value.title)
  const description = asString(value.description)
  const to = asString(value.to)
  const console = normalizeConsole(value.console)
  if (
    !id ||
    !title ||
    !description ||
    !to ||
    !console ||
    !to.startsWith(`${console.to}/`)
  ) {
    return undefined
  }

  const icon = asString(value.icon)
  const slug = asSlug(value.slug)
  return {
    id,
    title,
    description,
    to,
    console,
    ...(icon ? { icon } : {}),
    ...(slug ? { slug } : {}),
  }
}

function isFireuxMetaContent(value: unknown): value is FireuxMetaContent {
  return isRecord(value) && isRecord(value.app)
}

export default defineEventHandler((event: H3Event) => {
  const runtimeConfig = useRuntimeConfig()
  const meta = runtimeConfig.fireux?.meta
  const operations = isFireuxMetaContent(meta)
    ? (meta.operations || [])
        .map((operation) => normalizeOperation(operation))
        .filter((operation): operation is FireuxMetaOperation => Boolean(operation))
    : []

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
  })

  return {
    ok: true,
    operations,
    now: new Date().toISOString(),
  }
})
