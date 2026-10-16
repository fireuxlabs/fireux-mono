import { useKitchenOfferingCollection } from '../../useKitchenOfferingCollection'
import { useRouter } from '#imports'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useMenuEditorScope } from '../../../../menu/composables/useMenuEditorScope'
import { useMenuDelete } from '../../../../menu/composables/firestore/mutations/useMenuDelete'
import { computed, inject, provide, type InjectionKey } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useKitchenAccess } from '../../useKitchenAccess'
import { useKitchenRead } from '../../firestore/useKitchenRead'
import { useKitchenInterface } from '../../useKitchenInterface'
import { readPlaceCurrencyCode } from 'fireux-places/runtime/place/utils/place-spine'
import { useKitchenMenuRead } from '../../../../menu/composables/useKitchenMenuRead'
import { useMenuSectionCollection } from '../../../../menu/composables/useMenuSectionCollection'
import { useMenuSectionMutations } from '../../../../menu/composables/firestore/mutations/useMenuSectionMutations'
import { useMenuUpdate } from '../../../../menu/composables/firestore/mutations/useMenuUpdate'
import { useMenuPublication } from '../../../../menu/composables/publication/useMenuPublication'
import {
  MenuSourceUploadStorage,
  type MenuSourceUpload,
} from '../../../../menu/utils/menu-source-upload'
import { kitchenMenuOrdering } from '../../../../menu/utils/menu-ordering'

export type KitchenMenuRecordContext = ReturnType<
  typeof createKitchenMenuRecordContext
>
const recordKey: InjectionKey<KitchenMenuRecordContext> = Symbol(
  'KitchenMenuRecordContext'
)

/** One routed Menu workflow. Collection selection and creation stay in Menus. */
function createKitchenMenuRecordContext() {
  const session = useAppSession()
  const config = useFireUXConfig()
  const { selectedId: kitchenId } = useWorkspace('kitchen')
  const access = useKitchenAccess()
  const menuSlug = useRouteParam('menuSlug')
  const rootCollection = computed(() => 'kitchens')
  const databaseId = computed(() => readRuntimeFirestoreDatabaseId() || '')
  const accessError = computed(() => session.error.value || access.error.value)
  const accessPending = computed(
    () => session.pending.value || access.pending.value
  )
  // The existing membership-bound Kitchen association grants access; App role
  // restricts editing separately. No new read permission is inferred.
  const hasAccess = computed(
    () =>
      !accessPending.value &&
      !accessError.value &&
      Boolean(session.uid.value && session.appUser.value) &&
      access.ids.value.includes(kitchenId.value)
  )
  const accessibleKitchenId = computed(() =>
    hasAccess.value ? kitchenId.value : ''
  )
  const kitchen = useKitchenRead(accessibleKitchenId)
  const { surface } = useKitchenInterface()
  const selectedKitchen = computed(() =>
    hasAccess.value
      ? surface({
          kitchen: kitchen.kitchen.value,
          place: kitchen.place.value,
          routeScope: 'live',
        })
      : null
  )
  const storageKitchenId = computed(() =>
    hasAccess.value && kitchen.outcome.value === 'ready' ? kitchenId.value : ''
  )
  const offerings = useKitchenOfferingCollection(storageKitchenId)
  const scope = computed(() =>
    JSON.stringify([
      config.appId,
      session.uid.value,
      session.appUser.value?.created?.at,
    ])
  )
  const record = useKitchenMenuRead(storageKitchenId, menuSlug, {
    kitchenCollectionPath: rootCollection,
    databaseId,
    scope,
  })
  const error = computed(
    () => accessError.value || kitchen.error.value || record.error.value
  )
  const outcome = computed(() => {
    const failure = error.value as
      | { code?: string; statusCode?: number; status?: number }
      | undefined
    if (failure)
      return failure.code === 'permission-denied' ||
        failure.code === 'firestore/permission-denied' ||
        Number(failure.statusCode ?? failure.status) === 403
        ? 'denied'
        : 'error'
    if (accessPending.value) return 'pending'
    if (!kitchenId.value) return 'idle'
    if (!hasAccess.value) return 'denied'
    if (kitchen.outcome.value !== 'ready') return kitchen.outcome.value
    return record.outcome.value
  })
  const pending = computed(() => outcome.value === 'pending')
  const menu = computed(() =>
    outcome.value === 'ready' ? record.menu.value : null
  )
  const menuId = computed(() => menu.value?.id || '')
  const canManage = computed(
    () =>
      Boolean(menu.value) &&
      hasAccess.value &&
      ['user', 'admin', 'dev'].includes(String(session.appUser.value?.role))
  )
  const canWrite = computed(
    () =>
      canManage.value &&
      (menu.value?.schedule !== 'daily' ||
        ['premium', 'business'].includes(
          session.appUser.value?.subscription || 'free'
        ))
  )
  const currencyCode = computed(() =>
    readPlaceCurrencyCode(kitchen.place.value)
  )
  const subscription = computed(
    () => session.appUser.value?.subscription || 'free'
  )
  const ordering = computed(() =>
    kitchenMenuOrdering(offerings.offerings.value, menuId.value)
  )
  const { firestoreFetchDoc } = useFirestoreRead({ databaseId })
  const sourcePath = computed(() =>
    storageKitchenId.value
      ? `kitchens/${storageKitchenId.value}/${MenuSourceUploadStorage.collection}`
      : ''
  )
  const sourceRead = firestoreFetchDoc<MenuSourceUpload>(sourcePath, menuId)
  const source = computed(() =>
    menuId.value &&
    !sourceRead.pending.value &&
    !sourceRead.error.value &&
    sourceRead.value?.id === menuId.value
      ? sourceRead.value
      : null
  )
  const sectionState = useMenuSectionCollection(storageKitchenId, menuId, {
    kitchenCollectionPath: rootCollection,
    databaseId,
  })
  const sections = sectionState.sections
  const sectionMutations = useMenuSectionMutations()
  const update = useMenuUpdate()
  const removal = useMenuDelete()
  const router = useRouter()
  const toast = useToastify()
  const captureIntent = useMenuEditorScope([kitchenId, menuSlug])
  const publication = useMenuPublication()
  function assertCanWrite() {
    if (!canWrite.value) throw new Error('This menu is read-only.')
  }
  async function updateMenu(...args: Parameters<typeof update.updateMenu>) {
    assertCanWrite()
    return update.updateMenu(...args)
  }
  async function renameMenu(...args: Parameters<typeof update.renameMenu>) {
    assertCanWrite()
    const isCurrent = captureIntent()
    const result = await update.renameMenu(...args)
    if (!isCurrent()) return result
    toast.add({
      title: 'Menu renamed',
      description: 'The Menu name has been updated. Its address is unchanged.',
      color: 'success',
      icon: 'i-lucide-check',
    })
    await router.replace(
      `/workspace/kitchen/menus/${encodeURIComponent(result.slug)}`
    )
    return result
  }
  async function deleteMenu(...args: Parameters<typeof removal.deleteMenu>) {
    assertCanWrite()
    const isCurrent = captureIntent()
    const result = await removal.deleteMenu(...args)
    if (!isCurrent()) return result
    toast.add({ title: 'Menu deleted', icon: 'i-heroicons-check-circle' })
    await router.replace('/workspace/kitchen/menus')
    return result
  }
  async function publishMenu(
    ...args: Parameters<typeof publication.publishMenu>
  ) {
    assertCanWrite()
    return publication.publishMenu(...args)
  }
  async function unpublishMenu(
    ...args: Parameters<typeof publication.unpublishMenu>
  ) {
    assertCanWrite()
    return publication.unpublishMenu(...args)
  }
  async function createSection(
    ...args: Parameters<typeof sectionMutations.createSection>
  ) {
    assertCanWrite()
    return sectionMutations.createSection(...args)
  }
  async function updateSection(
    ...args: Parameters<typeof sectionMutations.updateSection>
  ) {
    assertCanWrite()
    return sectionMutations.updateSection(...args)
  }
  async function archiveSection(
    ...args: Parameters<typeof sectionMutations.archiveSection>
  ) {
    assertCanWrite()
    return sectionMutations.archiveSection(...args)
  }
  async function moveSection(
    ...args: Parameters<typeof sectionMutations.moveSection>
  ) {
    assertCanWrite()
    return sectionMutations.moveSection(...args)
  }
  return {
    menu,
    menuId,
    menuSlug,
    kitchenId,
    storageKitchenId,
    selectedKitchen,
    timezone: computed(() => String(kitchen.place.value?.timezone || '')),
    rootCollection,
    databaseId,
    activeKitchenAppId: computed(() => config.appId),
    pending,
    error,
    outcome,
    canWrite,
    canManage,
    currencyCode,
    subscription,
    offerings: offerings.offerings,
    offeringsOutcome: offerings.outcome,
    offeringsError: offerings.error,
    ordering,
    source,
    sourcePending: sourceRead.pending,
    sourceError: sourceRead.error,
    sections,
    allSections: sectionState.items,
    sectionsPending: sectionState.pending,
    sectionsError: sectionState.error,
    sectionsCollectionPath: sectionState.collectionPath,
    sectionPreviews: computed(() =>
      sections.value.map((section) => ({
        id: section.id,
        label: section.label || section.id || 'Section',
        description: section.description || '',
        itemCount: null,
        items: [],
      }))
    ),
    updateMenu,
    renameMenu,
    deleteMenu,
    publishMenu,
    unpublishMenu,
    createSection,
    updateSection,
    archiveSection,
    moveSection,
    debug: computed(() => ({
      kitchenId: kitchenId.value,
      menuId: menuId.value,
      hasMenu: Boolean(menu.value),
      hasSource: Boolean(source.value),
      sectionsCount: sections.value.length,
      pending: pending.value,
    })),
  }
}

export function provideKitchenMenuRecordContext() {
  const record = createKitchenMenuRecordContext()
  provide(recordKey, record)
  return record
}

export function useKitchenMenuRecordContext() {
  const record = inject(recordKey, null)
  if (!record) throw new Error('Menu record workspace is not available')
  return record
}

export function useOptionalKitchenMenuRecordContext() {
  return inject(recordKey, null)
}
