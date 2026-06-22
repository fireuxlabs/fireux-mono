<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="flex items-start gap-3">
          <UIcon name="i-lucide-eye" class="mt-1 size-5 shrink-0 text-muted" />
          <div>
            <p class="text-sm font-medium text-highlighted">
              Menu Preview
            </p>
            <p class="text-xs text-dimmed">
              Uses the current menu preview surface.
            </p>
            <p v-if="previewMenuLabel" class="text-xs text-dimmed">
              Previewing {{ previewMenuLabel }}
            </p>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <div class="flex rounded-md border border-default p-0.5">
            <UButton
              v-for="mode in previewModes"
              :key="mode.value"
              color="neutral"
              :variant="previewMode === mode.value ? 'solid' : 'ghost'"
              size="sm"
              :icon="mode.icon"
              @click="previewMode = mode.value"
            >
              {{ mode.label }}
            </UButton>
          </div>

          <UButton
            v-if="publicMenuUrl"
            :to="publicMenuUrl"
            target="_blank"
            color="neutral"
            variant="soft"
            size="sm"
            icon="i-lucide-external-link"
          >
            Go to menu
          </UButton>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <MenuThemeSurface
        :page-style="pageStyle"
        variant="preview"
        :color-mode="previewMode"
      >
        <MenuPublicHeader
          :kitchen-name="kitchenName"
          :name="previewMenu.name"
          :description="previewMenu.description"
        />

        <MenuAllergenNotice class="menu-allergen-notice" />

        <UAlert
          v-if="!previewSections.length"
          color="neutral"
          variant="soft"
          title="Menu unavailable"
          description="This menu has no public sections yet."
        />

        <MenuPublicSections
          v-else
          :sections="previewSections"
          :currency-code="placeCurrencyCode"
          :currency-format="menuCurrencyFormat"
          :show-currency="menuShowCurrency"
        />
      </MenuThemeSurface>

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
import { computed, ref } from 'vue'
import type { CurrencyDisplayFormat } from 'fireux-core/runtime/models/core/money.model'
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'
import type { KitchenPublicMenuSectionRow } from '../../../../composables/fireux/public/kitchen/menu/useKitchenPublicMenu'
import type { Menu } from '../../../../models/menu/menu.model'

const props = defineProps<{
  kitchenName: string
  menu?: Menu | null
  sections?: KitchenPublicMenuSectionRow[]
  pageStyle: Partial<PageStyle>
  placeCurrencyCode: string
  menuCurrencyFormat: CurrencyDisplayFormat
  menuShowCurrency: boolean
  publicMenuUrl?: string
}>()

const previewMode = ref<'system' | 'light' | 'dark'>('system')
const previewModes = [
  {
    label: 'System',
    value: 'system' as const,
    icon: 'i-lucide-monitor',
  },
  {
    label: 'Light',
    value: 'light' as const,
    icon: 'i-lucide-sun',
  },
  {
    label: 'Dark',
    value: 'dark' as const,
    icon: 'i-lucide-moon',
  },
]

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
const previewMenu = computed(() => props.menu ?? sampleMenu.value)
const previewMenuLabel = computed(() => previewMenu.value.name || previewMenu.value.id)
const previewSections = computed(() =>
  props.sections?.length ? props.sections : sampleSections.value
)

const snapshot = computed(() => ({
  kitchenName: props.kitchenName,
  menuId: previewMenu.value.id,
  previewMode: previewMode.value,
  menuStyle: {
    backgroundColorLight: props.pageStyle.background_color_light ?? '',
    backgroundColorDark: props.pageStyle.background_color_dark ?? '',
    fontColorLight: props.pageStyle.font_color_light ?? '',
    fontColorDark: props.pageStyle.font_color_dark ?? '',
    titleColorLight: props.pageStyle.title_color_light ?? '',
    titleColorDark: props.pageStyle.title_color_dark ?? '',
    titleFontSource: props.pageStyle.title_font_source ?? '',
    titleFontFamily: props.pageStyle.title_font_family ?? '',
    fontSource: props.pageStyle.font_source ?? '',
    fontFamily: props.pageStyle.font_family ?? '',
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

<style scoped>
.menu-allergen-notice {
  margin-bottom: 2.5rem;
}
</style>
