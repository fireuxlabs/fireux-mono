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

    // Canonical media: hydrated user avatar only (empty string means unset).
    avatarUrl: string
    secondaryAvatarUrl?: string

    // Primary display fields
    displayName: string
    tagline: string

    // Status/label chips
    badges: string[]

    // Summary fields for list views
    summary: string
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
    const headline = safeString(p.chef_headline) || safeString(p.title)
    const summary = safeString(p.summary)
    const signatureDishes =
      safeStringArray(p.chef_signature_dishes).length
        ? safeStringArray(p.chef_signature_dishes)
        : safeStringArray(p.specialties)
    const org = safeString(p.chef_organization_name) || safeString(p.organization_name)
    const userAvatar = safeString(u?.avatar)

    return {
      id,
      to: id ? `/${chefConfig.collectionName}/${id}` : '',

      avatarUrl: userAvatar,

      // Canonical: chef pills are user-hydrated; no legacy profile-name fallbacks.
      displayName: safeString(u?.display_name),

      // Prefer true tagline, else fall back to chef title/subtitle.
      // This makes pills useful even when docs are missing `tagline`.
      tagline: headline,
      badges: signatureDishes,

      summary,
      specialtiesCsv: csv(signatureDishes),
      locationsCsv: csv(p.locations),
      organizationName: org,
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

  return { card }
}
