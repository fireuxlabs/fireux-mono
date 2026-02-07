import { useRoute, useRuntimeConfig } from '#imports'
import { computed } from 'vue'
import { useKitchenFetch } from '../firestore/objects/kitchen/fetch/useKitchenFetch'

type KitchenDashboardStatus = 'ready' | 'needs_configuration' | 'empty'

export function useKitchenDashboardSelection() {
  const route = useRoute()
  const runtimeConfig = useRuntimeConfig()
  const { kitchens } = useKitchenFetch()

  const configuredKitchenId = computed(() => {
    const cfg = (runtimeConfig.public as any)?.fireux?.kitchens ?? {}
    return String(cfg.defaultKitchenId || '').trim()
  })

  const kitchenIds = computed(() =>
    (kitchens.value ?? [])
      .map((kitchen) => String(kitchen.id || '').trim())
      .filter(Boolean)
  )

  const routeKitchenId = computed(() => {
    const raw = route.query.kitchenId
    const value = Array.isArray(raw) ? raw[0] : raw
    return String(value || '').trim()
  })

  const hasRouteKitchen = computed(() =>
    Boolean(
      routeKitchenId.value &&
      kitchenIds.value.includes(routeKitchenId.value)
    )
  )

  const runtimeKitchenId = computed(() => {
    if (hasRouteKitchen.value) return routeKitchenId.value
    if (configuredKitchenId.value) return configuredKitchenId.value
    if (kitchenIds.value.length === 1) return kitchenIds.value[0]
    return ''
  })

  const selectedKitchen = computed(() => {
    const id = runtimeKitchenId.value
    if (!id) return null
    return (kitchens.value ?? []).find((kitchen) => String(kitchen.id || '').trim() === id) ?? null
  })

  const status = computed<KitchenDashboardStatus>(() => {
    if (runtimeKitchenId.value) return 'ready'
    if (kitchenIds.value.length > 1) return 'needs_configuration'
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
    dashboardQuery,
  }
}
