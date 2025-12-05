import { useFireUXConfig } from 'fireux-core/runtime/composables/core/config/FireUXConfig.ts'
import { requireUid } from 'fireux-core/runtime/composables/firestore/utils/useEnsureCommon.ts'
import {
  ensureCoreUserDocument,
  type EnsureCoreResult,
} from '../utils/ensureHelpers.ts'

type EnsureAuthContext = {
  uid: string
  email: string
  displayName: string
}

type EnsureCoreOutcome = EnsureCoreResult & { id: string }

type EnsureCoreOptions = {
  ecosystemName?: string
}

export function useCoreUserEnsure(options: EnsureCoreOptions = {}) {
  const { ecosystem } = useFireUXConfig()

  let authContextPromise: Promise<EnsureAuthContext> | null = null

  const resolveAuthContext = async () => {
    if (!authContextPromise) {
      authContextPromise = requireUid().then(({ uid, auth }) => ({
        uid,
        email: auth?.email ?? '',
        displayName: auth?.displayName || 'New User',
      }))
    }
    return authContextPromise
  }

  const ensureCoreUser = async (): Promise<EnsureCoreOutcome> => {
    const context = await resolveAuthContext()
    const result = await ensureCoreUserDocument(context.uid, {
      displayName: context.displayName,
      email: context.email,
      ecosystemName: options.ecosystemName ?? ecosystem,
    })
    return { ...result, id: context.uid }
  }

  return {
    ensureCoreUser,
    getAuthContext: resolveAuthContext,
  }
}
