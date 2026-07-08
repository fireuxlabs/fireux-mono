import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useKitchenInterface } from '../../../firestore/kitchen/utils/view/useKitchenInterface'
import { useKitchenConsole } from '../core/useKitchenConsole'
import { useKitchenConsoleDishes } from '../operations/Dishes/useKitchenConsoleDishes'
import { useKitchenConsoleIngredients } from '../operations/Ingredients/useKitchenConsoleIngredients'
import { useKitchenConsoleMenus } from '../operations/Menus/useKitchenConsoleMenus'
import { useKitchenConsoleMise } from '../operations/Mise/useKitchenConsoleMise'
import { useKitchenConsoleOrders } from '../operations/Orders/useKitchenConsoleOrders'
import { useKitchenConsoleRecipes } from '../operations/Recipes/useKitchenConsoleRecipes'
import { useKitchenConsoleStations } from '../operations/Stations/useKitchenConsoleStations'
import { useKitchenConsoleSuppliers } from '../operations/Suppliers/useKitchenConsoleSuppliers'
import { readKitchenCurrencyCode } from '../../../../../utils/kitchen-spine'

type DetailItem = {
  key: string
  label: string
  value: string
  icon: string
}

type IdentityField = {
  key: string
  label: string
  complete: boolean
  to?: string
}

export type KitchenOverviewOperationCard = {
  key: string
  label: string
  detail: string
  icon: string
  count: number
  pending: boolean
  to: string
}

const count = (items: unknown) => Array.isArray(items) ? items.length : 0
const identityTo = '/console/kitchen/identity'

export function useKitchenConsoleOverview() {
  const {
    selection,
    runtime,
    actions,
  } = useKitchenConsole()
  const { pill } = useKitchenInterface()
  const menuState = useKitchenConsoleMenus()
  const ingredientState = useKitchenConsoleIngredients()
  const dishState = useKitchenConsoleDishes({ resolveMenuSections: false })
  const recipeState = useKitchenConsoleRecipes()
  const supplierState = useKitchenConsoleSuppliers()
  const stationState = useKitchenConsoleStations()
  const miseState = useKitchenConsoleMise()
  const orderState = useKitchenConsoleOrders()

  const selectedKitchen = selection.kitchen
  const kitchenId = selection.kitchenId
  const kitchenSource = computed(() =>
    (selectedKitchen.value || {}) as Record<string, any>
  )
  const kitchenTitle = computed(() =>
    normalizeString(kitchenSource.value.display_name || kitchenSource.value.name) || 'Kitchen'
  )
  const kitchenSubtitle = computed(() =>
    normalizeString(kitchenSource.value.tagline) ||
      normalizeString(kitchenSource.value.short_address) ||
      normalizeString(kitchenSource.value.formatted_address)
  )
  const identityImage = computed(() =>
    normalizeString(
      kitchenSource.value.display_image_url ||
        kitchenSource.value.image_url ||
        kitchenSource.value.identity?.image_url
    )
  )
  const coverImage = computed(() => normalizeString(kitchenSource.value.cover_image))
  const address = computed(() =>
    normalizeString(kitchenSource.value.formatted_address) ||
      normalizeString(kitchenSource.value.short_address)
  )
  const phone = computed(() => normalizeString(kitchenSource.value.phone))
  const website = computed(() => normalizeString(kitchenSource.value.website))
  const currencyCode = computed(() => readKitchenCurrencyCode(kitchenSource.value))
  const placeId = computed(() => normalizeString(kitchenSource.value.place_id))
  const publicBadgeLabel = computed(() =>
    kitchenSource.value.show === true ? 'Public' : 'Draft'
  )
  const publicBadgeColor = computed(() =>
    kitchenSource.value.show === true ? 'success' as const : 'neutral' as const
  )
  const appScopeState = computed(() =>
    normalizeString(kitchenSource.value.app_scope_state)
  )
  const appScopeAppId = computed(() =>
    normalizeString(kitchenSource.value.app_scope_app_id)
  )
  const hasTenantApp = computed(() => appScopeState.value === 'dedicated_app')
  const operatorIds = computed(() =>
    Array.from(
      new Set(
        ((selectedKitchen.value as { operator_ids?: unknown[] } | null)?.operator_ids ?? [])
          .map((id) => normalizeString(id))
          .filter(Boolean)
      )
    )
  )
  const kitchenPill = computed(() => pill(selectedKitchen.value))
  const imageInitials = computed(() => {
    const parts = kitchenTitle.value.split(/\s+/).filter(Boolean)
    if (!parts.length) return 'K'
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase()
  })
  const detailItems = computed<DetailItem[]>(() =>
    [
      address.value
        ? {
            key: 'address',
            label: 'Address',
            value: address.value,
            icon: 'i-lucide-map-pin',
          }
        : null,
      phone.value
        ? {
            key: 'phone',
            label: 'Phone',
            value: phone.value,
            icon: 'i-lucide-phone',
          }
        : null,
      website.value
        ? {
            key: 'website',
            label: 'Website',
            value: website.value.replace(/^https?:\/\//, '').replace(/\/$/, ''),
            icon: 'i-lucide-globe',
          }
        : null,
      currencyCode.value
        ? {
            key: 'currency',
            label: 'Currency',
            value: currencyCode.value,
            icon: 'i-lucide-coins',
          }
        : null,
    ].filter((item): item is DetailItem => Boolean(item))
  )
  const identityFields = computed<IdentityField[]>(() => [
    {
      key: 'name',
      label: 'Name',
      complete: Boolean(kitchenTitle.value && kitchenTitle.value !== 'Kitchen'),
      to: identityTo,
    },
    {
      key: 'slug',
      label: 'Slug',
      complete: Boolean(normalizeString(kitchenSource.value.slug)),
      to: identityTo,
    },
    { key: 'address', label: 'Address', complete: Boolean(address.value), to: identityTo },
    { key: 'place', label: 'Linked place', complete: Boolean(placeId.value), to: identityTo },
    { key: 'phone', label: 'Phone', complete: Boolean(phone.value), to: identityTo },
    { key: 'website', label: 'Website', complete: Boolean(website.value), to: identityTo },
    {
      key: 'currency',
      label: 'Currency',
      complete: Boolean(currencyCode.value),
      to: identityTo,
    },
    { key: 'image', label: 'Profile image', complete: Boolean(identityImage.value), to: identityTo },
    {
      key: 'cover',
      label: 'Cover image',
      complete: Boolean(coverImage.value),
      to: identityTo,
    },
    {
      key: 'tagline',
      label: 'Tagline',
      complete: Boolean(normalizeString(kitchenSource.value.tagline)),
      to: identityTo,
    },
  ])
  const completeIdentityCount = computed(() =>
    identityFields.value.filter((field) => field.complete).length
  )
  const identityPercent = computed(() =>
    identityFields.value.length
      ? Math.round((completeIdentityCount.value / identityFields.value.length) * 100)
      : 0
  )
  const missingIdentityFields = computed(() =>
    identityFields.value.filter((field) => !field.complete)
  )
  const priorityIdentityFields = computed(() =>
    identityFields.value.filter((field) =>
      ['currency', 'cover', 'tagline'].includes(field.key)
    )
  )
  const operationCards = computed<KitchenOverviewOperationCard[]>(() => [
    {
      key: 'menus',
      label: 'Menus',
      detail: 'Published and working menu surfaces.',
      icon: 'i-lucide-book-open',
      count: count(menuState.menus.value),
      pending: Boolean(menuState.pending.value),
      to: '/console/kitchen/menus',
    },
    {
      key: 'ingredients',
      label: 'Ingredients',
      detail: 'Ingredient records available to recipes and dishes.',
      icon: 'i-lucide-wheat',
      count: count(ingredientState.ingredients.value),
      pending: Boolean(ingredientState.pending.value),
      to: '/console/kitchen/ingredients',
    },
    {
      key: 'dishes',
      label: 'Dishes',
      detail: 'Sellable dishes and menu items.',
      icon: 'i-lucide-utensils',
      count: count(dishState.dishes.value),
      pending: Boolean(dishState.pending.value),
      to: '/console/kitchen/dishes',
    },
    {
      key: 'recipes',
      label: 'Recipes',
      detail: 'Kitchen prep recipes connected to dishes.',
      icon: 'i-lucide-notebook-tabs',
      count: count(recipeState.recipes.value),
      pending: Boolean(recipeState.pending.value),
      to: '/console/kitchen/recipes',
    },
    {
      key: 'orders',
      label: 'Orders',
      detail: 'Visible kitchen order tickets.',
      icon: 'i-lucide-receipt-text',
      count: count(orderState.ticketOrders.value),
      pending: Boolean(orderState.pending.value),
      to: '/console/kitchen/orders',
    },
    {
      key: 'suppliers',
      label: 'Suppliers',
      detail: 'Supplier links for purchasing.',
      icon: 'i-lucide-truck',
      count: count(supplierState.suppliers.value),
      pending: Boolean(supplierState.pending.value),
      to: '/console/kitchen/suppliers',
    },
    {
      key: 'mise',
      label: 'Mise',
      detail: 'Prep tasks and service setup.',
      icon: 'i-lucide-list-checks',
      count: count(miseState.miseTasks.value),
      pending: Boolean(miseState.pending.value),
      to: '/console/kitchen/mise',
    },
    {
      key: 'stations',
      label: 'Stations',
      detail: 'Kitchen station setup.',
      icon: 'i-lucide-panels-top-left',
      count: count(stationState.stations.value),
      pending: Boolean(stationState.pending.value),
      to: '/console/kitchen/stations',
    },
  ])
  const debug = computed(() => ({
    kitchenId: kitchenId.value,
    activeKitchenAppId: runtime.appId.value,
    rootCollection: runtime.rootCollection.value,
    readOnly: runtime.readOnly.value,
    canWrite: runtime.canWrite.value,
    appScope: {
      state: appScopeState.value,
      appId: appScopeAppId.value,
      hasTenantApp: hasTenantApp.value,
    },
    operators: {
      ids: operatorIds.value,
      count: operatorIds.value.length,
    },
    identity: {
      percent: identityPercent.value,
      complete: completeIdentityCount.value,
      total: identityFields.value.length,
      missing: identityFields.value
        .filter((field) => !field.complete)
        .map((field) => field.key),
    },
    operations: {
      cards: operationCards.value.map((card) => ({
        key: card.key,
        count: card.count,
        pending: card.pending,
      })),
    },
  }))

  return {
    selectedKitchen,
    kitchenId,
    kitchenTitle,
    kitchenSubtitle,
    identityImage,
    imageInitials,
    kitchenPill,
    detailItems,
    publicBadgeLabel,
    publicBadgeColor,
    identityFields,
    completeIdentityCount,
    missingIdentityFields,
    priorityIdentityFields,
    identityPercent,
    operationCards,
    activeKitchenAppId: runtime.appId,
    rootCollection: runtime.rootCollection,
    readOnly: runtime.readOnly,
    canWrite: runtime.canWrite,
    clearSelectedKitchen: actions.clearSelectedKitchen,
    debug,
  }
}
