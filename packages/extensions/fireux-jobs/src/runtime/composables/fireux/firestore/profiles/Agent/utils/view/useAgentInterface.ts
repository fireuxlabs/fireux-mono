// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: public Agent contacts and Professional summary cleanup.
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: accept canonical User separately from Agent storage.
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
// Concurrent edit — 2026-07-20 20:14 CEST — Repo Efficiency Pass 2 of 6: map stored, detail, and exact directory Agent shapes without compatibility fields.
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
import { agentConfig } from '../../config/agentConfig'
import type {
  Agent,
  PublicAgentDirectoryProfile,
} from '../../../../../../../models/profiles/Agent/Agent.model'
import type { Ref } from 'vue'

type UserLike = Pick<User, 'display_name' | 'avatar'> &
  Partial<Pick<User, 'id' | 'handle'>>

type AgentTarget = PublicAgentDirectoryProfile

export namespace AgentCard {
  export type Card = {
    id: string
    to: string

    // Media (empty string means unset)
    imageUrl: string
    avatarUrl: string
    secondaryAvatarUrl?: string

    // Primary display fields
    displayName: string
    title: string
    subtitle: string

    // Status/label chips
    badges: string[]

    // Summary shown in lists
    summary: string

    handle: string

    // Public business contacts intended for Agent directory and profile surfaces.
    contactEmail: string
    contactPhone: string
    websiteUrl: string
  }
}

export function useAgentInterface(
  profileRefs?: ProfileRefs<Agent> | null,
  userRef?: Ref<User | null | undefined>
) {
  type AgentPill = AgentCard.Card
  type AgentCell = AgentCard.Card
  type AgentPreview = AgentCard.Card
  type AgentProfile = AgentCard.Card

  const { uid, currentUser: authUser } = useAuth()

  function resolveUserAvatar(u?: UserLike | null): string {
    const storedAvatar = safeString(u?.avatar).trim()
    if (storedAvatar) return storedAvatar

    const currentUid = safeString(uid.value).trim()
    const targetUid = safeString(u?.id).trim()
    if (!currentUid || !targetUid || currentUid !== targetUid) return ''

    return safeString(authUser.value?.photoURL).trim()
  }

  function map(p: AgentTarget, u?: UserLike | null): AgentCard.Card {
    const id = safeString(p.id).trim() || safeString(u?.id).trim()
    const handle = safeString(u?.handle).trim().replace(/^@/, '').toLowerCase()
    const routeKey = handle || id
    const headline = safeString(p.title)
    const summary = resolveProfileSummary([p.summary, p.agent_bio])
    const placementTypes = resolveProfileBadges([
      p.agent_placement_types,
      p.tags,
    ])
    const profileImage = resolveProfileImage([p.agent_image])
    const userAvatar = resolveUserAvatar(u)
    const secondaryAvatarUrl =
      resolveSecondaryAvatarUrl(profileImage, userAvatar) || ''

    return {
      id,
      to: routeKey
        ? `/${agentConfig.collectionName}/${encodeURIComponent(routeKey)}`
        : '',

      imageUrl: profileImage || userAvatar,
      avatarUrl: profileImage || userAvatar,
      secondaryAvatarUrl,

      displayName: resolveProfileDisplayName([u?.display_name]),
      title: headline,
      subtitle: handle,
      badges: placementTypes,

      summary,
      handle,

      contactEmail: safeString(p.agent_contact_email).trim(),
      contactPhone: safeString(p.agent_contact_phone).trim(),
      websiteUrl: safeString(p.agent_website_url),
    }
  }

  function buildInterface(
    target?: AgentTarget | null | undefined,
    userOverride?: UserLike | null
  ): AgentCard.Card | null {
    const p = target ?? profileRefs?.coreProfile?.value ?? null
    if (!p) return null
    const u = userOverride ?? userRef?.value ?? null
    const mapped = map(p, u)
    return mapped.id ? mapped : null
  }

  const toInterface = buildInterface

  function pill(
    target?: AgentTarget | null | undefined,
    userOverride?: UserLike | null
  ): AgentPill | null {
    return buildInterface(target, userOverride)
  }

  function cell(
    target?: AgentTarget | null | undefined,
    userOverride?: UserLike | null
  ): AgentCell | null {
    return buildInterface(target, userOverride)
  }

  function preview(
    target?: AgentTarget | null | undefined,
    userOverride?: UserLike | null
  ): AgentPreview | null {
    return buildInterface(target, userOverride)
  }

  function profile(
    target?: AgentTarget | null | undefined,
    userOverride?: UserLike | null
  ): AgentProfile | null {
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
