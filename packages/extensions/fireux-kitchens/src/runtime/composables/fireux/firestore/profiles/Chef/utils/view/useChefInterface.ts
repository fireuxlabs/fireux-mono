import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import {
    resolveProfileBadges,
    resolveProfileDisplayName,
    resolveProfileImage,
    resolveProfileSummary,
    resolveSecondaryAvatarUrl,
    safeString,
} from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import { chefConfig } from 'fireux-kitchens/runtime/composables/fireux/firestore/profiles/Chef/config/chefConfig'
import type { Chef } from 'fireux-kitchens/runtime/models/profiles/Chef/Chef.model'
import type { Ref } from 'vue'

type UserLike = Pick<User, 'display_name' | 'avatar'> & Partial<Pick<User, 'id'>>
type ChefTarget = Chef & { user?: UserLike | null }

export namespace ChefCard {
  export type Card = {
    id: string
    to: string
    imageUrl: string
    avatarUrl: string
    secondaryAvatarUrl?: string
    displayName: string
    title: string
    subtitle: string
    summary: string
    badges: string[]
    handle: string
    contactEmail: string
    contactPhone: string
    websiteUrl: string
  }
}

export function useChefInterface(
  profile?: ProfileRefs<Chef> | null,
  userRef?: Ref<User | null | undefined>
) {
  type ChefPill = ChefCard.Card
  type ChefCell = ChefCard.Card
  type ChefPreview = ChefCard.Card
  type ChefProfile = ChefCard.Card

  const { uid, currentUser: authUser } = useAuth()

  function resolveUserAvatar(u?: UserLike | null): string {
    const storedAvatar = safeString(u?.avatar).trim()
    if (storedAvatar) return storedAvatar

    const currentUid = safeString(uid.value).trim()
    const targetUid = safeString(u?.id).trim()
    if (!currentUid || !targetUid || currentUid !== targetUid) return ''

    return safeString(authUser.value?.photoURL).trim()
  }

  function map(p: Chef, u?: UserLike | null): ChefCard.Card {
    const id =
      safeString((p as any).owner_uid).trim() ||
      safeString(u?.id).trim() ||
      safeString((p as any).id).trim()
    const profileImage = resolveProfileImage([
      (p as Chef & { image?: string }).image,
      (p as any).chef_image,
    ])
    const summary = resolveProfileSummary([
      (p as Chef & { summary?: string }).summary,
      (p as any).chef_bio,
    ])
    const userAvatar = resolveUserAvatar(u)
    const avatarUrl = profileImage || userAvatar
    const badges = resolveProfileBadges([(p as Chef & { tags?: string[] }).tags])
    const secondaryAvatarUrl = resolveSecondaryAvatarUrl(avatarUrl, userAvatar)

    return {
      id,
      to: id ? `/${chefConfig.collectionName}/${encodeURIComponent(id)}` : '',
      imageUrl: avatarUrl,
      avatarUrl,
      secondaryAvatarUrl,
      displayName: resolveProfileDisplayName([
        u?.display_name,
        safeString((p as any).display_name).trim(),
        safeString((p as any).name).trim(),
      ]),
      title: safeString((p as any).title).trim(),
      subtitle: '',
      summary,
      badges,
      handle: '',
      contactEmail: '',
      contactPhone: '',
      websiteUrl: '',
    }
  }

  function buildInterface(target?: ChefTarget | null, userOverride?: UserLike | null): ChefCard.Card | null {
    const p = target ?? profile?.coreProfile?.value ?? null
    if (!p) return null

    const mapped = map(p, target?.user ?? userOverride ?? userRef?.value ?? null)
    return mapped.id && mapped.displayName ? mapped : null
  }

  function pill(target?: ChefTarget | null, userOverride?: UserLike | null): ChefPill | null {
    return buildInterface(target, userOverride)
  }

  function cell(target?: ChefTarget | null, userOverride?: UserLike | null): ChefCell | null {
    return buildInterface(target, userOverride)
  }

  function preview(target?: ChefTarget | null, userOverride?: UserLike | null): ChefPreview | null {
    return buildInterface(target, userOverride)
  }

  function profile(target?: ChefTarget | null, userOverride?: UserLike | null): ChefProfile | null {
    return buildInterface(target, userOverride)
  }

  function searchText(target: ChefTarget): string {
    const mapped = map(target, target.user ?? userRef?.value ?? null)
    const summary = resolveProfileSummary([
      (target as Chef & { summary?: string }).summary,
      (target as any).chef_bio,
    ])

    return [
      mapped.id,
      mapped.displayName,
      mapped.title,
      summary,
      ...mapped.badges,
    ]
      .join(' ')
      .trim()
      .toLowerCase()
  }

  return {
    interface: buildInterface,
    pill,
    cell,
    preview,
    profile,
    searchText,
  }
}
