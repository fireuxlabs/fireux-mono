import { computed } from 'vue'
import type { Ref } from 'vue'
import {
  agentConfig,
  type Agent,
  type AgentProfile,
} from '../../../../../../models/profiles/Agent.model.ts'

export namespace AgentCard {
  export interface Pill {
    avatar: string | null
    title: string
    subtitle?: string | null
    tagline: string | null
    badges: string[] | null
    to?: string | null
  }

  export interface Cell {
    id?: string
    creator_id?: string | null
    avatar: string | null
    title: string
    subtitle?: string | null
    tagline: string | null
    badges: string[] | null
    to?: string | null
  }

  export interface Profile {
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
  user?: Agent['user']
  creator_id?: string | null
  subtitle?: string | null
}

const routeFor = (id?: string | null) =>
  id ? `/${agentConfig.collectionName}/${id}` : null

export function useAgentInterface(agent: Ref<Agent>) {
  const pill = computed<AgentCard.Pill>(() => {
    const current = agent.value
    const user = current.user
    const core = current.core
    const avatar = user?.avatar ?? null
    const title = user?.display_name ?? ''
    const tagline = core?.tagline ?? null
    const badges = core?.badges ?? null

    return {
      avatar,
      title,
      subtitle: tagline,
      tagline,
      badges,
      to: routeFor(core?.id ?? user?.id ?? null),
    }
  })

  const cell = computed<AgentCard.Cell>(() => {
    const current = agent.value
    const user = current.user
    const core = current.core
    const avatar = user?.avatar ?? null
    const title = user?.display_name ?? ''
    const tagline = core?.tagline ?? null
    const badges = core?.badges ?? null

    return {
      avatar,
      title,
      subtitle: tagline,
      tagline,
      badges,
      id: core?.id ?? user?.id ?? undefined,
      creator_id: null,
      to: routeFor(core?.id ?? user?.id ?? null),
    }
  })

  const profile = computed<AgentCard.Profile>(() => {
    const current = agent.value
    const user = current.user
    const core = current.core
    const avatar = user?.avatar ?? null
    const title = user?.display_name ?? ''
    const tagline = core?.tagline ?? null
    const badges = core?.badges ?? null

    return {
      avatar,
      title,
      subtitle: tagline,
      tagline,
      badges,
      id: core?.id ?? user?.id ?? undefined,
      creator_id: null,
      to: routeFor(core?.id ?? user?.id ?? null),
    }
  })

  return { pill, cell, profile }
}

const resolveProfileTagline = (profile?: AgentProfileWithUser | null) =>
  profile?.tagline?.trim() ?? profile?.subtitle?.trim() ?? null

export const resolveAgentPill = (
  profile?: AgentProfile | null
): AgentCard.Pill => {
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

export const resolveAgentPillKey = (pill: AgentCard.Pill) =>
  pill.to ?? pill.title ?? 'agent'

export const resolveAgentCell = (
  profile?: AgentProfile | null
): AgentCard.Cell | null => {
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
