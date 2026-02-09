import { useRoute, useRuntimeConfig } from '#imports'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { computed } from 'vue'
import type { Kitchen } from '../../../models/objects/kitchen.model'
import { useKitchenFetch } from '../firestore/objects/kitchen/fetch/useKitchenFetch'

type KitchenDashboardStatus = 'ready' | 'needs_configuration' | 'empty'

export function useKitchenDashboardSelection() {
  const route = useRoute()
  const runtimeConfig = useRuntimeConfig()
  const { user, myKitchenIds, hasTestKitchen } = useUser()
  const { kitchens } = useKitchenFetch()

  const configuredKitchenId = computed(() => {
    const cfg = (runtimeConfig.public as any)?.fireux?.kitchens ?? {}
    return String(cfg.defaultKitchenId || '').trim()
  })

  const kitchenIds = computed(() =>
    Array.from(
      new Set(
        (kitchens.value ?? [])
          .map((kitchen) => String(kitchen.id || '').trim())
          .filter(Boolean)
      )
    )
  )

  const myKitchenIdsInCollection = computed(() =>
    myKitchenIds.value.filter((id) => kitchenIds.value.includes(id))
  )
  const testKitchenId = computed(() => {
    if (!hasTestKitchen.value) return ''
    return String(user.value?.id || '').trim()
  })
  const hasResolvedTestKitchen = computed(() => Boolean(testKitchenId.value))

  const preferredKitchenIds = computed(() =>
    myKitchenIdsInCollection.value.length
      ? myKitchenIdsInCollection.value
      : hasResolvedTestKitchen.value
        ? [testKitchenId.value]
        : kitchenIds.value
  )

  const routeKitchenId = computed(() => {
    const raw = route.query.kitchenId
    const value = Array.isArray(raw) ? raw[0] : raw
    return String(value || '').trim()
  })

  const isInCollection = (id: string, ids: string[]) =>
    Boolean(id && ids.includes(id))

  const hasRouteKitchen = computed(() =>
    isInCollection(routeKitchenId.value, kitchenIds.value)
  )
  const hasRouteTestKitchen = computed(
    () => hasResolvedTestKitchen.value && routeKitchenId.value === testKitchenId.value
  )

  const hasConfiguredKitchen = computed(() =>
    isInCollection(configuredKitchenId.value, kitchenIds.value)
  )

  const configuredKitchenInPreferred = computed(() =>
    isInCollection(configuredKitchenId.value, preferredKitchenIds.value)
  )

  const runtimeKitchenId = computed(() => {
    if (hasRouteKitchen.value) return routeKitchenId.value
    if (hasRouteTestKitchen.value) return routeKitchenId.value
    if (configuredKitchenInPreferred.value) return configuredKitchenId.value
    if (preferredKitchenIds.value.length === 1) return preferredKitchenIds.value[0]
    if (preferredKitchenIds.value.length > 1) return preferredKitchenIds.value[0]
    if (hasConfiguredKitchen.value) return configuredKitchenId.value
    if (kitchenIds.value.length === 1) return kitchenIds.value[0]
    if (kitchenIds.value.length > 1) return kitchenIds.value[0]
    return ''
  })

  const selectedKitchen = computed(() => {
    const id = runtimeKitchenId.value
    if (!id) return null
    const resolved = (kitchens.value ?? []).find(
      (kitchen) => String(kitchen.id || '').trim() === id
    )
    if (resolved) return resolved

    if (hasResolvedTestKitchen.value && id === testKitchenId.value) {
      return {
        id,
        name: 'Test Kitchen',
        short_name: 'Test Kitchen',
        short_address: 'Test Kitchen',
        formatted_address: 'Test Kitchen',
      } as Kitchen
    }

    return null
  })

  const status = computed<KitchenDashboardStatus>(() => {
    if (runtimeKitchenId.value) return 'ready'
    if (kitchenIds.value.length > 0) return 'needs_configuration'
    return 'empty'
  })

  const dashboardQuery = computed(() =>
    runtimeKitchenId.value ? { kitchenId: runtimeKitchenId.value } : undefined
  )

  return {
    status,
    configuredKitchenId,
    routeKitchenId,
    runtimeKitchenId,
    selectedKitchen,
    kitchenIds,
    myKitchenIds: myKitchenIdsInCollection,
    hasTestKitchen: hasResolvedTestKitchen,
    preferredKitchenIds,
    dashboardQuery,
  }
}
