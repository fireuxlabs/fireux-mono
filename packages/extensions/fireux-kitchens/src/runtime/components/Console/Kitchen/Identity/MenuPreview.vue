<template>
  <UCard>
    <template #header>
      <div class="flex items-start gap-3">
        <UIcon name="i-lucide-eye" class="mt-1 size-5 shrink-0 text-muted" />
        <div>
          <p class="text-sm font-medium text-highlighted">
            Menu Preview
          </p>
          <p class="text-xs text-dimmed">
            A small sample using the public menu component.
          </p>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <MenuPublic
        kitchen-name="Preview Kitchen"
        :menu="sampleMenu"
        :sections="sampleSections"
        :page-style="pageStyle"
        :currency-code="placeCurrencyCode"
        :currency-format="menuCurrencyFormat"
        :show-currency="menuShowCurrency"
        variant="preview"
      />

      <UCollapsible>
        <UButton
          color="neutral"
          variant="soft"
          size="sm"
          trailing-icon="i-lucide-chevron-down"
        >
          Theme snapshot
        </UButton>

        <template #content>
          <pre class="mt-3 overflow-auto rounded-lg border border-default bg-muted p-3 text-xs text-highlighted">{{ snapshotJson }}</pre>
        </template>
      </UCollapsible>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CurrencyDisplayFormat } from 'fireux-core/runtime/models/core/money.model'
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'
import type { KitchenPublicMenuSectionRow } from '../../../../composables/fireux/public/kitchen/menu/useKitchenPublicMenu'
import type { Menu } from '../../../../models/menu.model'

const props = defineProps<{
  kitchenName: string
  pageStyle: Partial<PageStyle>
  placeCurrencyCode: string
  menuCurrencyFormat: CurrencyDisplayFormat
  menuShowCurrency: boolean
}>()

const sampleMenu = computed(() => ({
  id: 'theme-preview',
  kitchen_id: '',
  name: `${props.kitchenName || 'Kitchen'} Menu`,
  description: 'A short menu preview for color and contrast.',
  status: 'published',
} as Menu))
const sampleSections = computed<KitchenPublicMenuSectionRow[]>(() => [
  {
    id: 'small-plates',
    section: {} as KitchenPublicMenuSectionRow['section'],
    label: 'Small Plates',
    description: '',
    items: [
      {
        id: 'tomato-bruschetta',
        item: {} as KitchenPublicMenuSectionRow['items'][number]['item'],
        dish: null,
        name: 'Tomato Bruschetta',
        description: 'Toasted bread, tomato, basil, and olive oil.',
        price: 12,
      },
      {
        id: 'house-pasta',
        item: {} as KitchenPublicMenuSectionRow['items'][number]['item'],
        dish: null,
        name: 'House Pasta',
        description: 'Fresh pasta with a slow tomato sauce.',
        price: 24,
      },
    ],
  },
])

const snapshot = computed(() => ({
  kitchenName: props.kitchenName,
  menuStyle: {
    backgroundColorLight: props.pageStyle.background_color_light ?? '',
    backgroundColorDark: props.pageStyle.background_color_dark ?? '',
    fontColorLight: props.pageStyle.font_color_light ?? '',
    fontColorDark: props.pageStyle.font_color_dark ?? '',
    primaryColor: props.pageStyle.primary_color ?? '',
    secondaryColor: props.pageStyle.secondary_color ?? '',
  },
  place: {
    defaultCurrencyCode: props.placeCurrencyCode,
  },
  menuCurrency: {
    format: props.menuCurrencyFormat,
    show: props.menuShowCurrency,
  },
}))

const snapshotJson = computed(() => JSON.stringify(snapshot.value, null, 2))
</script>
