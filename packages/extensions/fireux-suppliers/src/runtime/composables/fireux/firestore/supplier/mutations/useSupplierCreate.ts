// Concurrent edit — 2026-07-20 22:18 CEST — Both-Entity Authority — Supplier: keep test and canonical root creation free of App access fields.
// Concurrent edit — 2026-07-20 22:37 CEST — Supplier/Portfolio Authority Hardening: remove caller-selected Supplier root collection paths.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: expose explicit App support creation results.
// Concurrent edit — 2026-07-21 22:34 CEST — Supplier atomic onboarding: route live Console creation through the trusted transaction.
import type {
  ConsoleCreateMode,
  ConsoleCreateResult,
  ConsoleRootCreateResult,
} from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleCreate'
import { defineFireuxCreatePlan } from 'fireux-core/runtime/composables/fireux/firestore/operations/createStrategy'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type { SupplierOnboardingCompleteResult } from '../../../../../models/supplier/supplier-onboarding.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()
const UNSUPPORTED_TEST_WRITE_MESSAGE =
  '[fireux-suppliers] Supplier Test writes are unsupported: no canonical simulation producer exists.'

export type SupplierCreateOptions = {
  test?: boolean
}

export type SupplierCreateModeOptions = {
  mode?: ConsoleCreateMode
  existingRootId?: string | null
  organizationName?: string | null
  companyId?: string | null
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
  const requireCanonicalWriteSource = () => {
    if (options.test === true) {
      throw new Error(UNSUPPORTED_TEST_WRITE_MESSAGE)
    }
  }

  async function createTestSupplier(
    _input: SupplierTestCreateInput = {}
  ): Promise<ConsoleRootCreateResult> {
    throw new Error(UNSUPPORTED_TEST_WRITE_MESSAGE)
  }

  async function createSupplier(
    options: SupplierCreateModeOptions = {}
  ): Promise<ConsoleCreateResult> {
    return createSupplierConsole(options)
  }

  async function createSupplierConsole(
    options: SupplierCreateModeOptions = {}
  ): Promise<ConsoleCreateResult> {
    requireCanonicalWriteSource()
    const supplierId = normalizeString(options.existingRootId)
    const organizationName = normalizeString(options.organizationName)
    const companyId = normalizeString(options.companyId)
    const user = await useRequireUser()
    const token = await user.getIdToken()
    const result = await $fetch<SupplierOnboardingCompleteResult>(
      '/api/suppliers/onboarding/complete',
      {
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
    if (result?.ok !== true || !normalizeString(result.supplier_id)) {
      throw new Error('Supplier onboarding completion was invalid.')
    }

    return {
      id: result.supplier_id,
      createdRoot: result.created_root,
      createdAppSupport: result.created_app_support,
    }
  }

  return {
    createPlan: SupplierCreatePlan,
    createSupplier,
    createSupplierConsole,
    createTestSupplier,
  }
}
