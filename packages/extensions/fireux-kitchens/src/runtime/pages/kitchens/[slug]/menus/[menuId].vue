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

    <DevJson
      v-if="isDev"
      class="mx-auto my-8 max-w-3xl"
      title="Kitchen public menu detail debug"
      context="Kitchen menu detail · /kitchens/[slug]/menus/[menuId]"
      :data="pageDebug"
      :default-open="false"
    />
  </div>
</template>

<script setup lang="ts">
import type { CurrencyDisplayFormat } from 'fireux-core/runtime/models/core/money.model'
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'
import { computed } from 'vue'
import { useKitchenPublicMenuDetail } from '../../../../composables/fireux/public/kitchen/menu/useKitchenPublicMenu'
import type { Menu } from '../../../../models/menu.model'

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
  debug,
} = useKitchenPublicMenuDetail()
const isDev = import.meta.dev

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

const pageDebug = computed(() => ({
  ...debug.value,
  style: {
    note: 'Parent-app kitchens may use kitchen.menu_style. Dedicated tenant apps use their app/runtime styling.',
    source: storedKitchenMenuStyleEnabled.value ? 'kitchen.menu_style' : 'tenant-app',
    storedKitchenMenuStyleEnabled: storedKitchenMenuStyleEnabled.value,
    kitchenStyle: {
      backgroundColorLight: text(kitchenStyle.value.background_color_light),
      backgroundColorDark: text(kitchenStyle.value.background_color_dark),
      fontColorLight: text(kitchenStyle.value.font_color_light),
      fontColorDark: text(kitchenStyle.value.font_color_dark),
      titleColorLight: text(kitchenStyle.value.title_color_light),
      titleColorDark: text(kitchenStyle.value.title_color_dark),
      titleFontSource: text(kitchenStyle.value.title_font_source),
      titleFontFamily: text(kitchenStyle.value.title_font_family),
      fontSource: text(kitchenStyle.value.font_source),
      fontFamily: text(kitchenStyle.value.font_family),
    },
    currency: {
      code: text(kitchen.value?.default_currency_code) || 'CHF',
      format: currencyFormat.value,
      show: showCurrency.value,
    },
    maturity: {
      hasSource: hasSource.value,
      hasStructuredItems: hasStructuredItems.value,
      isOrderable: isOrderable.value,
      maturity: maturity.value,
    },
  },
}))
</script>
