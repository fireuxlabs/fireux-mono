import {
  collection,
  doc,
} from 'firebase/firestore'
import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { requireUid } from 'fireux-core/runtime/composables/fireux/firestore/utils/useEnsureCommon'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import {
  BlankStorage,
  type AppBlank,
  type Blank,
} from '../../../../models/blank.model'

const text = (value: unknown) => String(value ?? '').trim()

type CreateBlankInput = {
  name?: string
}

export function blankAppCollectionPath(appId: string) {
  const resolvedAppId = text(appId)
  if (!resolvedAppId) return ''

  return `${AppStorage.collection}/${resolvedAppId}/${BlankStorage.appCollection}`
}

export function useBlankCollection() {
  const { appId } = useFireUXConfig()
  const { firestoreFetchCollection, firestoreLoadDocsByIds } = useFirestoreRead()
  const appCollectionPath = computed(() => blankAppCollectionPath(appId))
  const appBlanks = firestoreFetchCollection<AppBlank>(appCollectionPath)
  const blankIds = computed(() =>
    (appBlanks.value ?? [])
      .map((blank) => text(blank.blank_id || blank.id))
      .filter(Boolean)
  )
  const rootBlanks = firestoreLoadDocsByIds<Blank>({
    collectionPath: BlankStorage.rootCollection,
    ids: blankIds,
  })
  const blanks = computed<Blank[]>(() => {
    const overlaysById = new Map<string, AppBlank>()

    for (const overlay of appBlanks.value ?? []) {
      const id = text(overlay.blank_id || overlay.id)
      if (id) overlaysById.set(id, overlay)
    }

    return (rootBlanks.docs.value ?? []).map((blank) => {
      const id = text(blank.id)
      const overlay = overlaysById.get(id)

      return {
        ...blank,
        id,
        operator_ids: Array.isArray(overlay?.operator_ids)
          ? overlay.operator_ids
          : blank.operator_ids,
      }
    })
  })
  const pending = computed(
    () => appBlanks.value === undefined || rootBlanks.pending.value
  )

  return {
    blanks,
    pending,
    rootCollectionPath: BlankStorage.rootCollection,
    appCollectionPath,
  }
}

export function useBlankCreate() {
  const db = useFirestore()
  const { appId } = useFireUXConfig()
  const { setDocument } = useFirestoreCreate()

  async function createBlank(input: CreateBlankInput = {}) {
    const uid = await requireUid()
    const resolvedAppId = text(appId)

    if (!resolvedAppId) {
      throw new Error('[blank] app id is required to create a console target')
    }

    const id = doc(collection(db, BlankStorage.rootCollection)).id
    const name = text(input.name) || 'Blank target'
    const slug = normalizeSlug(`${name}-${id.slice(0, 6)}`)

    const rootPayload: Blank = {
      app_scope_state: 'parent_app',
      app_scope_app_id: resolvedAppId,
      name,
      slug,
      status: 'active',
      operator_ids: [uid],
    }

    await setDocument<Blank>(
      BlankStorage.rootCollection,
      id,
      rootPayload,
      { creator: true, app: true }
    )

    const overlayPayload: AppBlank = {
      blank_id: id,
      operator_ids: [uid],
      team_ids: [uid],
      join_requests: [],
    }

    await setDocument<AppBlank>(
      blankAppCollectionPath(resolvedAppId),
      id,
      overlayPayload,
      { creator: true, app: true }
    )

    return {
      id,
      createdRoot: true,
      createdScope: true,
    }
  }

  return {
    createBlank,
  }
}
