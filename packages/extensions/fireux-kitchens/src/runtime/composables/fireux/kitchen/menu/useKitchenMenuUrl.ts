import { collection, limit as fsLimit, query as fsQuery, type Query } from 'firebase/firestore'
import { computed, ref, unref, type ComputedRef, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useAppFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/app/fetch/useAppFetch'
import {
  useCollection,
  useFirestoreResolver,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model'
import { KitchenStorage } from '../../../../models/kitchen.model'
import {
  kitchenMenuIndexPath,
  kitchenMenuPath,
  kitchenMenuRouteMode,
} from '../../../../utils/kitchen-menu-route'

type MaybeRef<T> = Ref<T> | ComputedRef<T>

const text = (value: unknown) => String(value ?? '').trim()
const origin = (value: unknown) => text(value).replace(/\/+$/, '')

export function useKitchenMenuUrl(options: {
  appId: MaybeRef<string | null | undefined>
  kitchenSlug: MaybeRef<string | null | undefined>
}) {
  const fireux = useFireUXConfig()
  const db = useFirestoreResolver()
  const appId = computed(() => text(unref(options.appId)))
  const kitchenSlug = computed(() => text(unref(options.kitchenSlug)))
  const { app } = useAppFetch(appId)
  const appKitchenCollectionPath = computed(() =>
    appId.value
      ? `${AppStorage.collection}/${appId.value}/${KitchenStorage.scopeCollection}`
      : ''
  )
  const appKitchenQuery = computed<Query<Record<string, unknown>> | null>(() => {
    if (import.meta.server || !appKitchenCollectionPath.value) return null

    return fsQuery(
      collection(db(), appKitchenCollectionPath.value),
      fsLimit(2)
    ) as Query<Record<string, unknown>>
  })
  const appKitchenState = import.meta.server
    ? {
        data: ref<Record<string, unknown>[]>([]),
        pending: ref(false),
      }
    : useCollection<Record<string, unknown>>(appKitchenQuery as any, {
        transform: (docSnap: any) => ({
          ...(docSnap.data() as Record<string, unknown>),
          id: docSnap.id,
        }),
      } as any)
  const appKitchenCount = computed(() => appKitchenState.data.value?.length ?? 0)
  const appKitchenIds = computed(() =>
    (appKitchenState.data.value ?? [])
      .map((kitchen: Record<string, unknown>) => text(kitchen.id))
      .filter(Boolean)
  )
  const singleKitchenId = computed(() =>
    appKitchenCount.value === 1 ? appKitchenIds.value[0] ?? '' : ''
  )
  const routeMode = computed(() =>
    kitchenMenuRouteMode(appKitchenCount.value)
  )
  const menuIndexPath = computed(() =>
    kitchenMenuIndexPath({
      mode: routeMode.value,
      kitchenSlug: kitchenSlug.value,
    })
  )
  const appRecord = computed<Record<string, unknown>>(() =>
    app.value && typeof app.value === 'object'
      ? app.value as Record<string, unknown>
      : {}
  )
  const socialLinks = computed<Record<string, unknown>>(() => {
    const links = appRecord.value.social_links
    return links && typeof links === 'object' && !Array.isArray(links)
      ? links as Record<string, unknown>
      : {}
  })
  const appOrigin = computed(
    () =>
      origin(socialLinks.value.website) ||
      origin(appRecord.value.source_url) ||
      origin(fireux.siteUrl) ||
      (import.meta.client ? origin(window.location.origin) : '')
  )
  const menuIndexUrl = computed(() => {
    if (!menuIndexPath.value || !appOrigin.value) return menuIndexPath.value
    return new URL(menuIndexPath.value, appOrigin.value).toString()
  })
  const menuPath = (menuId: unknown) =>
    kitchenMenuPath({
      mode: routeMode.value,
      kitchenSlug: kitchenSlug.value,
      menuId,
    })
  const menuUrl = (menuId: unknown) => {
    const path = menuPath(menuId)
    if (!path || !appOrigin.value) return path
    return new URL(path, appOrigin.value).toString()
  }
  const debug = computed(() => ({
    appId: appId.value,
    kitchenSlug: kitchenSlug.value,
    appKitchenCollectionPath: appKitchenCollectionPath.value,
    appKitchenCount: appKitchenCount.value,
    appKitchenIds: appKitchenIds.value,
    singleKitchenId: singleKitchenId.value,
    routeMode: routeMode.value,
    menuIndexPath: menuIndexPath.value,
    menuIndexUrl: menuIndexUrl.value,
    appOrigin: appOrigin.value,
    pending: appKitchenState.pending.value,
  }))

  return {
    appId,
    kitchenSlug,
    appKitchenCount,
    appKitchenIds,
    singleKitchenId,
    routeMode,
    menuIndexPath,
    menuIndexUrl,
    menuPath,
    menuUrl,
    pending: appKitchenState.pending,
    debug,
  }
}
