import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import { chefConfig } from 'fireux-kitchens/runtime/composables/fireux/firestore/profiles/Chef/config/chefConfig'
import type { ChefCore } from 'fireux-kitchens/runtime/models/profiles/Chef/Chef.model'
import type { Ref } from 'vue'

type UserLike = Pick<User, 'display_name' | 'avatar'> & Partial<Pick<User, 'id'>>

export namespace ChefCard {
  export type Card = {
    id: string
    to: string
    avatarUrl: string
    displayName: string
    chef_headline: string
  }
}

export function useChefInterface(
  profile?: ProfileRefs<ChefCore> | null,
  userRef?: Ref<User | null | undefined>
) {
  function map(p: ChefCore, u?: UserLike | null): ChefCard.Card {
    const id =
      safeString((p as any).owner_uid).trim() ||
      safeString(u?.id).trim() ||
      safeString((p as any).id).trim()
    const profileImage = safeString((p as ChefCore & { image?: string }).image).trim()
    const chefImage = safeString((p as any).chef_image).trim()
    const summary =
      safeString((p as ChefCore & { summary?: string }).summary).trim() ||
      safeString((p as any).chef_bio).trim()

    return {
      id,
      to: id ? `/${chefConfig.collectionName}/${encodeURIComponent(id)}` : '',
      avatarUrl: profileImage || chefImage || safeString(u?.avatar).trim(),
      displayName: safeString(u?.display_name).trim(),
      chef_headline: safeString((p as any).title).trim(),
    }
  }

  function card(target?: ChefCore | null, userOverride?: UserLike | null): ChefCard.Card | null {
    const p = target ?? profile?.coreProfile.value ?? null
    if (!p) return null

    const mapped = map(p, userOverride ?? userRef?.value ?? null)
    return mapped.id && mapped.displayName ? mapped : null
  }

  function searchText(target: ChefCore): string {
    const mapped = map(target, userRef?.value ?? null)
    const summary =
      safeString((target as ChefCore & { summary?: string }).summary).trim() ||
      safeString((target as any).chef_bio).trim()

    return [
      mapped.id,
      mapped.displayName,
      mapped.chef_headline,
      summary,
    ]
      .join(' ')
      .trim()
      .toLowerCase()
  }

  return { card, searchText }
}
