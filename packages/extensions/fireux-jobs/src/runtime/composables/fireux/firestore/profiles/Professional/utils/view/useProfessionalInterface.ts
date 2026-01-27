import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { csv, safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import type { Ref } from 'vue'
import { professionalConfig, type ProfessionalCore, type ProfessionalResolved } from '../../../../../../../models/profiles/Professional/Professional.model'

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
    title: string

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
  const resolveUser = (
    target?: ProfessionalCore | ProfessionalResolved | null
  ) => {
    if (target && 'user' in target && target.user) return target.user as UserLike
    return userRef?.value ?? null
  }

  function map(p: ProfessionalCore, u?: UserLike | null): ProfessionalCard.Card {
    const id = safeString(p.id).trim()
    const title = safeString(p.title)

    return {
      id,
      to: id ? `/${professionalConfig.collectionName}/${id}` : '',

      avatarUrl: safeString(u?.avatar),

      // Canonical: professional pills are user-hydrated; no profile-title fallback for display name.
      displayName: safeString(u?.display_name),
      title,

      bioShort: safeString(p.bio_short),
      specialtiesCsv: csv(p.specialties),
      locationsCsv: csv(p.locations),
    }
  }

  function card(
    target?: ProfessionalCore | ProfessionalResolved | null | undefined
  ): ProfessionalCard.Card | null {
    const p = target ?? profile?.coreProfile.value ?? null
    if (!p) return null
    const u = resolveUser(target as ProfessionalCore | ProfessionalResolved | null)
    const mapped = map(p, u)
    return mapped.id ? mapped : null
  }

  function searchText(
    target?: ProfessionalCore | ProfessionalResolved | null | undefined
  ): string {
    const p = target ?? profile?.coreProfile.value ?? null
    if (!p) return ''
    const u = resolveUser(target as ProfessionalCore | ProfessionalResolved | null)
    const displayName = safeString(u?.display_name)
    const title = safeString(p.title)
    const id = safeString(p.id)
    return `${displayName} ${title} ${id}`.trim().toLowerCase()
  }

  return { card, searchText }
}
