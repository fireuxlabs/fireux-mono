<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div>
        <p class="text-sm font-medium text-highlighted">
          Real menu sample
        </p>
        <p class="text-xs text-dimmed">
          Uses the first section from the selected kitchen's published menu.
        </p>
      </div>

      <UButton
        v-if="menu && slug"
        size="xs"
        variant="soft"
        color="neutral"
        icon="i-lucide-external-link"
        :to="`/kitchens/${encodeURIComponent(slug)}/menus/${encodeURIComponent(menu.id)}`"
      >
        Open public menu
      </UButton>
    </div>

    <UAlert
      v-if="pending"
      color="neutral"
      variant="soft"
      title="Loading menu preview"
      description="Reading the published menu for this kitchen."
    />

    <UAlert
      v-else-if="!menu"
      color="neutral"
      variant="soft"
      title="No published menu"
      description="Publish a menu to see the public preview here."
    />

    <MenuPublic
      v-else
      variant="preview"
      :kitchen-name="kitchenName"
      :menu="menu"
      :sections="previewSectionRows"
      :page-style="pageStyle"
      :public-menu-polish="publicMenuPolish"
      :currency-code="currencyCode"
      :currency-format="currencyFormat"
      :show-currency="showCurrency"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CurrencyDisplayFormat } from 'fireux-core/runtime/models/core/money.model'
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'
import { useKitchenConsoleIdentity } from '../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleIdentity'
import { useDishCollection } from '../../../../composables/fireux/firestore/dish/fetch/useDishCollection'
import { useMenuCollection } from '../../../../composables/fireux/firestore/menu/fetch/useMenuCollection'
import { useMenuItemCollection } from '../../../../composables/fireux/firestore/menu/fetch/useMenuItemCollection'
import { useMenuSectionCollection } from '../../../../composables/fireux/firestore/menu/fetch/useMenuSectionCollection'
import type {
  KitchenPublicMenuSectionRow,
} from '../../../../composables/fireux/public/kitchen/menu/useKitchenPublicMenu'
import type { Dish } from '../../../../models/dish.model'
import type { KitchenPublicMenuPolish } from '../../../../models/kitchen.model'
import type { MenuItem } from '../../../../models/menu.model'

const text = (value: unknown) => String(value ?? '').trim()

const { selectedKitchen, kitchenId } = useKitchenConsoleIdentity()
const menuRead = useMenuCollection(kitchenId)
const menu = computed(() => menuRead.publishedMenus.value[0] ?? null)
const menuId = computed(() => text(menu.value?.id))
const sectionState = useMenuSectionCollection(kitchenId, menuId)
const previewSection = computed(() => sectionState.sections.value[0] ?? null)
const previewSectionId = computed(() => text(previewSection.value?.id))
const itemState = useMenuItemCollection(kitchenId, menuId, previewSectionId)
const dishState = useDishCollection(kitchenId)

const dishesById = computed(() => {
  const map = new Map<string, Dish>()
  for (const dish of dishState.dishes.value) {
    const id = text(dish.id)
    if (id) map.set(id, dish)
  }
  return map
})
const itemsBySectionId = computed(() => {
  const map = new Map<string, MenuItem[]>()
  for (const item of itemState.items.value) {
    const sectionId = text(item.section_id)
    if (!sectionId) continue
    map.set(sectionId, [...(map.get(sectionId) ?? []), item])
  }
  return map
})
const sectionRows = computed<KitchenPublicMenuSectionRow[]>(() =>
  sectionState.sections.value.map((section) => {
    const sectionId = text(section.id)
    const sectionItems = itemsBySectionId.value.get(sectionId) ?? []

    return {
      id: sectionId,
      section,
      label: text(section.label),
      description: text(section.description),
      items: sectionItems.map((item) => {
        const dish = dishesById.value.get(text(item.dish_id)) ?? null
        return {
          id: text(item.id),
          item,
          dish,
          name: text(dish?.name) || text(item.dish_id),
          description: text(dish?.description),
          price: Number(item.price || 0),
        }
      }),
    }
  })
)
const previewSectionRows = computed<KitchenPublicMenuSectionRow[]>(() =>
  sectionRows.value.slice(0, 1).map((section) => ({
    ...section,
    items: section.items.slice(0, 2),
  }))
)
const pending = computed(
  () =>
    menuRead.pending.value ||
    sectionState.pending.value ||
    dishState.pending.value ||
    itemState.pending.value
)
const kitchenName = computed(() =>
  text(selectedKitchen.value?.display_name || selectedKitchen.value?.name) || 'Kitchen'
)
const slug = computed(() => text(selectedKitchen.value?.slug))
const pageStyle = computed(
  () => (selectedKitchen.value?.menu_style ?? null) as Partial<PageStyle> | null
)
const publicMenuPolish = computed(
  () =>
    (selectedKitchen.value?.public_menu_polish ?? null) as Partial<KitchenPublicMenuPolish> | null
)
const currencyCode = computed(() => text(selectedKitchen.value?.default_currency_code) || 'CHF')
const currencyFormat = computed(
  () => (text(selectedKitchen.value?.menu_currency_format) || 'dash') as CurrencyDisplayFormat
)
const showCurrency = computed(() => selectedKitchen.value?.menu_show_currency !== false)
</script>
