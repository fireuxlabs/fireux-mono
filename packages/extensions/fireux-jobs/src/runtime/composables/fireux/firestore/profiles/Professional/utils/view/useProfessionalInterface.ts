import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { useUserFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/user/fetch/useUserFetch'
import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import { computed } from 'vue'
import { professionalConfig, type ProfessionalCore, type ProfessionalResolved } from '../../../../../../../models/profiles/Professional/Professional.model'

type UserLike = Pick<User, 'display_name' | 'avatar'> &
  Partial<Pick<User, 'id' | 'handle' | 'email'>>

export namespace ProfessionalCard {
  export type Card = {
    id: string
    to: string

    // Media (empty string means unset)
    avatarUrl: string
    secondaryAvatarUrl?: string

    // Primary display fields
    displayName: string
    title: string

    // Summary fields for list views
    bioShort: string
    locationsCsv: string
  }
}

export function useProfessionalInterface(
  profile?: ProfileRefs<ProfessionalCore> | null
) {
  const profileUser = profile
    ? useUserFetch(computed(() => profile.coreProfile.value?.id ?? null))
    : null
  const hydratedUser = computed(() => profileUser?.user.value ?? null)

  const resolveUser = (
    target?: ProfessionalCore | ProfessionalResolved | null
  ) => {
    if (target && 'user' in target && target.user) return target.user as UserLike
    if (!target || target === profile?.coreProfile.value) return hydratedUser.value as UserLike
    return null
  }

  function map(p: ProfessionalCore, u?: UserLike | null): ProfessionalCard.Card {
    const id = safeString(p.id).trim()
    const headline = safeString(p.job_title)
    const summary = safeString(p.summary)
    const profileImage = safeString(p.image)
    const userAvatar = safeString(u?.avatar)
    const secondaryAvatarUrl = profileImage && userAvatar && profileImage !== userAvatar
      ? userAvatar
      : ''
    const positions = Array.isArray(p.positions) ? p.positions : []

    return {
      id,
      to: id ? `/${professionalConfig.collectionName}/${id}` : '',

      avatarUrl: profileImage || userAvatar,
      secondaryAvatarUrl,

      // Canonical: professional pills are user-hydrated; no profile-title fallback for display name.
      displayName: safeString(u?.display_name),
      title: headline,

      bioShort: summary,
      locationsCsv: '',
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
    const headline = safeString(p.job_title)
    const summary = safeString(p.summary)
    const id = safeString(p.id)
    return `${displayName} ${headline} ${summary} ${id}`.trim().toLowerCase()
  }

  return { card, searchText }
}
