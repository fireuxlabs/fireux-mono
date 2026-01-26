import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { csv, safeString, safeStringArray } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import type { Ref } from 'vue'
import { chefConfig, type ChefCore } from '../../../../../../../models/profiles/Chef/Chef.model'

type UserLike = Pick<User, 'display_name' | 'avatar'> &
  Partial<Pick<User, 'id' | 'handle' | 'email'>>

export namespace ChefCard {
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
    organizationName: string
  }
}

export function useChefInterface(
  profile?: ProfileRefs<ChefCore> | null,
  userRef?: Ref<User | null | undefined>
) {
  function map(p: ChefCore, u?: UserLike | null): ChefCard.Card {
    const id = safeString(p.id).trim()
    const title = safeString(p.title)
    const subtitle = safeString(p.subtitle)
    const tagline = safeString(p.tagline)

    return {
      id,
      to: id ? `/${chefConfig.collectionName}/${id}` : '',

      avatarUrl: safeString(u?.avatar),

      // Canonical: chef pills are user-hydrated; no legacy profile-name fallbacks.
      displayName: safeString(u?.display_name),

      // Prefer true tagline, else fall back to chef title/subtitle.
      // This makes pills useful even when docs are missing `tagline`.
      tagline: tagline || title || subtitle,
      badges: safeStringArray(p.tags),

      bioShort: safeString(p.bio_short),
      specialtiesCsv: csv(p.specialties),
      locationsCsv: csv(p.locations),
      organizationName: safeString(p.organization_name),
    }
  }

  function card(
    target?: ChefCore | null | undefined,
    userOverride?: UserLike | null
  ): ChefCard.Card | null {
    const p = target ?? profile?.coreProfile.value ?? null
    if (!p) return null
    const u = userOverride ?? userRef?.value ?? null
    const mapped = map(p, u)
    return mapped.id ? mapped : null
  }

  function searchText(target?: ChefCore | null | undefined, userOverride?: UserLike | null): string {
    const p = target ?? profile?.coreProfile.value ?? null
    if (!p) return ''
    const u = userOverride ?? userRef?.value ?? null
    const displayName = safeString(u?.display_name)
    const title = safeString(p.title)
    const tagline = safeString(p.tagline)
    const org = safeString(p.organization_name)
    const id = safeString(p.id)
    return `${displayName} ${title} ${tagline} ${org} ${id}`.trim().toLowerCase()
  }

  return { card, searchText }
}
