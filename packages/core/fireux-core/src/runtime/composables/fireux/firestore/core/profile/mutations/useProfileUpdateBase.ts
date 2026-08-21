import { useFireUXConfig } from '../../../../../../app/composables/config/FireUXConfig'
import { useRequireUser } from '../../../../firebase/useRequireUser'
import type { ProfileRefs } from '../fetch/useProfileFetch'
import { useFirestoreUpdate } from '../../../operations/useFirestoreUpdate'
import { readRuntimeIdentityFirestoreDatabaseId } from '../../../vuefire'
import type {
  ProfileAppStateBase,
  ProfileRecord,
} from '../../../../../../models/utils/profile.model'

function useProfileMutationIdentity<
  TCore extends ProfileRecord,
  TApp extends ProfileRecord,
>(profile?: ProfileRefs<TCore, TApp> | null) {
  const { appId } = useFireUXConfig()
  const hasAppScope = Boolean(appId)

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
    kind: string,
    explicit?: string | null
  ): Promise<string> => {
    const trimmed = explicit?.trim()
    const fromRefs = profile?.profile?.value?.id ?? null
    const user = await useRequireUser()
    if (!user?.uid) {
      throw new Error(
        `[useProfileUpdateBase] Unable to resolve User id for profile "${kind}".`
      )
    }
    const resolved = trimmed || fromRefs?.trim() || user.uid
    if (resolved !== user.uid) {
      throw new Error(
        `[useProfileUpdateBase] Client updates to ${kind} must target the signed-in User.`
      )
    }
    return resolved
  }

  return {
    appId,
    hasAppScope,
    pruneUndefined,
    cleanString,
    toStringArray,
    resolveUid,
  }
}

export function useProfileUpdateBase<
  TProfile extends ProfileRecord,
  TAppState extends ProfileRecord = ProfileAppStateBase,
>(kind: string, profile?: ProfileRefs<TProfile, TAppState> | null) {
  const identityUpdate = useFirestoreUpdate({
    databaseId: readRuntimeIdentityFirestoreDatabaseId(),
  })
  const base = useProfileMutationIdentity(profile)

  const updateProfile = async (
    patch: Partial<TProfile>,
    options: { id?: string | null } = {}
  ): Promise<void> => {
    const uid = await base.resolveUid(kind, options.id)
    await identityUpdate.updateDocument<TProfile>(
      `users/${uid}/profiles`,
      kind,
      base.pruneUndefined(patch)
    )
  }

  return {
    ...base,
    updateProfile,
  }
}

export function useProfileAppStateUpdateBase<
  TProfile extends ProfileRecord,
  TAppState extends ProfileRecord,
>(kind: string, profile?: ProfileRefs<TProfile, TAppState> | null) {
  const identityUpdate = useFirestoreUpdate({
    databaseId: readRuntimeIdentityFirestoreDatabaseId(),
  })
  const base = useProfileMutationIdentity(profile)

  const updateAppState = async (
    patch: Partial<TAppState>,
    options: { id?: string | null } = {}
  ): Promise<void> => {
    if (!base.hasAppScope || !base.appId) {
      throw new Error(
        `[useProfileUpdateBase] App context required for ${kind} App state.`
      )
    }

    const uid = await base.resolveUid(kind, options.id)
    await identityUpdate.updateDocument<TAppState>(
      `users/${uid}/profiles/${kind}/app-state`,
      base.appId,
      base.pruneUndefined(patch)
    )
  }

  return {
    ...base,
    updateAppState,
  }
}
