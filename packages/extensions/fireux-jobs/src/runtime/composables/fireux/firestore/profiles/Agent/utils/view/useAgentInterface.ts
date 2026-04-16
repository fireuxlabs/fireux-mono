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
import { agentConfig } from 'fireux-jobs/runtime/composables/fireux/firestore/profiles/Agent/config/agentConfig'
import type { Agent } from 'fireux-jobs/runtime/models/profiles/Agent/Agent.model'
import type { Ref } from 'vue'

type UserLike = Pick<User, 'display_name' | 'avatar'> &
  Partial<Pick<User, 'id' | 'handle' | 'email'>>

type AgentTarget = Agent & { user?: UserLike | null }

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

    // IMPORTANT: only render contactEmail on authorized UI surfaces.
    contactEmail: string
    contactPhone: string
    websiteUrl: string
  }
}

export function useAgentInterface(
  profile?: ProfileRefs<Agent> | null,
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

  const resolveUser = (target?: AgentTarget | null) => {
    if (target && 'user' in target && target.user)
      return target.user as UserLike
    return userRef?.value ?? null
  }

  function map(p: Agent, u?: UserLike | null): AgentCard.Card {
    const id =
      safeString((p as any).id).trim() ||
      safeString((p as any).owner_uid).trim() ||
      safeString(u?.id).trim()
    const headline = safeString(p.title)
    const summary = resolveProfileSummary([p.summary, p.agent_bio])
    const placementTypes = resolveProfileBadges([
      p.agent_placement_types,
      p.tags,
    ])
    const profileImage = resolveProfileImage([
      (p as Agent & { image?: string }).image,
      p.agent_image,
    ])
    const userAvatar = resolveUserAvatar(u)
    const secondaryAvatarUrl =
      resolveSecondaryAvatarUrl(profileImage, userAvatar) || ''

    return {
      id,
      to: id ? `/${agentConfig.collectionName}/${encodeURIComponent(id)}` : '',

      imageUrl: profileImage || userAvatar,
      avatarUrl: profileImage || userAvatar,
      secondaryAvatarUrl,

      displayName: resolveProfileDisplayName([u?.display_name]),
      title: headline,
      subtitle: safeString(u?.handle).trim(),
      badges: placementTypes,

      summary,
      handle: safeString(u?.handle).trim(),

      contactEmail: safeString(p.agent_contact_email || p.contact_email).trim(),
      contactPhone: safeString(p.agent_contact_phone || p.contact_phone).trim(),
      websiteUrl: safeString(p.agent_website_url || p.website_url),
    }
  }

  function buildInterface(
    target?: AgentTarget | null | undefined
  ): AgentCard.Card | null {
    const p = target ?? profile?.coreProfile?.value ?? null
    if (!p) return null
    const u = resolveUser(target as AgentTarget | null)
    const mapped = map(p, u)
    return mapped.id ? mapped : null
  }

  const toInterface = buildInterface

  function pill(target?: AgentTarget | null | undefined): AgentPill | null {
    return buildInterface(target)
  }

  function cell(target?: AgentTarget | null | undefined): AgentCell | null {
    return buildInterface(target)
  }

  function preview(
    target?: AgentTarget | null | undefined
  ): AgentPreview | null {
    return buildInterface(target)
  }

  function profile(
    target?: AgentTarget | null | undefined
  ): AgentProfile | null {
    return buildInterface(target)
  }

  return {
    interface: toInterface,
    pill,
    cell,
    preview,
    profile,
  }
}
