import { useState } from '#imports'
import { useAuth } from '../firebase/useAuth'

// One transient, explicit navigation handoff. Never persisted or put in URLs.
export function useWorkspaceDraftHandoff() {
  const { uid } = useAuth()
  const pending = useState<{
    uid: string
    scope: string
    draft: string
    expires: number
  } | null>('workspace-draft-handoff', () => null)
  function put(scope: string, draft: string) {
    if (!uid.value || !draft.trim()) return false
    pending.value = {
      uid: uid.value,
      scope,
      draft: draft.trim().slice(0, 4000),
      expires: Date.now() + 300000,
    }
    return true
  }
  function take(scope: string) {
    const value = pending.value
    if (!value) return ''
    if (value.uid !== uid.value || value.expires < Date.now()) {
      pending.value = null
      return ''
    }
    if (value.scope !== scope) return ''
    pending.value = null
    return value.draft
  }
  return { put, take }
}
