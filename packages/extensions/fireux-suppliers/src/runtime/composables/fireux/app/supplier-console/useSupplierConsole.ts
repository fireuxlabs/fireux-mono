import { computed, isRef } from 'vue'
import {
  useConsole,
  type ConsoleMode,
} from 'fireux-core/runtime/composables/fireux/console/useConsole'
import {
  usePublishConsoleHeader,
  type ConsoleHeaderData,
} from 'fireux-core/runtime/composables/fireux/console/useConsoleHeader'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import {
  useSupplierCollection,
  type SupplierCollectionFilter,
} from '../../firestore/supplier/fetch/useSupplierCollection'
import { useSupplierFetch } from '../../firestore/supplier/fetch/useSupplierFetch'
import {
  useSupplierInterface,
  type SupplierSurface,
} from '../../firestore/supplier/utils/view/useSupplierInterface'
import type { Ref } from 'vue'

type SupplierConsoleMode = ConsoleMode
type UseSupplierConsoleOptions = {
  publishHeader?: boolean
  filter?: SupplierCollectionFilter | Ref<SupplierCollectionFilter | null | undefined> | null
}

type AppSupplierOverlay = {
  id?: string
  team_ids?: string[]
  admin_ids?: string[]
  console_enabled?: boolean
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useSupplierConsole(
  options: UseSupplierConsoleOptions = {}
) {
  const { appId } = useFireUXConfig()
  const { uid } = useAuth()
  const { avatarSrc, currentUser } = useUser()
  const { firestoreFetchCollection } = useFirestoreRead()
  const { pill } = useSupplierInterface()
  const resolvedAppId = normalizeString(appId)
  const overlaySource = resolvedAppId
    ? firestoreFetchCollection<AppSupplierOverlay>(
        `apps/${resolvedAppId}/suppliers`
      )
    : null
  const liveFilter = computed<SupplierCollectionFilter>(() => {
    const currentUid = normalizeString(uid.value)
    if (!currentUid) return { ids: [] }

    const ids = (overlaySource?.value ?? [])
      .map((overlay) => {
        const id = normalizeString(overlay?.id)
        if (!id) return ''
        if (overlay?.console_enabled === false) return ''

        const members = Array.isArray(overlay?.team_ids)
          ? overlay.team_ids
          : Array.isArray(overlay?.admin_ids)
            ? overlay.admin_ids
            : []

        return members
          .map((value) => normalizeString(value))
          .includes(currentUid)
          ? id
          : ''
      })
      .filter(Boolean)

    return {
      ids,
    }
  })
  const resolvedFilter = computed<SupplierCollectionFilter>(() => {
    if (options.filter) {
      const value = isRef(options.filter)
        ? (options.filter.value ?? undefined)
        : options.filter
      if (value) return value
    }

    return liveFilter.value
  })
  const { suppliers: liveSuppliers } = useSupplierCollection({
    filter: resolvedFilter,
  })
  const demoSuppliers = computed<SupplierSurface[]>(() => [])
  const { supplier: testSupplier } = useSupplierFetch(uid, {
    collectionPath: 'test-suppliers',
  })

  const {
    selectedId,
    selectedMode,
    selectedEntity,
    selectEntity,
    clearSelection,
  } = useConsole<SupplierSurface, SupplierSurface, SupplierSurface>('suppliers', {
    liveItems: liveSuppliers,
    demoItems: demoSuppliers,
    testItem: testSupplier,
    getId: (supplier) => normalizeString((supplier as SupplierSurface)?.id),
  })

  const selectedSupplier = computed<SupplierSurface | null>(
    () => selectedEntity.value as SupplierSurface | null
  )

  const supplier = computed(() => {
    const target = selectedSupplier.value
    if (!target) return null

    if (selectedMode.value === 'test') {
      const card = pill(
        {
          ...target,
          image_url:
            normalizeString((target as Record<string, unknown>).image_url) ||
            normalizeString((target as Record<string, unknown>).supplier_image) ||
            undefined,
        },
        { avatar: avatarSrc.value || undefined }
      )
      if (!card) return null

      return {
        ...card,
        title: 'Test Supplier',
        subtitle: normalizeString(currentUser.value?.display_name),
      }
    }

    return pill(target)
  })

  const supplierState = {
    id: selectedId,
    mode: selectedMode,
    entity: selectedSupplier,
  }

  const header = computed<ConsoleHeaderData>(() => {
    const target = selectedSupplier.value as Record<string, unknown> | null
    if (!target) return null

    if (selectedMode.value === 'test') {
      return {
        title: 'Test Supplier',
        subtitle:
          normalizeString(target.supplier_organization_name) ||
          normalizeString(target.name) ||
          normalizeString(target.id) ||
          undefined,
        imageUrl:
          normalizeString(target.supplier_image) ||
          normalizeString(target.image_url) ||
          undefined,
      }
    }

    return {
      title:
        normalizeString(target.supplier_organization_name) ||
        normalizeString(target.name) ||
        normalizeString(target.short_name) ||
        normalizeString(target.id),
      subtitle:
        normalizeString(target.supplier_headline) ||
        normalizeString(target.summary) ||
        normalizeString(target.id) ||
        undefined,
      imageUrl:
        normalizeString(target.supplier_image) ||
        normalizeString(target.image_url) ||
        undefined,
    }
  })

  usePublishConsoleHeader('suppliers', header)

  const clearSelectedSupplier = () => {
    clearSelection()
  }

  const selectSupplier = (supplierId: string, mode: SupplierConsoleMode = 'live') => {
    selectEntity(supplierId, mode)
  }

  return {
    liveSuppliers,
    demoSuppliers,
    testSupplier,
    supplierState,
    supplier,
    selectedSupplier,
    selectedMode,
    clearSelectedSupplier,
    selectSupplier,
  }
}
