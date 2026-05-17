import {
  collection,
  query as fsq,
  where,
  type Query,
} from 'firebase/firestore'
import { computed, isRef, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { Property } from '../../../../../models/property.model'
import {
  createTestPropertySimulation,
  getDemoPropertySimulations,
} from '../../../console/property/operations/demo-scenarios'

type PropertyCollectionDoc = Partial<Property> & {
  id?: string
  operator_ids?: string[]
  team_ids?: string[]
}

type AppPropertyOverlay = PropertyCollectionDoc & {
  operator_ids?: string[]
  team_ids?: string[]
}

const DEFAULT_COLLECTION_PATH = 'properties'

export type PropertyCollectionFilterValue = string | number | null | undefined
export type PropertyCollectionFilter = {
  ids?: PropertyCollectionFilterValue[] | null | undefined
  operatorId?: PropertyCollectionFilterValue
  teamId?: PropertyCollectionFilterValue
}
export type PropertyCollectionSource = 'live' | 'demo' | 'test'

type UsePropertyCollectionOptions = {
  source?:
    | PropertyCollectionSource
    | Ref<PropertyCollectionSource | null | undefined>
    | null
  filter?:
    | PropertyCollectionFilter
    | Ref<PropertyCollectionFilter | null | undefined>
    | null
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

function resolvePropertyId(property: Partial<PropertyCollectionDoc> | null | undefined) {
  return normalizeString(property?.id)
}

export function usePropertyCollection(
  options: UsePropertyCollectionOptions = {}
) {
  const db = useFirestore()
  const { appId } = useFireUXConfig()
  const { uid } = useAuth()
  const { currentUser, avatarSrc } = useUser()
  const { firestoreFetchCollection, firestoreLoadDocsByIds, firestoreQuery } =
    useFirestoreRead()

  const sourceMode = computed<PropertyCollectionSource>(() => {
    if (isRef(options.source)) return options.source.value ?? 'live'
    return options.source ?? 'live'
  })
  const resolvedFilter = computed<PropertyCollectionFilter | undefined>(() => {
    if (isRef(options.filter)) return options.filter.value ?? undefined
    return options.filter ?? undefined
  })
  const resolvedAppId = computed(() => normalizeString(appId))
  const hasFilter = computed(() => Array.isArray(resolvedFilter.value?.ids))
  const filterOperatorId = computed(() =>
    normalizeString(resolvedFilter.value?.operatorId ?? resolvedFilter.value?.teamId)
  )
  const hasOperatorFilter = computed(() =>
    Object.prototype.hasOwnProperty.call(resolvedFilter.value ?? {}, 'operatorId') ||
    Object.prototype.hasOwnProperty.call(resolvedFilter.value ?? {}, 'teamId')
  )
  const filterIdSet = computed(
    () =>
      new Set(
        (resolvedFilter.value?.ids ?? [])
          .map((value) => normalizeString(value))
          .filter(Boolean)
      )
  )

  const liveRootSource = firestoreFetchCollection<PropertyCollectionDoc>(
    DEFAULT_COLLECTION_PATH
  )
  const overlaySource = computed(() => {
    if (sourceMode.value !== 'live' || !resolvedAppId.value) return null
    if (!hasOperatorFilter.value || !filterOperatorId.value) return null

    const q = fsq(
      collection(db, 'apps', resolvedAppId.value, DEFAULT_COLLECTION_PATH),
      where('operator_ids', 'array-contains', filterOperatorId.value)
    ) as Query<AppPropertyOverlay>

    return firestoreQuery<AppPropertyOverlay>(
      q,
      `apps-${resolvedAppId.value}-${DEFAULT_COLLECTION_PATH}-operator-${filterOperatorId.value}`,
      `apps/${resolvedAppId.value}/${DEFAULT_COLLECTION_PATH}`
    )
  })
  const allowedPropertyIds = computed(() =>
    (overlaySource.value?.value ?? [])
      .map((property) => resolvePropertyId(property))
      .filter(Boolean)
  )
  const liveRootDocs = firestoreLoadDocsByIds<PropertyCollectionDoc>({
    collectionPath: DEFAULT_COLLECTION_PATH,
    ids: allowedPropertyIds,
  })
  const demoItems = computed<PropertyCollectionDoc[]>(() =>
    getDemoPropertySimulations()
  )
  const testItem = computed<PropertyCollectionDoc | null>(() =>
    createTestPropertySimulation(
      normalizeString(uid.value),
      normalizeString(currentUser.value?.display_name),
      normalizeString(avatarSrc.value)
    )
  )

  const liveItems = computed<PropertyCollectionDoc[]>(() => {
    if (!hasOperatorFilter.value) return liveRootSource.value ?? []

    const rootById = new Map<string, PropertyCollectionDoc>()
    const overlayById = new Map<string, AppPropertyOverlay>()

    for (const property of liveRootDocs.docs.value ?? []) {
      const id = resolvePropertyId(property)
      if (!id) continue
      rootById.set(id, {
        ...property,
        id,
      })
    }

    for (const overlay of overlaySource.value?.value ?? []) {
      const id = resolvePropertyId(overlay)
      if (!id) continue
      overlayById.set(id, {
        ...overlay,
        id,
      })
    }

    const merged: PropertyCollectionDoc[] = []
    const seen = new Set<string>()

    for (const property of liveRootDocs.docs.value ?? []) {
      const id = resolvePropertyId(property)
      if (!id || seen.has(id)) continue
      seen.add(id)

      merged.push({
        ...(rootById.get(id) ?? {}),
        ...(overlayById.get(id) ?? {}),
        id,
      })
    }

    for (const overlay of overlaySource.value?.value ?? []) {
      const id = resolvePropertyId(overlay)
      if (!id || seen.has(id)) continue
      seen.add(id)

      merged.push({
        ...(rootById.get(id) ?? {}),
        ...(overlayById.get(id) ?? {}),
        id,
      })
    }

    return merged
  })

  const collectionItems = computed<PropertyCollectionDoc[]>(() => {
    if (sourceMode.value === 'demo') return demoItems.value
    if (sourceMode.value === 'test') return testItem.value ? [testItem.value] : []
    return liveItems.value
  })

  const properties = computed<Property[]>(() =>
    collectionItems.value.reduce<Property[]>((acc, property) => {
      const id = resolvePropertyId(property)
      if (!id) return acc
      if (hasFilter.value && !filterIdSet.value.has(id)) return acc
      if (hasOperatorFilter.value) {
        if (!filterOperatorId.value) return acc
        const operatorIds = Array.isArray(property?.operator_ids)
          ? property.operator_ids.map((value) => normalizeString(value))
          : []
        if (!operatorIds.includes(filterOperatorId.value)) return acc
      }

      acc.push({
        ...(property as Property),
        id,
      })

      return acc
    }, [])
  )
  const count = computed(() => properties.value.length)
  const pending = computed(() => {
    if (sourceMode.value === 'demo') return false
    if (sourceMode.value === 'test') return false
    if (!hasOperatorFilter.value) return liveRootSource.value === undefined
    return (
      liveRootDocs.docs.value === undefined ||
      liveRootDocs.pending.value ||
      (overlaySource.value ? overlaySource.value.value === undefined : false)
    )
  })

  return {
    properties,
    count,
    pending,
  }
}
