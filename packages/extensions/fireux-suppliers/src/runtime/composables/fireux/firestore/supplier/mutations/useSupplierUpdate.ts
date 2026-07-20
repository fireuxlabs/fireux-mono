// Concurrent edit — 2026-07-20 22:24 CEST — Both-Entity Authority — Supplier: require an explicit entity id on fixed root and App-overlay writes.
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import {
  AppSupplierStorage,
  SupplierStorage,
  type AppSupplier,
  type AppSupplierUpdateInput,
  type Supplier,
  type SupplierUpdateInput,
} from '../../../../../models/supplier/Supplier.model'

type SupplierMutationOptions = {
  id: string
}
/**
 * useSupplierUpdate
 * - Canon surface: global supplier record updates
 * - App-scope updates target the supplier console overlay
 *
 * Shared update surface for v1 scoped fields.
 */
export function useSupplierUpdate() {
  const { updateDocument } = useFirestoreUpdate()
  const { appId } = useFireUXConfig()

  const pruneUndefined = <T extends Record<string, any>>(payload: Partial<T>) => {
    const entries = Object.entries(payload).filter(([, value]) => value !== undefined)
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
  const updateSupplierRoot = async (
    patch: SupplierUpdateInput,
    options: SupplierMutationOptions
  ) => {
    const resolvedId = resolveId(options.id)

    await updateDocument<Supplier>(
      SupplierStorage.rootCollection,
      resolvedId,
      pruneUndefined(patch)
    )
  }

  const updateSupplierOverlay = async (
    patch: AppSupplierUpdateInput,
    options: SupplierMutationOptions
  ) => {
    if (!appId) {
      throw new Error('[useSupplierUpdate] App context required for supplier overlay updates')
    }

    const resolvedId = resolveId(options.id)
    const collectionPath = `${AppStorage.collection}/${appId}/${AppSupplierStorage.collection}`

    await updateDocument<AppSupplier>(
      collectionPath,
      resolvedId,
      pruneUndefined(patch)
    )
  }

  const updateHeadline = async (
    value: string,
    options: SupplierMutationOptions
  ) => {
    const normalized = cleanString(value)
    await updateSupplierRoot(
      { supplier_headline: normalized ?? undefined },
      options
    )
  }

  const updateSummary = async (
    value: string,
    options: SupplierMutationOptions
  ) => {
    const normalized = cleanString(value)
    await updateSupplierRoot({ summary: normalized ?? undefined }, options)
  }

  const updateBio = async (
    value: string,
    options: SupplierMutationOptions
  ) => {
    const normalized = cleanString(value)
    await updateSupplierRoot({ supplier_bio: normalized ?? undefined }, options)
  }

  const updateImage = async (
    value: string,
    options: SupplierMutationOptions
  ) => {
    const normalized = cleanString(value)
    await updateSupplierRoot({ supplier_image: normalized ?? undefined }, options)
  }

  const updateItemCategories = async (
    value: string | string[],
    options: SupplierMutationOptions
  ) => {
    await updateSupplierRoot(
      {
        supplier_item_categories: toStringArray(value),
      },
      options
    )
  }

  const updateDeliveryAreas = async (
    value: string | string[],
    options: SupplierMutationOptions
  ) => {
    await updateSupplierRoot(
      {
        supplier_delivery_areas: toStringArray(value),
      },
      options
    )
  }

  const updateOrganizationName = async (
    value: string,
    options: SupplierMutationOptions
  ) => {
    const normalized = cleanString(value)
    const slug = normalized ? normalizeSlug(normalized) : undefined
    await updateSupplierRoot(
      {
        supplier_organization_name: normalized ?? undefined,
        slug,
      },
      options
    )
  }

  const updateTagline = async (
    value: string,
    options: SupplierMutationOptions
  ) => {
    const normalized = cleanString(value)
    await updateSupplierRoot({ tagline: normalized ?? undefined }, options)
  }

  const updateBioShort = async (
    value: string,
    options: SupplierMutationOptions
  ) =>
    updateSummary(value, options)

  return {
    updateSupplierRoot,
    updateSupplierOverlay,
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
