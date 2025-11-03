// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/profile/main/useProfileFetch.ts
import { useDocument, useFirestore } from 'vuefire'
import { doc } from 'firebase/firestore'
import type { Profile } from 'fireux-core/runtime/models/core/profile.model.ts'

export function useProfileFetch(id: string, collectionName: string) {
  const db = useFirestore()
  const { data: profile } = useDocument<Profile>(doc(db, collectionName, id))
  return { profile }
}