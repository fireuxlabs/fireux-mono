import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import {
  resolveProfileBadges,
  resolveProfileDisplayName,
  resolveProfileImage,
  resolveProfileSummary,
  resolveSecondaryAvatarUrl,
  safeString,
} from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import { agentConfig } from 'fireux-jobs/runtime/composables/fireux/firestore/profiles/Agent/config/agentConfig'
import type { AgentCore, AgentResolved } from 'fireux-jobs/runtime/models/profiles/Agent/Agent.model'
import type { Ref } from 'vue'

type UserLike = Pick<User, 'display_name' | 'avatar'> &
  Partial<Pick<User, 'id' | 'handle' | 'email'>>

export namespace AgentCard {
  export type Card = {
    id: string
    to: string

    // Media (empty string means unset)
    avatarUrl: string
    secondaryAvatarUrl?: string

    // Primary display fields
    displayName: string
    title: string

    // Status/label chips
    badges: string[]

    // Summary shown in lists
    summary: string

    // IMPORTANT: only render contactEmail on authorized UI surfaces.
    contactEmail: string
    contactPhone: string
    websiteUrl: string
  }
}

export function useAgentInterface(
  profile?: ProfileRefs<AgentCore> | null,
  userRef?: Ref<User | null | undefined>
) {
  const resolveUser = (target?: AgentCore | AgentResolved | null) => {
    if (target && 'user' in target && target.user) return target.user as UserLike
    return userRef?.value ?? null
  }

  function map(p: AgentCore, u?: UserLike | null): AgentCard.Card {
    const id =
      safeString((p as any).id).trim() ||
      safeString((p as any).owner_uid).trim() ||
      safeString(u?.id).trim()
    const headline = safeString(p.title)
    const summary = resolveProfileSummary([p.summary, p.agent_bio])
    const placementTypes = resolveProfileBadges([p.agent_placement_types, p.tags])
    const profileImage = resolveProfileImage([
      (p as AgentCore & { image?: string }).image,
      p.agent_image,
    ])
    const userAvatar = safeString(u?.avatar)
    const secondaryAvatarUrl = resolveSecondaryAvatarUrl(profileImage, userAvatar) || ''

    return {
      id,
      to: id ? `/${agentConfig.collectionName}/${encodeURIComponent(id)}` : '',

      avatarUrl: profileImage || userAvatar,
      secondaryAvatarUrl,

      displayName: resolveProfileDisplayName([u?.display_name]),
      title: headline,
      badges: placementTypes,

      summary,

      contactEmail: safeString(p.agent_contact_email || p.contact_email).trim(),
      contactPhone: safeString(p.agent_contact_phone || p.contact_phone).trim(),
      websiteUrl: safeString(p.agent_website_url || p.website_url),
    }
  }

  function card(
    target?: AgentCore | AgentResolved | null | undefined
  ): AgentCard.Card | null {
    const p = target ?? profile?.coreProfile.value ?? null
    if (!p) return null
    const u = resolveUser(target as AgentCore | AgentResolved | null)
    const mapped = map(p, u)
    return mapped.id ? mapped : null
  }

  function searchText(target: AgentCore | AgentResolved): string {
    const mapped = map(target, resolveUser(target))

    return [
      mapped.id,
      mapped.displayName,
      mapped.title,
      mapped.summary,
      mapped.contactEmail,
      mapped.contactPhone,
      mapped.websiteUrl,
      ...mapped.badges,
    ]
      .join(' ')
      .trim()
      .toLowerCase()
  }

  return { card, searchText }
}
