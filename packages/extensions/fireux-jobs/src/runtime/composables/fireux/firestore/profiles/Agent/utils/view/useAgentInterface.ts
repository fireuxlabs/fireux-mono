import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import type { Ref } from 'vue'
import { agentConfig, type AgentCore } from '../../../../../../../models/profiles/Agent/Agent.model'

type UserLike = Pick<User, 'display_name' | 'avatar'> &
  Partial<Pick<User, 'id' | 'handle' | 'email'>>

export namespace AgentCard {
  export type Card = {
    id: string
    to: string

    avatarUrl: string

    displayName: string
    tagline: string
    badges: string[]

    bioShort: string

    // IMPORTANT: only render contactEmail on authorized UI surfaces.
    contactEmail: string
    contactPhone: string
    websiteUrl: string
  }
}

export function useAgentInterface(
  profile: ProfileRefs<AgentCore>,
  userRef?: Ref<User | null | undefined>
) {
  function safeArray<T>(input: unknown): T[] {
    return Array.isArray(input) ? (input as T[]) : []
  }

  function safeString(input: unknown): string {
    return typeof input === 'string' ? input : ''
  }

  function map(p: AgentCore, u?: UserLike | null): AgentCard.Card {
    const title = safeString((p as any)?.title)
    const subtitle = safeString((p as any)?.subtitle)
    const tagline = safeString((p as any)?.tagline)
    const tags = safeArray<string>((p as any)?.tags)

    return {
      id: p.id,
      to: `/${agentConfig.collectionName}/${p.id}`,

      avatarUrl: u?.avatar ?? '',

      // Canonical: agent pills are user-hydrated; no profile-title fallback for display name.
      displayName: safeString(u?.display_name),

      // Prefer tagline; fall back to title/subtitle so pills stay useful.
      tagline: tagline || title || subtitle,
      badges: tags,

      bioShort: safeString((p as any)?.bio_short),

      contactEmail: safeString((p as any)?.contact_email).trim(),
      contactPhone: safeString((p as any)?.contact_phone).trim(),
      websiteUrl: safeString((p as any)?.website_url),
    }
  }

  function card(
    target?: AgentCore | null | undefined,
    userOverride?: UserLike | null
  ): AgentCard.Card | null {
    const p = target ?? profile.coreProfile.value ?? null
    if (!p) return null
    const u = userOverride ?? userRef?.value ?? null
    return map(p, u)
  }

  function searchText(target?: AgentCore | null | undefined): string {
    const p = target ?? profile.coreProfile.value ?? null
    if (!p) return ''
    const u = userRef?.value ?? null

    const displayName = safeString((u as any)?.display_name)
    const title = safeString((p as any)?.title)
    const tagline = safeString((p as any)?.tagline)
    return `${displayName} ${title} ${tagline} ${p.id}`.trim().toLowerCase()
  }

  return { card, searchText }
}
