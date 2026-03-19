import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import {
    resolveProfileBadges,
    resolveProfileDisplayName,
    resolveProfileImage,
    resolveProfileSummary,
    resolveSecondaryAvatarUrl,
    safeString,
} from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { Ref } from 'vue'
import type { ProfessionalCore, ProfessionalUserSummary } from '../../../../../../../models/profiles/Professional/Professional.model'
import { professionalConfig } from '../../config/professionalConfig'

type UserLike = ProfessionalUserSummary
type ProfessionalTarget = ProfessionalCore & { user?: UserLike | null }

export namespace ProfessionalCard {
  export type Card = {
    id: string
    to: string
    avatarUrl: string
    secondaryAvatarUrl?: string
    image: string
    displayName: string
    title: string
    summary: string
    badges: string[]
  }
}

export function useProfessionalInterface(
  profile?: ProfileRefs<ProfessionalCore> | null,
  userRef?: Ref<UserLike | null | undefined>
) {
  function card(
    target?: ProfessionalTarget | null | undefined,
    userOverride?: UserLike | null
  ): ProfessionalCard.Card | null {
    const p = target ?? profile?.coreProfile.value ?? null
    if (!p) return null

    const user = target?.user ?? userOverride ?? userRef?.value ?? null
    const id =
      safeString((p as any).id).trim() ||
      safeString((p as any).owner_uid).trim() ||
      safeString(user?.id).trim()
    if (!id) return null

    const image = resolveProfileImage([p.image])
    const avatar = safeString(user?.avatar)
    const summary = resolveProfileSummary([p.summary, p.bio])
    const badges = resolveProfileBadges([p.tags])
    const secondaryAvatarUrl = resolveSecondaryAvatarUrl(image, avatar)

    return {
      id,
      to: `/${professionalConfig.collectionName}/${encodeURIComponent(id)}`,
      avatarUrl: avatar,
      secondaryAvatarUrl,
      image,
      displayName: resolveProfileDisplayName([user?.display_name]),
      title: safeString(p.title),
      summary,
      badges,
    }
  }

  function searchText(target: ProfessionalTarget): string {
    const mapped = card(target, target.user ?? userRef?.value ?? null)

    return [
      mapped?.id ?? '',
      mapped?.displayName ?? '',
      mapped?.title ?? '',
      mapped?.summary ?? '',
      ...(mapped?.badges ?? []),
    ]
      .join(' ')
      .trim()
      .toLowerCase()
  }

  return { card, searchText }
}
