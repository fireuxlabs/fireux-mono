<template>
  <UDashboardPanel id="console-kitchen-menu">
    <template #header>
      <LayoutsConsoleNavbar title="Menu" />
    </template>

    <template #body>
      <section class="space-y-8">
        <MenuCollectionManager
          :collection="menus"
          :selected-id="selectedMenuId"
          title="Menus"
          description="Service menus built from kitchen dishes."
          :link="false"
          @select="onSelectMenu"
        />

        <QRManager :size="72" />

        <UCard v-if="selectedMenu">
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1">
              <div class="font-medium">
                Selected Menu · {{ selectedMenu.name || selectedMenu.id || 'Untitled menu' }}
              </div>
              <div class="text-xs text-dimmed">
                {{ selectedMenu.description || 'No description' }}
              </div>
            </div>

            <UButton
              size="xs"
              variant="soft"
              icon="i-lucide-eye"
              :to="selectedMenuViewTo || undefined"
              :disabled="!selectedMenuViewTo"
            >
              View
            </UButton>
          </div>

          <div class="mt-4 space-y-3">
            <div
              v-for="(section, sectionIndex) in selectedSectionsResolved"
              :key="section.id || section.label || sectionIndex"
              class="rounded border border-default p-3"
            >
              <div class="text-sm font-semibold">
                {{ section.label || section.id || 'Untitled section' }}
              </div>

              <div v-if="section.description" class="text-xs text-dimmed">
                {{ section.description }}
              </div>

              <div class="mt-2 space-y-1">
                <div
                  v-for="item in section.resolvedItems"
                  :key="item.id || item.dish_id"
                  class="rounded border border-default px-2 py-1.5"
                >
                  <div class="flex items-center justify-between gap-2 text-sm">
                    <span class="truncate">
                      {{ item.label || dishNameById.get(item.dish_id) || item.dish_id || item.id }}
                    </span>
                    <span class="shrink-0 text-xs text-dimmed">
                      {{ formatMinor(item.price_minor, item.currency_code) }}
                    </span>
                  </div>
                </div>

                <div v-if="!section.resolvedItems.length" class="text-xs italic text-dimmed">
                  No items in this section.
                </div>
              </div>
            </div>

            <UAlert
              v-if="!selectedSectionsResolved.length"
              color="neutral"
              variant="soft"
              title="No sections in selected menu"
              description="Add sections and items to structure this menu."
            />
          </div>
        </UCard>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import MenuCollectionManager from '../../../components/organisms/Menu/Collection/Manager.vue'
import QRManager from '../../../components/runtimeKitchen/QRManager.vue'
import { useRuntimeKitchen } from '../../../composables/fireux/app/kitchen-runtime/useRuntimeKitchen'
import {
  resolveMenuItemView,
  type ResolvedMenuItemView,
} from '../../../composables/fireux/firestore/runtime-kitchen/menu/utils/view/resolveMenuItemView'
import type { MenuSection } from '../../../models/menu.model'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-menu',
    label: 'Menus',
    icon: 'i-lucide-book-open-check',
    order: 5,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const runtime = useRuntimeKitchen()
const menus = computed(() => runtime.data.value.menus ?? [])
const dishes = computed(() => runtime.data.value.dishes ?? [])

const selectedMenuId = ref('')

watch(
  menus,
  (nextMenus) => {
    const current = String(selectedMenuId.value || '').trim()
    if (!current) return
    if (nextMenus.some((menu) => String(menu.id || '').trim() === current)) return
    selectedMenuId.value = ''
  },
  { immediate: true }
)

const selectedMenu = computed(() => {
  const selected = String(selectedMenuId.value || '').trim()
  if (!selected) return null
  return menus.value.find((menu) => String(menu.id || '').trim() === selected) || null
})

const selectedMenuViewTo = computed(() => {
  const kitchenId = String(selectedMenu.value?.kitchen_id || runtime.id.value || '').trim()
  const menuId = String(selectedMenu.value?.id || '').trim()
  if (!kitchenId || !menuId) return ''
  return `/kitchens/${encodeURIComponent(kitchenId)}/menu/${encodeURIComponent(menuId)}`
})

const onSelectMenu = (menuId: string) => {
  selectedMenuId.value = String(menuId || '').trim()
}

const selectedSections = computed<MenuSection[]>(() =>
  [...(selectedMenu.value?.sections ?? [])].sort(
    (a, b) =>
      Number(a.sort_order || 0) - Number(b.sort_order || 0) ||
      String(a.label || '').localeCompare(String(b.label || ''))
  )
)

type ResolvedMenuSection = MenuSection & {
  resolvedItems: ResolvedMenuItemView[]
}

const selectedSectionsResolved = computed<ResolvedMenuSection[]>(() => {
  const menu = selectedMenu.value
  if (!menu) return []

  return selectedSections.value.map((section) => ({
    ...section,
    resolvedItems: [...(section.items ?? [])]
      .map((item) => resolveMenuItemView(menu, section, item))
      .sort(
        (a, b) =>
          Number(a.sort_order || 0) - Number(b.sort_order || 0) ||
          String(a.label || '').localeCompare(String(b.label || ''))
      ),
  }))
})

const dishNameById = computed(() => {
  const map = new Map<string, string>()
  for (const dish of dishes.value) {
    const id = String(dish.id || '').trim()
    if (!id) continue
    const shortName = String((dish as any).short_name || '').trim()
    const fullName = String(dish.name || '').trim()
    map.set(id, shortName || fullName || id)
  }
  return map
})

const formatMinor = (value: unknown, currencyCode: unknown) => {
  const minor = Number(value || 0)
  const code = String(currencyCode || 'CHF').trim() || 'CHF'
  if (!Number.isFinite(minor) || minor <= 0) return ''
  return `${code} ${(minor / 100).toFixed(2)}`
}
</script>
