import { computed } from 'vue'
import type { Ref } from 'vue'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'
import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import {
  agentConfig,
  type AgentProfile,
  type AgentCard,
} from '../../../../../models/profiles/Agent.model.ts'

const routeFor = (id?: string | null) =>
  id ? `/${agentConfig.collectionName}/${id}` : null

/**
 * Minimal agent interface.
 * No merging, no overrides.
 * Pill = user.avatar + user.display_name + profile tagline.
 */
export function useAgentInterface(
  profile: ProfileRefs<AgentProfile>,
  user: Ref<User | null>
) {
  const resolveProfile = (target?: AgentProfile | null) =>
    target ?? profile.coreProfile.value ?? null

  const resolveUser = (target?: AgentProfile | null) =>
    target?.user ?? user.value ?? null

  const resolveTagline = (payload: AgentProfile | null | undefined): string =>
    payload?.tagline?.trim() ??
    (payload as { subtitle?: string | null } | null)?.subtitle?.trim() ??
    ''

  const resolveTitle = (u: User) =>
    u.display_name?.trim() ||
    u.email?.trim() ||
    (u.handle ? `@${u.handle.trim()}` : '') ||
    'Agent'

  const pillProps = (target?: AgentProfile | null): AgentCard.Pill | null => {
    const currentProfile = resolveProfile(target)
    const currentUser = resolveUser(target)
    if (!currentUser) return null

    const tagline = resolveTagline(currentProfile)
    const to = routeFor(currentProfile?.id ?? currentUser.id)

    return {
      avatar: currentUser.avatar ?? '',
      title: resolveTitle(currentUser),
      subtitle: tagline,
      tagline,
      badges: currentProfile?.badges ?? [],
      to,
    }
  }

  const cellProps = (target?: AgentProfile | null): AgentCard.Cell | null => {
    const base = pillProps(target)
    if (!base) return null

    const currentProfile = resolveProfile(target)
    const id = currentProfile?.id ?? resolveUser(target)?.id ?? undefined

    return {
      ...base,
      id,
      bio_short: currentProfile?.bio_short ?? null,
    }
  }

  const pill = computed(() => pillProps())
  const cell = computed(() => cellProps())

  return { pill, cell, pillProps, cellProps }
}

export const resolveAgentPill = (
  profile?: AgentProfile | null
): AgentCard.Pill => ({
  avatar: profile?.user?.avatar ?? '',
  title: profile?.user?.display_name ?? '',
  subtitle:
    profile?.tagline ??
    (profile as { subtitle?: string | null } | null)?.subtitle ??
    '',
  tagline:
    profile?.tagline ??
    (profile as { subtitle?: string | null } | null)?.subtitle ??
    '',
  badges: [],
  to: routeFor(profile?.id),
})

export const resolveAgentPillKey = (pill: AgentCard.Pill) =>
  pill.to ?? pill.title ?? 'agent'
