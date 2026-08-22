import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { Professional } from '../../../models/profiles/Professional/Professional.model'

export type * from '../../../models/profiles/Professional/Professional.model'
export const ProfessionalStorage = { shape: 'user-owned', path: 'users/{userId}/profiles/professional', collection: 'profiles', document: 'professional', idParam: 'userId' } as const
export const ProfessionalConstraints = { positions: 20, tags: 20, relevantExperience: 12, otherExperience: 12, languages: 12, certifications: 8, education: 8, volunteering: 8, projects: 8, structuredTotal: 24, stringItemLength: 240, urlLength: 2048, yearMin: 1000, yearMax: 9999 } as const
export const ProfessionalDefaults: Professional = { id: '', kind: 'professional', title: '', subtitle: '', tagline: '', summary: '', bio: '', image: '', positions: [], tags: [], relevant_experience: [], other_experience: [], languages: [], certifications: [], education: [], volunteering: [], projects: [], created: { at: {} as FirebaseTimestamp, by: undefined as FireuxStamped['created']['by'] }, updated: { at: {} as FirebaseTimestamp, by: undefined as FireuxStamped['updated']['by'] } }
export type ProfessionalProfile = Omit<Professional, 'created' | 'updated'>
export type ProfessionalProfilePayload = Omit<ProfessionalProfile, 'id'>
export type ProfessionalDirectoryProfilePayload = Pick<ProfessionalProfilePayload, 'title' | 'subtitle' | 'tagline' | 'summary' | 'bio' | 'image' | 'positions' | 'tags'>
export type ProfessionalDirectoryProfile = ProfessionalDirectoryProfilePayload & Pick<ProfessionalProfile, 'id'>
export type ProfessionalCreateInput = Omit<Professional, 'id' | 'created' | 'updated'>
export type ProfessionalUpdateInput = Partial<Omit<Professional, 'id' | 'created' | 'updated'>>
export function createProfessionalProfileSeed(): ProfessionalCreateInput { const { id: _id, created: _created, updated: _updated, ...seed } = ProfessionalDefaults; return { ...seed, positions: [], tags: [], relevant_experience: [], other_experience: [], languages: [], certifications: [], education: [], volunteering: [], projects: [] } }
