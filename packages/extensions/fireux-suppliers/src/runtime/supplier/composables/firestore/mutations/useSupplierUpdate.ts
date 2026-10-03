// Concurrent edit — 2026-07-20 22:24 CEST — Both-Entity Authority — Supplier: require an explicit entity id on fixed root and App-overlay writes.
// Concurrent edit — 2026-07-20 22:37 CEST — Supplier/Portfolio Authority Hardening: retire generic App access-array updates.
import type { WatchSource } from 'vue'
import { useRoute } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type { SupplierUpdateInput } from '../../../models/Supplier.model.ts'

type SupplierMutationOptions = { id: string }
/**
 * useSupplierUpdate
 * - Canonical Supplier identity updates only.
 * - App access changes require a trusted lifecycle and are not exposed here.
 */
export function useSupplierUpdate(sources: WatchSource[] = []) {
  const { currentUser } = useAuth(),
    session = useAppSession(),
    config = useFireUXConfig(),
    route = useRoute()
  const captureIntent = useCommandScope([
    () => currentUser.value?.uid,
    session.appUser,
    () => config.appId,
    () => route.path,
    ...sources,
  ])
  const pruneUndefined = <T extends Record<string, any>>(
    payload: Partial<T>
  ) => {
    const entries = Object.entries(payload).filter(
      ([, value]) => value !== undefined
    )
    return Object.fromEntries(entries) as Partial<T>
  }

  const toStringArray = (value: string | string[]) =>
    Array.from(
      new Set(
        (Array.isArray(value) ? value : (value ?? '').split(','))
          .map((item) => String(item ?? '').trim())
          .filter(Boolean)
      )
    )

  const resolveId = (explicit: string): string => {
    const id = explicit.trim()
    if (!id) throw new Error('[useSupplierUpdate] Supplier id is required')
    return id
  }

  /**
   * Update the canonical root Supplier record.
   * Supplier ids are independent entity ids and must be supplied explicitly.
   */
  const updateSupplierRoot = async (input: {
    supplierId: string
    changes: SupplierUpdateInput
  }) => {
    const resolvedId = resolveId(input.supplierId)

    const patch = JSON.parse(JSON.stringify(pruneUndefined(input.changes)))
    const uid = currentUser.value?.uid,
      isCurrent = captureIntent()
    const assertCurrent = () => {
      if (!uid || !isCurrent())
        throw new Error(
          'The Supplier or account context changed. Please try again.'
        )
    }
    const user = await useRequireUser()
    assertCurrent()
    if (user.uid !== uid)
      throw new Error('The account context changed. Please try again.')
    const token = await user.getIdToken()
    assertCurrent()
    const result = await $fetch<{ ok: true; supplier_id: string }>(
      '/api/workspace/supplier/update',
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: {
          supplier_id: resolvedId,
          patch,
        },
      }
    )
    if (result.ok !== true || result.supplier_id !== resolvedId) {
      throw new Error('Supplier update response was invalid.')
    }
  }

  const updateDeliveryAreas = async (
    value: string | string[],
    options: SupplierMutationOptions
  ) => {
    await updateSupplierRoot({
      supplierId: options.id,
      changes: {
        delivery_areas: toStringArray(value),
      },
    })
  }

  return {
    updateSupplierRoot,
    updateDeliveryAreas,
    captureIntent,
  }
}
