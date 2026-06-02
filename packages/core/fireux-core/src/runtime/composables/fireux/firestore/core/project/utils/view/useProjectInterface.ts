import type {
  Project,
  ProjectStatus,
  ProjectType,
  AppProject,
} from '../../../../../../../models/system/project.model'
import { ProjectStorage } from '../../../../../../../models/system/project.model'

const safeString = (value: unknown) => String(value ?? '').trim()
const resolveProjectPath = (target: { slug?: string }) => {
  const slug = safeString(target.slug)
  return slug ? `/${ProjectStorage.rootCollection}/${slug}` : ''
}
const labelize = (value: string) =>
  safeString(value)
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ')

export type ProjectSurface = {
  id?: string
  key?: string
  app_scope_state?: Project['app_scope_state']
  app_scope_app_id?: Project['app_scope_app_id']
  name?: string
  slug?: string
  description?: string
  image_url?: string
  status?: ProjectStatus | string
  source_url?: string
  primary_project?: boolean
  project_type?: ProjectType | string
  console_endpoint_url?: string
  app_id?: string
  ecosystem_id?: string
  firebase_project_id?: string
  owner_user_id?: string
  operator_ids?: string[]
  team_ids?: string[]
  created?: Project['created']
  updated?: Project['updated']
}
export type ProjectSurfaceParts<TProject extends object = Partial<Project>> = {
  project?: TProject | null | undefined
  overlay?: Partial<AppProject> | Record<string, unknown> | null | undefined
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

    const merged = {
      ...source,
      ...(parts.overlay ?? {}),
    } as TProject & ProjectSurface
    const id = safeString(merged.id)
    if (!id) return null

    return {
      ...merged,
      id,
    }
  }

  function buildInterface(
    target?: ProjectSurface | null | undefined
  ): ProjectInterfaceCard | null {
    if (!target) return null

    const id = safeString(target.id)
    const name = safeString(target.name)
    const status = safeString(target.status)
    const description = safeString(target.description)
    const projectType = safeString(target.project_type)
    const imageUrl = safeString(target.image_url)

    if (!id) return null

    return {
      id,
      to: resolveProjectPath({ slug: target.slug }),
      imageUrl,
      title: name,
      subtitle: description,
      meta: description,
      badges: [labelize(status), labelize(projectType)].filter(Boolean),
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
