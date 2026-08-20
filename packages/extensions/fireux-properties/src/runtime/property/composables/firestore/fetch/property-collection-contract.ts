import { isRef, type Ref } from 'vue'
import type { WorkspaceSource } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import {
  PropertyStorage,
  type AppProperty,
  type Property,
} from '../../../models/property.model.ts'
import type {
  TargetCollectionFilter,
  TargetCollectionFilterValue,
} from '../../../../composables/fireux/firestore/collection-selection'
export type PropertyCollectionFilterValue = TargetCollectionFilterValue
export type PropertyCollectionFilter = TargetCollectionFilter
export type PropertyCollectionSource = WorkspaceSource
export type PropertyCollectionDoc = Partial<Property> & {
  id?: string
}

export type AppPropertyRecord = Partial<AppProperty> & {
  id?: string
}

export const DEFAULT_COLLECTION_PATH = PropertyStorage.rootCollection

export const UNSUPPORTED_TEST_SOURCE_MESSAGE =
  '[fireux-properties] Property Test source is unsupported: no canonical simulation producer exists.'

export type PropertyCollectionShape = 'root' | 'root-with-app-support'

export type UsePropertyCollectionOptions = {
  source?:
    | PropertyCollectionSource
    | Ref<PropertyCollectionSource | null | undefined>
    | null
  shape?:
    | PropertyCollectionShape
    | Ref<PropertyCollectionShape | null | undefined>
    | null
  filter?:
    | PropertyCollectionFilter
    | Ref<PropertyCollectionFilter | null | undefined>
    | null
}

export function resolvePropertyCollectionShape(
  shape: UsePropertyCollectionOptions['shape'],
  hasOperatorFilter: boolean
): PropertyCollectionShape {
  const explicitShape = isRef(shape) ? shape.value : shape
  if (explicitShape) return explicitShape
  return hasOperatorFilter ? 'root-with-app-support' : 'root'
}

export const normalizeString = (value: unknown) => String(value ?? '').trim()

export function resolvePropertyId(
  property: Partial<PropertyCollectionDoc> | null | undefined
) {
  return normalizeString(property?.id)
}
