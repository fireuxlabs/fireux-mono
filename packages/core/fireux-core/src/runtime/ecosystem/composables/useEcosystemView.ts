import type { Ecosystem } from '../models/ecosystem.model.ts'
import type { EcosystemDirectoryEntry } from '../../models/utils/directory'

export type EcosystemCard = {
  id: string
  to: string
  imageUrl?: string
  avatarText: string
  title: string
  subtitle?: string
  badges: string[]
}

export type EcosystemDirectoryCard = EcosystemCard & { meta: string }

type EcosystemCardFields = Pick<
  Ecosystem,
  'id' | 'status' | 'name' | 'description' | 'image_url'
>

function statusLabel(status: Ecosystem['status']): string {
  return `${status.charAt(0).toUpperCase()}${status.slice(1)}`
}

function buildCard(source: EcosystemCardFields, to: string): EcosystemCard {
  return {
    id: source.id,
    to,
    ...(source.image_url !== undefined ? { imageUrl: source.image_url } : {}),
    avatarText: source.name,
    title: source.name,
    ...(source.description !== undefined
      ? { subtitle: source.description }
      : {}),
    badges: [statusLabel(source.status)],
  }
}

function toCard(ecosystem: Ecosystem): EcosystemCard {
  return buildCard(
    ecosystem,
    `/ecosystems/${encodeURIComponent(ecosystem.id)}`
  )
}

function toDirectoryCard(
  entry: EcosystemDirectoryEntry
): EcosystemDirectoryCard {
  const card = buildCard(entry, entry.detail_url)
  const meta = `${entry.app_count} app${entry.app_count === 1 ? '' : 's'}`
  return {
    ...card,
    meta,
  }
}

export function useEcosystemView() {
  return { toCard, toDirectoryCard }
}
