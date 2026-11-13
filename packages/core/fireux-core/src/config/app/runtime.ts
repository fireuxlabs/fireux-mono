import type { FireuxSeoConfig, FireuxSeoResolved } from './seo-config'
import type { FireuxMetaContent } from '../../runtime/app/literature/types'
import type {
  FireuxAppConfig,
  FireuxWorkspaceConfig,
  FireuxAppSubscriptionCapacity,
} from './types'

// Build-only inputs never form part of the public App runtime contract.
type RuntimeNormalizedFields =
  | 'context'
  | 'authEnabled'
  | 'firebaseSecrets'
  | 'extends'
  | 'databaseId'
  | 'modules'
  | 'workspaces'
  | 'workspaceConfig'
  | 'subscriptionCapacity'
  | 'domains'
  | 'profiles'
  | 'seo'
  | 'meta'

export type RuntimeApp = Omit<FireuxAppConfig, RuntimeNormalizedFields> & {
  /** Optional signed-in uid allowed to access developer-only dashboard tools. */
  developerId?: string
  /** Resolved public search policy and transport configuration. */
  seo?: FireuxSeoResolved
  domain: string
  /** Optional canonical origin used for SEO surfaces (e.g. https://fireux.app). */
  siteUrl?: string
  /** Registered root route keys excluded from public User handles. */
  reservedRouteKeys?: readonly string[]
  modules: readonly string[]
  workspaces: readonly string[]
  workspaceConfig: FireuxWorkspaceConfig
  subscriptionCapacity: FireuxAppSubscriptionCapacity
  domains: readonly string[]
  profiles: readonly string[]
}

export type RuntimeFirebaseEcosystem = {
  id: string
  name: string
  description: string
  firebase: {
    apiKey: string
    authDomain: string
    projectId: string
    storageBucket: string
    messagingSenderId: string
    databaseId?: string
    identityDatabaseId?: string
  }
}

export type RuntimeFirebaseApp = {
  apiKey?: string
  appId: string
}

export type RuntimePrivate = {
  initialAppContext?: string
  seo?: FireuxSeoConfig
  meta?: FireuxMetaContent
}

export type RuntimeShape = {
  app?: Partial<RuntimeApp>
  firebaseEcosystem?: Partial<RuntimeFirebaseEcosystem>
  firebaseApp?: Partial<RuntimeFirebaseApp>
  private?: Partial<RuntimePrivate>
}

// Accept only the configuration surface this writer needs, not Nuxt's full schema.
type RuntimeTarget = {
  runtimeConfig?: object
  options?: { runtimeConfig?: object }
}

type RuntimeValues = {
  public?: {
    fireux?: Partial<RuntimeApp>
    firebaseEcosystem?: Partial<RuntimeFirebaseEcosystem>
    firebaseApp?: Partial<RuntimeFirebaseApp>
  }
  fireux?: Partial<RuntimePrivate>
}

/** Config-time builders and module setup share the same runtime projection. */
function ensureRuntime(target: RuntimeTarget) {
  const config = target.options ?? target
  const runtime = (config.runtimeConfig ||= {}) as RuntimeValues
  const publicRuntime = (runtime.public ||= {})
  return { runtime, publicRuntime }
}

export function setRuntime(target: RuntimeTarget, values: RuntimeShape) {
  const { runtime, publicRuntime } = ensureRuntime(target)

  if (values.app)
    publicRuntime.fireux = { ...publicRuntime.fireux, ...values.app }
  if (values.firebaseEcosystem)
    publicRuntime.firebaseEcosystem = {
      ...publicRuntime.firebaseEcosystem,
      ...values.firebaseEcosystem,
    }
  if (values.firebaseApp)
    publicRuntime.firebaseApp = {
      ...publicRuntime.firebaseApp,
      ...values.firebaseApp,
    }
  if (values.private) runtime.fireux = { ...runtime.fireux, ...values.private }
}

export function setRuntimeFirebaseEcosystem(
  target: RuntimeTarget,
  config: Partial<RuntimeFirebaseEcosystem>
) {
  setRuntime(target, { firebaseEcosystem: config })
}
