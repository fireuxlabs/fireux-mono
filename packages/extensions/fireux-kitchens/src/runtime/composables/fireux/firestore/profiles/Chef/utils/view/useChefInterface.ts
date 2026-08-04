import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
// Concurrent edit — 2026-07-20 20:14 CEST — Repo Efficiency Pass 2 of 6: map stored, detail, and exact directory Chef shapes without compatibility fields.
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
import { chefConfig } from '../../config/chefConfig'
import type {
  Chef,
  PublicChefDirectoryProfile,
  PublicChefProfile,
} from '../../../../../../../models/chef.model'
import type { Ref } from 'vue'

type UserLike = Pick<User, 'display_name' | 'avatar'> &
  Partial<Pick<User, 'id' | 'handle'>>
type ChefTarget = PublicChefDirectoryProfile &
  Partial<Pick<PublicChefProfile, 'chef_signature_dishes'>>

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
  profileRefs?: ProfileRefs<Chef> | null,
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

  function map(p: ChefTarget, u?: UserLike | null): ChefCard.Card {
    const id = safeString(u?.id).trim() || safeString(p.id).trim()
    const handle = safeString(u?.handle).trim().replace(/^@/, '').toLowerCase()
    const routeKey = handle || id
    const profileImage = resolveProfileImage([p.chef_image])
    const summary = resolveProfileSummary([p.summary, p.chef_bio])
    const userAvatar = resolveUserAvatar(u)
    const avatarUrl = profileImage || userAvatar
    const badges = resolveProfileBadges([p.chef_signature_dishes])
    const secondaryAvatarUrl = resolveSecondaryAvatarUrl(avatarUrl, userAvatar)

    return {
      id,
      to: routeKey
        ? `/${chefConfig.collectionName}/${encodeURIComponent(routeKey)}`
        : '',
      imageUrl: avatarUrl,
      avatarUrl,
      secondaryAvatarUrl,
      displayName: resolveProfileDisplayName([u?.display_name]),
      title: safeString(p.title).trim(),
      subtitle: handle,
      summary,
      badges,
      handle,
      contactEmail: '',
      contactPhone: '',
      websiteUrl: '',
    }
  }

  function buildInterface(
    target?: ChefTarget | null,
    userOverride?: UserLike | null
  ): ChefCard.Card | null {
    const p = target ?? profileRefs?.coreProfile?.value ?? null
    if (!p) return null

    const mapped = map(p, userOverride ?? userRef?.value ?? null)
    return mapped.id && mapped.displayName ? mapped : null
  }

  const toInterface = buildInterface

  function pill(
    target?: ChefTarget | null,
    userOverride?: UserLike | null
  ): ChefPill | null {
    return buildInterface(target, userOverride)
  }

  function cell(
    target?: ChefTarget | null,
    userOverride?: UserLike | null
  ): ChefCell | null {
    return buildInterface(target, userOverride)
  }

  function preview(
    target?: ChefTarget | null,
    userOverride?: UserLike | null
  ): ChefPreview | null {
    return buildInterface(target, userOverride)
  }

  function profile(
    target?: ChefTarget | null,
    userOverride?: UserLike | null
  ): ChefProfile | null {
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
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: accept canonical User separately from Chef storage.
