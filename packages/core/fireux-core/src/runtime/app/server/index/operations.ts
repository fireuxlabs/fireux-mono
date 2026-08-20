// Concurrent edit — 2026-07-21 12:44 CEST — Operations catalogue: expose route-backed app operations.
// Concurrent edit — 2026-07-21 13:07 CEST — Operation detail surfaces: expose validated public slugs.
import { useRuntimeConfig } from '#imports'
import type { H3Event } from 'h3'
import type {
  FireuxMetaContent,
  FireuxMetaOperation,
  FireuxMetaOperationWorkspace,
} from '../../../../config/app/meta-content'

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

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map(asString).filter((item): item is string => Boolean(item))
    : []
}

function normalizeWorkspace(
  value: unknown
): FireuxMetaOperationWorkspace | undefined {
  if (!isRecord(value)) return undefined

  const id = asString(value.id)
  const name = asString(value.name)
  const to = asString(value.to)
  if (!id || !name || !to?.startsWith('/workspace/')) return undefined

  return { id, name, to }
}

function normalizeOperation(value: unknown): FireuxMetaOperation | undefined {
  if (!isRecord(value)) return undefined

  const id = asString(value.id)
  const title = asString(value.title)
  const description = asString(value.description)
  const to = asString(value.to)
  const workspace = normalizeWorkspace(value.workspace)
  if (
    !id ||
    !title ||
    !description ||
    !to ||
    !workspace ||
    !to.startsWith(`${workspace.to}/`)
  ) {
    return undefined
  }

  const icon = asString(value.icon)
  const headline = asString(value.headline)
  const slug = asSlug(value.slug)
  const keywords = asStringArray(value.keywords)
  return {
    id,
    title,
    description,
    to,
    workspace,
    ...(headline ? { headline } : {}),
    ...(icon ? { icon } : {}),
    ...(slug ? { slug } : {}),
    ...(keywords.length ? { keywords } : {}),
  }
}

function isFireuxMetaContent(value: unknown): value is FireuxMetaContent {
  return isRecord(value) && isRecord(value.app)
}

export function readAppOperations(event: H3Event) {
  const runtimeConfig = useRuntimeConfig(event)
  const meta = runtimeConfig.fireux?.meta
  const operations = isFireuxMetaContent(meta)
    ? (meta.operations || [])
        .map((operation) => normalizeOperation(operation))
        .filter((operation): operation is FireuxMetaOperation =>
          Boolean(operation)
        )
    : []

  return {
    ok: true,
    operations,
    now: new Date().toISOString(),
  }
}
