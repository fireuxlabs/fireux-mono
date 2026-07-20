// Concurrent edit — 2026-07-20 22:20 CEST — Both-Entity Authority — Property: split fixed Place-linked root creation from app-overlay attachment.
import { doc, getDoc } from 'firebase/firestore'
import type {
  ConsoleCreateMode,
  ConsoleCreateResult,
  ConsoleRootCreateResult,
} from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleCreate'
import { useConsoleCreate } from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleCreate'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import {
  PropertyStorage,
  type AppProperty,
  type AppPropertyCreateInput,
  type Property,
  type PropertyCreateInput,
  type PropertyIdentity,
  type PropertyManual,
} from '../../../../../models/property.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export type PropertyCreateModeOptions = {
  mode?: ConsoleCreateMode
  existingRootId?: string | null
  manual?: PropertyManual
}

function normalizeIdentity(identity: PropertyIdentity): PropertyIdentity {
  return {
    name: normalizeString(identity.name),
    image_url: normalizeString(identity.image_url),
    property_type:
      identity.property_type === 'commercial' || identity.property_type === 'mixed'
        ? identity.property_type
        : 'residential',
    unit_count: Number.isFinite(identity.unit_count) ? identity.unit_count : 0,
    estimated_value: Number.isFinite(identity.estimated_value)
      ? identity.estimated_value
      : 0,
    estimated_value_currency: normalizeString(identity.estimated_value_currency),
  }
}

export function usePropertyCreate() {
  const db = useFirestore()
  const { uid } = useAuth()
  const { setDocument } = useFirestoreCreate()
  const { createConsole } = useConsoleCreate()

  async function createPropertyRootResult(
    input: PropertyCreateInput
  ): Promise<ConsoleRootCreateResult> {
    const identity = normalizeIdentity(input.identity)
    const placeId = normalizeString(input.place_id)
    const slug = normalizeSlug(normalizeString(input.slug) || identity.name)
    const id = normalizeString(input.id) || slug

    if (!identity.name) {
      throw new Error('[fireux-properties] property name is required.')
    }
    if (!placeId) {
      throw new Error('[fireux-properties] canonical Place id is required.')
    }
    if (!id || !slug) {
      throw new Error('[fireux-properties] property id and slug are required.')
    }

    const rootRef = doc(db, PropertyStorage.rootCollection, id)
    const rootSnap = await getDoc(rootRef)
    if (rootSnap.exists()) return { id, created: false }

    const payload: Omit<Property, 'id' | 'created' | 'updated'> = {
      slug,
      portfolio_id: normalizeString(input.portfolio_id),
      place_id: placeId,
      app_scope_state: 'root_only',
      app_scope_app_id: '',
      identity,
      status: input.status === 'inactive' ? 'inactive' : 'active',
    }

    await setDocument(PropertyStorage.rootCollection, id, payload, {
      creator: true,
      app: true,
    })

    return { id, created: true }
  }

  async function createProperty(
    input: PropertyCreateInput
  ): Promise<ConsoleCreateResult> {
    const root = await createPropertyRootResult(input)
    return {
      id: root.id,
      createdRoot: root.created,
      createdOverlay: false,
    }
  }

  async function createPropertyConsole(
    input: PropertyCreateInput,
    options: PropertyCreateModeOptions = {}
  ): Promise<ConsoleCreateResult> {
    return createConsole<AppProperty>({
      type: 'property',
      mode: options.mode ?? 'console',
      existingRootId: options.existingRootId,
      createRoot: () => createPropertyRootResult(input),
      createOverlay: async () => {
        const operatorId = normalizeString(uid.value)
        const payload: AppPropertyCreateInput = {
          operator_ids: operatorId ? [operatorId] : [],
          team_ids: operatorId ? [operatorId] : [],
          join_requests: [],
          ...(options.manual ? { manual: options.manual } : {}),
        }
        return payload as AppProperty
      },
    })
  }

  return {
    createProperty,
    createPropertyConsole,
    createPropertyRoot: createPropertyRootResult,
  }
}
