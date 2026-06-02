import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import {
  resolveConsoleEntityCollectionPath,
  type ConsoleEntityRuntimeMode,
} from 'fireux-core/runtime/composables/fireux/firestore/system/console/utils/resolveConsoleEntityCollectionPath'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import {
  SupplierStorage,
  type AppSupplier,
  type Supplier,
} from '../../../../../models/supplier/Supplier.model'
import type { SupplierRefs } from '../fetch/useSupplierRecord'

const supplierCollection = SupplierStorage.rootCollection

type SupplierUpdateCollectionOptions = {
  collectionPath?: string | null
  mode?: ConsoleEntityRuntimeMode | null
  source?: ConsoleEntityRuntimeMode | null
  test?: boolean
}
/**
 * useSupplierUpdate
 * - Canon surface: global supplier record updates
 * - App-scope updates target the supplier console overlay
 *
 * Shared update surface for v1 scoped fields.
 */
export function useSupplierUpdate(
  supplier?: SupplierRefs | null,
  defaults: SupplierUpdateCollectionOptions = {}
) {
  const { updateDocument } = useFirestoreUpdate()
  const { appId } = useFireUXConfig()
  const hasAppScope = Boolean(appId)
  type UpdateOptions = SupplierUpdateCollectionOptions & {
    id?: string | null
    scope?: 'core' | 'app'
  }

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

  const resolveMode = (
    options: SupplierUpdateCollectionOptions = {}
  ): ConsoleEntityRuntimeMode => {
    if (options.test === true || defaults.test === true) return 'test'
    return (
      options.mode ??
      options.source ??
      defaults.mode ??
      defaults.source ??
      'live'
    )
  }

  const resolveCoreCollectionPath = (
    options: SupplierUpdateCollectionOptions = {}
  ) =>
    resolveConsoleEntityCollectionPath({
      family: supplierCollection,
      mode: resolveMode(options),
      explicitPath: options.collectionPath ?? defaults.collectionPath,
    })

  /**
   * Update the CORE Supplier record
   * - global document (e.g. suppliers/{uid})
   */
  const updateCoreSupplier = async (
    patch: Partial<Supplier>,
    options: UpdateOptions = {}
  ) => {
    const resolvedId = await resolveId(options.id)
    const collectionPath = resolveCoreCollectionPath(options)
    if (!collectionPath) {
      throw new Error('[useSupplierUpdate] Cannot update demo supplier records')
    }

    await updateDocument<Supplier>(
      collectionPath,
      resolvedId,
      pruneUndefined(patch)
    )
  }

  const updateAppSupplier = async (
    patch: Partial<AppSupplier>,
    options: UpdateOptions = {}
  ) => {
    if (!hasAppScope || !appId) {
      throw new Error('[useSupplierUpdate] App context required for supplier overlay updates')
    }

    const resolvedId = await resolveId(options.id)
    const collectionPath = resolveConsoleEntityCollectionPath({
      family: supplierCollection,
      mode: 'live',
      appId,
      useAppOverlay: true,
    })

    await updateDocument<AppSupplier>(
      collectionPath,
      resolvedId,
      pruneUndefined(patch)
    )
  }

  const commitUpdate = async (
    patch: Partial<Supplier>,
    options: UpdateOptions = {}
  ) => {
    if (options.scope === 'app') {
      await updateAppSupplier(patch as Partial<AppSupplier>, options)
      return
    }

    await updateCoreSupplier(patch, options)
  }

  const updateHeadline = async (value: string, options: UpdateOptions = {}) => {
    const normalized = cleanString(value)
    await updateCoreSupplier(
      { supplier_headline: normalized ?? undefined },
      options
    )
  }

  const updateSummary = async (value: string, options: UpdateOptions = {}) => {
    const normalized = cleanString(value)
    await updateCoreSupplier({ summary: normalized ?? undefined }, options)
  }

  const updateBio = async (value: string, options: UpdateOptions = {}) => {
    const normalized = cleanString(value)
    await updateCoreSupplier({ supplier_bio: normalized ?? undefined }, options)
  }

  const updateImage = async (value: string, options: UpdateOptions = {}) => {
    const normalized = cleanString(value)
    await updateCoreSupplier({ supplier_image: normalized ?? undefined }, options)
  }

  const updateItemCategories = async (
    value: string | string[],
    options: UpdateOptions = {}
  ) => {
    await updateCoreSupplier(
      {
        supplier_item_categories: toStringArray(value),
      },
      options
    )
  }

  const updateDeliveryAreas = async (
    value: string | string[],
    options: UpdateOptions = {}
  ) => {
    await updateCoreSupplier(
      {
        supplier_delivery_areas: toStringArray(value),
      },
      options
    )
  }

  const updateOrganizationName = async (
    value: string,
    options: UpdateOptions = {}
  ) => {
    const normalized = cleanString(value)
    await updateCoreSupplier(
      { supplier_organization_name: normalized ?? undefined },
      options
    )
  }

  const updateTagline = async (value: string, options: UpdateOptions = {}) => {
    const normalized = cleanString(value)
    await updateCoreSupplier({ tagline: normalized ?? undefined }, options)
  }

  const updateBioShort = async (value: string, options: UpdateOptions = {}) =>
    updateSummary(value, options)

  return {
    commitUpdate,
    updateCoreSupplier,
    updateAppSupplier,
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
