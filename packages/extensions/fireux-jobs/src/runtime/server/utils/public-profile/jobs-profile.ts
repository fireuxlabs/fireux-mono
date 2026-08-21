// Concurrent edit — 2026-07-20 13:42 CEST — Public profile projection: allowlist Agent and Professional directory/detail fields.
// Concurrent edit — 2026-07-20 19:14 CEST — Repo Efficiency Pass 2 of 6: project exact bounded profiles with safe URLs and Place ids.
// Concurrent edit — 2026-07-20 23:01 CEST — Misebox dev recovery: make workspace runtime imports explicit for Nitro resolution.
// Concurrent edit — 2026-07-21 13:11 CEST — Cleanbox-to-Werkbox profile correction: retain the canonical persisted experience discriminator allowlist.
import type {
  ProfileDirectoryConfig,
  ProfileDirectoryMapper,
} from 'fireux-core/runtime/user/server/directory/profile-directory'
import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestoreDocumentId'
import { readHttpsUrl } from 'fireux-core/runtime/utils/httpsUrl'
import { ProfessionalConstraints } from '../../../models/profiles/Professional/Professional.model'

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function strings(value: unknown, maxItems: number, maxLength = 240): string[] {
  if (
    !Array.isArray(value) ||
    value.length > maxItems ||
    value.some(
      (entry) => typeof entry !== 'string' || entry.trim().length > maxLength
    )
  ) {
    return []
  }
  return value
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry.trim().slice(0, maxLength))
    .filter(Boolean)
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function year(value: unknown): string | null {
  if (typeof value === 'string' && /^[1-9]\d{3}$/.test(value.trim())) {
    return value.trim()
  }
  return null
}

function experienceMonth(value: unknown): string | null {
  const normalized = text(value, 16)
  return [
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
  ].includes(normalized)
    ? normalized
    : null
}

function experienceYear(value: unknown): string | null {
  const normalized = text(value, 16)
  return normalized === '' || /^[1-9]\d{3}$/.test(normalized)
    ? normalized
    : null
}

function rows(
  value: unknown,
  limit: number,
  mapper: (entry: Record<string, unknown>) => Record<string, unknown> | null
): Record<string, unknown>[] {
  if (!Array.isArray(value) || value.length > limit) return []
  const mapped = value.map((entry) => mapper(record(entry)))
  return mapped.every(Boolean) ? (mapped as Record<string, unknown>[]) : []
}

function experience(value: unknown, limit: number) {
  return rows(value, limit, (entry) => {
    const placeId = text(entry.place_id, 1_500)
    const placeCollection = text(entry.place_collection, 120)
    const fromMonth = experienceMonth(entry.from_month)
    const fromYear = experienceYear(entry.from_year)
    const toMonth = experienceMonth(entry.to_month)
    const toYear = experienceYear(entry.to_year)
    if (
      !isFirestoreDocumentId(placeId) ||
      !['', 'kitchens', 'companies'].includes(placeCollection) ||
      fromMonth == null ||
      fromYear == null ||
      toMonth == null ||
      toYear == null
    ) {
      return null
    }
    return {
      role: text(entry.role, 160),
      from_month: fromMonth,
      from_year: fromYear,
      to_month: toMonth,
      to_year: toYear,
      ongoing: entry.ongoing === true,
      responsibilities: text(entry.responsibilities, 4_000),
      place_id: placeId,
      place_collection: placeCollection,
    }
  })
}

export const mapAgentProfile: ProfileDirectoryMapper = (data, mode) => ({
  title: text(data.title, 120),
  summary: text(data.summary, 1_000),
  agent_bio: text(data.agent_bio, 4_000),
  agent_image: readHttpsUrl(data.agent_image),
  agent_placement_types: strings(data.agent_placement_types, 20),
  tags: strings(data.tags, 20),
  agent_contact_email: text(data.agent_contact_email, 320),
  agent_contact_phone: text(data.agent_contact_phone, 40),
  agent_website_url: readHttpsUrl(data.agent_website_url),
  ...(mode === 'detail'
    ? {
        agent_coverage_areas: strings(data.agent_coverage_areas, 20),
        subtitle: text(data.subtitle, 240),
        tagline: text(data.tagline, 240),
      }
    : {}),
})

export const mapProfessionalProfile: ProfileDirectoryMapper = (data, mode) => {
  const structuredCount = [
    'relevant_experience',
    'other_experience',
    'languages',
    'certifications',
    'education',
    'volunteering',
    'projects',
  ].reduce(
    (count, key) => count + (Array.isArray(data[key]) ? data[key].length : 0),
    0
  )
  if (structuredCount > ProfessionalConstraints.structuredTotal) return null

  return {
    title: text(data.title, 120),
    subtitle: text(data.subtitle, 240),
    tagline: text(data.tagline, 240),
    summary: text(data.summary, 1_000),
    bio: text(data.bio, 4_000),
    image: readHttpsUrl(data.image),
    positions: strings(
      data.positions,
      ProfessionalConstraints.positions,
      ProfessionalConstraints.stringItemLength
    ),
    tags: strings(
      data.tags,
      ProfessionalConstraints.tags,
      ProfessionalConstraints.stringItemLength
    ),
    ...(mode === 'detail'
      ? {
          relevant_experience: experience(
            data.relevant_experience,
            ProfessionalConstraints.relevantExperience
          ),
          other_experience: experience(
            data.other_experience,
            ProfessionalConstraints.otherExperience
          ),
          languages: rows(data.languages, ProfessionalConstraints.languages, (entry) => ({
          language: text(entry.language, 120),
          proficiency: text(entry.proficiency, 120),
        })),
          certifications: rows(data.certifications, ProfessionalConstraints.certifications, (entry) => ({
          name: text(entry.name, 240),
          year: year(entry.year),
          place_name: text(entry.place_name, 240),
          formatted_address: text(entry.formatted_address, 500),
            document_url: readHttpsUrl(entry.document_url),
            image_url: readHttpsUrl(entry.image_url),
        })),
          education: rows(data.education, ProfessionalConstraints.education, (entry) => ({
          institution: text(entry.institution, 240),
          degree: text(entry.degree, 240),
          start_year: year(entry.start_year),
          end_year: year(entry.end_year),
          ongoing: entry.ongoing === true,
          formatted_address: text(entry.formatted_address, 500),
            document_url: readHttpsUrl(entry.document_url),
            image_url: readHttpsUrl(entry.image_url),
        })),
          volunteering: rows(data.volunteering, ProfessionalConstraints.volunteering, (entry) => ({
          organization: text(entry.organization, 240),
          role: text(entry.role, 160),
          from_year: year(entry.from_year),
          to_year: year(entry.to_year),
          ongoing: entry.ongoing === true,
          responsibilities: text(entry.responsibilities, 4_000),
        })),
          projects: rows(data.projects, ProfessionalConstraints.projects, (entry) => ({
          name: text(entry.name, 240),
          role: text(entry.role, 160),
          from_year: year(entry.from_year),
          to_year: year(entry.to_year),
          ongoing: entry.ongoing === true,
          responsibilities: text(entry.responsibilities, 4_000),
        })),
        }
      : {}),
  }
}

export const agentProfileDirectory: ProfileDirectoryConfig = {
  kind: 'agent',
  mapProfile: mapAgentProfile,
}

export const professionalProfileDirectory: ProfileDirectoryConfig = {
  kind: 'professional',
  mapProfile: mapProfessionalProfile,
}
