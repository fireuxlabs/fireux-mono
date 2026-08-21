import type {
  Project,
  ProjectStatus,
} from '../models/project.model.ts'

const text = (value: unknown) => String(value ?? '').trim()
const labelize = (value: string) =>
  text(value)
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ')

export type ProjectSurface = {
  id?: string
  name?: string
  description?: string
  image_url?: string
  status?: ProjectStatus
}

export type ProjectSurfaceParts<TProject extends object = Partial<Project>> = {
  project?: TProject | null
}

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

function surface<TProject extends object = Partial<Project>>(
  parts: ProjectSurfaceParts<TProject>
): (TProject & ProjectSurface) | null {
  const source = parts.project
  const id = text((source as ProjectSurface | null)?.id)
  if (!source || !id) return null

  const raw = source as TProject & ProjectSurface
  return {
    ...raw,
    id,
    name: text(raw.name),
    description: text(raw.description),
    image_url: text(raw.image_url),
  }
}

function card(target?: ProjectSurface | null): ProjectInterfaceCard | null {
  if (!target) return null
  const id = text(target.id)
  if (!id) return null
  const description = text(target.description)
  return {
    id,
    // Project has no public detail route. Workspace selection owns navigation.
    to: '',
    imageUrl: text(target.image_url),
    title: text(target.name) || id,
    subtitle: description,
    meta: description,
    badges: [labelize(text(target.status))].filter(Boolean),
  }
}

function profile(
  target?: ProjectSurface | null
): ProjectInterfaceProfile | null {
  const item = surface({ project: target })
  if (!item) return null
  const id = text(item.id)
  return {
    id,
    name: text(item.name) || id,
    description: text(item.description),
    imageUrl: text(item.image_url),
    status: text(item.status),
  }
}

export function useProjectInterface() {
  return {
    surface,
    interface: card,
    identity: card,
    pill: card,
    cell: card,
    preview: profile,
    profile,
  }
}
