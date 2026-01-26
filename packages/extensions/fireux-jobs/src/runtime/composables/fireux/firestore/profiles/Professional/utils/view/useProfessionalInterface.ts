import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { csv, safeString, safeStringArray } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import type { Ref } from 'vue'
import { professionalConfig, type ProfessionalCore } from '../../../../../../../models/profiles/Professional/Professional.model'

type UserLike = Pick<User, 'display_name' | 'avatar'> &
  Partial<Pick<User, 'id' | 'handle' | 'email'>>

export namespace ProfessionalCard {
  export type Card = {
    id: string
    to: string

    // Media (empty string means unset)
    avatarUrl: string

    // Primary display fields
    displayName: string
    tagline: string

    // Status/label chips
    badges: string[]

    // Summary fields for list views
    bioShort: string
    specialtiesCsv: string
    locationsCsv: string
  }
}

export function useProfessionalInterface(
  profile?: ProfileRefs<ProfessionalCore> | null,
  userRef?: Ref<User | null | undefined>
) {
  function map(p: ProfessionalCore, u?: UserLike | null): ProfessionalCard.Card {
    const id = safeString(p.id).trim()
    const title = safeString(p.title)
    const subtitle = safeString(p.subtitle)
    const tagline = safeString(p.tagline)

    return {
      id,
      to: id ? `/${professionalConfig.collectionName}/${id}` : '',

      avatarUrl: safeString(u?.avatar),

      // Canonical: professional pills are user-hydrated; no profile-title fallback for display name.
      displayName: safeString(u?.display_name),
      tagline: tagline || title || subtitle,
      badges: safeStringArray(p.tags),

      bioShort: safeString(p.bio_short),
      specialtiesCsv: csv(p.specialties),
      locationsCsv: csv(p.locations),
    }
  }

  function card(
    target?: ProfessionalCore | null | undefined,
    userOverride?: UserLike | null
  ): ProfessionalCard.Card | null {
    const p = target ?? profile?.coreProfile.value ?? null
    if (!p) return null
    const u = userOverride ?? userRef?.value ?? null
    const mapped = map(p, u)
    return mapped.id ? mapped : null
  }

  function searchText(target?: ProfessionalCore | null | undefined, userOverride?: UserLike | null): string {
    const p = target ?? profile?.coreProfile.value ?? null
    if (!p) return ''
    const u = userOverride ?? userRef?.value ?? null
    const displayName = safeString(u?.display_name)
    const title = safeString(p.title)
    const tagline = safeString(p.tagline)
    const id = safeString(p.id)
    return `${displayName} ${title} ${tagline} ${id}`.trim().toLowerCase()
  }

  return { card, searchText }
}
