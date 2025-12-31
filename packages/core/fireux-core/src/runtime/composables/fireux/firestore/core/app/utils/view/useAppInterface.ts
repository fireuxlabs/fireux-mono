import type { Ref } from 'vue'
import type { App } from '../../../../../../../models/core/app.model'

export namespace AppCard {
  export type Badge = {
    label: string
    tone: 'neutral' | 'primary' | 'success' | 'warning' | 'danger'
  }

  export type Base = {
    avatar: string
    title: string
    subtitle: string
    badges: Badge[]
  }

  export type Pill = Base

  export type Cell = Base & {
    shortDescription: string
  }

  export type Preview = Base & {
    shortDescription: string
    contextNote: string
  }

  export type Profile = Base & {
    shortDescription: string
    contextNote: string
    longDescription: string
  }

  // Unified “card” shape you can down-cast for each component as needed.
  export type Card = Profile
}

type CardOverrides = Partial<Pick<AppCard.Profile, 'contextNote' | 'badges'>>

function buildBadges(app: App): AppCard.Badge[] {
  const badges: AppCard.Badge[] = []

  badges.push({
    label: app.role,
    tone: app.role === 'global' ? 'primary' : app.role === 'tenant' ? 'neutral' : 'warning',
  })

  badges.push({
    label: app.status ?? 'unknown',
    tone: app.status === 'active' ? 'success' : 'neutral',
  })

  const isInitialized = (app.admin_ids ?? []).length > 0
  badges.push({
    label: isInitialized ? 'initialized' : 'needs setup',
    tone: isInitialized ? 'success' : 'warning',
  })

  return badges
}

function buildSubtitle(app: App): string {
  return app.ecosystem
}

/**
 * Canon:
 * - Cards are pure view models.
 * - No routing, no CTA logic.
 * - Empty strings are allowed; UI decides whether to render.
 */
export function useAppInterface(appRef?: Ref<App | null | undefined>) {
  const resolveApp = (target?: App | null) => target ?? appRef?.value ?? null

  const toProfileCard = (target?: App | null, overrides: CardOverrides = {}): AppCard.Profile => {
    const app = resolveApp(target)
    if (!app) {
      return {
        avatar: '',
        title: 'App',
        subtitle: '',
        shortDescription: '',
        contextNote: overrides.contextNote ?? '',
        longDescription: '',
        badges: overrides.badges ?? [],
      }
    }

    const baseBadges = buildBadges(app)

    return {
      avatar: app.avatar_url ?? '',
      title: app.app_name,
      subtitle: buildSubtitle(app),

      shortDescription: app.description ?? '',
      contextNote: overrides.contextNote ?? '',
      longDescription: app.description ?? '',

      badges: overrides.badges ?? baseBadges,
    }
  }

  const toPreviewCard = (target?: App | null, overrides: CardOverrides = {}): AppCard.Preview => {
    const profile = toProfileCard(target, overrides)
    return {
      avatar: profile.avatar,
      title: profile.title,
      subtitle: profile.subtitle,
      shortDescription: profile.shortDescription,
      contextNote: profile.contextNote,
      badges: profile.badges,
    }
  }

  const toCellCard = (target?: App | null, overrides: CardOverrides = {}): AppCard.Cell => {
    const profile = toProfileCard(target, overrides)
    return {
      avatar: profile.avatar,
      title: profile.title,
      subtitle: profile.subtitle,
      shortDescription: profile.shortDescription,
      badges: profile.badges,
    }
  }

  const toPillCard = (target?: App | null, overrides: CardOverrides = {}): AppCard.Pill => {
    const profile = toProfileCard(target, overrides)
    return {
      avatar: profile.avatar,
      title: profile.title,
      subtitle: profile.subtitle,
      badges: profile.badges,
    }
  }

  return {
    toPillCard,
    toCellCard,
    toPreviewCard,
    toProfileCard,
    card: toProfileCard,
  }
}
