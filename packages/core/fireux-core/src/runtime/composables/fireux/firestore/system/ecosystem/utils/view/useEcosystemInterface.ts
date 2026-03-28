import type { Ecosystem } from '../../../../../../../models/system/ecosystem.model'

const safeString = (value: unknown) => String(value ?? '').trim()
const labelize = (value: string) =>
  safeString(value)
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ')

export type EcosystemInterfaceInput = Omit<Partial<Ecosystem>, 'apps'> & {
  key?: string
  src?: string
  text?: string
  href?: string
  appCount?: number
  apps?: number | unknown[]
}

export type EcosystemInterfaceCard = {
  id: string
  to: string
  imageUrl: string
  avatarText: string
  title: string
  subtitle: string
  meta: string
  badges: string[]
}

export function useEcosystemInterface() {
  function buildInterface(
    target?: EcosystemInterfaceInput | null | undefined
  ): EcosystemInterfaceCard | null {
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
      to: safeString(target.href),
      imageUrl: safeString(target.src),
      avatarText: safeString(target.text) || name || key,
      title: name || key || 'Untitled ecosystem',
      subtitle: key || '',
      meta: [safeString(target.team) ? `team: ${safeString(target.team)}` : '', `apps: ${apps}`]
        .filter(Boolean)
        .join(' · '),
      badges: [
        labelize(safeString(target.status)),
        `${apps} app${apps === 1 ? '' : 's'}`,
      ].filter(Boolean),
    }
  }

  function searchText(target: EcosystemInterfaceInput): string {
    const key = safeString(target.key) || safeString(target.id) || safeString(target.slug)
    const name = safeString(target.name)

    return [key, name, safeString(target.status), safeString(target.team), safeString(target.description)]
      .join(' ')
      .trim()
      .toLowerCase()
  }

  return {
    interface: buildInterface,
    searchText,
  }
}
