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
        v-else-if="!activeMenu"
        color="neutral"
        variant="soft"
        title="No active menu"
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
              v-for="item in sortedItems(section.items)"
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
                  {{ formatPrice(item.price_minor) }}
                </div>
                <UButton size="xs" variant="soft" color="neutral">
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
import type { Menu, MenuSection, MenuSectionItem } from '../../../models/menu.model'

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
    .filter((menu) => Boolean(menu?.active))
    .sort((a, b) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0))
)

const activeMenu = computed(() => sortedMenus.value[0] ?? null)

const sortedSections = computed<MenuSection[]>(() =>
  [...(activeMenu.value?.sections ?? [])].sort(
    (a, b) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0)
  )
)

const sortedItems = (items?: MenuSectionItem[]) =>
  [...(items ?? [])].sort(
    (a, b) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0)
  )

const formatPrice = (priceMinor?: number) => {
  const amount = Number(priceMinor || 0) / 100
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

const headerTitle = computed(() => activeMenu.value?.name || 'Menu')
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
