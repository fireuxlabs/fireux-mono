import { useRuntimeConfig } from '#imports'
import type { H3Event } from 'h3'
import type {
  FireuxMetaCta,
  FireuxMetaChecklistItem,
  FireuxMetaContent,
  FireuxMetaRelatedApp,
  FireuxMetaSolution,
  FireuxMetaSolutionOwner,
  FireuxMetaSolutionStatus,
} from '../../../../config/app/meta-content'

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => asString(entry))
    .filter((entry): entry is string => Boolean(entry))
}

function normalizeChecklist(value: unknown): FireuxMetaChecklistItem[] {
  if (!Array.isArray(value)) return []

  return value
    .map((entry) => {
      if (typeof entry === 'string') {
        const label = entry.trim()
        return label ? { label } : null
      }

      if (!isRecord(entry)) return null
      const label = asString(entry.label)
      if (!label) return null

      return {
        label,
        ...(typeof entry.done === 'boolean' ? { done: entry.done } : {}),
      }
    })
    .filter((entry): entry is FireuxMetaChecklistItem => Boolean(entry))
}

function normalizeSlug(value: unknown): string | undefined {
  const raw = asString(value)
  if (!raw) return undefined

  const slug = raw
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || undefined
}

function normalizeCta(value: unknown): FireuxMetaCta | undefined {
  if (!isRecord(value)) return undefined

  const label = asString(value.label)
  const to = asString(value.to)
  if (!label || !to) return undefined

  return {
    label,
    to,
    ...(asString(value.icon) ? { icon: asString(value.icon) } : {}),
    ...(typeof value.external === 'boolean'
      ? { external: value.external }
      : {}),
  }
}

function normalizeStatus(value: unknown): FireuxMetaSolutionStatus | undefined {
  const status = asString(value)
  if (
    status === 'live' ||
    status === 'very-easy' ||
    status === 'coming-soon' ||
    status === 'bridge' ||
    status === 'planned' ||
    status === 'later'
  ) {
    return status
  }

  return undefined
}

function normalizeRelatedApp(value: unknown): FireuxMetaRelatedApp | undefined {
  if (!isRecord(value)) return undefined

  const name = asString(value.name)
  const to = asString(value.to)
  if (!name || !to) return undefined

  const description = asString(value.description)

  return {
    name,
    to,
    ...(description ? { description } : {}),
    ...(typeof value.external === 'boolean'
      ? { external: value.external }
      : {}),
  }
}

function normalizeOwner(value: unknown): FireuxMetaSolutionOwner | undefined {
  if (!isRecord(value)) return undefined

  const id = asString(value.id)
  const name = asString(value.name)
  if (!id || !name) return undefined

  const to = asString(value.to)
  return {
    id,
    name,
    ...(to ? { to } : {}),
  }
}

function normalizeSolution(value: unknown): FireuxMetaSolution | undefined {
  if (!isRecord(value)) return undefined

  const slug = normalizeSlug(value.slug)
  const title = asString(value.title)
  const description = asString(value.description)
  if (!slug || !title || !description) return undefined

  const icon = asString(value.icon)
  const status = normalizeStatus(value.status)
  const body = asString(value.body)
  const steps = asStringArray(value.steps)
  const businessCase = asString(value.businessCase)
  const provisioning = asStringArray(value.provisioning)
  const checklist = normalizeChecklist(value.checklist)
  const relatedApp = normalizeRelatedApp(value.relatedApp)
  const cta = normalizeCta(value.cta)
  const keywords = asStringArray(value.keywords)
  const owner = normalizeOwner(value.owner)
  const to = asString(value.to)

  return {
    slug,
    title,
    description,
    ...(icon ? { icon } : {}),
    ...(status ? { status } : {}),
    ...(body ? { body } : {}),
    ...(steps.length ? { steps } : {}),
    ...(businessCase ? { businessCase } : {}),
    ...(provisioning.length ? { provisioning } : {}),
    ...(checklist.length ? { checklist } : {}),
    ...(relatedApp ? { relatedApp } : {}),
    ...(cta ? { cta } : {}),
    ...(keywords.length ? { keywords } : {}),
    ...(owner ? { owner } : {}),
    ...(to ? { to } : {}),
    ...(typeof value.external === 'boolean'
      ? { external: value.external }
      : {}),
    ...(typeof value.featured === 'boolean'
      ? { featured: value.featured }
      : {}),
  }
}

function isFireuxMetaContent(value: unknown): value is FireuxMetaContent {
  return isRecord(value) && isRecord(value.app)
}

export function readAppSolutions(event: H3Event) {
  const runtimeConfig = useRuntimeConfig(event)
  const meta = runtimeConfig.fireux?.meta
  const solutions = isFireuxMetaContent(meta)
    ? (meta.solutions || [])
        .map((solution) => normalizeSolution(solution))
        .filter((solution): solution is FireuxMetaSolution => Boolean(solution))
    : []

  return {
    ok: true,
    solutions,
    now: new Date().toISOString(),
  }
}
