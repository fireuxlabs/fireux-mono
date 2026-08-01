import { createError } from 'h3'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'
import { ProfessionalConstraints } from '../../models/profiles/Professional/Professional.model.ts'

export type ProfessionalStructuredField =
  | 'relevant_experience'
  | 'other_experience'
  | 'languages'
  | 'certifications'
  | 'education'
  | 'volunteering'
  | 'projects'

export const PROFESSIONAL_STRUCTURED_FIELDS =
  new Set<ProfessionalStructuredField>([
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

export function failProfessionalStructuredInput(statusMessage: string): never {
  throw createError({ statusCode: 400, statusMessage })
}

export function requireProfessionalStructuredObject(
  value: unknown,
  label: string
): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    failProfessionalStructuredInput(`${label} must be an object.`)
  }
  return value as Record<string, unknown>
}

export function assertProfessionalStructuredKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
  label: string
): void {
  const allowedSet = new Set(allowed)
  const unsupported = Object.keys(value).find((key) => !allowedSet.has(key))
  if (unsupported) {
    failProfessionalStructuredInput(
      `${label} contains unsupported field ${unsupported}.`
    )
  }
}

function array(value: unknown, label: string, maximum: number): unknown[] {
  if (!Array.isArray(value)) {
    failProfessionalStructuredInput(`${label} must be a list.`)
  }
  if (value.length > maximum) {
    failProfessionalStructuredInput(
      `${label} supports at most ${maximum} items.`
    )
  }
  return value
}

function text(
  value: unknown,
  label: string,
  maximum: number,
  required = false
): string {
  if (typeof value !== 'string') {
    failProfessionalStructuredInput(`${label} must be text.`)
  }
  const normalized = value.trim()
  if (required && !normalized) {
    failProfessionalStructuredInput(`${label} is required.`)
  }
  if (normalized.length > maximum) {
    failProfessionalStructuredInput(
      `${label} must be ${maximum} characters or less.`
    )
  }
  return normalized
}

function boolean(value: unknown, label: string): boolean {
  if (typeof value !== 'boolean') {
    failProfessionalStructuredInput(`${label} must be true or false.`)
  }
  return value
}

function year(value: unknown, label: string, nullable: boolean): string | null {
  if (nullable && (value === null || value === '')) return null
  const normalized = text(value, label, 4)
  if (!normalized && !nullable) return ''
  if (!/^\d{4}$/.test(normalized)) {
    failProfessionalStructuredInput(`${label} must contain four digits.`)
  }
  const number = Number(normalized)
  if (
    number < ProfessionalConstraints.yearMin ||
    number > ProfessionalConstraints.yearMax
  ) {
    failProfessionalStructuredInput(`${label} is outside the supported range.`)
  }
  return normalized
}

function month(value: unknown, label: string): string {
  const normalized = text(value, label, 3)
  if (!MONTHS.has(normalized)) {
    failProfessionalStructuredInput(
      `${label} must use a three-letter month.`
    )
  }
  return normalized
}

function httpsUrl(value: unknown, label: string): string {
  const normalized = text(value, label, ProfessionalConstraints.urlLength)
  if (!normalized) return ''
  let parsed: URL
  try {
    parsed = new URL(normalized)
  } catch {
    failProfessionalStructuredInput(`${label} must be a valid HTTPS URL.`)
  }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
    failProfessionalStructuredInput(
      `${label} must use HTTPS without embedded credentials.`
    )
  }
  return parsed.toString()
}

function documentId(value: unknown, label: string): string {
  const id = text(value, label, 1_500, true)
  if (!isFirestoreDocumentId(id)) {
    failProfessionalStructuredInput(`${label} is invalid.`)
  }
  return id
}

function normalizeExperience(
  value: unknown,
  label: string,
  references: ReferenceRequirement[]
) {
  const source = requireProfessionalStructuredObject(value, label)
  assertProfessionalStructuredKeys(
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
    failProfessionalStructuredInput(
      `${label} Place collection is unsupported.`
    )
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
      const source = requireProfessionalStructuredObject(entry, label)
      assertProfessionalStructuredKeys(
        source,
        ['language', 'proficiency'],
        label
      )
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
    const source = requireProfessionalStructuredObject(entry, label)
    assertProfessionalStructuredKeys(
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
      formatted_address: text(source.formatted_address, `${label} address`, 500),
      document_url: httpsUrl(source.document_url, `${label} document URL`),
      image_url: httpsUrl(source.image_url, `${label} image URL`),
    }
  })
}

function normalizeEducation(value: unknown) {
  return array(value, 'Education', ProfessionalConstraints.education).map(
    (entry, index) => {
      const label = `Education ${index + 1}`
      const source = requireProfessionalStructuredObject(entry, label)
      assertProfessionalStructuredKeys(
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

function normalizeDatedWork(
  value: unknown,
  field: 'Volunteering' | 'Projects',
  maximum: number
) {
  return array(value, field, maximum).map((entry, index) => {
    const label = `${field === 'Projects' ? 'Project' : 'Volunteering'} ${index + 1}`
    const source = requireProfessionalStructuredObject(entry, label)
    const identityKey = field === 'Projects' ? 'name' : 'organization'
    assertProfessionalStructuredKeys(
      source,
      [
        identityKey,
        'role',
        'from_year',
        'to_year',
        'ongoing',
        'responsibilities',
      ],
      label
    )
    return {
      [identityKey]: text(source[identityKey], `${label} ${identityKey}`, 240),
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

export function normalizeProfessionalStructuredInput(
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
    items = normalizeDatedWork(
      value,
      'Volunteering',
      ProfessionalConstraints.volunteering
    )
  } else {
    items = normalizeDatedWork(
      value,
      'Projects',
      ProfessionalConstraints.projects
    )
  }
  return {
    items,
    references: Array.from(
      new Map(references.map((reference) => [reference.path, reference])).values()
    ),
  }
}
