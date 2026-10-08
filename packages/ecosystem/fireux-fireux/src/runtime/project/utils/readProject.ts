import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestoreDocumentId'
import type { Project, ProjectIdentity, ProjectPublicSummary } from '../models/project.model.ts'

const PROJECT_FIELDS = new Set(['id', 'identity', 'guest_owner_uid', 'created', 'updated'])
const IDENTITY_FIELDS = new Set(['status', 'name', 'description', 'image_url'])
const PROJECT_STATUSES = new Set<ProjectIdentity['status']>(['active', 'inactive', 'archived'])

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function isStamp(value: unknown, allowAppId = false): boolean {
  return (
    isRecord(value) && isRecord(value.at) &&
    typeof value.at.seconds === 'number' && typeof value.at.nanoseconds === 'number' &&
    Object.keys(value).every(key => key === 'at' || key === 'by' || (allowAppId && key === 'app_id')) &&
    (value.by === undefined || typeof value.by === 'string') &&
    (value.app_id === undefined || (allowAppId && typeof value.app_id === 'string'))
  )
}

function readIdentity(value: unknown): ProjectIdentity | null {
  if (!isRecord(value) || Object.keys(value).some(key => !IDENTITY_FIELDS.has(key)) ||
      !PROJECT_STATUSES.has(value.status as ProjectIdentity['status']) ||
      typeof value.name !== 'string' || !value.name.trim() || value.name.length > 120 ||
      typeof value.description !== 'string' || value.description.length > 2000 ||
      typeof value.image_url !== 'string' || value.image_url.length > 2048) return null
  return {
    status: value.status as ProjectIdentity['status'], name: value.name.trim(),
    description: value.description.trim(), image_url: value.image_url.trim(),
  }
}

/** Canonical root: document identity, local Identity, authority and audit only. */
export function readProjectDocument(raw: unknown, id: string): Project | null {
  if (!isFirestoreDocumentId(id) || !isRecord(raw) ||
      Object.keys(raw).some(field => !PROJECT_FIELDS.has(field)) ||
      (raw.id !== undefined && raw.id !== id) ||
      !isStamp(raw.created, true) || !isStamp(raw.updated)) return null
  const identity = readIdentity(raw.identity)
  if (!identity) return null
  const guestOwner = raw.guest_owner_uid
  if (guestOwner !== undefined && (
      typeof guestOwner !== 'string' || !isFirestoreDocumentId(guestOwner) || guestOwner !== id ||
      (raw.created as Project['created']).by !== guestOwner ||
      !isFirestoreDocumentId((raw.created as Project['created']).app_id)
  )) return null
  return {
    id, identity, created: raw.created as Project['created'], updated: raw.updated as Project['updated'],
    ...(guestOwner !== undefined ? { guest_owner_uid: guestOwner as string } : {}),
  }
}

/** Public reads validate their allowlist independently of private root metadata. */
export function readProjectPublicSummary(raw: unknown, id: string): ProjectPublicSummary | null {
  if (!isFirestoreDocumentId(id) || !isRecord(raw) || (raw.id !== undefined && raw.id !== id)) return null
  const identity = readIdentity(raw.identity)
  return identity ? { id, identity } : null
}
