import type { Ecosystem } from 'fireux-core/runtime/models/system/ecosystem.model'

const safeString = (value: unknown) => String(value ?? '').trim()
const labelize = (value: string) =>
  safeString(value)
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ')

export namespace EcosystemView {
  export type Row = Omit<Partial<Ecosystem>, 'apps'> & {
    key?: string
    src?: string
    text?: string
    href?: string
    appCount?: number
    apps?: number | unknown[]
  }

  export type Item = {
    id: string
    key: string
    name: string
    description: string
    status: string
    imageUrl: string
    avatarText: string
    to: string
    apps: number
    team: string
  }
}

export namespace EcosystemCard {
  export type Card = {
    id: string
    to: string
    imageUrl: string
    avatarText: string
    title: string
    subtitle: string
    meta: string
    badges: string[]
  }
}

export function useEcosystemInterface() {
  function item(target?: EcosystemView.Row | null | undefined): EcosystemView.Item | null {
    if (!target) return null

    const key = safeString(target.key) || safeString(target.id) || safeString(target.slug)
    const name = safeString(target.name)
    const resolvedId = safeString(target.id) || key || name

    if (!resolvedId || !(key || name)) return null

    const apps = Array.isArray(target.apps)
      ? target.apps.length
      : Number.isFinite(Number(target.appCount))
        ? Number(target.appCount)
        : Number.isFinite(Number(target.apps))
          ? Number(target.apps)
          : 0

    return {
      id: resolvedId,
      key,
      name,
      description: safeString(target.description),
      status: safeString(target.status),
      imageUrl: safeString(target.src),
      avatarText: safeString(target.text),
      to: safeString(target.href),
      apps,
      team: safeString(target.team),
    }
  }

  function card(target?: EcosystemView.Item | null | undefined): EcosystemCard.Card | null {
    if (!target) return null

    return {
      id: target.id,
      to: target.to || '',
      imageUrl: target.imageUrl || '',
      avatarText: target.avatarText || target.name || target.key || '',
      title: target.name || target.key || 'Untitled ecosystem',
      subtitle: target.key || '',
      meta: [target.team ? `team: ${target.team}` : '', `apps: ${target.apps}`]
        .filter(Boolean)
        .join(' · '),
      badges: [
        labelize(target.status),
        `${target.apps} app${target.apps === 1 ? '' : 's'}`,
      ].filter(Boolean),
    }
  }

  function searchText(target: EcosystemView.Item): string {
    return [target.key, target.name, target.status, target.team, target.description]
      .join(' ')
      .trim()
      .toLowerCase()
  }

  return {
    item,
    card,
    searchText,
  }
}
