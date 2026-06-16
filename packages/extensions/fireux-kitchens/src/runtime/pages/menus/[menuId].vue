<template>
  <div class="contents">
    <UPageCard v-if="detailPending" class="mx-auto mt-8 max-w-3xl" variant="subtle">
      <p class="text-sm text-dimmed">Loading menu...</p>
    </UPageCard>

    <UAlert
      v-else-if="!kitchen || !menu"
      class="mx-auto mt-8 max-w-3xl"
      color="neutral"
      variant="soft"
      title="Menu unavailable"
      description="This menu is missing, unpublished, or no longer available."
    />

    <UAlert
      v-else-if="!hasSource && !hasStructuredItems"
      class="mx-auto mt-8 max-w-3xl"
      color="neutral"
      variant="soft"
      title="Menu unavailable"
      description="This menu has no public source or structured items yet."
    />

    <MenuSource
      v-else-if="maturity === 'source'"
      :kitchen-name="kitchenName"
      :menu="displayMenu"
      :source-url="sourceUrl"
    />

    <MenuPublic
      v-else
      :kitchen-name="kitchenName"
      :menu="displayMenu"
      :sections="sectionRows"
      :page-style="{}"
      :currency-code="kitchen.default_currency_code"
      :currency-format="currencyFormat"
      :show-currency="showCurrency"
      :orderable="isOrderable"
    />

    <DevJson
      class="mx-auto my-8 max-w-3xl"
      title="Kitchen public single menu debug"
      context="Kitchen menu detail · /menus/[menuId]"
      :data="debug"
      :default-open="false"
    />
  </div>
</template>

<script setup lang="ts">
import type { CurrencyDisplayFormat } from 'fireux-core/runtime/models/core/money.model'
import { computed } from 'vue'
import { useKitchenPublicSingleMenuDetail } from '../../composables/fireux/public/kitchen/menu/useKitchenPublicMenu'
import type { Menu } from '../../models/menu/menu.model'

definePageMeta({
  layout: 'public-menu',
  name: 'KitchenPublicSingleMenuDetailPage',
})

const {
  kitchen,
  menu,
  sectionRows,
  hasSource,
  hasStructuredItems,
  isOrderable,
  maturity,
  detailPending,
  debug,
} = useKitchenPublicSingleMenuDetail()

const text = (value: unknown) => String(value ?? '').trim()
const kitchenName = computed(() =>
  text(kitchen.value?.display_name || kitchen.value?.name) || 'Kitchen'
)
const displayMenu = computed<Menu>(() => {
  const current = menu.value as Menu | null
  return current ?? {} as Menu
})
const sourceUrl = computed(() => text(displayMenu.value.doc_url))
const currencyFormat = computed(
  () => (text(kitchen.value?.menu_currency_format) || 'dash') as CurrencyDisplayFormat
)
const showCurrency = computed(() => kitchen.value?.menu_show_currency !== false)
</script>
