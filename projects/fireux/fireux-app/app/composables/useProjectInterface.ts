import type { Project } from 'fireux-core/runtime/models/system/project.model'

const safeString = (value: unknown) => String(value ?? '').trim()
const labelize = (value: string) =>
  safeString(value)
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ')

export type ProjectInterfaceInput = Partial<Project> & {
  key?: string
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
  function buildInterface(
    target?: ProjectInterfaceInput | null | undefined
  ): ProjectInterfaceCard | null {
    if (!target) return null

    const id = safeString(target.id)
    const key = safeString(target.key) || id || safeString(target.slug)
    const name = safeString(target.name)
    const status = safeString(target.status) || 'active'
    const description = safeString(target.description)
    const projectType = safeString(target.project_type)
    const imageUrl = safeString(target.image_url)
    const resolvedId = id || key || name

    if (!resolvedId || !(key || name)) return null

    return {
      id: resolvedId,
      to: '',
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

  function searchText(target: ProjectInterfaceInput): string {
    const key = safeString(target.key) || safeString(target.id) || safeString(target.slug)

    return [
      key,
      safeString(target.name),
      safeString(target.status),
      safeString(target.project_type),
      safeString(target.description),
    ]
      .join(' ')
      .trim()
      .toLowerCase()
  }

  return {
    interface: buildInterface,
    searchText,
  }
}
