import type { Ecosystem } from '../models/ecosystem.model.ts'
import type { EcosystemDirectoryEntry } from '../../models/utils/directory'
import type { PublicEcosystemDto } from '../../server/utils/public-projection/public-dto.types.ts'

const text = (value: unknown) => String(value ?? '').trim()
const labelize = (value: string) =>
  text(value)
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ')

export type EcosystemSurface = Partial<Ecosystem> | PublicEcosystemDto | EcosystemDirectoryEntry

export type EcosystemInterfaceInput = EcosystemSurface & {
  key?: string
  src?: string
  text?: string
  href?: string
  appCount?: number
}

export type EcosystemSurfaceParts<T extends object = EcosystemSurface> = {
  ecosystem?: T | null
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

export type EcosystemInterfaceProfile = {
  id: string
  name: string
  description: string
  status: string
  appCount: number
  imageUrl: string
  websiteUrl: string
}

function resolveAppCount(target?: EcosystemInterfaceInput | null): number {
  if (!target) return 0
  if ('app_count' in target && Number.isFinite(Number(target.app_count))) {
    return Math.max(0, Math.trunc(Number(target.app_count)))
  }
  return Number.isFinite(Number(target.appCount))
    ? Math.max(0, Math.trunc(Number(target.appCount)))
    : 0
}

function surface<T extends object = EcosystemSurface>(
  parts: EcosystemSurfaceParts<T>
): (T & { id: string }) | null {
  const source = parts.ecosystem
  const id = text((source as { id?: unknown } | null)?.id)
  return source && id ? ({ ...source, id } as T & { id: string }) : null
}

function buildCard(target?: EcosystemInterfaceInput | null): EcosystemInterfaceCard | null {
  if (!target) return null
  const id = text(target.id || target.key)
  const name = text(target.name)
  if (!id) return null

  const apps = resolveAppCount(target)
  return {
    id,
    to: text(target.href) || `/ecosystems/${encodeURIComponent(id)}`,
    imageUrl: text(target.src) || text(target.image_url),
    avatarText: text(target.text) || name || id,
    title: name || id,
    subtitle: id,
    meta: `${apps} app${apps === 1 ? '' : 's'}`,
    badges: [
      labelize(text(target.status)),
      `${apps} app${apps === 1 ? '' : 's'}`,
    ].filter(Boolean),
  }
}

function profile(
  target?: EcosystemInterfaceInput | null
): EcosystemInterfaceProfile | null {
  const card = buildCard(target)
  if (!card || !target) return null
  return {
    id: card.id,
    name: text(target.name) || card.title,
    description: text(target.description),
    status: text(target.status),
    appCount: resolveAppCount(target),
    imageUrl: card.imageUrl,
    websiteUrl: text(target.website_url),
  }
}

export function useEcosystemInterface() {
  return {
    surface,
    interface: buildCard,
    pill: buildCard,
    cell: buildCard,
    preview: profile,
    profile,
  }
}
