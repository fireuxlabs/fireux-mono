import { computed } from 'vue'
import type { Ref } from 'vue'
import type { Agent } from '../../../../../models/profiles/Agent.model.ts'

export namespace AgentCard {
  export interface Pill {
    avatar: string | null
    title: string
    tagline: string | null
    badges: string[] | null
  }

  export interface Cell {
    avatar: string | null
    title: string
    tagline: string | null
    badges: string[] | null
  }

  export interface Profile {
    avatar: string | null
    title: string
    tagline: string | null
    badges: string[] | null
  }
}

export function useAgentInterface(agent: Ref<Agent>) {
  const pill = computed<AgentCard.Pill>(() => {
    const current = agent.value
    const user = current.user
    const core = current.core

    return {
      avatar: user?.avatar ?? null,
      title: user?.display_name ?? '',
      tagline: core?.tagline ?? null,
      badges: core?.badges ?? null,
    }
  })

  const cell = computed<AgentCard.Cell>(() => {
    const current = agent.value
    const user = current.user
    const core = current.core

    return {
      avatar: user?.avatar ?? null,
      title: user?.display_name ?? '',
      tagline: core?.tagline ?? null,
      badges: core?.badges ?? null,
    }
  })

  const profile = computed<AgentCard.Profile>(() => {
    const current = agent.value
    const user = current.user
    const core = current.core

    return {
      avatar: user?.avatar ?? null,
      title: user?.display_name ?? '',
      tagline: core?.tagline ?? null,
      badges: core?.badges ?? null,
    }
  })

  return { pill, cell, profile }
}
