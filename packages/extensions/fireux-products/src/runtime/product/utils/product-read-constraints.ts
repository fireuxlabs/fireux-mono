import { where } from 'firebase/firestore'

/** Existing Product discovery scope, shared by collection and focused reads. */
export function productReadConstraints(
  scope: { appId: string; isTenant: boolean; role: string },
  canManage: boolean
) {
  if (canManage)
    return scope.appId ? [where('source_app_id', '==', scope.appId)] : null
  const constraints = [
    where('visibility', '==', 'public'),
    where('active', '==', true),
  ]
  if (scope.isTenant || scope.role === 'standalone') {
    if (!scope.appId) return null
    constraints.push(where('source_app_id', '==', scope.appId))
  }
  return constraints
}
