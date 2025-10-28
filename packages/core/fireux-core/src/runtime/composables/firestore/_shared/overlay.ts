// FILE: packages/core/fireux-core/src/runtime/composables/firestore/_shared/overlay.ts
import { computed, type ComputedRef, type Ref } from 'vue'
import {
  doc,
  type DocumentReference,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'

import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'

export interface OverlayAccessOptions<TCore, TApp, TResult> {
  id: Ref<string | null | undefined>
  key: string
  requireCore?: boolean
  map?: (input: OverlayMergeInput<TCore, TApp>) => TResult | null
}

export interface OverlayMergeInput<TCore, TApp> {
  id: string
  core: TCore | null
  app: TApp | null
  isTenant: boolean
  appId: string | null
}

export type OverlayRecord<TCore, TApp = TCore> = (Partial<TCore> &
  Partial<TApp>) & {
  id: string
  core: TCore | null
  app?: TApp | null
}

/** Generic “path → doc data” reader. Returns Ref<T | null | undefined> */
function getDocData<T>(db: Firestore, pathResolver: () => string | null) {
  const ref = computed(() => {
    const path = pathResolver()
    return path ? (doc(db, path) as DocumentReference<T>) : null
  })
  const { data } = useDocument<T>(
    ref as unknown as Ref<DocumentReference<DocumentData> | null>
  )
  return data // undefined while loading, null if missing, T when present
}

const normalizeId = (value: string | null | undefined) => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

const joinPath = (key: string, id: string) => {
  const leadingTrimmed = key.replace(/^\/+/, '')
  const cleanKey = leadingTrimmed.replace(/\/+$/u, '')
  return `${cleanKey}/${id}`
}

const resolveCollectionId = (record: unknown): string | null => {
  if (!record || typeof record !== 'object') return null
  const rawId = (record as { id?: unknown }).id
  if (typeof rawId !== 'string') return null
  return normalizeId(rawId)
}

const defaultMap = <TCore, TApp>(
  input: OverlayMergeInput<TCore, TApp>,
  requireCore: boolean | undefined,
  isTenantScope: boolean
): OverlayRecord<TCore, TApp> | null => {
  if (requireCore && !input.core) return null

  const base: OverlayRecord<TCore, TApp> = {
    id: input.id,
    core: input.core,
    ...(isTenantScope ? { app: input.app } : {}),
  } as OverlayRecord<TCore, TApp>

  if (input.core) Object.assign(base, input.core)
  if (isTenantScope && input.app) Object.assign(base, input.app)

  if (isTenantScope) base.app = input.app

  return base
}

export function createOverlayAccessors<
  TCore,
  TApp = TCore,
  TResult = OverlayRecord<TCore, TApp>
>(
  options: OverlayAccessOptions<TCore, TApp, TResult>
): {
  current: ComputedRef<TResult | null>
  byId: (id: string | null | undefined) => ComputedRef<TResult | null>
} {
  const db = useFirestore()
  const { isTenant, appId } = useFireUXConfig()

  const build = (uidRef: ComputedRef<string | null>) => {
    const coreDoc = getDocData<TCore>(db, () => {
      const id = uidRef.value
      return id ? joinPath(options.key, id) : null
    })

    const appDoc = getDocData<TApp>(db, () => {
      const id = uidRef.value
      if (!id || !isTenant || !appId) return null
      return joinPath(`apps/${appId}/${options.key}`, id)
    })

    return computed<TResult | null>(() => {
      const id = uidRef.value
      if (!id) return null

      const core = (coreDoc.value ?? null) as TCore | null
      const app = (appDoc.value ?? null) as TApp | null

      const payload: OverlayMergeInput<TCore, TApp> = {
        id,
        core,
        app: isTenant ? app : null,
        isTenant,
        appId: appId ?? null,
      }

      const mapper = options.map
      const result = mapper
        ? mapper(payload)
        : (defaultMap(payload, options.requireCore, isTenant) as TResult | null)

      if (!result) return null
      return result
    })
  }

  const current = build(computed(() => normalizeId(options.id.value)))

  const byId = (rawId: string | null | undefined) =>
    build(computed(() => normalizeId(rawId)))

  return { current, byId }
}

export interface OverlayCollectionMergeOptions<TCore, TApp, TResult> {
  cores: ReadonlyArray<TCore | null | undefined>
  overlays?: ReadonlyArray<TApp | null | undefined>
  isTenant: boolean
  appId: string | null
  requireCore?: boolean
  map?: (input: OverlayMergeInput<TCore, TApp>) => TResult | null
}

export function mergeOverlayCollection<
  TCore,
  TApp = TCore,
  TResult = OverlayRecord<TCore, TApp>
>(options: OverlayCollectionMergeOptions<TCore, TApp, TResult>): TResult[] {
  const {
    cores,
    overlays = [],
    isTenant,
    appId,
    requireCore,
    map,
  } = options

  const mapper = map ?? ((input: OverlayMergeInput<TCore, TApp>) =>
    defaultMap(input, requireCore, isTenant) as TResult | null
  )

  const overlaysById = isTenant
    ? overlays.reduce((acc, overlay) => {
        if (!overlay) return acc
        const id = resolveCollectionId(overlay)
        if (id) acc.set(id, overlay)
        return acc
      }, new Map<string, TApp>())
    : null

  const results: TResult[] = []

  const pushRecord = (id: string | null, core: TCore | null, overlay: TApp | null) => {
    if (!id) return
    const payload: OverlayMergeInput<TCore, TApp> = {
      id,
      core,
      app: isTenant ? overlay : null,
      isTenant,
      appId,
    }
    const record = mapper(payload)
    if (record) results.push(record)
  }

  for (const core of cores) {
    if (!core) continue
    const id = resolveCollectionId(core)
    const overlay = id && overlaysById ? overlaysById.get(id) ?? null : null
    pushRecord(id, core, overlay ?? null)
    if (overlay && overlaysById && id) overlaysById.delete(id)
  }

  if (overlaysById && !requireCore) {
    for (const [id, overlay] of overlaysById.entries()) {
      pushRecord(id, null, overlay)
    }
  }

  return results
}
