// Concurrent edit — 2026-07-20 19:27 CEST — Repo Efficiency Pass 2 of 6: expose separate root and App profile mutation authorities.
import { useFireUXConfig } from '../../../../app/FireUXConfig'
import { useRequireUser } from '../../../../firebase/useRequireUser'
import type { ProfileRefs } from '../fetch/useProfileFetch'
import { useFirestoreUpdate } from '../../../operations/useFirestoreUpdate'
import { readRuntimeIdentityFirestoreDatabaseId } from '../../../vuefire'
import { AppStorage } from '../../../../../../app/models/app.model.ts'
import type {
  AppProfileBase,
  ProfileRecord,
} from '../../../../../../models/utils/profile.model'

function useProfileMutationIdentity<
  TCore extends ProfileRecord,
  TApp extends ProfileRecord,
>(profile?: ProfileRefs<TCore, TApp> | null) {
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

  const resolveUid = async (
    collectionName: string,
    explicit?: string | null
  ): Promise<string> => {
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

  return {
    appId,
    role,
    hasAppScope,
    isTenant,
    pruneUndefined,
    cleanString,
    toStringArray,
    resolveUid,
  }
}

export function useProfileRootUpdateBase<
  TCore extends ProfileRecord,
  TApp extends ProfileRecord = AppProfileBase,
>(collectionName: string, profile?: ProfileRefs<TCore, TApp> | null) {
  const identityUpdate = useFirestoreUpdate({
    databaseId: readRuntimeIdentityFirestoreDatabaseId(),
  })
  const base = useProfileMutationIdentity(profile)

  const updateCoreProfile = async (
    patch: Partial<TCore>,
    options: { id?: string | null } = {}
  ): Promise<void> => {
    const uid = await base.resolveUid(collectionName, options.id)
    await identityUpdate.updateDocument<TCore>(
      collectionName,
      uid,
      base.pruneUndefined(patch)
    )
  }

  return {
    ...base,
    updateCoreProfile,
  }
}

export function useProfileAppUpdateBase<
  TCore extends ProfileRecord,
  TApp extends ProfileRecord,
>(collectionName: string, profile?: ProfileRefs<TCore, TApp> | null) {
  const appUpdate = useFirestoreUpdate()
  const base = useProfileMutationIdentity(profile)

  const updateAppProfile = async (
    patch: Partial<TApp>,
    options: { id?: string | null } = {}
  ): Promise<void> => {
    if (!base.hasAppScope || !base.appId) {
      throw new Error(
        `[useProfileUpdateBase] App context required for app updates (${collectionName})`
      )
    }

    const uid = await base.resolveUid(collectionName, options.id)
    await appUpdate.updateDocument<TApp>(
      `${AppStorage.collection}/${base.appId}/${collectionName}`,
      uid,
      base.pruneUndefined(patch)
    )
  }

  return {
    ...base,
    updateAppProfile,
  }
}
