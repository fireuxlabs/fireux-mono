<template>
  <MenuPublicShell
    :page-style="pageStyle"
    :variant="variant"
    :color-mode="colorMode"
  >
    <slot name="breadcrumbs" />

    <MenuPublicHeader
      :kitchen-name="kitchenName"
      :name="menu.name"
      :description="menu.description"
    >
      <template
        v-if="$slots.language"
        #language
      >
        <slot name="language" />
      </template>
    </MenuPublicHeader>

    <MenuAllergenNotice class="menu-allergen-notice" />

    <slot
      v-if="orderable"
      name="ordering"
    />

    <UAlert
      v-if="!sections.length"
      color="neutral"
      variant="soft"
      title="Menu unavailable"
      description="This menu has no public sections yet."
    />

    <MenuPublicSections
      v-else
      :sections="sections"
      :currency-code="currencyCode"
      :currency-format="currencyFormat"
      :show-currency="showCurrency"
    />
  </MenuPublicShell>
</template>

<script setup lang="ts">
import type { CurrencyDisplayFormat } from 'fireux-core/runtime/models/core/money.model'
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'
import type { KitchenPublicMenuSectionRow } from '../../composables/fireux/public/kitchen/menu/useKitchenPublicMenu'
import type { Menu } from '../../models/menu.model'

defineProps<{
  kitchenName: string
  menu: Menu
  sections: KitchenPublicMenuSectionRow[]
  pageStyle?: Partial<PageStyle> | null
  currencyCode?: string
  currencyFormat?: CurrencyDisplayFormat
  showCurrency?: boolean
  orderable?: boolean
  variant?: 'page' | 'preview'
  colorMode?: 'system' | 'light' | 'dark'
}>()
</script>

<style scoped>
.menu-allergen-notice {
  margin-bottom: 2.5rem;
}
</style>
º