import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { Ref } from 'vue'
import {
  professionalConfig,
  type ProfessionalCore,
  type ProfessionalUserSummary,
} from '../../../../../../../models/profiles/Professional/Professional.model'

type UserLike = ProfessionalUserSummary
type ProfessionalTarget = ProfessionalCore & { user?: UserLike | null }

export namespace ProfessionalCard {
  export type Card = {
    id: string
    to: string
    avatarUrl: string
    image: string
    displayName: string
    title: string
    summary: string
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

    const image = safeString(p.image)
    const avatar = safeString(user?.avatar)

    return {
      id,
      to: `/${professionalConfig.collectionName}/${encodeURIComponent(id)}`,
      avatarUrl: avatar,
      image,
      displayName: safeString(user?.display_name),
      title: safeString(p.title),
      summary: safeString(p.summary),
    }
  }

  return { card }
}
