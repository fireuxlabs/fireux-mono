// FILE: packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface.ts

import type { Ref } from 'vue'
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import { professionalConfig, type ProfessionalCore } from '../../../../../../../models/profiles/Professional/Professional.model.ts'

export namespace ProfessionalCard {
  export type Card = {
    id: string
    to: string

    // Media (empty string means unset)
    avatarUrl: string

    displayName: string
    tagline: string
    badges: string[]

    bioShort: string
    specialties: string
    locations: string
  }
}

export function useProfessionalInterface(
  profile: ProfileRefs<ProfessionalCore>,
  userRef?: Ref<User | null | undefined>
) {
  function readField(target: unknown, key: string): unknown {
    if (typeof target !== 'object' || target === null) return undefined
    if (!(key in target)) return undefined
    return (target as Record<string, unknown>)[key]
  }

  function resolveAvatar(currentProfile: ProfessionalCore, user?: User | null): string {
    const fromUser = user?.avatar
    if (typeof fromUser === 'string' && fromUser.trim()) return fromUser.trim()

    const avatarUrl = readField(currentProfile, 'avatar_url')
    if (typeof avatarUrl === 'string' && avatarUrl.trim()) return avatarUrl.trim()

    const avatar = readField(currentProfile, 'avatar')
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

  function map(currentProfile: ProfessionalCore, user?: User | null): ProfessionalCard.Card {
    const displayName = user?.display_name ?? currentProfile.title

    return {
      id: currentProfile.id,
      to: `/${professionalConfig.collectionName}/${currentProfile.id}`,

      avatarUrl: resolveAvatar(currentProfile, user),

      displayName,
      tagline: currentProfile.tagline,

      // Caller-owned, aligned with useUserInterface
      badges: [],

      bioShort: currentProfile.bio_short,
      specialties: resolveCsv(readField(currentProfile, 'specialties')),
      locations: resolveCsv(readField(currentProfile, 'locations')),
    }
  }

  function card(target?: ProfessionalCore | null | undefined): ProfessionalCard.Card | null {
    const currentProfile = target ?? profile.coreProfile.value ?? null
    const user = userRef?.value ?? null
    return currentProfile ? map(currentProfile, user) : null
  }

  return { card }
}
