<template>
  <UPage>
    <UPageHeader :title="headerTitle" :description="headerDescription">
      <template #ctas>
        <UButton size="xs" variant="ghost" icon="i-lucide-arrow-left" :to="backToKitchen">
          Back
        </UButton>
        <UButton
          v-if="itemCount > 0"
          size="xs"
          variant="soft"
          icon="i-lucide-shopping-basket"
          :to="checkoutRoute"
        >
          Basket · {{ itemCount }}
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="space-y-6">
      <div v-if="loading" class="py-10 text-sm text-dimmed">
        Loading menu...
      </div>

      <UAlert
        v-else-if="!resolvedKitchen"
        color="neutral"
        variant="soft"
        title="Kitchen not found"
        description="We could not resolve this kitchen from the current route."
      />

      <template v-else>
        <UCard>
          <div class="space-y-1">
            <div class="text-sm font-semibold">{{ resolvedKitchen.name || 'Kitchen' }}</div>
            <div v-if="kitchenAddress" class="text-xs text-dimmed">
              {{ kitchenAddress }}
            </div>
          </div>

          <div v-if="requestedModeLabel || requestedTable || requestedCover" class="mt-3 flex flex-wrap items-center gap-2">
            <UBadge v-if="requestedModeLabel" variant="soft" color="neutral">
              {{ requestedModeLabel }}
            </UBadge>
            <UBadge v-if="requestedTable" variant="soft" color="neutral">
              Table {{ requestedTable }}
            </UBadge>
            <UBadge v-if="requestedCover" variant="soft" color="neutral">
              Cover {{ requestedCover }}
            </UBadge>
          </div>
        </UCard>

        <UAlert
          v-if="basketKitchenMismatch"
          color="warning"
          variant="soft"
          title="Basket has a different kitchen"
          description="Adding here will start a new basket for this kitchen."
        />

        <UCard v-if="itemCount > 0">
          <template #header>
            <div class="flex items-center justify-between gap-3">
              <div class="text-sm font-semibold">
                Basket · {{ itemCount }} item{{ itemCount === 1 ? '' : 's' }}
              </div>
              <UButton
                size="xs"
                variant="soft"
                icon="i-lucide-shopping-basket"
                :to="checkoutRoute"
              >
                Checkout
              </UButton>
            </div>
          </template>

          <div class="space-y-2">
            <div
              v-for="(line, index) in basketItems"
              :key="lineKey(line, index)"
              class="flex items-center justify-between gap-3 rounded border border-default p-2.5"
            >
              <div class="min-w-0">
                <div class="truncate text-sm font-medium">{{ line.label }}</div>
                <div class="text-xs text-dimmed">
                  {{ formatPrice(line.price_minor, line.currency_code) }} each
                </div>
              </div>

              <div class="flex items-center gap-1">
                <UButton
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-minus"
                  @click="decrementAt(index)"
                />
                <div class="w-6 text-center text-sm font-medium">{{ line.qty }}</div>
                <UButton
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-plus"
                  @click="incrementAt(index)"
                />
                <UButton
                  size="xs"
                  variant="ghost"
                  color="error"
                  icon="i-lucide-trash-2"
                  @click="removeAt(index)"
                />
              </div>
            </div>
          </div>

          <template #footer>
            <div class="flex items-center justify-between">
              <div class="text-sm text-dimmed">Subtotal</div>
              <div class="text-sm font-semibold">
                {{ formatPrice(subtotalMinor, currencyCode) }}
              </div>
            </div>
          </template>
        </UCard>

        <UCard v-if="sortedMenus.length">
          <template #header>
            <div class="space-y-1">
              <div class="text-sm font-semibold">Menus</div>
              <div class="text-xs text-dimmed">
                Active menus are selectable. Current service mode filters menu availability.
              </div>
            </div>
          </template>

          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="menu in sortedMenus"
              :key="menu.id || menu.name"
              size="xs"
              :variant="isSelectedMenu(menu) ? 'solid' : 'soft'"
              :color="isMenuSelectable(menu) ? 'primary' : 'neutral'"
              :disabled="!isMenuSelectable(menu)"
              :to="isMenuSelectable(menu) ? resolveMenuTo(menu) : undefined"
            >
              {{ menu.name || 'Untitled menu' }}
            </UButton>
          </div>
        </UCard>

        <UAlert
          v-if="!selectedMenu"
          color="neutral"
          variant="soft"
          :title="requestedModeLabel ? `No ${requestedModeLabel} menu available` : 'No active menu available'"
          :description="noMenuDescription"
        />

        <div v-else class="space-y-6">
          <UCard
            v-for="section in sortedSections"
            :key="section.id || section.label"
          >
            <template #header>
              <div class="space-y-1">
                <div class="text-base font-semibold">{{ section.label || 'Section' }}</div>
                <USeparator />
              </div>
            </template>

            <div class="space-y-3">
              <div
                v-for="group in section.itemGroups"
                :key="group.key"
                class="rounded border border-default p-3"
              >
                <div
                  v-if="group.items.length > 1"
                  class="mb-2 text-sm font-semibold"
                >
                  {{ group.label }}
                </div>

                <div class="space-y-2">
                  <div
                    v-for="item in group.items"
                    :key="item.id || item.label"
                    class="flex items-start justify-between gap-4"
                  >
                    <div class="min-w-0 space-y-1">
                      <div class="font-medium">
                        {{
                          group.items.length > 1
                            ? resolveVariantLabel(group.label, item.label)
                            : (item.label || 'Menu item')
                        }}
                      </div>
                      <div v-if="item.description" class="text-sm text-dimmed">
                        {{ item.description }}
                      </div>
                    </div>

                    <div class="flex shrink-0 items-center gap-3">
                      <div class="text-sm font-semibold text-right min-w-[5rem]">
                        {{ formatPrice(item.price_minor, item.currency_code) }}
                      </div>
                      <UButton
                        size="xs"
                        variant="soft"
                        color="neutral"
                        @click="handleAddToBasket(group, item)"
                      >
                        Add to basket
                      </UButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </template>
    </UPageBody>

    <UButton
      v-if="itemCount > 0"
      class="fixed bottom-5 right-5 z-[60] rounded-full shadow-lg"
      icon="i-lucide-shopping-basket"
      size="lg"
      :to="checkoutRoute"
    >
      Basket · {{ itemCount }} · {{ formatPrice(subtotalMinor, currencyCode) }}
    </UButton>
  </UPage>
</template>

<script setup lang="ts">
import { useRoute } from '#imports'
import { useBasket } from 'fireux-orders/runtime/composables/useBasket'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import { resolveKitchenConsoleCollectionPath } from '../../../../composables/fireux/app/kitchen-console/shared'
import { useKitchenFetch } from '../../../../composables/fireux/firestore/kitchen/fetch/useKitchenFetch'
import type { Menu, MenuSection, MenuServiceMode } from '../../../../models/menu.model'
import {
  resolveMenuItemView,
  type ResolvedMenuItemView,
} from '../../../../composables/fireux/firestore/runtime-kitchen/menu/utils/view/resolveMenuItemView'

definePageMeta({
  layout: 'kitchen-menu',
  title: 'Kitchen Menu',
  description: 'Public menu view.',
  head: { title: 'Kitchen Menu' },
  name: 'KitchenPublicMenuDetailPage',
})

const route = useRoute()
const toast = useToastify()

const routeId = computed(() => {
  const raw = route.params.id
  return Array.isArray(raw)
    ? String(raw[0] ?? '').trim()
    : String(raw ?? '').trim()
})

const routeMenuId = computed(() => {
  const rawParam = route.params.menuId
  const menuIdFromParam = Array.isArray(rawParam)
    ? String(rawParam[0] ?? '').trim()
    : String(rawParam ?? '').trim()

  if (menuIdFromParam) return menuIdFromParam

  const raw = route.query.menuId
  return Array.isArray(raw)
    ? String(raw[0] ?? '').trim()
    : String(raw ?? '').trim()
})

const normalizeMode = (value: unknown): '' | 'dine_in' | 'collection' | 'delivery' => {
  const raw = String(value || '').trim().toLowerCase()
  if (raw === 'dine_in' || raw === 'dine-in') return 'dine_in'
  if (raw === 'collection') return 'collection'
  if (raw === 'delivery') return 'delivery'
  return ''
}

const requestedMode = computed(() => normalizeMode(route.query.mode))
const requestedTable = computed(() => {
  const raw = route.query.table
  return Array.isArray(raw)
    ? String(raw[0] ?? '').trim()
    : String(raw ?? '').trim()
})
const requestedCover = computed(() => {
  const raw = route.query.cover
  return Array.isArray(raw)
    ? String(raw[0] ?? '').trim()
    : String(raw ?? '').trim()
})

const requestedModeLabel = computed(() => {
  if (requestedMode.value === 'dine_in') return 'Dine-in'
  if (requestedMode.value === 'collection') return 'Collection'
  if (requestedMode.value === 'delivery') return 'Delivery'
  return ''
})

const { kitchens } = useKitchenFetch()
const { appId } = useFireUXConfig()
const resolvedKitchen = computed(() => {
  const key = routeId.value
  if (!key) return null

  const keyLower = key.toLowerCase()
  const list = kitchens.value ?? []

  const found = list.find((entry) => {
    const id = String(entry?.id ?? '').trim()
    const slug = String((entry as any)?.slug ?? '').trim().toLowerCase()
    return id === key || (slug.length > 0 && slug === keyLower)
  })

  return found ?? null
})

const kitchenId = computed(() => String(resolvedKitchen.value?.id ?? '').trim())
const kitchenAddress = computed(() =>
  String(
    (resolvedKitchen.value as any)?.short_address ||
      (resolvedKitchen.value as any)?.formatted_address ||
      ''
  ).trim()
)

const loading = computed(() => Boolean(routeId.value) && kitchens.value === undefined)

const { firestoreFetchCollection } = useFirestoreRead()
const menusRef = shallowRef(null) as ShallowRef<Ref<Menu[] | undefined> | null>

watch(
  kitchenId,
  (nextKitchenId) => {
    const basePath = resolveKitchenConsoleCollectionPath(appId)
    const path = nextKitchenId ? `${basePath}/${nextKitchenId}/menus` : ''

    menusRef.value = path ? firestoreFetchCollection<Menu>(path) : null
  },
  { immediate: true }
)

const menus = computed(() => menusRef.value?.value ?? [])

const sortedMenus = computed(() =>
  [...menus.value].sort((a, b) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0))
)

const inferLegacyModes = (menu: Menu): MenuServiceMode[] => {
  const id = String(menu?.id || '').trim().toLowerCase()
  const name = String(menu?.name || '').trim().toLowerCase()
  const joined = `${id} ${name}`
  const inferred: MenuServiceMode[] = []

  if (joined.includes('dine') || joined.includes('eat in')) inferred.push('dine_in')
  if (joined.includes('collection') || joined.includes('pickup') || joined.includes('pick up')) {
    inferred.push('collection')
  }
  if (joined.includes('delivery')) inferred.push('delivery')

  return inferred
}

const resolveMenuModes = (menu: Menu): MenuServiceMode[] => {
  const raw = Array.isArray((menu as any)?.service_modes)
    ? (menu as any).service_modes
    : []

  const normalized = raw
    .map((mode: unknown) => normalizeMode(mode))
    .filter(Boolean) as MenuServiceMode[]

  if (normalized.length) return normalized

  const inferred = inferLegacyModes(menu)
  if (inferred.length) return inferred

  return ['dine_in']
}

const isMenuAvailableForMode = (menu: Menu, mode: '' | MenuServiceMode) => {
  if (!mode) return true
  return resolveMenuModes(menu).includes(mode)
}

const isMenuSelectable = (menu: Menu) =>
  Boolean(menu?.active) && isMenuAvailableForMode(menu, requestedMode.value)

const activeMenus = computed(() =>
  sortedMenus.value.filter((menu) => isMenuSelectable(menu))
)

const activeMenu = computed(() => activeMenus.value[0] ?? null)

const selectedMenu = computed(() => {
  const requestedId = routeMenuId.value
  if (requestedId) {
    const requested = activeMenus.value.find(
      (menu) => String(menu?.id || '').trim() === requestedId
    )
    if (requested) return requested
  }

  return activeMenu.value
})

const selectedMenuId = computed(() => String(selectedMenu.value?.id || '').trim())

const noMenuDescription = computed(() => {
  if (requestedModeLabel.value) {
    return `This kitchen has no active menu available for ${requestedModeLabel.value.toLowerCase()} right now.`
  }
  return 'This kitchen has no active menu open for ordering right now.'
})

const resolveMenuTo = (menu: Menu) => {
  const menuId = String(menu?.id || '').trim()
  const key = String(routeId.value || kitchenId.value || '').trim()
  if (!menuId || !key) return undefined

  return {
    path: `/kitchens/${encodeURIComponent(key)}/menu/${encodeURIComponent(menuId)}`,
    query: {
      mode: requestedMode.value || undefined,
      table: requestedTable.value || undefined,
      cover: requestedCover.value || undefined,
      postcode: Array.isArray(route.query.postcode)
        ? String(route.query.postcode[0] ?? '').trim() || undefined
        : String(route.query.postcode ?? '').trim() || undefined,
      slot: Array.isArray(route.query.slot)
        ? String(route.query.slot[0] ?? '').trim() || undefined
        : String(route.query.slot ?? '').trim() || undefined,
    },
  }
}

const isSelectedMenu = (menu: Menu) =>
  String(menu?.id || '').trim() === selectedMenuId.value

type PublicMenuSection = MenuSection & {
  itemGroups: PublicMenuItemGroup[]
}

type PublicMenuItemGroup = {
  key: string
  label: string
  items: ResolvedMenuItemView[]
}

const resolveGroupLabel = (dishId: string, items: ResolvedMenuItemView[]) => {
  const labels = items
    .map((item) => String(item.label || '').trim())
    .filter(Boolean)

  if (!labels.length) return dishId || 'Menu item'

  const prefixParts = labels.map((label) => {
    const [prefix] = label.split('·')
    return String(prefix || '').trim()
  })

  const firstPrefix = String(prefixParts[0] || '').trim()
  const hasCommonPrefix =
    Boolean(firstPrefix) && prefixParts.every((part) => part === firstPrefix)

  if (hasCommonPrefix) return firstPrefix

  return labels[0] || dishId || 'Menu item'
}

const buildItemGroups = (items: ResolvedMenuItemView[]) => {
  const groups: PublicMenuItemGroup[] = []
  const groupsByKey = new Map<string, PublicMenuItemGroup>()

  for (const item of items) {
    const dishId = String(item.dish_id || '').trim()
    const key =
      dishId ||
      `item:${String(item.id || '').trim() || String(item.label || '').trim()}`

    let group = groupsByKey.get(key)

    if (!group) {
      group = {
        key,
        label: '',
        items: [],
      }
      groupsByKey.set(key, group)
      groups.push(group)
    }

    group.items.push(item)
  }

  for (const group of groups) {
    const dishId = String(group.items[0]?.dish_id || '').trim()
    group.label = resolveGroupLabel(dishId, group.items)
  }

  return groups
}

const resolveVariantLabel = (groupLabel: string, itemLabel: string) => {
  const label = String(itemLabel || '').trim()
  const prefix = String(groupLabel || '').trim()
  if (!label) return 'Option'
  if (!prefix) return label

  const normalizedPrefix = `${prefix} · `
  if (label.startsWith(normalizedPrefix)) {
    const variant = String(label.slice(normalizedPrefix.length) || '').trim()
    return variant || label
  }

  return label
}

const sortedSections = computed<PublicMenuSection[]>(() => {
  const menu = selectedMenu.value
  if (!menu) return []

  return [...(menu.sections ?? [])]
    .sort((a, b) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0))
    .map((section) => ({
      ...section,
      itemGroups: buildItemGroups(
        [...(section.items ?? [])]
          .map((item) => resolveMenuItemView(menu, section, item))
          .filter((item) => item.active)
          .sort((a, b) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0))
      ),
    }))
    .filter((section) => section.itemGroups.length > 0)
})

const {
  kitchenId: basketKitchenId,
  items: basketItems,
  addLine,
  itemCount,
  subtotalMinor,
  currencyCode,
  incrementAt,
  decrementAt,
  removeAt,
} = useBasket()

const lineKey = (
  line: {
    dish_id: string
    label: string
    price_minor: number
    currency_code: string
  },
  index: number
) => `${line.dish_id}:${line.label}:${line.price_minor}:${line.currency_code}:${index}`

const basketKitchenMismatch = computed(() => {
  const basketId = String(basketKitchenId.value || '').trim()
  const currentKitchenId = kitchenId.value
  if (!basketId || !currentKitchenId) return false
  return basketId !== currentKitchenId
})

const handleAddToBasket = (
  group: PublicMenuItemGroup,
  item: ResolvedMenuItemView
) => {
  if (!kitchenId.value) return

  const label =
    group.items.length > 1
      ? resolveVariantLabel(group.label, item.label)
      : String(item?.label || '').trim() || 'Menu item'

  try {
    const result = addLine({
      scope_type: 'kitchen',
      scope_id: kitchenId.value,
      kitchen_id: kitchenId.value,
      dish_id: String(item?.dish_id || '').trim(),
      label,
      price_minor: Number(item?.price_minor || 0),
      currency_code: String(item?.currency_code || 'CHF').trim(),
      qty: 1,
    })

    if (result.replacedKitchen) {
      toast.warn('Started a new basket for this kitchen')
    } else {
      toast.success('Added to basket')
    }
  } catch (error: any) {
    toast.error(String(error?.message || 'Failed to add item'))
  }
}

const checkoutRoute = computed(() => ({
  path: '/orders/checkout',
  query: {
    scopeType: 'kitchen',
    scopeId: kitchenId.value || undefined,
    kitchen: kitchenId.value || undefined,
    kitchenName: String(resolvedKitchen.value?.name || '').trim() || undefined,
    mode: requestedMode.value || undefined,
    table: requestedTable.value || undefined,
    cover: requestedCover.value || undefined,
    returnTo: route.fullPath || undefined,
  },
}))

const formatPrice = (priceMinor?: number, currencyCode?: string) => {
  const amount = Number(priceMinor || 0) / 100
  const code = String(currencyCode || 'CHF').trim().toUpperCase() || 'CHF'

  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

const headerTitle = computed(() => selectedMenu.value?.name || 'Menu')
const headerDescription = computed(() => {
  const kitchenName = String(resolvedKitchen.value?.name || '').trim()
  if (kitchenName && kitchenAddress.value) {
    return `${kitchenName} · ${kitchenAddress.value}`
  }
  if (kitchenName) {
    return `${kitchenName} · Public menu`
  }
  return 'Public menu'
})

const backToKitchen = computed(() =>
  kitchenId.value
    ? `/kitchens/${encodeURIComponent(kitchenId.value)}`
    : '/kitchens'
)
</script>
