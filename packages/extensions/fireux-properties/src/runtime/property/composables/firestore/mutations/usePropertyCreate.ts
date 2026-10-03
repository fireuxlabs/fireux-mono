import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
// Concurrent edit — 2026-07-20 22:52 CEST — Both-Entity Authority — Property: validate attach, isolate manuals, and default public publication to draft.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: expose explicit App support creation and paths.
// Concurrent edit — 2026-07-21 22:30 CEST — Workspace alignment — Property: route workspace attachment through one trusted atomic transaction.
import { doc, getDoc } from 'firebase/firestore'
import type {
  FireuxEntityCreateMode,
  FireuxEntityCreateResult,
  FireuxRootCreateResult,
} from 'fireux-core/runtime/models/utils/entity-create.model'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
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
  const { currentUser } = useAuth()
  const appSession = useAppSession()
  const fireux = useFireUXConfig()
  const captureCommand = useCommandScope([currentUser, appSession.appUser, () => fireux.appId])
  const db = useFirestore()
  const { createDocument: create } = useFirestoreCreate()

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

    await create(PropertyStorage.rootCollection, plan.payload, {
      id,
      creator: true,
      app: true,
    })

    return { id, created: true }
  }

  async function createProperty(
    input: PropertyCreateInput
  ): Promise<FireuxEntityCreateResult> {
    const root = await createPropertyRootResult(input)
    return {
      id: root.id,
      createdRoot: root.created,
      createdTeamMember: false,
    }
  }

  async function createPropertyWorkspace(
    input: PropertyCreateInput,
    options: PropertyCreateModeOptions = {}
  ): Promise<FireuxEntityCreateResult> {
    const isCurrent = captureCommand()
    input = structuredClone(input)
    const manual = options.manual ? structuredClone(options.manual) : undefined
    const existingRootId = normalizeString(options.existingRootId)
    const user = await useRequireUser()
    const token = await user.getIdToken()
    if (!isCurrent() || user.uid !== currentUser.value?.uid)
      throw new Error('Creation context changed. Try again.')
    const response = await $fetch<PropertyOnboardingCompleteResult>(
      '/api/properties/onboarding/complete',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: existingRootId ? { property_id: existingRootId } : input,
      }
    )
    if (response?.ok !== true || !normalizeString(response.property_id)) {
      throw new Error(
        '[fireux-properties] Property onboarding completion was invalid.'
      )
    }

    const result: FireuxEntityCreateResult = {
      id: response.property_id,
      createdRoot: response.created_root,
      createdTeamMember: response.created_team_member,
    }

    if (manual && isCurrent()) {
      await createPropertyManual(result.id, manual)
    }

    return result
  }

  async function createPropertyManual(
    propertyId: string,
    input: PropertyManual
  ): Promise<boolean> {
    const resolvedPropertyId = normalizeString(propertyId)
    const manual = canonicalPropertyManual(input)
    if (!resolvedPropertyId) {
      throw new Error(
        '[fireux-properties] property id is required for private manual creation.'
      )
    }
    if (!manual) {
      throw new Error(
        '[fireux-properties] complete Property manual input is required.'
      )
    }

    const propertySnap = await getDoc(
      doc(db, PropertyStorage.rootCollection, resolvedPropertyId)
    )
    if (!propertySnap.exists()) {
      throw new Error(
        `[fireux-properties] Property is required before its private manual: ${resolvedPropertyId}`
      )
    }

    const manualCollection = `${PropertyStorage.rootCollection}/${resolvedPropertyId}/${PropertyManualStorage.collection}`
    const manualRef = doc(
      db,
      manualCollection,
      PropertyManualStorage.documentId
    )
    if ((await getDoc(manualRef)).exists()) return false

    await create(manualCollection, manual, {
      id: PropertyManualStorage.documentId,
      creator: true,
      app: true,
    })
    return true
  }

  return {
    createProperty,
    createPropertyWorkspace,
    createPropertyManual,
    createPropertyRoot: createPropertyRootResult,
  }
}
