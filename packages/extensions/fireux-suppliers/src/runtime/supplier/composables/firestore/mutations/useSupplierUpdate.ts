// Concurrent edit — 2026-07-20 22:24 CEST — Both-Entity Authority — Supplier: require an explicit entity id on fixed root and App-overlay writes.
// Concurrent edit — 2026-07-20 22:37 CEST — Supplier/Portfolio Authority Hardening: retire generic App access-array updates.
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import {
  SupplierStorage,
  type Supplier,
  type SupplierUpdateInput,
} from '../../../models/Supplier.model.ts'

type SupplierMutationOptions = { id: string }
/**
 * useSupplierUpdate
 * - Canonical Supplier identity updates only.
 * - App access changes require a trusted lifecycle and are not exposed here.
 */
export function useSupplierUpdate() {
  const pruneUndefined = <T extends Record<string, any>>(
    payload: Partial<T>
  ) => {
    const entries = Object.entries(payload).filter(
      ([, value]) => value !== undefined
    )
    return Object.fromEntries(entries) as Partial<T>
  }

  const cleanString = (value: string | null | undefined) => {
    const normalized = typeof value === 'string' ? value.trim() : ''
    return normalized.length ? normalized : null
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

    const user = await useRequireUser()
    const token = await user.getIdToken()
    const result = await $fetch<{ ok: true; supplier_id: string }>(
      '/api/workspace/supplier/update',
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: {
          supplier_id: resolvedId,
          patch: pruneUndefined(input.changes),
        },
      }
    )
    if (result.ok !== true || result.supplier_id !== resolvedId) {
      throw new Error('Supplier update response was invalid.')
    }
  }

  const updateHeadline = async (
    value: string,
    options: SupplierMutationOptions
  ) => {
    const normalized = cleanString(value)
    await updateSupplierRoot({
      supplierId: options.id,
      changes: { supplier_headline: normalized ?? undefined },
    })
  }

  const updateSummary = async (
    value: string,
    options: SupplierMutationOptions
  ) => {
    const normalized = cleanString(value)
    await updateSupplierRoot({
      supplierId: options.id,
      changes: { summary: normalized ?? undefined },
    })
  }

  const updateBio = async (value: string, options: SupplierMutationOptions) => {
    const normalized = cleanString(value)
    await updateSupplierRoot({
      supplierId: options.id,
      changes: { supplier_bio: normalized ?? undefined },
    })
  }

  const updateImage = async (
    value: string,
    options: SupplierMutationOptions
  ) => {
    const normalized = cleanString(value)
    await updateSupplierRoot({
      supplierId: options.id,
      changes: { supplier_image: normalized ?? undefined },
    })
  }

  const updateItemCategories = async (
    value: string | string[],
    options: SupplierMutationOptions
  ) => {
    await updateSupplierRoot({
      supplierId: options.id,
      changes: {
        supplier_item_categories: toStringArray(value),
      },
    })
  }

  const updateDeliveryAreas = async (
    value: string | string[],
    options: SupplierMutationOptions
  ) => {
    await updateSupplierRoot({
      supplierId: options.id,
      changes: {
        supplier_delivery_areas: toStringArray(value),
      },
    })
  }

  const updateOrganizationName = async (
    value: string,
    options: SupplierMutationOptions
  ) => {
    const normalized = cleanString(value)
    await updateSupplierRoot({
      supplierId: options.id,
      changes: {
        supplier_organization_name: normalized ?? undefined,
      },
    })
  }

  const updateTagline = async (
    value: string,
    options: SupplierMutationOptions
  ) => {
    const normalized = cleanString(value)
    await updateSupplierRoot({
      supplierId: options.id,
      changes: { tagline: normalized ?? undefined },
    })
  }

  const updateBioShort = async (
    value: string,
    options: SupplierMutationOptions
  ) => updateSummary(value, options)

  return {
    updateSupplierRoot,
    updateHeadline,
    updateSummary,
    updateBio,
    updateImage,
    updateItemCategories,
    updateDeliveryAreas,
    updateOrganizationName,
    updateTagline,
    updateBioShort,
  }
}
