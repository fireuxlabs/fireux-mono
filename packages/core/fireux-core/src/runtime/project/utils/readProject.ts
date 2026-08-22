import type { Project } from '../models/project.model.ts'

const PROJECT_FIELDS = new Set([
  'status',
  'name',
  'description',
  'image_url',
  'created',
  'updated',
])
const PROJECT_STATUSES = new Set<Project['status']>([
  'active',
  'inactive',
  'archived',
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function isStamp(value: unknown, allowAppId = false): boolean {
  return (
    isRecord(value) &&
    isRecord(value.at) &&
    typeof value.at.seconds === 'number' &&
    typeof value.at.nanoseconds === 'number' &&
    Object.keys(value).every(
      (key) => key === 'at' || key === 'by' || (allowAppId && key === 'app_id')
    ) &&
    (value.by === undefined || typeof value.by === 'string') &&
    (value.app_id === undefined ||
      (allowAppId && typeof value.app_id === 'string'))
  )
}

/** Read one canonical Project. Firestore supplies its document identity. */
export function readProjectDocument(raw: unknown, id: string): Project | null {
  if (!id || !isRecord(raw)) return null
  if (Object.keys(raw).some((field) => !PROJECT_FIELDS.has(field))) return null
  if (
    !PROJECT_STATUSES.has(raw.status as Project['status']) ||
    typeof raw.name !== 'string' ||
    typeof raw.description !== 'string' ||
    typeof raw.image_url !== 'string' ||
    !isStamp(raw.created, true) ||
    !isStamp(raw.updated)
  ) {
    return null
  }
  return { ...raw, id } as Project
}
