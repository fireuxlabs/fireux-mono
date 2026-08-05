import type {
  Project,
  ProjectStatus,
} from '../../../../../../../models/system/project.model'

const safeString = (value: unknown) => String(value ?? '').trim()
const labelize = (value: string) =>
  safeString(value)
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
  created?: Project['created']
  updated?: Project['updated']
}
export type ProjectSurfaceParts<TProject extends object = Partial<Project>> = {
  project?: TProject | null | undefined
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

export function useProjectInterface() {
  type ProjectIdentity = ProjectInterfaceCard
  type ProjectPill = ProjectInterfaceCard
  type ProjectCell = ProjectInterfaceCard
  type ProjectPreview = ProjectInterfaceCard
  type ProjectProfile = ProjectInterfaceCard

  function surface<TProject extends object = Partial<Project>>(
    parts: ProjectSurfaceParts<TProject>
  ): (TProject & ProjectSurface) | null {
    const source = parts.project ?? null
    if (!source) return null

    const raw = source as TProject & ProjectSurface
    const id = safeString(raw.id)
    if (!id) return null

    return {
      id,
      name: safeString(raw.name),
      description: safeString(raw.description),
      image_url: safeString(raw.image_url),
      status: raw.status,
      created: raw.created,
      updated: raw.updated,
    } as TProject & ProjectSurface
  }

  function buildInterface(
    target?: ProjectSurface | null | undefined
  ): ProjectInterfaceCard | null {
    if (!target) return null

    const id = safeString(target.id)
    const name = safeString(target.name)
    const status = safeString(target.status)
    const description = safeString(target.description)
    const imageUrl = safeString(target.image_url)

    if (!id) return null

    return {
      id,
      to: '',
      imageUrl,
      title: name,
      subtitle: description,
      meta: description,
      badges: [labelize(status)].filter(Boolean),
    }
  }

  const toInterface = buildInterface

  function identity(
    target?: ProjectSurface | null | undefined
  ): ProjectIdentity | null {
    return buildInterface(target)
  }

  function pill(
    target?: ProjectSurface | null | undefined
  ): ProjectPill | null {
    return buildInterface(target)
  }

  function cell(
    target?: ProjectSurface | null | undefined
  ): ProjectCell | null {
    return buildInterface(target)
  }

  function preview(
    target?: ProjectSurface | null | undefined
  ): ProjectPreview | null {
    return buildInterface(target)
  }

  function profile(
    target?: ProjectSurface | null | undefined
  ): ProjectProfile | null {
    return identity(target)
  }

  return {
    surface,
    interface: toInterface,
    identity,
    pill,
    cell,
    preview,
    profile,
  }
}
