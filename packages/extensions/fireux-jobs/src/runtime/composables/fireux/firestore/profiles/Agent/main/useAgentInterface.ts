import { computed } from 'vue'
import type { Ref } from 'vue'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { agentConfig, type AgentProfile } from '../../../../../../models/profiles/Agent/Agent.model'

export namespace AgentCard {
  export interface AgentPill {
    avatar: string | null
    title: string
    subtitle?: string | null
    tagline: string | null
    badges: string[] | null
    to?: string | null
  }

  export interface AgentCell {
    id?: string
    creator_id?: string | null
    avatar: string | null
    title: string
    subtitle?: string | null
    tagline: string | null
    badges: string[] | null
    to?: string | null
  }

  export interface AgentProfileCard {
    id?: string
    creator_id?: string | null
    avatar: string | null
    title: string
    subtitle?: string | null
    tagline: string | null
    badges: string[] | null
    to?: string | null
  }
}

type AgentProfileWithUser = AgentProfile & {
  user?: User | null
  creator_id?: string | null
  subtitle?: string | null
}

const routeFor = (id?: string | null) =>
  id ? `/${agentConfig.collectionName}/${id}` : null

export function useAgentInterface(
  profile: ProfileRefs<AgentProfile>,
  user: Ref<User | null | undefined>
) {
  const resolveProfile = (target?: AgentProfile | null) =>
    target ?? profile.coreProfile.value ?? null

  const resolveUser = (target?: AgentProfile | null) =>
    target?.user ?? user.value ?? null

  const resolveTagline = (payload: AgentProfile | null | undefined): string | null =>
    payload?.tagline?.trim() ??
    (payload as { subtitle?: string | null } | null)?.subtitle?.trim() ??
    null

  const resolveTitle = (u: Partial<User>) =>
    u.display_name?.trim() ||
    u.email?.trim() ||
    (u.handle ? `@${u.handle.trim()}` : '') ||
    'Agent'

  const pillProps = (
    target?: AgentProfile | null
  ): AgentCard.AgentPill | null => {
    const currentProfile = resolveProfile(target)
    const currentUser = resolveUser(target)
    if (!currentUser) return null

    const tagline = resolveTagline(currentProfile)
    const to = routeFor(currentProfile?.id ?? currentUser.id)

    return {
      avatar: currentUser.avatar ?? null,
      title: resolveTitle(currentUser),
      subtitle: tagline,
      tagline,
      badges: currentProfile?.badges ?? null,
      to,
    }
  }

  const cellProps = (
    target?: AgentProfile | null
  ): AgentCard.AgentCell | null => {
    const base = pillProps(target)
    if (!base) return null

    const currentProfile = resolveProfile(target)
    const id = currentProfile?.id ?? resolveUser(target)?.id ?? undefined

    return {
      ...base,
      id,
      creator_id: null,
      to: routeFor(id ?? null),
    }
  }

  const profileCardProps = (
    target?: AgentProfile | null
  ): AgentCard.AgentProfileCard | null => {
    const base = pillProps(target)
    if (!base) return null

    const currentProfile = resolveProfile(target)
    const id = currentProfile?.id ?? resolveUser(target)?.id ?? undefined

    return {
      ...base,
      id,
      creator_id: null,
      to: routeFor(id ?? null),
    }
  }

  const pill = computed(() => pillProps())
  const cell = computed(() => cellProps())
  const profileCard = computed(() => profileCardProps())

  return {
    pill,
    cell,
    profile: profileCard,
    pillProps,
    cellProps,
    profileCardProps,
  }
}

const resolveProfileTagline = (profile?: AgentProfileWithUser | null) =>
  profile?.tagline?.trim() ?? profile?.subtitle?.trim() ?? null

export const resolveAgentPill = (
  profile?: AgentProfile | null
): AgentCard.AgentPill => {
  const payload = (profile ?? null) as AgentProfileWithUser | null
  const user = payload?.user ?? null
  const tagline = resolveProfileTagline(payload)
  const title = user?.display_name?.trim() || user?.email?.trim() || 'Agent'

  return {
    avatar: user?.avatar ?? null,
    title,
    subtitle: tagline,
    tagline,
    badges: payload?.badges ?? null,
    to: routeFor(payload?.id ?? user?.id ?? null),
  }
}

export const resolveAgentPillKey = (pill: AgentCard.AgentPill) =>
  pill.to ?? pill.title ?? 'agent'

export const resolveAgentCell = (
  profile?: AgentProfile | null
): AgentCard.AgentCell | null => {
  const payload = (profile ?? null) as AgentProfileWithUser | null
  const user = payload?.user ?? null
  if (!payload || !user) return null

  const tagline = resolveProfileTagline(payload)
  const id = payload.id ?? user.id ?? undefined

  return {
    id,
    creator_id: payload.creator_id ?? null,
    avatar: user.avatar ?? null,
    title: user.display_name ?? 'Agent',
    subtitle: tagline,
    tagline,
    badges: payload.badges ?? null,
    to: routeFor(id ?? null),
  }
}
