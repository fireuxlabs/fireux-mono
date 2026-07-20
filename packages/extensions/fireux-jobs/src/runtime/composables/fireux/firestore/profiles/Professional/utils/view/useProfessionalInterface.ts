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
import type { Ref } from 'vue'
import type { Professional } from '../../../../../../../models/profiles/Professional/Professional.model'
import { professionalConfig } from '../../config/professionalConfig'

type UserLike = Pick<User, 'display_name' | 'avatar' | 'handle'> &
  Partial<Pick<User, 'id'>>
type ProfessionalTarget = Professional

export namespace ProfessionalCard {
  export type Card = {
    id: string
    to: string
    imageUrl: string
    avatarUrl: string
    secondaryAvatarUrl?: string
    image: string
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

export function useProfessionalInterface(
  profileRefs?: ProfileRefs<Professional> | null,
  userRef?: Ref<UserLike | null | undefined>
) {
  type ProfessionalPill = ProfessionalCard.Card
  type ProfessionalCell = ProfessionalCard.Card
  type ProfessionalPreview = ProfessionalCard.Card
  type ProfessionalProfile = ProfessionalCard.Card

  const { uid, currentUser: authUser } = useAuth()

  function resolveUserAvatar(user?: UserLike | null): string {
    const storedAvatar = safeString(user?.avatar).trim()
    if (storedAvatar) return storedAvatar

    const currentUid = safeString(uid.value).trim()
    const targetUid = safeString(user?.id).trim()
    if (!currentUid || !targetUid || currentUid !== targetUid) return ''

    return safeString(authUser.value?.photoURL).trim()
  }

  function buildInterface(
    target?: ProfessionalTarget | null | undefined,
    userOverride?: UserLike | null
  ): ProfessionalCard.Card | null {
    const p = target ?? profileRefs?.coreProfile?.value ?? null
    if (!p) return null

    const user = userOverride ?? userRef?.value ?? null
    const id =
      safeString((p as any).id).trim() ||
      safeString((p as any).owner_uid).trim() ||
      safeString(user?.id).trim()
    if (!id) return null

    const image = resolveProfileImage([p.image])
    const avatar = resolveUserAvatar(user)
    const summary = resolveProfileSummary([p.summary, p.bio])
    const badges = resolveProfileBadges([p.tags])
    const secondaryAvatarUrl = resolveSecondaryAvatarUrl(image, avatar)
    const explicitTo = safeString((p as any).to).trim()

    return {
      id,
      to: explicitTo || `/${professionalConfig.collectionName}/${encodeURIComponent(id)}`,
      imageUrl: image || avatar,
      avatarUrl: avatar,
      secondaryAvatarUrl,
      image,
      displayName: resolveProfileDisplayName([user?.display_name]),
      title: safeString(p.title),
      subtitle: safeString(user?.handle).trim(),
      summary,
      badges,
      handle: safeString(user?.handle).trim(),
      contactEmail: '',
      contactPhone: '',
      websiteUrl: '',
    }
  }

  const toInterface = buildInterface

  function pill(
    target?: ProfessionalTarget | null | undefined,
    userOverride?: UserLike | null
  ): ProfessionalPill | null {
    return buildInterface(target, userOverride)
  }

  function cell(
    target?: ProfessionalTarget | null | undefined,
    userOverride?: UserLike | null
  ): ProfessionalCell | null {
    return buildInterface(target, userOverride)
  }

  function preview(
    target?: ProfessionalTarget | null | undefined,
    userOverride?: UserLike | null
  ): ProfessionalPreview | null {
    return buildInterface(target, userOverride)
  }

  function profile(
    target?: ProfessionalTarget | null | undefined,
    userOverride?: UserLike | null
  ): ProfessionalProfile | null {
    return buildInterface(target, userOverride)
  }

  return {
    interface: toInterface,
    pill,
    cell,
    preview,
    profile,
  }
}
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: accept canonical User separately from Professional storage.
