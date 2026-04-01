import { useRuntimeConfig } from '#imports'
import { doc, type DocumentSnapshot } from 'firebase/firestore'
import { useDocument, useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { computed, ref, unref, type Ref } from 'vue'
import type { ProjectDoc } from 'fireux-core/runtime/models/system/project.model'
import { normalizeString } from 'fireux-core/runtime/composables/fireux/runtime/runtime.normalize'
import type { RuntimeMode } from 'fireux-core/runtime/composables/fireux/runtime/runtime.types'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { getReadOnlyProjectScenario } from './read-only-scenarios'
import { useRuntimeProjectSelection } from './state'
import {
  useRuntimeProjectContext,
  type UseRuntimeProjectParams,
} from './useRuntimeProjectContext'

export type RuntimeProjectMode = RuntimeMode

export type RuntimeProjectDoc = Partial<ProjectDoc> & Record<string, unknown> & {
  id?: string
  name?: string
  project_name?: string
}

const ROOT_PROJECT_COLLECTION_PATH = 'projects'

const resolveProjectConsoleCollectionPath = (appId?: unknown): string => {
  const resolvedAppId = normalizeString(appId)
  return resolvedAppId ? `apps/${resolvedAppId}/${ROOT_PROJECT_COLLECTION_PATH}` : ROOT_PROJECT_COLLECTION_PATH
}

const resolveRuntimeProjectDocumentCollectionPath = (
  mode: RuntimeProjectMode
): string => ROOT_PROJECT_COLLECTION_PATH

const resolveRuntimeProjectDataCollectionPath = (
  mode: RuntimeProjectMode,
  appId?: unknown
): string => resolveProjectConsoleCollectionPath(appId)

function isOfflineFirestoreError(error: unknown): boolean {
  const code = typeof (error as any)?.code === 'string' ? (error as any).code : ''
  const message = String((error as any)?.message ?? '').toLowerCase()
  return code === 'unavailable' || message.includes('client is offline')
}

function guardDocumentPromise(
  state: { promise?: Ref<Promise<unknown>> },
  context: string
) {
  const promise = state.promise?.value
  if (!promise || typeof promise.catch !== 'function') return

  promise.catch((error) => {
    if (!import.meta.dev) return
    if (isOfflineFirestoreError(error)) {
      console.warn(`[useRuntimeProject] offline read ignored (${context})`, error)
      return
    }
    console.error(`[useRuntimeProject] read failed (${context})`, error)
  })
}

/**
 * Canon project console seam.
 *
 * Root project identity stays at `/projects/<id>`.
 * App-hosted project console state lives under the app project scope.
 */
export function useRuntimeProject(params?: UseRuntimeProjectParams) {
  const cfg = useFireUXConfig()
  const runtimeConfig = useRuntimeConfig() as any
  const selection = useRuntimeProjectSelection()

  const runtimeProjectId = computed(() =>
    normalizeString(runtimeConfig.public?.firebaseEcosystem?.firebase?.projectId) ||
    normalizeString(cfg.ecosystem)
  )

  const { id, mode, isReadOnly } = useRuntimeProjectContext(params, selection)
  const documentCollectionPath = computed(() => {
    if (params?.collectionPath !== undefined) {
      const explicitPath = normalizeString(unref(params.collectionPath))
      if (explicitPath) return explicitPath
    }
    return resolveRuntimeProjectDocumentCollectionPath(mode.value)
  })
  const projectCollectionPath = computed(() =>
    resolveRuntimeProjectDataCollectionPath(mode.value, cfg.appId)
  )

  const db = import.meta.server ? null : useFirestore()
  const docRef = computed(() => {
    if (!db) return null
    if (!id.value || isReadOnly.value) return null
    return doc(db, documentCollectionPath.value, id.value)
  })

  const docState =
    import.meta.server || !db
      ? {
          data: ref<RuntimeProjectDoc | undefined>(undefined),
          pending: ref(false),
        }
      : useDocument<RuntimeProjectDoc | undefined>(docRef as any, {
          transform: (docSnap: DocumentSnapshot<RuntimeProjectDoc>) => {
            const raw = docSnap.data()
            if (!raw) return undefined
            return { ...(raw as any), id: docSnap.id } as RuntimeProjectDoc
          },
        } as any)

  guardDocumentPromise(
    docState as any,
    `${documentCollectionPath.value}/${id.value || ''}`
  )

  const readOnlyScenario = computed(() =>
    isReadOnly.value ? getReadOnlyProjectScenario(id.value) : null
  )

  const project = computed<RuntimeProjectDoc | null>(() => {
    if (!id.value) return null
    if (isReadOnly.value) return (readOnlyScenario.value?.project as RuntimeProjectDoc) ?? null
    return docState.data?.value ?? null
  })

  const pending = computed(() => (isReadOnly.value ? false : Boolean(docState.pending?.value)))
  const isLoading = computed(() => pending.value)

  // Project runtime should remain valid even before a /projects/<id> doc exists.
  const isReady = computed(() => {
    if (!id.value) return false
    if (isReadOnly.value) return true
    return !isLoading.value
  })
  const hasDoc = computed(() => Boolean(project.value))

  const name = computed(() =>
    String(project.value?.name || project.value?.project_name || '').trim()
  )
  const ecosystem = computed(() => String(cfg.ecosystem || '').trim())
  const appId = computed(() => String(cfg.appId || '').trim())
  const appName = computed(() => String(cfg.appName || '').trim())
  const data = {
    name,
    ecosystem,
    appId,
    appName,
    firebaseProjectId: runtimeProjectId,
    hasDoc,
    readOnlyScenario,
  }

  return {
    id,
    mode,
    isReadOnly,
    collectionPath: projectCollectionPath,
    documentCollectionPath,
    projectCollectionPath,

    doc: project,
    pending,
    isLoading,
    isReady,
    data,

    project,
    hasDoc,
    name,
    ecosystem,
    appId,
    appName,
    firebaseProjectId: runtimeProjectId,
    readOnlyScenario,
  }
}
