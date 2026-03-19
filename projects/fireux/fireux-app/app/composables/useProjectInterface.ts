import type { Project } from 'fireux-core/runtime/models/system/project.model'

const safeString = (value: unknown) => String(value ?? '').trim()
const labelize = (value: string) =>
  safeString(value)
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ')

export namespace ProjectView {
  export type Row = Partial<Project> & {
    key?: string
  }

  export type Item = {
    id: string
    key: string
    name: string
    status: string
    description: string
    projectType: string
    imageUrl: string
  }
}

export namespace ProjectCard {
  export type Card = {
    id: string
    to: string
    imageUrl: string
    title: string
    subtitle: string
    meta: string
    badges: string[]
  }
}

export function useProjectInterface() {
  function item(target?: ProjectView.Row | null | undefined): ProjectView.Item | null {
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
      key,
      name,
      status,
      description,
      projectType,
      imageUrl,
    }
  }

  function card(target?: ProjectView.Item | null | undefined): ProjectCard.Card | null {
    if (!target) return null

    return {
      id: target.id,
      to: '',
      imageUrl: target.imageUrl,
      title: target.name || target.key || 'Untitled project',
      subtitle: target.key || '',
      meta:
        target.description ||
        [
          target.projectType ? `type ${labelize(target.projectType)}` : '',
          target.key ? `key ${target.key}` : '',
        ]
          .filter(Boolean)
          .join(' · '),
      badges: [labelize(target.status), labelize(target.projectType)].filter(Boolean),
    }
  }

  function searchText(target: ProjectView.Item): string {
    return [
      target.key,
      target.name,
      target.status,
      target.projectType,
      target.description,
    ]
      .join(' ')
      .trim()
      .toLowerCase()
  }

  return {
    item,
    card,
    searchText,
  }
}
