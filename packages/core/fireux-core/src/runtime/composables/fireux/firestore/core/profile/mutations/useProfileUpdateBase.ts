import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'

type Scope = 'core' | 'app'

export function useProfileUpdateBase<TCore extends { id: string }>(
  collectionName: string,
  profile?: ProfileRefs<TCore> | null
) {
  const { updateDocument } = useFirestoreUpdate()
  const { appId, role } = useFireUXConfig()
  const isTenant = role === 'tenant' && Boolean(appId)

  const pruneUndefined = <T extends Record<string, any>>(payload: T) => {
    const entries = Object.entries(payload).filter(
      ([, value]) => value !== undefined
    )
    return Object.fromEntries(entries) as Partial<T>
  }

  const cleanString = (value: string | null | undefined) => {
    const normalized = typeof value === 'string' ? value.trim() : ''
    return normalized.length ? normalized : null
  }

  const csvToArray = (value: string) =>
    Array.from(
      new Set(
        (value ?? '')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      )
    )

  const resolveUid = async (explicit?: string | null): Promise<string> => {
    const trimmed = explicit?.trim()
    if (trimmed) return trimmed

    const fromRefs =
      profile?.coreProfile?.value?.id ?? profile?.appProfile?.value?.id ?? null
    if (fromRefs?.trim()) return fromRefs.trim()

    const user = await useRequireUser()
    if (!user?.uid) {
      throw new Error(
        `[useProfileUpdateBase] Unable to resolve id for collection "${collectionName}"`
      )
    }
    return user.uid
  }

  const updateCoreProfile = async (
    patch: Partial<TCore>,
    options: { id?: string | null } = {}
  ): Promise<void> => {
    const uid = await resolveUid(options.id)
    await updateDocument<TCore>(collectionName, uid, pruneUndefined(patch as any))
  }

  const updateAppProfile = async (
    patch: Partial<TCore>,
    options: { id?: string | null } = {}
  ): Promise<void> => {
    if (!isTenant || !appId) {
      throw new Error(
        `[useProfileUpdateBase] Tenant context required for app updates (${collectionName})`
      )
    }

    const uid = await resolveUid(options.id)
    await updateDocument<TCore>(
      `apps/${appId}/${collectionName}`,
      uid,
      pruneUndefined(patch as any)
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
    isTenant,

    pruneUndefined,
    cleanString,
    csvToArray,
    resolveUid,

    commitUpdate,
    updateCoreProfile,
    updateAppProfile,
  }
}