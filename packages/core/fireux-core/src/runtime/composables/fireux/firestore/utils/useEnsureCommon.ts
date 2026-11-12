// Shared "ensure" helpers used by user/app/profile ensure flows.
// Lives under firestore/utils (not firebase/) to avoid coupling higher levels to storage internals.

import { useRequireUser } from '../../firebase/useRequireUser'

export async function requireUid() {
  const auth = await useRequireUser()
  if (!auth?.uid) {
    throw new Error('[ensure] Missing authenticated user')
  }
  return { uid: auth.uid, auth }
}
