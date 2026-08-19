// Concurrent edit — 2026-07-20 22:52 CEST — Both-Entity Authority — Property: validate attach, isolate manuals, and default public publication to draft.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: expose explicit App support creation and paths.
// Concurrent edit — 2026-07-21 22:30 CEST — Console alignment — Property: route console attachment through one trusted atomic transaction.
import { doc, getDoc } from 'firebase/firestore'
import type {
  FireuxEntityCreateMode,
  FireuxEntityCreateResult,
  FireuxRootCreateResult,
} from 'fireux-core/runtime/models/utils/entity-create.model'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useFirestoreClientCreate } from 'fireux-core/runtime/composables/fireux/firestore/mutations/useFirestoreClientCreate'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { defineRuntimeClientCreateTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { AppStorage } from 'fireux-core/runtime/app/models/app.model'
import {
  PropertyManualStorage,
  PropertyStorage,
  type Property,
  type PropertyCreateInput,
  type PropertyManual,
} from '../../../models/property.model.ts'
import type { PropertyOnboardingCompleteResult } from '../../../models/property-onboarding.model.ts'
import { buildPropertyCreateRoot } from '../../../utils/property-create'
import {
  canonicalPropertyManual,
  canonicalPropertyRoot,
} from '../utils/view/usePropertyInterface'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export type PropertyCreateModeOptions = {
  mode?: FireuxEntityCreateMode
  existingRootId?: string | null
  manual?: PropertyManual
}

export function usePropertyCreate() {
  const db = useFirestore()
  const { appId } = useFireUXConfig()
  const create = useFirestoreClientCreate()

  async function createPropertyRootResult(
    input: PropertyCreateInput
  ): Promise<FireuxRootCreateResult> {
    const plan = buildPropertyCreateRoot(input)
    const { id } = plan

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

    await create(
      defineRuntimeClientCreateTarget(
        'project.properties',
        PropertyStorage.rootCollection
      ),
      plan.payload,
      { id, creator: true, app: true }
    )

    return { id, created: true }
  }

  async function createProperty(
    input: PropertyCreateInput
  ): Promise<FireuxEntityCreateResult> {
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
  ): Promise<FireuxEntityCreateResult> {
    const existingRootId = normalizeString(options.existingRootId)
    const user = await useRequireUser()
    const token = await user.getIdToken()
    const response = await $fetch<PropertyOnboardingCompleteResult>(
      '/api/properties/onboarding/complete',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: existingRootId
          ? { property_id: existingRootId }
          : input,
      }
    )
    if (response?.ok !== true || !normalizeString(response.property_id)) {
      throw new Error('[fireux-properties] Property onboarding completion was invalid.')
    }

    const result: FireuxEntityCreateResult = {
      id: response.property_id,
      createdRoot: response.created_root,
      createdAppSupport: response.created_app_support,
    }

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

    await create(
      defineRuntimeClientCreateTarget(
        'project.app-property-manuals',
        manualCollection
      ),
      manual,
      {
        id: PropertyManualStorage.documentId,
        creator: true,
        app: true,
      }
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
