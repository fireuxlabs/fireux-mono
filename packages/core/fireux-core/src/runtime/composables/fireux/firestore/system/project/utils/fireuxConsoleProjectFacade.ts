import type { ProjectStatus, ProjectType } from '../../../../../../../models/system/project.model'
import type { EcosystemSurface } from '../../ecosystem/utils/view/useEcosystemInterface'
import type { ProjectSurface } from './view/useProjectInterface'

const normalizeString = (value: unknown) => String(value || '').trim()

export type FireuxConsoleProject = Pick<
  ProjectSurface,
  | 'id'
  | 'name'
  | 'slug'
  | 'description'
  | 'image_url'
  | 'status'
  | 'project_type'
  | 'source_url'
  | 'console_endpoint_url'
  | 'app_id'
  | 'ecosystem_id'
  | 'firebase_project_id'
>

export type FireuxConsoleEcosystem = EcosystemSurface & { id: string }
export type FireuxConsoleAppRef = {
  id: string
  url: string
}

export type FireuxConsolePayload = {
  project?: FireuxConsoleProject | null
  ecosystem?: FireuxConsoleEcosystem | null
  apps?: FireuxConsoleAppRef[]
}

export type ProjectPublicFacade = FireuxConsoleProject

function normalizeProjectType(value: unknown): ProjectType | '' {
  const normalized = normalizeString(value).replace(/-/g, '_')
  if (normalized === 'ecosystem_app' || normalized === 'standalone_app') {
    return normalized
  }
  return ''
}

function normalizeProjectStatus(value: unknown): ProjectStatus {
  const normalized = normalizeString(value)
  if (
    normalized === 'draft' ||
    normalized === 'active' ||
    normalized === 'paused' ||
    normalized === 'archived'
  ) {
    return normalized
  }
  return 'active'
}

export function normalizeFireuxConsoleEndpoint(value: string) {
  const raw = normalizeString(value)
  if (!raw) {
    throw new Error('Project endpoint URL is required')
  }

  let url: URL
  try {
    url = new URL(raw)
  } catch {
    throw new Error('Enter a valid project endpoint URL')
  }

  if (url.pathname === '' || url.pathname === '/') {
    url.pathname = '/api/fireux-console'
    return url.toString()
  }

  if (url.pathname === '/api/fireux-console') {
    return url.toString()
  }

  throw new Error('Use the app URL or the full /api/fireux-console endpoint')
}

export function resolveFireuxConsoleEndpoint(target: {
  console_endpoint_url?: string
  source_url?: string
}) {
  const explicit = normalizeString(target.console_endpoint_url)
  if (explicit) return normalizeFireuxConsoleEndpoint(explicit)

  const sourceUrl = normalizeString(target.source_url)
  if (sourceUrl) return normalizeFireuxConsoleEndpoint(sourceUrl)

  throw new Error('Project does not expose a console endpoint URL')
}

export function readProjectPublicFacade(
  payload: unknown,
  normalizedUrl: string
): ProjectPublicFacade {
  const next = payload as FireuxConsolePayload | null
  if (!next?.project) {
    throw new Error('Project endpoint did not return the required console data')
  }

  const project = next.project
  const ecosystem = next.ecosystem
  const firebaseProjectId = normalizeString(project.firebase_project_id)
  if (!firebaseProjectId) {
    throw new Error('Project endpoint did not return a project id')
  }

  const normalizedEndpoint = normalizeFireuxConsoleEndpoint(normalizedUrl)
  const ecosystemId = normalizeString(
    project.ecosystem_id ||
      ecosystem?.slug ||
      ecosystem?.id
  )
  const normalizedProjectType = normalizeProjectType(project.project_type)

  return {
    id: normalizeString(project.id || ecosystemId || firebaseProjectId),
    name: normalizeString(project.name || ecosystem?.name),
    description: normalizeString(project.description || ecosystem?.description),
    slug: normalizeString(project.slug || ecosystem?.slug || project.id || firebaseProjectId),
    image_url: normalizeString(project.image_url || ecosystem?.image_url),
    status: normalizeProjectStatus(project.status || ecosystem?.status),
    project_type: normalizedProjectType || (ecosystemId ? 'ecosystem_app' : 'standalone_app'),
    source_url: normalizeString(
      project.source_url || ecosystem?.source_url || new URL(normalizedEndpoint).origin
    ),
    console_endpoint_url: normalizeString(project.console_endpoint_url || normalizedEndpoint),
    app_id: normalizeString(project.app_id),
    ecosystem_id: ecosystemId,
    firebase_project_id: firebaseProjectId,
  }
}
