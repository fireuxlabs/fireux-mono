<template>
  <div class="contents">
    <UPageCard v-if="detailPending" class="mx-auto mt-8 max-w-3xl" variant="subtle">
      <p class="text-sm text-dimmed">Loading menu...</p>
    </UPageCard>

    <p
      v-else-if="!kitchen || !menu || (!hasSource && !hasStructuredItems)"
      class="mx-auto mt-8 max-w-3xl text-sm text-dimmed"
    >
      Menu unavailable.
    </p>

    <MenuSource
      v-else-if="maturity === 'source'"
      :kitchen-name="kitchenName"
      :menu="displayMenu"
      :source-url="sourceUrl"
    >
      <template #breadcrumbs>
        <KitchenPublicBreadcrumbs
          class="menu-breadcrumbs"
          :kitchen-name="kitchenName"
          :kitchen-slug="kitchenSlug"
          :menu-name="displayMenu.name"
          current="menu"
        />
      </template>
    </MenuSource>

    <MenuPublic
      v-else
      :kitchen-name="kitchenName"
      :menu="displayMenu"
      :sections="sectionRows"
      :page-style="publicMenuPageStyle"
      :currency-code="kitchen.default_currency_code"
      :currency-format="currencyFormat"
      :show-currency="showCurrency"
      :orderable="isOrderable"
    >
      <template #breadcrumbs>
        <KitchenPublicBreadcrumbs
          class="menu-breadcrumbs"
          :kitchen-name="kitchenName"
          :kitchen-slug="kitchenSlug"
          :menu-name="displayMenu.name"
          current="menu"
        />
      </template>
    </MenuPublic>
  </div>
</template>

<script setup lang="ts">
import type { CurrencyDisplayFormat } from 'fireux-core/runtime/models/core/money.model'
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'
import { computed } from 'vue'
import { useKitchenPublicMenuDetail } from '../../../../composables/fireux/public/kitchen/menu/useKitchenPublicMenu'
import type { Menu } from '../../../../models/menu/menu.model'

definePageMeta({
  layout: 'public-menu',
  name: 'KitchenPublicMenusDetailPage',
})

const {
  detailPending,
  kitchenSlug,
  kitchen,
  menu,
  sectionRows,
  hasSource,
  hasStructuredItems,
  isOrderable,
  maturity,
} = useKitchenPublicMenuDetail()

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
const storedKitchenMenuStyleEnabled = computed(
  () => text((kitchen.value as any)?.app_scope_state) !== 'dedicated_app'
)
const kitchenStyle = computed<Partial<PageStyle>>(() => {
  if (!storedKitchenMenuStyleEnabled.value) return {}

  const style = kitchen.value?.menu_style
  return style && typeof style === 'object' ? style : {}
})
const publicMenuPageStyle = computed(() => kitchenStyle.value)
</script>
