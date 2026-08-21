// FILE: packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional/Professional.model.ts
// User-owned Professional profile and directory summary.
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: keep Professional storage domain-only.
// Concurrent edit — 2026-07-20 20:14 CEST — Repo Efficiency Pass 2 of 6: own exact storage, provision, and public detail/directory shapes.
// Concurrent edit — 2026-07-21 15:26 CEST — Misebox Nitro startup fix: resolve server-loaded core model and Firebase type imports explicitly.

import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type {
  CertificationItem,
  EducationItem,
  LanguageProficiency,
  OtherExperienceItem,
  ProjectItem,
  RelevantExperienceItem,
  VolunteeringItem,
} from './supporting'

export type {
  CertificationItem,
  EducationItem,
  ExperienceItem,
  LanguageProficiency,
  OtherExperienceItem,
  ProjectItem,
  RelevantExperienceItem,
  VolunteeringItem,
} from './supporting'

/**
 * Runtime models canon: docs/ai/gpt-context.md
 *
 * Family: Identity
 * Storage: User-owned profile
 * Path: /users/<userId>/profiles/professional
 *
 * Decision note:
 * - Professional is a User-owned identity capability/profile record.
 */
export const ProfessionalStorage = {
  shape: 'user-owned',
  path: 'users/{userId}/profiles/professional',
  collection: 'profiles',
  document: 'professional',
  idParam: 'userId',
} as const

export const ProfessionalConstraints = {
  positions: 20,
  tags: 20,
  relevantExperience: 12,
  otherExperience: 12,
  languages: 12,
  certifications: 8,
  education: 8,
  volunteering: 8,
  projects: 8,
  structuredTotal: 24,
  stringItemLength: 240,
  urlLength: 2_048,
  yearMin: 1_000,
  yearMax: 9_999,
} as const

export const ProfessionalModel = {
  id: '' as string,
  kind: 'professional' as const,
  title: '' as string,
  subtitle: '' as string,
  tagline: '' as string,
  summary: '' as string,
  bio: '' as string,
  image: '' as string,
  positions: [] as string[],
  tags: [] as string[],
  relevant_experience: [] as RelevantExperienceItem[],
  other_experience: [] as OtherExperienceItem[],
  languages: [] as LanguageProficiency[],
  certifications: [] as CertificationItem[],
  education: [] as EducationItem[],
  volunteering: [] as VolunteeringItem[],
  projects: [] as ProjectItem[],
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type Professional = {
  [K in keyof typeof ProfessionalModel]: (typeof ProfessionalModel)[K]
}

export type ProfessionalProfile = Omit<
  Professional,
  'created' | 'updated'
>
export type ProfessionalProfilePayload = Omit<
  ProfessionalProfile,
  'id'
>
export type ProfessionalDirectoryProfilePayload = Pick<
  ProfessionalProfilePayload,
  | 'title'
  | 'subtitle'
  | 'tagline'
  | 'summary'
  | 'bio'
  | 'image'
  | 'positions'
  | 'tags'
>
export type ProfessionalDirectoryProfile =
  ProfessionalDirectoryProfilePayload &
    Pick<ProfessionalProfile, 'id'>

export type ProfessionalCreateInput = Omit<
  Professional,
  'id' | 'created' | 'updated'
>
export type ProfessionalUpdateInput = Partial<
  Omit<Professional, 'id' | 'created' | 'updated'>
>

export function createProfessionalProfileSeed(): ProfessionalCreateInput {
  return {
    title: ProfessionalModel.title,
    kind: ProfessionalModel.kind,
    subtitle: ProfessionalModel.subtitle,
    tagline: ProfessionalModel.tagline,
    summary: ProfessionalModel.summary,
    bio: ProfessionalModel.bio,
    image: ProfessionalModel.image,
    positions: [...ProfessionalModel.positions],
    tags: [...ProfessionalModel.tags],
    relevant_experience: [...ProfessionalModel.relevant_experience],
    other_experience: [...ProfessionalModel.other_experience],
    languages: [...ProfessionalModel.languages],
    certifications: [...ProfessionalModel.certifications],
    education: [...ProfessionalModel.education],
    volunteering: [...ProfessionalModel.volunteering],
    projects: [...ProfessionalModel.projects],
  }
}
