import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useSeoIndexWrite } from 'fireux-core/runtime/composables/fireux/seo/useSeoIndexWrite'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import type { SupplierApp, SupplierCore } from '../../models/supplier/Supplier.model'
import type { SupplierRefs } from './useSupplierRecord'
import { SUPPLIER_COLLECTION } from './constants'

/**
 * useSupplierUpdate
 * - Canon surface: global supplier record updates
 * - Legacy app-scope update remains exposed only for compatibility with older callers
 *
 * Shared update surface for v1 scoped fields.
 */
export function useSupplierUpdate(
  supplier?: SupplierRefs | null
) {
  const { updateDocument } = useFirestoreUpdate()
  const { appId, role } = useFireUXConfig()
  const { upsertSeoIndexDoc } = useSeoIndexWrite()
  const isTenant = role === 'tenant' && Boolean(appId)
  type UpdateOptions = { id?: string | null; scope?: 'core' | 'app' }

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

  const resolveId = async (explicit?: string | null): Promise<string> => {
    const trimmed = explicit?.trim()
    if (trimmed) return trimmed

    const fromRefs =
      supplier?.coreSupplier?.value?.id ?? supplier?.appSupplier?.value?.id ?? null
    if (fromRefs?.trim()) return fromRefs.trim()

    const user = await useRequireUser()
    if (!user?.uid) {
      throw new Error('[useSupplierUpdate] Unable to resolve supplier id')
    }
    return user.uid
  }

  /**
   * Update the CORE Supplier record
   * - global document (e.g. suppliers/{uid})
   */
  const touchSeoIndex = async (id?: string | null) => {
    const resolvedId = await resolveId(id)
    await upsertSeoIndexDoc('seo_index_suppliers', resolvedId, {
      path: `/suppliers/${resolvedId}`,
      isPublic: true,
    })
  }

  const updateCoreSupplier = async (
    patch: Partial<SupplierCore>,
    options: { id?: string | null } = {}
  ) => {
    const resolvedId = await resolveId(options.id)
    await updateDocument<SupplierCore>(
      SUPPLIER_COLLECTION,
      resolvedId,
      pruneUndefined(patch)
    )
    await touchSeoIndex(options.id)
  }

  const updateAppSupplier = async (
    patch: Partial<SupplierApp>,
    options: { id?: string | null } = {}
  ) => {
    if (!isTenant || !appId) {
      throw new Error('[useSupplierUpdate] Tenant context required for supplier overlay updates')
    }

    const resolvedId = await resolveId(options.id)
    await updateDocument<SupplierApp>(
      `apps/${appId}/${SUPPLIER_COLLECTION}`,
      resolvedId,
      pruneUndefined(patch)
    )
  }

  const commitUpdate = async (
    patch: Partial<SupplierCore>,
    options: UpdateOptions = {}
  ) => {
    if (options.scope === 'app') {
      await updateAppSupplier(patch as Partial<SupplierApp>, options)
      return
    }

    await updateCoreSupplier(patch, options)
  }

  const updateHeadline = async (value: string) => {
    const normalized = cleanString(value)
    await updateCoreSupplier({ supplier_headline: normalized ?? undefined })
  }

  const updateSummary = async (value: string) => {
    const normalized = cleanString(value)
    await updateCoreSupplier({ summary: normalized ?? undefined })
  }

  const updateBio = async (value: string) => {
    const normalized = cleanString(value)
    await updateCoreSupplier({ supplier_bio: normalized ?? undefined })
  }

  const updateImage = async (value: string) => {
    const normalized = cleanString(value)
    await updateCoreSupplier({ supplier_image: normalized ?? undefined })
  }

  const updateProductCategories = async (value: string | string[]) => {
    await updateCoreSupplier({
      supplier_product_categories: toStringArray(value),
    })
  }

  const updateDeliveryAreas = async (value: string | string[]) => {
    await updateCoreSupplier({
      supplier_delivery_areas: toStringArray(value),
    })
  }

  const updateOrganizationName = async (value: string) => {
    const normalized = cleanString(value)
    await updateCoreSupplier({ supplier_organization_name: normalized ?? undefined })
  }

  const updateTagline = async (value: string) => updateHeadline(value)

  const updateBioShort = async (value: string) => updateSummary(value)

  return {
    commitUpdate,
    updateCoreSupplier,
    updateAppSupplier,
    updateHeadline,
    updateSummary,
    updateBio,
    updateImage,
    updateProductCategories,
    updateDeliveryAreas,
    updateOrganizationName,
    updateTagline,
    updateBioShort,
  }
}
