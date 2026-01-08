// FILE: packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface.ts

import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { professionalConfig, type ProfessionalCore } from '../../../../../../../models/profiles/Professional/Professional.model.ts'

export namespace ProfessionalCard {
  export type Card = {
    id: string
    to: string
    avatarUrl: string
    displayName: string
    tagline: string
    badges: string[]
    bioShort: string
    specialties: string
    locations: string
  }
}

export function useProfessionalInterface(profile: ProfileRefs<ProfessionalCore>) {
  function resolveProfile(target?: ProfessionalCore | null | undefined): ProfessionalCore | null {
    return target ?? profile.coreProfile.value ?? null
  }

  function resolveAvatar(target?: ProfessionalCore | null | undefined): string {
    const currentProfile = resolveProfile(target)
    if (!currentProfile) return ''

    const avatarUrl = (currentProfile as any).avatar_url
    if (typeof avatarUrl === 'string' && avatarUrl.trim()) return avatarUrl.trim()

    const avatar = (currentProfile as any).avatar
    if (typeof avatar === 'string' && avatar.trim()) return avatar.trim()

    return ''
  }

  function resolveCsv(value: unknown): string {
    if (Array.isArray(value)) {
      return value
        .filter((x) => typeof x === 'string')
        .map((s) => s.trim())
        .filter(Boolean)
        .join(', ')
    }
    if (typeof value === 'string') return value.trim()
    return ''
  }

  function card(target: ProfessionalCore): ProfessionalCard.Card
  function card(target?: ProfessionalCore | null | undefined): ProfessionalCard.Card | null
  function card(target?: ProfessionalCore | null | undefined): ProfessionalCard.Card | null {
    const currentProfile = resolveProfile(target)
    if (!currentProfile) return null

    return {
      id: currentProfile.id,
      to: `/${professionalConfig.collectionName}/${currentProfile.id}`,
      avatarUrl: resolveAvatar(currentProfile),
      displayName: currentProfile.title,
      tagline: currentProfile.tagline,
      badges: currentProfile.badges,
      bioShort: currentProfile.bio_short,
      specialties: resolveCsv((currentProfile as any).specialties),
      locations: resolveCsv((currentProfile as any).locations),
    }
  }

  return { card }
}
