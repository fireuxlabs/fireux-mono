import { useRuntimeConfig } from '#imports'
import { doc, type DocumentSnapshot } from 'firebase/firestore'
import { computed, ref, unref, type Ref } from 'vue'
import { useDocument, useFirestore } from 'vuefire'
import type { FireuxProjectDoc } from '../../../../models/system/project.model'
import { normalizeRuntimeMode, normalizeString } from '../../runtime/runtime.normalize'
import type { RuntimeMode } from '../../runtime/runtime.types'
import { useFireUXConfig } from '../FireUXConfig'
import { getReadOnlyProjectScenario } from './read-only-scenarios'
import { useRuntimeProjectSelection } from './state'

export type RuntimeProjectMode = RuntimeMode

export type RuntimeProjectDoc = Partial<FireuxProjectDoc> & Record<string, unknown> & {
  id?: string
  name?: string
  project_name?: string
}

export type UseRuntimeProjectParams = {
  projectId?: string | Ref<string | null | undefined>
  mode?: RuntimeProjectMode | Ref<RuntimeProjectMode | null | undefined>
  collectionPath?: string | Ref<string | null | undefined>
}

const resolveRuntimeProjectCollectionPath = (
  mode: RuntimeProjectMode
): 'projects' | 'test-projects' => (mode === 'live' ? 'projects' : 'test-projects')

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

export function useRuntimeProject(params?: UseRuntimeProjectParams) {
  const cfg = useFireUXConfig()
  const runtimeConfig = useRuntimeConfig() as any
  const selection = useRuntimeProjectSelection()

  const runtimeProjectId = computed(() =>
    normalizeString(runtimeConfig.public?.firebaseEcosystem?.firebase?.projectId) ||
    normalizeString(cfg.ecosystem)
  )

  const idSource = computed(() =>
    params?.projectId !== undefined
      ? normalizeString(unref(params.projectId))
      : normalizeString(selection.runtimeProjectId.value)
  )
  const modeSource = computed(() =>
    params?.mode !== undefined ? unref(params.mode) : selection.runtimeProjectMode.value
  )

  const id = computed(() => normalizeString(idSource.value))
  const mode = computed<RuntimeProjectMode>(() => normalizeRuntimeMode(modeSource.value))
  const isReadOnly = computed(() => mode.value === 'read-only')
  const collectionPath = computed(() => {
    if (params?.collectionPath !== undefined) {
      const explicitPath = normalizeString(unref(params.collectionPath))
      if (explicitPath) return explicitPath
    }
    return resolveRuntimeProjectCollectionPath(mode.value)
  })

  const db = import.meta.server ? null : useFirestore()
  const docRef = computed(() => {
    if (!db) return null
    if (!id.value || isReadOnly.value) return null
    return doc(db, collectionPath.value, id.value)
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
    `${collectionPath.value}/${id.value || ''}`
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

  return {
    id,
    mode,
    isReadOnly,
    collectionPath,

    doc: project,
    project,
    pending,
    isLoading,
    isReady,
    hasDoc,

    name,
    ecosystem,
    appId,
    appName,
    firebaseProjectId: runtimeProjectId,
    readOnlyScenario,

    data: {
      name,
      ecosystem,
      appId,
      appName,
      firebaseProjectId: runtimeProjectId,
      hasDoc,
      readOnlyScenario,
    },
  }
}
