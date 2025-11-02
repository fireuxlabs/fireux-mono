// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/profile/main/useProfileFetch.ts
import { ref, isRef, type Ref } from 'vue'
import { doc } from 'firebase/firestore'
import { useDocument, useFirestore } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import type { ProfileBase } from 'fireux-core/runtime/models/core/profile.model.ts'

export type ProfileIdSource = string | Ref<string | null | undefined>

interface UseProfileFetchOptions {
  collectionName: string
}

export function useProfileFetch<
  TCore extends ProfileBase,
  TApp extends ProfileBase = TCore
>(idSource: ProfileIdSource, options: UseProfileFetchOptions) {
  const db = useFirestore()
  const { isTenant, appId } = useFireUXConfig()
  const idRef: Ref<string | null | undefined> = isRef(idSource) ? idSource : ref(idSource)

  const { data: coreProfile } = useDocument<TCore>(() => {
    const id = idRef.value
    return id ? (doc(db, options.collectionName, id) as any) : null
  })

  const { data: appProfile } = useDocument<TApp>(() => {
    const id = idRef.value
    if (!(id && isTenant && appId)) return null
    return doc(db, 'apps', appId, options.collectionName, id) as any
  })

  return { coreProfile, appProfile }
}