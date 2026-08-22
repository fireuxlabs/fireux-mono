import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'

export type Agent = FireuxStamped & { id: string; kind: 'agent'; title: string; summary: string; agent_bio: string; agent_image: string; agent_placement_types: string[]; agent_coverage_areas: string[]; agent_contact_email: string; agent_contact_phone: string; agent_website_url: string; subtitle: string; tagline: string; tags: string[] }
