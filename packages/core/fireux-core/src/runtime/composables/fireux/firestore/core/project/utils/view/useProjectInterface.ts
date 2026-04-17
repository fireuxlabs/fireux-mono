import type {
  Project,
  ProjectStatus,
  ProjectType,
} from '../../../../../../../models/system/project.model'

const safeString = (value: unknown) => String(value ?? '').trim()
const DEFAULT_PROJECT_IMAGE = '/img/core/brand/logo.png'
const resolveProjectPath = (target: { slug?: string; id?: string }) => {
  const slug = safeString(target.slug)
  const id = safeString(target.id)
  const key = slug || id
  return key ? `/projects/${key}` : ''
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
  created?: Project['created']
  updated?: Project['updated']
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
  type ProjectPill = ProjectInterfaceCard
  type ProjectCell = ProjectInterfaceCard
  type ProjectPreview = ProjectInterfaceCard
  type ProjectProfile = ProjectInterfaceCard

  function buildInterface(
    target?: ProjectSurface | null | undefined
  ): ProjectInterfaceCard | null {
    if (!target) return null

    const id = safeString(target.id)
    const key = safeString(target.key) || id || safeString(target.slug)
    const name = safeString(target.name)
    const status = safeString(target.status) || 'active'
    const description = safeString(target.description)
    const projectType = safeString(target.project_type)
    const imageUrl = safeString(target.image_url) || DEFAULT_PROJECT_IMAGE
    const resolvedId = id || key || name

    if (!resolvedId || !(key || name)) return null

    return {
      id: resolvedId,
      to: resolveProjectPath({ slug: target.slug, id: resolvedId }),
      imageUrl,
      title: name || key || 'Untitled project',
      subtitle: key || '',
      meta:
        description ||
        [
          projectType ? `type ${labelize(projectType)}` : '',
          key ? `key ${key}` : '',
        ]
          .filter(Boolean)
          .join(' · '),
      badges: [labelize(status), labelize(projectType)].filter(Boolean),
    }
  }

  const toInterface = buildInterface

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
    return buildInterface(target)
  }

  return {
    interface: toInterface,
    pill,
    cell,
    preview,
    profile,
  }
}
