import type {
  ProjectPublicSummary,
} from '../models/project.model.ts'

const text = (value: unknown) => String(value ?? '').trim()
const labelize = (value: string) =>
  text(value)
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ')

export type ProjectSurface = ProjectPublicSummary

export type ProjectInterfaceCard = {
  id: string
  to: string
  imageUrl: string
  title: string
  subtitle: string
  meta: string
  badges: string[]
}

export type ProjectInterfaceProfile = {
  id: string
  name: string
  description: string
  imageUrl: string
  status: string
}

function card(target?: ProjectSurface | null): ProjectInterfaceCard | null {
  if (!target) return null
  const id = text(target.id)
  if (!id) return null
  const description = text(target.identity.description)
  return {
    id,
    to: `/projects/${encodeURIComponent(id)}`,
    imageUrl: text(target.identity.image_url),
    title: text(target.identity.name) || id,
    subtitle: description,
    meta: description,
    badges: [labelize(text(target.identity.status))].filter(Boolean),
  }
}

function profile(
  target?: ProjectSurface | null
): ProjectInterfaceProfile | null {
  if (!target) return null
  const id = text(target.id)
  if (!id) return null
  return {
    id,
    name: text(target.identity.name) || id,
    description: text(target.identity.description),
    imageUrl: text(target.identity.image_url),
    status: text(target.identity.status),
  }
}

export function useProjectInterface() {
  return {
    interface: card,
    identity: card,
    pill: card,
    cell: card,
    preview: profile,
    profile,
  }
}
