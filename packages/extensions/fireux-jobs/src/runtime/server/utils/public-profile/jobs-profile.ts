// Concurrent edit — 2026-07-20 13:42 CEST — Public profile projection: allowlist Agent and Professional directory/detail fields.
import type {
  PublicProfileHandlerConfig,
  PublicProfileMapper,
} from 'fireux-core/runtime/server/utils/public-projection/public-profile.ts'

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function strings(value: unknown, maxItems: number, maxLength = 240): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry.trim().slice(0, maxLength))
    .filter(Boolean)
    .slice(0, maxItems)
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function year(value: unknown): string | number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') return value.trim().slice(0, 16)
  return null
}

function rows(
  value: unknown,
  limit: number,
  mapper: (entry: Record<string, unknown>) => Record<string, unknown>
): Record<string, unknown>[] {
  if (!Array.isArray(value)) return []
  return value.slice(0, limit).map((entry) => mapper(record(entry)))
}

function experience(value: unknown) {
  return rows(value, 50, (entry) => ({
    role: text(entry.role, 160),
    from_month: text(entry.from_month, 16),
    from_year: text(entry.from_year, 16),
    to_month: text(entry.to_month, 16),
    to_year: text(entry.to_year, 16),
    ongoing: entry.ongoing === true,
    responsibilities: text(entry.responsibilities, 4_000),
    place_id: text(entry.place_id, 1_500),
    place_collection: text(entry.place_collection, 120),
  }))
}

export const mapAgentPublicProfile: PublicProfileMapper = (data, mode) => ({
  title: text(data.title, 120),
  summary: text(data.summary, 1_000),
  agent_bio: text(data.agent_bio, 4_000),
  agent_image: text(data.agent_image, 2_048),
  agent_placement_types: strings(data.agent_placement_types, 30),
  tags: strings(data.tags, 20),
  agent_contact_email: text(data.agent_contact_email, 320),
  agent_contact_phone: text(data.agent_contact_phone, 40),
  agent_website_url: text(data.agent_website_url, 2_048),
  contact_email: text(data.contact_email, 320),
  contact_phone: text(data.contact_phone, 40),
  website_url: text(data.website_url, 2_048),
  ...(mode === 'detail'
    ? {
        agent_coverage_areas: strings(data.agent_coverage_areas, 50),
        subtitle: text(data.subtitle, 240),
        tagline: text(data.tagline, 240),
      }
    : {}),
})

export const mapProfessionalPublicProfile: PublicProfileMapper = (data, mode) => ({
  title: text(data.title, 120),
  subtitle: text(data.subtitle, 240),
  tagline: text(data.tagline, 240),
  summary: text(data.summary, 1_000),
  bio: text(data.bio, 4_000),
  image: text(data.image, 2_048),
  positions: strings(data.positions, 30),
  tags: strings(data.tags, 20),
  ...(mode === 'detail'
    ? {
        relevant_experience: experience(data.relevant_experience),
        other_experience: experience(data.other_experience),
        languages: rows(data.languages, 30, (entry) => ({
          language: text(entry.language, 120),
          proficiency: text(entry.proficiency, 120),
        })),
        certifications: rows(data.certifications, 30, (entry) => ({
          name: text(entry.name, 240),
          year: year(entry.year),
          place_name: text(entry.place_name, 240),
          formatted_address: text(entry.formatted_address, 500),
          document_url: text(entry.document_url, 2_048),
          image_url: text(entry.image_url, 2_048),
        })),
        education: rows(data.education, 30, (entry) => ({
          institution: text(entry.institution, 240),
          degree: text(entry.degree, 240),
          start_year: year(entry.start_year),
          end_year: year(entry.end_year),
          ongoing: entry.ongoing === true,
          formatted_address: text(entry.formatted_address, 500),
          document_url: text(entry.document_url, 2_048),
          image_url: text(entry.image_url, 2_048),
        })),
        volunteering: rows(data.volunteering, 30, (entry) => ({
          organization: text(entry.organization, 240),
          role: text(entry.role, 160),
          from_year: year(entry.from_year),
          to_year: year(entry.to_year),
          ongoing: entry.ongoing === true,
          responsibilities: text(entry.responsibilities, 4_000),
        })),
        projects: rows(data.projects, 30, (entry) => ({
          name: text(entry.name, 240),
          role: text(entry.role, 160),
          from_year: year(entry.from_year),
          to_year: year(entry.to_year),
          ongoing: entry.ongoing === true,
          responsibilities: text(entry.responsibilities, 4_000),
        })),
      }
    : {}),
})

export const publicAgentProfileConfig: PublicProfileHandlerConfig = {
  collection: 'agents',
  kind: 'agent',
  mapProfile: mapAgentPublicProfile,
}

export const publicProfessionalProfileConfig: PublicProfileHandlerConfig = {
  collection: 'professionals',
  kind: 'professional',
  mapProfile: mapProfessionalPublicProfile,
}
