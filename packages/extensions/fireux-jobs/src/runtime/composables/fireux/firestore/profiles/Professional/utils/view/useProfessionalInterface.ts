import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
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
  profile: ProfileRefs<ProfessionalCore>,
  userRef?: Ref<User | null | undefined>
) {
  function map(p: ProfessionalCore, u?: UserLike | null): ProfessionalCard.Card {
    const title = p.title
    const subtitle = p.subtitle
    const tagline = p.tagline
    const tags = p.tags

    return {
      id: p.id,
      to: `/${professionalConfig.collectionName}/${p.id}`,

      avatarUrl: u?.avatar ?? '',

      // Canonical: professional pills are user-hydrated; no profile-title fallback for display name.
      displayName: u?.display_name ?? '',
      tagline: tagline || title || subtitle,
      badges: tags,

      bioShort: p.bio_short,
      specialtiesCsv: p.specialties.join(', '),
      locationsCsv: p.locations.join(', '),
    }
  }

  function card(
    target?: ProfessionalCore | null | undefined,
    userOverride?: UserLike | null
  ): ProfessionalCard.Card | null {
    const p = target ?? profile.coreProfile.value ?? null
    if (!p) return null
    const u = userOverride ?? userRef?.value ?? null
    return map(p, u)
  }

  function searchText(target?: ProfessionalCore | null | undefined): string {
    const p = target ?? profile.coreProfile.value ?? null
    if (!p) return ''
    const u = userRef?.value ?? null
    const displayName = u?.display_name ?? ''
    return `${displayName} ${p.title} ${p.tagline} ${p.id}`.trim().toLowerCase()
  }

  return { card, searchText }
}
