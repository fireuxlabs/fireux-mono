import { readProjectDocument } from './readProject'

/** Exact anonymous ownership on a valid root; attribution alone is not a grant. */
export function isGuestProject(
  value: unknown,
  uid: string | null | undefined,
  appId: string
): boolean {
  if (!uid || !appId || !value || typeof value !== 'object') return false
  const project = readProjectDocument(value, uid)
  if (!project) return false
  const created = project.created
  return (
    project.guest_owner_uid === uid &&
    created?.by === uid &&
    created?.app_id === appId
  )
}
