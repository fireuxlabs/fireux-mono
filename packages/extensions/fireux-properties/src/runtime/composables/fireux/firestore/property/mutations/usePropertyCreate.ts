// Concurrent edit — 2026-07-20 22:52 CEST — Both-Entity Authority — Property: validate attach, isolate manuals, and default public publication to draft.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: expose explicit App support creation and paths.
import { doc, getDoc } from 'firebase/firestore'
import type {
  ConsoleCreateMode,
  ConsoleCreateResult,
  ConsoleRootCreateResult,
} from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleCreate'
import { useConsoleCreate } from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleCreate'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model'
import {
  PropertyManualStorage,
  PropertyStorage,
  type AppProperty,
  type AppPropertyCreateInput,
  type Property,
  type PropertyCreateInput,
  type PropertyIdentity,
  type PropertyManual,
} from '../../../../../models/property.model'
import {
  canonicalPropertyManual,
  canonicalPropertyRoot,
} from '../utils/view/usePropertyInterface'

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
  const { appId } = useFireUXConfig()
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
    if (rootSnap.exists()) {
      const existing = canonicalPropertyRoot({
        ...(rootSnap.data() as Property),
        id: rootSnap.id,
      })
      if (!existing) {
        throw new Error(
          `[fireux-properties] existing Property root is schema-invalid: ${id}`
        )
      }
      return { id, created: false }
    }

    const payload: Omit<Property, 'id' | 'created' | 'updated'> = {
      slug,
      portfolio_id: normalizeString(input.portfolio_id),
      place_id: placeId,
      app_scope_state: 'root_only',
      app_scope_app_id: '',
      identity,
      status: input.status === 'inactive' ? 'inactive' : 'active',
      publication_state: 'draft',
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
      createdAppSupport: false,
    }
  }

  async function createPropertyConsole(
    input: PropertyCreateInput,
    options: PropertyCreateModeOptions = {}
  ): Promise<ConsoleCreateResult> {
    const result = await createConsole<AppProperty>({
      type: 'property',
      mode: options.mode ?? 'console',
      existingRootId: options.existingRootId,
      createRoot: () => createPropertyRootResult(input),
      validateRoot: (rootId, rootData) => {
        const root = canonicalPropertyRoot({
          ...(rootData as Property),
          id: rootId,
        })
        if (!root) {
          throw new Error(
            `[fireux-properties] cannot attach schema-invalid Property root: ${rootId}`
          )
        }
      },
      createAppSupport: async () => {
        const operatorId = normalizeString(uid.value)
        const payload: AppPropertyCreateInput = {
          operator_ids: operatorId ? [operatorId] : [],
          team_ids: operatorId ? [operatorId] : [],
          join_requests: [],
        }
        return payload as AppProperty
      },
    })

    if (options.manual) {
      await createPropertyManual(result.id, options.manual)
    }

    return result
  }

  async function createPropertyManual(
    propertyId: string,
    input: PropertyManual
  ): Promise<boolean> {
    const resolvedAppId = normalizeString(appId)
    const resolvedPropertyId = normalizeString(propertyId)
    const manual = canonicalPropertyManual(input)
    if (!resolvedAppId) {
      throw new Error('[fireux-properties] app id is required for private manual creation.')
    }
    if (!resolvedPropertyId) {
      throw new Error('[fireux-properties] property id is required for private manual creation.')
    }
    if (!manual) {
      throw new Error('[fireux-properties] complete Property manual input is required.')
    }

    const appPropertyCollection = `${AppStorage.collection}/${resolvedAppId}/${PropertyStorage.appSupportCollection}`
    const appPropertySnap = await getDoc(
      doc(db, appPropertyCollection, resolvedPropertyId)
    )
    if (!appPropertySnap.exists()) {
      throw new Error(
        `[fireux-properties] AppProperty access record is required before its private manual: ${resolvedPropertyId}`
      )
    }

    const manualCollection = `${appPropertyCollection}/${resolvedPropertyId}/${PropertyManualStorage.collection}`
    const manualRef = doc(
      db,
      manualCollection,
      PropertyManualStorage.documentId
    )
    if ((await getDoc(manualRef)).exists()) return false

    await setDocument(
      manualCollection,
      PropertyManualStorage.documentId,
      manual,
      { creator: true, app: true }
    )
    return true
  }

  return {
    createProperty,
    createPropertyConsole,
    createPropertyManual,
    createPropertyRoot: createPropertyRootResult,
  }
}
