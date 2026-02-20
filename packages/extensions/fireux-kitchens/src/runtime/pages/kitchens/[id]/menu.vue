<template>
  <UPage>
    <UPageHeader :title="headerTitle" :description="headerDescription">
      <template #ctas>
        <UButton size="xs" variant="ghost" icon="i-lucide-arrow-left" :to="backToKitchen">
          Back
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="space-y-6">
      <div v-if="loading" class="py-10 text-sm text-dimmed">
        Loading menu...
      </div>

      <UAlert
        v-else-if="!selectedMenu"
        color="neutral"
        variant="soft"
        title="No menu available"
        description="This kitchen has no active menu yet."
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
              v-for="item in section.resolvedItems"
              :key="item.id || item.label"
              class="flex items-start justify-between gap-4 rounded border border-default p-3"
            >
              <div class="min-w-0 space-y-1">
                <div class="font-medium">{{ item.label || 'Menu item' }}</div>
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
                  @click="handleOrder(item)"
                >
                  Order
                </UButton>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useRoute } from '#imports'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import { useKitchenFetch } from '../../../composables/fireux/firestore/kitchen/fetch/useKitchenFetch'
import { useKitchenOrderCreate } from '../../../composables/fireux/firestore/runtime-kitchen/orders/mutations/useKitchenOrderCreate'
import type { Menu, MenuSection } from '../../../models/menu.model'
import {
  resolveMenuItemView,
  type ResolvedMenuItemView,
} from '../../../composables/fireux/firestore/runtime-kitchen/menu/utils/view/resolveMenuItemView'

definePageMeta({
  layout: 'default',
  title: 'Kitchen Menu',
  description: 'Public menu view.',
  head: { title: 'Kitchen Menu' },
  name: 'KitchenPublicMenuPage',
})

const route = useRoute()
const routeId = computed(() => {
  const raw = route.params.id
  return Array.isArray(raw)
    ? String(raw[0] ?? '').trim()
    : String(raw ?? '').trim()
})
const routeMenuId = computed(() => {
  const raw = route.query.menuId
  return Array.isArray(raw)
    ? String(raw[0] ?? '').trim()
    : String(raw ?? '').trim()
})

const { kitchens } = useKitchenFetch()
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
const loading = computed(() => Boolean(routeId.value) && kitchens.value === undefined)

const { firestoreFetchCollection } = useFirestoreRead()
const menusRef = shallowRef(null) as ShallowRef<Ref<Menu[] | undefined> | null>

watch(
  kitchenId,
  (nextKitchenId) => {
    const path = nextKitchenId
      ? `kitchens/${nextKitchenId}/menus`
      : ''
    menusRef.value = path ? firestoreFetchCollection<Menu>(path) : null
  },
  { immediate: true }
)

const menus = computed(() => menusRef.value?.value ?? [])

const sortedMenus = computed(() =>
  [...menus.value]
    .sort((a, b) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0))
)

const activeMenu = computed(() =>
  sortedMenus.value.find((menu) => Boolean(menu?.active)) ?? null
)

const selectedMenu = computed(() => {
  const requestedId = routeMenuId.value
  if (requestedId) {
    const requested = sortedMenus.value.find(
      (menu) => String(menu?.id || '').trim() === requestedId
    )
    if (requested) return requested
  }
  return activeMenu.value
})

type PublicMenuSection = MenuSection & {
  resolvedItems: ResolvedMenuItemView[]
}

const sortedSections = computed<PublicMenuSection[]>(() => {
  const menu = selectedMenu.value
  if (!menu) return []

  return [...(menu.sections ?? [])]
    .sort((a, b) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0))
    .map((section) => ({
      ...section,
      resolvedItems: [...(section.items ?? [])]
        .map((item) => resolveMenuItemView(menu, section, item))
        .filter((item) => item.active)
        .sort((a, b) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0)),
    }))
    .filter((section) => section.resolvedItems.length > 0)
})

const { createOrder } = useKitchenOrderCreate()

const handleOrder = async (item: ResolvedMenuItemView) => {
  if (!kitchenId.value) return

  const orderId = await createOrder({
    kitchenId: kitchenId.value,
    dish_id: String(item?.dish_id || '').trim(),
    label: String(item?.label || '').trim() || 'Menu item',
    channel: 'menu',
  })

  console.info('[kitchen-menu] order-created', {
    kitchenId: kitchenId.value,
    orderId,
    dishId: String(item?.dish_id || '').trim(),
    label: String(item?.label || '').trim() || 'Menu item',
  })
}

const formatPrice = (priceMinor?: number, currencyCode?: string) => {
  const amount = Number(priceMinor || 0) / 100
  const code = String(currencyCode || 'CHF').trim() || 'CHF'
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

const headerTitle = computed(() => selectedMenu.value?.name || 'Menu')
const headerDescription = computed(() =>
  resolvedKitchen.value?.name
    ? `${resolvedKitchen.value.name} · Public menu`
    : 'Public menu'
)
const backToKitchen = computed(() =>
  kitchenId.value
    ? `/kitchens/${encodeURIComponent(kitchenId.value)}`
    : '/kitchens'
)
</script>
