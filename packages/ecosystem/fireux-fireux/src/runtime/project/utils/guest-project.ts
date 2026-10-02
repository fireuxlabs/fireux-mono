/** Exact anonymous ownership; creator attribution alone is not a guest grant. */
export function isGuestProject(
  value: unknown,
  uid: string | null | undefined,
  appId: string
): boolean {
  if (!uid || !appId || !value || typeof value !== 'object') return false
  const project = value as Record<string, unknown>
  const created = project.created as Record<string, unknown> | undefined
  return (
    project.guest_owner_uid === uid &&
    created?.by === uid &&
    created?.app_id === appId
  )
}
