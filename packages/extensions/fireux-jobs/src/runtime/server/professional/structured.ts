// Concurrent edit — 2026-07-21 14:08 CEST — Trusted Professional API: validate structured profile families and every canonical reference before writing.
import { useRuntimeConfig } from '#imports'
import { createError, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer.ts'
import {
  getRuntimeFirestore,
  getRuntimeIdentityFirestore,
} from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps.ts'
import {
  AppProfessionalStorage,
  ProfessionalConstraints,
  ProfessionalStorage,
} from '../../models/profiles/Professional/Professional.model.ts'

export type ProfessionalStructuredField =
  | 'relevant_experience'
  | 'other_experience'
  | 'languages'
  | 'certifications'
  | 'education'
  | 'volunteering'
  | 'projects'

const STRUCTURED_FIELDS = new Set<ProfessionalStructuredField>([
  'relevant_experience',
  'other_experience',
  'languages',
  'certifications',
  'education',
  'volunteering',
  'projects',
])

const MONTHS = new Set([
  '',
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
])

const FIELD_LIMITS: Record<ProfessionalStructuredField, number> = {
  relevant_experience: ProfessionalConstraints.relevantExperience,
  other_experience: ProfessionalConstraints.otherExperience,
  languages: ProfessionalConstraints.languages,
  certifications: ProfessionalConstraints.certifications,
  education: ProfessionalConstraints.education,
  volunteering: ProfessionalConstraints.volunteering,
  projects: ProfessionalConstraints.projects,
}

type ReferenceRequirement = { path: string; label: string }

function fail(statusMessage: string): never {
  throw createError({ statusCode: 400, statusMessage })
}

function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(`${label} must be an object.`)
  }
  return value as Record<string, unknown>
}

function exactKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
  label: string
): void {
  const allowedSet = new Set(allowed)
  const unsupported = Object.keys(value).find(key => !allowedSet.has(key))
  if (unsupported) fail(`${label} contains unsupported field ${unsupported}.`)
}

function array(value: unknown, label: string, maximum: number): unknown[] {
  if (!Array.isArray(value)) fail(`${label} must be a list.`)
  if (value.length > maximum) {
    fail(`${label} supports at most ${maximum} items.`)
  }
  return value
}

function text(
  value: unknown,
  label: string,
  maximum: number,
  required = false
): string {
  if (typeof value !== 'string') fail(`${label} must be text.`)
  const normalized = value.trim()
  if (required && !normalized) fail(`${label} is required.`)
  if (normalized.length > maximum) {
    fail(`${label} must be ${maximum} characters or less.`)
  }
  return normalized
}

function boolean(value: unknown, label: string): boolean {
  if (typeof value !== 'boolean') fail(`${label} must be true or false.`)
  return value
}

function year(value: unknown, label: string, nullable: boolean): string | null {
  if (nullable && (value === null || value === '')) return null
  const normalized = text(value, label, 4)
  if (!normalized && !nullable) return ''
  if (!/^\d{4}$/.test(normalized)) fail(`${label} must contain four digits.`)
  const number = Number(normalized)
  if (
    number < ProfessionalConstraints.yearMin ||
    number > ProfessionalConstraints.yearMax
  ) {
    fail(`${label} is outside the supported range.`)
  }
  return normalized
}

function month(value: unknown, label: string): string {
  const normalized = text(value, label, 3)
  if (!MONTHS.has(normalized)) fail(`${label} must use a three-letter month.`)
  return normalized
}

function httpsUrl(value: unknown, label: string): string {
  const normalized = text(value, label, ProfessionalConstraints.urlLength)
  if (!normalized) return ''
  let parsed: URL
  try {
    parsed = new URL(normalized)
  } catch {
    fail(`${label} must be a valid HTTPS URL.`)
  }
  if (parsed.protocol !== 'https:') fail(`${label} must use HTTPS.`)
  return parsed.toString()
}

function documentId(value: unknown, label: string): string {
  const id = text(value, label, 1_500, true)
  if (!isFirestoreDocumentId(id)) fail(`${label} is invalid.`)
  return id
}

function normalizeExperience(
  value: unknown,
  label: string,
  references: ReferenceRequirement[]
) {
  const source = object(value, label)
  exactKeys(
    source,
    [
      'place_id',
      'place_collection',
      'role',
      'from_month',
      'from_year',
      'to_month',
      'to_year',
      'ongoing',
      'responsibilities',
    ],
    label
  )
  const placeId = documentId(source.place_id, `${label} Place id`)
  const placeCollection = text(
    source.place_collection,
    `${label} Place collection`,
    120
  )
  if (!['', 'kitchens', 'companies'].includes(placeCollection)) {
    fail(`${label} Place collection is unsupported.`)
  }
  references.push({ path: `places/${placeId}`, label: `${label} Place` })
  if (placeCollection === 'companies') {
    references.push({ path: `companies/${placeId}`, label: `${label} Company` })
  }
  if (placeCollection === 'kitchens') {
    references.push({ path: `kitchens/${placeId}`, label: `${label} Kitchen` })
  }

  return {
    place_id: placeId,
    place_collection: placeCollection,
    role: text(source.role, `${label} role`, 160),
    from_month: month(source.from_month, `${label} start month`),
    from_year: year(source.from_year, `${label} start year`, false) as string,
    to_month: month(source.to_month, `${label} end month`),
    to_year: year(source.to_year, `${label} end year`, false) as string,
    ongoing: boolean(source.ongoing, `${label} ongoing`),
    responsibilities: text(
      source.responsibilities,
      `${label} responsibilities`,
      4_000
    ),
  }
}

function normalizeLanguages(value: unknown) {
  return array(value, 'Languages', ProfessionalConstraints.languages).map(
    (entry, index) => {
      const label = `Language ${index + 1}`
      const source = object(entry, label)
      exactKeys(source, ['language', 'proficiency'], label)
      return {
        language: text(source.language, `${label} name`, 120, true),
        proficiency: text(source.proficiency, `${label} proficiency`, 120),
      }
    }
  )
}

function normalizeCertifications(value: unknown) {
  return array(
    value,
    'Certifications',
    ProfessionalConstraints.certifications
  ).map((entry, index) => {
    const label = `Certification ${index + 1}`
    const source = object(entry, label)
    exactKeys(
      source,
      [
        'name',
        'year',
        'place_name',
        'formatted_address',
        'document_url',
        'image_url',
      ],
      label
    )
    return {
      name: text(source.name, `${label} name`, 240),
      year: year(source.year, `${label} year`, true),
      place_name: text(source.place_name, `${label} place name`, 240),
      formatted_address: text(
        source.formatted_address,
        `${label} address`,
        500
      ),
      document_url: httpsUrl(source.document_url, `${label} document URL`),
      image_url: httpsUrl(source.image_url, `${label} image URL`),
    }
  })
}

function normalizeEducation(value: unknown) {
  return array(value, 'Education', ProfessionalConstraints.education).map(
    (entry, index) => {
      const label = `Education ${index + 1}`
      const source = object(entry, label)
      exactKeys(
        source,
        [
          'institution',
          'degree',
          'start_year',
          'end_year',
          'ongoing',
          'formatted_address',
          'document_url',
          'image_url',
        ],
        label
      )
      return {
        institution: text(source.institution, `${label} institution`, 240),
        degree: text(source.degree, `${label} degree`, 240),
        start_year: year(source.start_year, `${label} start year`, true),
        end_year: year(source.end_year, `${label} end year`, true),
        ongoing: boolean(source.ongoing, `${label} ongoing`),
        formatted_address: text(
          source.formatted_address,
          `${label} address`,
          500
        ),
        document_url: httpsUrl(source.document_url, `${label} document URL`),
        image_url: httpsUrl(source.image_url, `${label} image URL`),
      }
    }
  )
}

function normalizeVolunteering(value: unknown) {
  return array(
    value,
    'Volunteering',
    ProfessionalConstraints.volunteering
  ).map((entry, index) => {
    const label = `Volunteering ${index + 1}`
    const source = object(entry, label)
    exactKeys(
      source,
      [
        'organization',
        'role',
        'from_year',
        'to_year',
        'ongoing',
        'responsibilities',
      ],
      label
    )
    return {
      organization: text(source.organization, `${label} organization`, 240),
      role: text(source.role, `${label} role`, 160),
      from_year: year(source.from_year, `${label} start year`, true),
      to_year: year(source.to_year, `${label} end year`, true),
      ongoing: boolean(source.ongoing, `${label} ongoing`),
      responsibilities: text(
        source.responsibilities,
        `${label} responsibilities`,
        4_000
      ),
    }
  })
}

function normalizeProjects(value: unknown) {
  return array(value, 'Projects', ProfessionalConstraints.projects).map(
    (entry, index) => {
      const label = `Project ${index + 1}`
      const source = object(entry, label)
      exactKeys(
        source,
        [
          'name',
          'role',
          'from_year',
          'to_year',
          'ongoing',
          'responsibilities',
        ],
        label
      )
      return {
        name: text(source.name, `${label} name`, 240),
        role: text(source.role, `${label} role`, 160),
        from_year: year(source.from_year, `${label} start year`, true),
        to_year: year(source.to_year, `${label} end year`, true),
        ongoing: boolean(source.ongoing, `${label} ongoing`),
        responsibilities: text(
          source.responsibilities,
          `${label} responsibilities`,
          4_000
        ),
      }
    }
  )
}

function normalizeStructuredInput(
  field: ProfessionalStructuredField,
  value: unknown
) {
  const references: ReferenceRequirement[] = []
  let items: Record<string, unknown>[]

  if (field === 'relevant_experience' || field === 'other_experience') {
    items = array(value, 'Experience', FIELD_LIMITS[field]).map((entry, index) =>
      normalizeExperience(entry, `Experience ${index + 1}`, references)
    )
  } else if (field === 'languages') {
    items = normalizeLanguages(value)
  } else if (field === 'certifications') {
    items = normalizeCertifications(value)
  } else if (field === 'education') {
    items = normalizeEducation(value)
  } else if (field === 'volunteering') {
    items = normalizeVolunteering(value)
  } else {
    items = normalizeProjects(value)
  }

  return {
    items,
    references: Array.from(
      new Map(references.map(reference => [reference.path, reference])).values()
    ),
  }
}

function runtimeDatabases(event: H3Event) {
  const runtime = useRuntimeConfig(event)
  const fireux = (runtime.public?.fireux ?? {}) as Record<string, unknown>
  const firebase = (runtime.public?.firebaseEcosystem?.firebase ?? {}) as Record<
    string,
    unknown
  >
  const appId = String(fireux.id ?? '').trim()
  const appDatabaseId = String(firebase.databaseId ?? '').trim()
  const identityDatabaseId = String(
    firebase.identityDatabaseId ?? appDatabaseId
  ).trim()
  const profiles = new Set(
    Array.isArray(fireux.profiles)
      ? fireux.profiles.map(value => String(value ?? '').trim()).filter(Boolean)
      : []
  )
  if (
    !isFirestoreDocumentId(appId) ||
    !appDatabaseId ||
    !identityDatabaseId
  ) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Professional runtime authority is not configured.',
    })
  }
  if (!profiles.has('professional')) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Professional profiles are not enabled for this App.',
    })
  }
  return {
    appId,
    appDb: getRuntimeFirestore(appDatabaseId),
    identityDb: getRuntimeIdentityFirestore(identityDatabaseId),
  }
}

export async function updateProfessionalStructuredField(
  event: H3Event,
  input: unknown
) {
  const { uid } = await requireFirebaseBearerUser(event)
  const body = object(input, 'Professional structured update')
  exactKeys(body, ['field', 'items'], 'Professional structured update')
  const field = String(body.field ?? '').trim() as ProfessionalStructuredField
  if (!STRUCTURED_FIELDS.has(field)) fail('Professional structured field is invalid.')
  const normalized = normalizeStructuredInput(field, body.items)
  const { appId, appDb, identityDb } = runtimeDatabases(event)

  const appChecks = [
    appDb.doc(`apps/${appId}`),
    appDb.doc(`apps/${appId}/users/${uid}`),
    appDb.doc(
      `apps/${appId}/${AppProfessionalStorage.collection}/${uid}`
    ),
    ...normalized.references.map(reference => appDb.doc(reference.path)),
  ]
  const appSnapshots = await appDb.getAll(...appChecks)
  const [appSnapshot, membershipSnapshot, appProfileSnapshot, ...referenceSnapshots] = appSnapshots
  const membership = object(membershipSnapshot?.data() ?? {}, 'App membership')
  const membershipRole = String(membership.role ?? '').trim()
  const profiles = Array.isArray(membership.profiles)
    ? membership.profiles.map(value => String(value ?? '').trim())
    : []
  if (
    !appSnapshot?.exists ||
    !membershipSnapshot?.exists ||
    !appProfileSnapshot?.exists ||
    (membershipRole !== 'user' && membershipRole !== 'admin') ||
    !profiles.includes('professional')
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: 'An active Professional profile in this App is required.',
    })
  }
  const missingReference = normalized.references.find(
    (_, index) => !referenceSnapshots[index]?.exists
  )
  if (missingReference) {
    fail(`${missingReference.label} is not available.`)
  }

  const profileRef = identityDb
    .collection(ProfessionalStorage.rootCollection)
    .doc(uid)
  await identityDb.runTransaction(async transaction => {
    const snapshot = await transaction.get(profileRef)
    if (!snapshot.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Professional profile not found.',
      })
    }
    const current = snapshot.data() ?? {}
    const total = [...STRUCTURED_FIELDS].reduce(
      (count, key) =>
        count +
        (key === field
          ? normalized.items.length
          : Array.isArray(current[key])
            ? current[key].length
            : 0),
      0
    )
    if (total > ProfessionalConstraints.structuredTotal) {
      fail(
        `Professional details support at most ${ProfessionalConstraints.structuredTotal} structured items in total.`
      )
    }

    transaction.update(profileRef, {
      [field]: normalized.items,
      updated: serverAuditStamp({ by: uid }),
    })
  })

  return {
    updated: true,
    field,
    count: normalized.items.length,
  }
}
