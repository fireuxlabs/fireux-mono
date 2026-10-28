import { refreshNuxtData } from 'nuxt/app'
import { useRoute } from '#imports'
import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestore-document-id'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalize-slug'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import type {
  FireuxEntityCreateMode,
  FireuxEntityCreateResult,
  FireuxRootCreateResult,
} from 'fireux-core/runtime/models/utils/entity-create.model'
import { defineFireuxCreatePlan } from 'fireux-core/runtime/composables/fireux/firestore/operations/createStrategy'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type { SupplierOnboardingCompleteResult } from '../../../models/supplier-onboarding.model.ts'

const normalizeString = (value: unknown) => String(value ?? '').trim()
const UNSUPPORTED_TEST_WRITE_MESSAGE =
  '[fireux-suppliers] Supplier Test writes are unsupported: no canonical simulation producer exists.'

export type SupplierCreateOptions = {
  test?: boolean
}

export type SupplierCreateModeOptions = {
  mode?: FireuxEntityCreateMode
  existingRootId?: string | null
  organizationName?: string | null
  companyId?: string | null
  isCurrent?: () => boolean
}

type SupplierTestCreateInput = {
  id?: string
  name?: string
  subtitle?: string
  image_url?: string
}

export const SupplierCreatePlan = defineFireuxCreatePlan({
  family: 'idempotent',
})

export function useSupplierCreate(options: SupplierCreateOptions = {}) {
  const { currentUser } = useAuth()
  const appSession = useAppSession()
  const fireux = useFireUXConfig()
  const route = useRoute()
  const captureCommand = useCommandScope([
    currentUser,
    appSession.appUser,
    () => fireux.appId,
    () => route.fullPath,
  ])
  const requireCanonicalWriteSource = () => {
    if (options.test === true) {
      throw new Error(UNSUPPORTED_TEST_WRITE_MESSAGE)
    }
  }

  async function createTestSupplier(
    _input: SupplierTestCreateInput = {}
  ): Promise<FireuxRootCreateResult> {
    throw new Error(UNSUPPORTED_TEST_WRITE_MESSAGE)
  }

  async function createSupplier(
    options: SupplierCreateModeOptions = {}
  ): Promise<FireuxEntityCreateResult> {
    return createSupplierWorkspace(options)
  }

  async function createSupplierWorkspace(
    options: SupplierCreateModeOptions = {}
  ): Promise<FireuxEntityCreateResult> {
    const isCurrent = captureCommand()
    const uid = currentUser.value?.uid
    const isOwnerCurrent = options.isCurrent ?? (() => true)
    const assertCurrent = () => {
      if (
        !uid ||
        !isCurrent() ||
        !isOwnerCurrent() ||
        currentUser.value?.uid !== uid
      )
        throw new Error('Creation context changed. Try again.')
    }
    requireCanonicalWriteSource()
    const supplierId = normalizeString(options.existingRootId)
    const organizationName = normalizeString(options.organizationName)
    const companyId = normalizeString(options.companyId)
    const expectedId = supplierId || normalizeSlug(organizationName)
    assertCurrent()
    const user = await useRequireUser()
    assertCurrent()
    if (user.uid !== uid)
      throw new Error('Creation context changed. Try again.')
    const token = await user.getIdToken()
    assertCurrent()
    const result = await $fetch<SupplierOnboardingCompleteResult>(
      '/api/suppliers/onboarding/complete',
      {
        onResponse: async ({ options, response }) => {
          if (
            response.ok &&
            !['GET', 'HEAD'].includes(
              String(options.method || 'GET').toUpperCase()
            )
          )
            await refreshNuxtData()
        },
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: supplierId
          ? { supplier_id: supplierId }
          : {
              organization_name: organizationName,
              company_id: companyId,
            },
      }
    )
    if (
      result?.ok !== true ||
      typeof result.supplier_id !== 'string' ||
      !isFirestoreDocumentId(result.supplier_id) ||
      result.supplier_id !== expectedId ||
      !['create', 'connect', 'open'].includes(result.action) ||
      typeof result.created_root !== 'boolean' ||
      typeof result.created_team_member !== 'boolean'
    ) {
      throw new Error('Supplier onboarding completion was invalid.')
    }

    return {
      id: result.supplier_id,
      createdRoot: result.created_root,
      createdTeamMember: result.created_team_member,
    }
  }

  return {
    createPlan: SupplierCreatePlan,
    createSupplier,
    createSupplierWorkspace,
    createTestSupplier,
  }
}
