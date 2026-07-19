import type {
  Ecosystem,
  EcosystemStatus,
} from '../../../../../../../models/system/ecosystem.model'
import { EcosystemStorage } from '../../../../../../../models/system/ecosystem.model'

const safeString = (value: unknown) => String(value ?? '').trim()
const labelize = (value: string) =>
  safeString(value)
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ')

export type EcosystemSurface = {
  id?: string
  project_id?: string
  name?: string
  slug?: string
  description?: string
  image_url?: string
  website_url?: string
  /** Narrow legacy read adapter; canonical field is website_url. */
  source_url?: string
  status?: EcosystemStatus | string
  created?: Ecosystem['created']
  updated?: Ecosystem['updated']
}

export type EcosystemInterfaceInput = EcosystemSurface & {
  key?: string
  src?: string
  text?: string
  href?: string
  appCount?: number
}

export type EcosystemSurfaceParts<T extends object = Partial<EcosystemSurface>> = {
  ecosystem?: T | null | undefined
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
  type EcosystemPill = EcosystemInterfaceCard
  type EcosystemCell = EcosystemInterfaceCard

  type EcosystemPreview = {
    id: string
    slug: string
    name: string
    description: string
    status: string
    appCount: number
    imageUrl: string
    websiteUrl: string
  }

  type EcosystemProfile = EcosystemPreview

  const resolveAppCount = (
    target?: EcosystemInterfaceInput | null | undefined
  ): number => {
    if (!target) return 0

    if (Number.isFinite(Number(target.appCount))) return Number(target.appCount)
    return 0
  }

  function surface<T extends object = Partial<EcosystemSurface>>(
    parts: EcosystemSurfaceParts<T>
  ): (T & EcosystemSurface) | null {
    const source = parts.ecosystem ?? null
    if (!source) return null

    const id = safeString((source as EcosystemSurface).id)
    if (!id) return null

    return {
      ...source,
      id,
    } as T & EcosystemSurface
  }

  function buildInterface(
    target?: EcosystemInterfaceInput | null | undefined
  ): EcosystemInterfaceCard | null {
    if (!target) return null

    const slug = safeString(target.slug)
    const key = safeString(target.key) || safeString(target.id) || slug
    const name = safeString(target.name)
    const resolvedId = safeString(target.id) || key || name

    if (!resolvedId || !(key || name)) return null

    const apps = resolveAppCount(target)

    return {
      id: resolvedId,
      to: safeString(target.href) ||
        (slug ? `/${EcosystemStorage.collection}/${encodeURIComponent(slug)}` : ''),
      imageUrl: safeString(target.src) || safeString(target.image_url),
      avatarText: safeString(target.text) || name || key,
      title: name || key || 'Untitled ecosystem',
      subtitle: slug || key || '',
      meta: `${apps} app${apps === 1 ? '' : 's'}`,
      badges: [
        labelize(safeString(target.status)),
        `${apps} app${apps === 1 ? '' : 's'}`,
      ].filter(Boolean),
    }
  }

  const toInterface = buildInterface

  function pill(
    target?: EcosystemInterfaceInput | null | undefined
  ): EcosystemPill | null {
    return buildInterface(target)
  }

  function cell(
    target?: EcosystemInterfaceInput | null | undefined
  ): EcosystemCell | null {
    return buildInterface(target)
  }

  function preview(
    target?: EcosystemInterfaceInput | null | undefined
  ): EcosystemPreview | null {
    const base = buildInterface(target)
    if (!base || !target) return null

    return {
      id: base.id,
      slug: safeString(target.slug || target.key || target.id),
      name: safeString(target.name || base.title),
      description: safeString(target.description),
      status: safeString(target.status),
      appCount: resolveAppCount(target),
      imageUrl: base.imageUrl,
      websiteUrl: safeString(target.website_url || target.source_url),
    }
  }

  function profile(
    target?: EcosystemInterfaceInput | null | undefined
  ): EcosystemProfile | null {
    const base = preview(target)
    if (!base || !target) return null

    return base
  }

  return {
    surface,
    interface: toInterface,
    pill,
    cell,
    preview,
    profile,
  }
}
