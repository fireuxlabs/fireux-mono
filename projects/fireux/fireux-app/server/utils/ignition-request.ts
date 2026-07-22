// Concurrent edit — 2026-07-22 13:03 CEST — Origin-aware Ignition pipelines: validate and preserve pricing, solution, and App entry points.
import { createError } from 'h3'

export const IgnitionRequestStorage = {
  path: 'apps/{appId}/ignition-requests/{requestId}',
  collection: 'ignition-requests',
  parent: 'app',
} as const

export const IGNITION_PAGE_OPTIONS = [
  'home',
  'about',
  'services',
  'products',
  'booking',
  'news',
  'contact',
  'account',
] as const

export const IGNITION_BRANDING_OPTIONS = [
  'ready',
  'use-existing',
  'help',
] as const

export const IGNITION_STATUSES = [
  'new',
  'accepted',
  'in-progress',
  'launched',
  'declined',
] as const

export const IGNITION_CHECKLIST = [
  'request_reviewed',
  'scope_agreed',
  'content_received',
  'app_configured',
  'customer_reviewed',
  'launched',
] as const

export const IGNITION_ORIGIN_SURFACES = [
  'pricing',
  'solution',
  'app-directory',
] as const

export type IgnitionStatus = (typeof IGNITION_STATUSES)[number]
export type IgnitionChecklistKey = (typeof IGNITION_CHECKLIST)[number]
export type IgnitionOrigin = {
  surface: (typeof IGNITION_ORIGIN_SURFACES)[number]
  ref: string
}

export type PublicIgnitionRequestInput = {
  contactName: string
  contactEmail: string
  businessName: string
  website: string
  branding: (typeof IGNITION_BRANDING_OPTIONS)[number]
  pages: (typeof IGNITION_PAGE_OPTIONS)[number][]
  appJob: string
  access: string
  origin: IgnitionOrigin | null
}

export type IgnitionRequestPatch =
  | { kind: 'status'; status: IgnitionStatus }
  | { kind: 'checklist'; key: IgnitionChecklistKey; value: boolean }

const PUBLIC_FIELDS = new Set([
  'contact_name',
  'contact_email',
  'business_name',
  'website',
  'branding',
  'pages',
  'app_job',
  'access',
  'privacy_acknowledged',
  'fax_number',
  'origin',
])

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Complete the Ignition form before sending it.',
    })
  }
  return value as Record<string, unknown>
}

function cleanLine(value: unknown, max: number) {
  const result = String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
  return result.length <= max ? result : ''
}

function cleanText(value: unknown, max: number) {
  const result = String(value ?? '').trim()
  return result.length <= max ? result : ''
}

function requiredLine(
  source: Record<string, unknown>,
  field: string,
  label: string,
  min: number,
  max: number
) {
  const value = cleanLine(source[field], max)
  if (value.length < min) {
    throw createError({
      statusCode: 400,
      statusMessage: `${label} is required.`,
    })
  }
  return value
}

function parseWebsite(value: unknown) {
  const website = cleanLine(value, 2048)
  if (!website) return ''

  try {
    const url = new URL(website)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error()
    return url.toString()
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Website must be a valid web address.',
    })
  }
}

function parseOrigin(value: unknown): IgnitionOrigin | null {
  if (value === undefined || value === null) return null
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'The Ignition source is invalid.',
    })
  }

  const source = value as Record<string, unknown>
  const keys = Object.keys(source)
  const surface = cleanLine(source.surface, 32)
  const ref = cleanLine(source.ref, 96)
  const validRef = /^[a-z0-9](?:[a-z0-9-]{0,94}[a-z0-9])?$/.test(ref)
  const validPricingRef = surface !== 'pricing' || ref === 'apps'

  if (
    keys.length !== 2 ||
    !keys.includes('surface') ||
    !keys.includes('ref') ||
    !IGNITION_ORIGIN_SURFACES.includes(surface as never) ||
    !validRef ||
    !validPricingRef
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'The Ignition source is invalid.',
    })
  }

  return {
    surface: surface as IgnitionOrigin['surface'],
    ref,
  }
}

export function parsePublicIgnitionRequest(
  body: unknown
): PublicIgnitionRequestInput {
  const source = record(body)
  if (Object.keys(source).some((key) => !PUBLIC_FIELDS.has(key))) {
    throw createError({
      statusCode: 400,
      statusMessage: 'The Ignition request contains an unsupported field.',
    })
  }
  if (cleanLine(source.fax_number, 200)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Request not accepted.',
    })
  }

  const contactEmail = cleanLine(source.contact_email, 320).toLowerCase()
  if (!EMAIL_PATTERN.test(contactEmail)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'A valid email address is required.',
    })
  }

  const branding = cleanLine(source.branding, 32)
  if (!IGNITION_BRANDING_OPTIONS.includes(branding as never)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose what you have for branding.',
    })
  }

  const pageSet = new Set(
    (Array.isArray(source.pages) ? source.pages : [])
      .map((value) => cleanLine(value, 32))
      .filter((value) => IGNITION_PAGE_OPTIONS.includes(value as never))
  )
  if (!pageSet.size || pageSet.size > IGNITION_PAGE_OPTIONS.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose at least one page.',
    })
  }
  if (
    !Array.isArray(source.pages) ||
    source.pages.some(
      (value) => !IGNITION_PAGE_OPTIONS.includes(cleanLine(value, 32) as never)
    )
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'One or more selected pages are invalid.',
    })
  }

  if (source.privacy_acknowledged !== true) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Confirm that FireUX may use these details to reply.',
    })
  }

  const appJob = cleanText(source.app_job, 2000)
  if (appJob.length < 10) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tell us the one job the app needs to do.',
    })
  }

  const access = cleanText(source.access, 1000)
  if (access.length < 3) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tell us who needs access.',
    })
  }

  return {
    contactName: requiredLine(source, 'contact_name', 'Your name', 2, 120),
    contactEmail,
    businessName: requiredLine(
      source,
      'business_name',
      'Business name',
      2,
      160
    ),
    website: parseWebsite(source.website),
    branding: branding as PublicIgnitionRequestInput['branding'],
    pages: Array.from(pageSet) as PublicIgnitionRequestInput['pages'],
    appJob,
    access,
    origin: parseOrigin(source.origin),
  }
}

export function parseIgnitionRequestPatch(body: unknown): IgnitionRequestPatch {
  const source = record(body)
  const keys = Object.keys(source)

  if (keys.length === 1 && keys[0] === 'status') {
    const status = cleanLine(source.status, 32)
    if (IGNITION_STATUSES.includes(status as never)) {
      return { kind: 'status', status: status as IgnitionStatus }
    }
  }

  if (
    keys.length === 2 &&
    keys.includes('checklist_key') &&
    keys.includes('checked')
  ) {
    const key = cleanLine(source.checklist_key, 64)
    if (
      IGNITION_CHECKLIST.includes(key as never) &&
      typeof source.checked === 'boolean'
    ) {
      return {
        kind: 'checklist',
        key: key as IgnitionChecklistKey,
        value: source.checked,
      }
    }
  }

  throw createError({
    statusCode: 400,
    statusMessage: 'The Ignition update is invalid.',
  })
}

export function emptyIgnitionChecklist() {
  return Object.fromEntries(
    IGNITION_CHECKLIST.map((key) => [key, false])
  ) as Record<IgnitionChecklistKey, boolean>
}

function isoDate(value: unknown) {
  if (!value || typeof value !== 'object') return ''
  const candidate = value as { toDate?: () => Date }
  if (typeof candidate.toDate !== 'function') return ''
  return candidate.toDate().toISOString()
}

function nestedRecord(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function serializeOrigin(value: unknown): IgnitionOrigin | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const source = value as Record<string, unknown>
  const surface = cleanLine(source.surface, 32)
  const ref = cleanLine(source.ref, 96)
  if (
    !IGNITION_ORIGIN_SURFACES.includes(surface as never) ||
    !/^[a-z0-9](?:[a-z0-9-]{0,94}[a-z0-9])?$/.test(ref) ||
    (surface === 'pricing' && ref !== 'apps')
  ) {
    return null
  }
  return { surface: surface as IgnitionOrigin['surface'], ref }
}

export function serializeIgnitionRequest(
  id: string,
  source: Record<string, unknown>
) {
  const contact = nestedRecord(source.contact)
  const business = nestedRecord(source.business)
  const delivery = nestedRecord(source.delivery)
  const created = nestedRecord(source.created)
  const status = cleanLine(source.status, 32)

  return {
    id,
    status: IGNITION_STATUSES.includes(status as never)
      ? (status as IgnitionStatus)
      : ('new' as const),
    contact: {
      name: cleanLine(contact.name, 120),
      email: cleanLine(contact.email, 320),
    },
    business: {
      name: cleanLine(business.name, 160),
      website: cleanLine(business.website, 2048),
      branding: cleanLine(business.branding, 32),
    },
    pages: Array.isArray(source.pages)
      ? source.pages.map((value) => cleanLine(value, 32)).filter(Boolean)
      : [],
    app_job: cleanText(source.app_job, 2000),
    access: cleanText(source.access, 1000),
    origin: serializeOrigin(source.origin),
    delivery: Object.fromEntries(
      IGNITION_CHECKLIST.map((key) => [key, delivery[key] === true])
    ) as Record<IgnitionChecklistKey, boolean>,
    created_at: isoDate(created.at),
  }
}
