// Concurrent edit — 2026-07-21 12:44 CEST — Operations catalogue: expose route-backed app operations.
// Concurrent edit — 2026-07-21 13:07 CEST — Operation detail surfaces: expose validated public slugs.
import { useRuntimeConfig } from '#imports'
import type { H3Event } from 'h3'
import {
  WORKSPACE_CAPABILITY_ENTRY_FAMILIES,
  WORKSPACE_CAPABILITY_SURFACE_FAMILIES,
  WORKSPACE_CAPABILITY_TOOL_FAMILIES,
  WORKSPACE_CAPABILITY_TOOL_SCOPES,
  type WorkspaceCapabilityFamilies,
} from '../../../../config/app/capability-families'
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

function asFamilyArray<const T extends readonly string[]>(
  value: unknown,
  allowed: T
): T[number][] | undefined {
  if (!Array.isArray(value)) return undefined
  const items = value.map(asString)
  if (items.some((item) => !item || !allowed.includes(item as T[number]))) {
    return undefined
  }
  return [...new Set(items as T[number][])]
}

function normalizeCapabilityFamilies(
  value: unknown
): WorkspaceCapabilityFamilies | undefined {
  if (!isRecord(value)) return undefined

  const surfaces = asFamilyArray(
    value.surfaces,
    WORKSPACE_CAPABILITY_SURFACE_FAMILIES
  )
  const entries = asFamilyArray(
    value.entries,
    WORKSPACE_CAPABILITY_ENTRY_FAMILIES
  )
  const tools = asFamilyArray(value.tools, WORKSPACE_CAPABILITY_TOOL_FAMILIES)
  const scopes = asFamilyArray(value.scopes, WORKSPACE_CAPABILITY_TOOL_SCOPES)
  if (!surfaces?.length || !entries || !tools || !scopes) return undefined
  if (Boolean(tools.length) !== Boolean(scopes.length)) return undefined

  return { surfaces, entries, tools, scopes }
}

function normalizeWorkspace(
  value: unknown
): FireuxMetaOperationWorkspace | undefined {
  if (!isRecord(value)) return undefined

  const id = asString(value.id)
  const name = asString(value.name)
  const to = asString(value.to)
  if (!id || !name || !to?.startsWith('/')) return undefined

  return { id, name, to }
}

function ownsOperationPath(
  workspace: FireuxMetaOperationWorkspace,
  operationPath: string
) {
  return workspace.to === '/'
    ? operationPath.startsWith(`/workspace/${workspace.id}/`)
    : operationPath.startsWith(`${workspace.to}/`)
}

function normalizeOperation(value: unknown): FireuxMetaOperation | undefined {
  if (!isRecord(value)) return undefined

  const id = asString(value.id)
  const title = asString(value.title)
  const description = asString(value.description)
  const to = asString(value.to)
  const workspace = normalizeWorkspace(value.workspace)
  const capabilityFamilies = normalizeCapabilityFamilies(
    value.capabilityFamilies
  )
  if (
    !id ||
    !title ||
    !description ||
    !to ||
    !workspace ||
    !capabilityFamilies ||
    !ownsOperationPath(workspace, to)
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
    capabilityFamilies,
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
  const meta: unknown = runtimeConfig.fireux?.meta
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
