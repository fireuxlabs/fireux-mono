// Concurrent edit — 2026-07-20 11:52 CEST — Security spine: bind browser profile mutations to the authenticated User id.
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: strip embedded User snapshots from all profile patches.
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { readRuntimeIdentityFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model'
import type { ProfileRecord } from 'fireux-core/runtime/models/core/profile.model'

type Scope = 'core' | 'app'

export function useProfileUpdateBase<TCore extends ProfileRecord>(
  collectionName: string,
  profile?: ProfileRefs<TCore> | null
) {
  const identityUpdate = useFirestoreUpdate({
    databaseId: readRuntimeIdentityFirestoreDatabaseId(),
  })
  const appUpdate = useFirestoreUpdate()
  const { appId, role } = useFireUXConfig()
  const hasAppScope = Boolean(appId)
  const isTenant = role === 'tenant' && Boolean(appId)

  const pruneUndefined = <T extends Record<string, any>>(
    payload: Partial<T>
  ) => {
    const entries = Object.entries(payload).filter(
      ([key, value]) => key !== 'user' && value !== undefined
    )
    return Object.fromEntries(entries) as Partial<T>
  }

  const cleanString = (value: string | null | undefined) => {
    const normalized = typeof value === 'string' ? value.trim() : ''
    return normalized.length ? normalized : null
  }

  const toStringArray = (value: string | string[]) =>
    Array.from(
      new Set(
        (Array.isArray(value) ? value : (value ?? '').split(','))
          .map((item) => String(item ?? '').trim())
          .filter(Boolean)
      )
    )

  const resolveUid = async (explicit?: string | null): Promise<string> => {
    const trimmed = explicit?.trim()
    const fromRefs =
      profile?.coreProfile?.value?.id ?? profile?.appProfile?.value?.id ?? null
    const user = await useRequireUser()
    if (!user?.uid) {
      throw new Error(
        `[useProfileUpdateBase] Unable to resolve id for collection "${collectionName}"`
      )
    }
    const resolved = trimmed || fromRefs?.trim() || user.uid
    if (resolved !== user.uid) {
      throw new Error(
        `[useProfileUpdateBase] Client updates to ${collectionName} must target the signed-in user.`
      )
    }
    return resolved
  }

  const updateCoreProfile = async (
    patch: Partial<TCore>,
    options: { id?: string | null } = {}
  ): Promise<void> => {
    const uid = await resolveUid(options.id)
    await identityUpdate.updateDocument<TCore>(
      collectionName,
      uid,
      pruneUndefined(patch)
    )
  }

  const updateAppProfile = async (
    patch: Partial<TCore>,
    options: { id?: string | null } = {}
  ): Promise<void> => {
    if (!hasAppScope || !appId) {
      throw new Error(
        `[useProfileUpdateBase] App context required for app updates (${collectionName})`
      )
    }

    const uid = await resolveUid(options.id)
    await appUpdate.updateDocument<TCore>(
      `${AppStorage.collection}/${appId}/${collectionName}`,
      uid,
      pruneUndefined(patch)
    )
  }

  const commitUpdate = async (
    patch: Partial<TCore>,
    options: { id?: string | null; scope?: Scope } = {}
  ): Promise<void> => {
    const scope = options.scope ?? 'core'
    if (scope === 'app') return updateAppProfile(patch, options)
    return updateCoreProfile(patch, options)
  }

  return {
    appId,
    role,
    hasAppScope,
    isTenant,

    pruneUndefined,
    cleanString,
    toStringArray,
    resolveUid,

    commitUpdate,
    updateCoreProfile,
    updateAppProfile,
  }
}
