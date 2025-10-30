import { computed, isRef, ref, type Ref } from 'vue'
import { doc } from 'firebase/firestore'
import { useDocument, useFirestore } from 'vuefire'

import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import type { ProfileBase } from 'fireux-core/runtime/models/core/profile.model.ts'

export type ProfileIdSource = string | Ref<string | null | undefined>

interface UseProfileFetchOptions {
  collectionName: string
}

export type ProfileFetchResult<
  TCore extends ProfileBase,
  TApp extends ProfileBase
> = (Partial<TCore> & Partial<TApp>) & {
  id: string
  core: TCore | null
  app: TApp | null
}

export function useProfileFetch<
  TCore extends ProfileBase,
  TApp extends ProfileBase = TCore
>(idSource: ProfileIdSource, options: UseProfileFetchOptions) {
  const db = useFirestore()
  const { isTenant, appId } = useFireUXConfig()
  const idRef: Ref<string | null | undefined> = isRef(idSource)
    ? idSource
    : ref(idSource)

  const normalizedId = computed(() => {
    const raw = idRef.value
    if (typeof raw !== 'string') return null
    const trimmed = raw.trim()
    return trimmed.length ? trimmed : null
  })

  const { data: coreDoc } = useDocument<TCore>(() => {
    const id = normalizedId.value
    return id ? (doc(db, options.collectionName, id) as any) : null
  })

  const { data: appDoc } = useDocument<TApp>(() => {
    const id = normalizedId.value
    if (!(id && isTenant && appId)) return null
    return doc(db, 'apps', appId, options.collectionName, id) as any
  })

  const coreProfile = computed<TCore | null>(() => coreDoc.value ?? null)
  const appProfile = computed<TApp | null>(() =>
    isTenant ? appDoc.value ?? null : null
  )

  const profile = computed<ProfileFetchResult<TCore, TApp> | null>(() => {
    const id = normalizedId.value
    if (!id) return null

    const core = coreProfile.value
    if (!core) return null

    const app = appProfile.value

    const merged: ProfileFetchResult<TCore, TApp> = {
      id: core.id ?? id,
      core,
      app,
    } as ProfileFetchResult<TCore, TApp>

    Object.assign(merged, core)
    if (isTenant && app) Object.assign(merged, app)

    return merged
  })

  return {
    profile,
    coreProfile,
    appProfile,
  }
}
