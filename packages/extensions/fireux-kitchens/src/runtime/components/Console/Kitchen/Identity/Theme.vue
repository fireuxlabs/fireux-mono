<template>
  <ClientOnly>
    <div v-if="selectedKitchen" class="space-y-6">
      <UCard variant="subtle">
        <div class="flex items-start gap-3">
          <UIcon name="i-lucide-palette" class="mt-1 size-5 shrink-0 text-muted" />
          <div>
            <h2 class="text-2xl font-semibold text-highlighted">
              Menu Display
            </h2>
            <p class="text-sm text-dimmed">
              Stored menu display values for this kitchen.
            </p>
          </div>
        </div>
      </UCard>

      <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <ConsoleKitchenIdentityThemeEditor
          :style="draftPageStyle"
          :can-write="canWrite"
          :saving="saving"
          :has-changes="hasChanges"
          @update:style="setDraftPageStyle"
          @save="saveTheme"
          @reset="resetDraftPageStyle"
        />

        <ConsoleKitchenIdentityMenuPreview
          :kitchen-name="kitchenName"
          :page-style="draftPageStyle"
          :place-currency-code="placeCurrencyCode"
          :menu-currency-format="menuCurrencyFormat"
          :menu-show-currency="menuShowCurrency"
        />
      </div>
    </div>

    <MoleculesStateCard v-else entity="kitchen theme" kind="document" loading />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { CurrencyDisplayFormat } from 'fireux-core/runtime/models/core/money.model'
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useKitchenUpdate } from '../../../../composables/fireux/firestore/kitchen/mutations/useKitchenUpdate'
import { useKitchenConsoleIdentity } from '../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleIdentity'

const {
  selectedKitchen,
  kitchenId,
  canWrite,
} = useKitchenConsoleIdentity()
const { updateKitchen } = useKitchenUpdate()
const toast = useToastify()

const kitchen = computed(() => selectedKitchen.value as Record<string, unknown> | null)
const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizePageStyle = (style?: Partial<PageStyle> | null): PageStyle => ({
  background_color_light: normalizeString(style?.background_color_light),
  background_color_dark: normalizeString(style?.background_color_dark),
  font_color_light: normalizeString(style?.font_color_light),
  font_color_dark: normalizeString(style?.font_color_dark),
  primary_color: normalizeString(style?.primary_color),
  secondary_color: normalizeString(style?.secondary_color),
})
const pageStyleEquals = (a: PageStyle, b: PageStyle) =>
  JSON.stringify(normalizePageStyle(a)) === JSON.stringify(normalizePageStyle(b))
const kitchenName = computed(() =>
  normalizeString(kitchen.value?.display_name || kitchen.value?.name) || 'Kitchen'
)
const pageStyle = computed(() => (kitchen.value?.menu_style ?? {}) as Partial<PageStyle>)
const storedPageStyle = computed(() => normalizePageStyle(pageStyle.value))
const draftPageStyle = ref<PageStyle>(normalizePageStyle())
const saving = ref(false)
const placeCurrencyCode = computed(() =>
  normalizeString(kitchen.value?.default_currency_code) || 'CHF'
)
const menuCurrencyFormat = computed(
  () =>
    (normalizeString(kitchen.value?.menu_currency_format) || 'dash') as CurrencyDisplayFormat
)
const menuShowCurrency = computed(() => kitchen.value?.menu_show_currency !== false)
const hasChanges = computed(() =>
  !pageStyleEquals(draftPageStyle.value, storedPageStyle.value)
)

watch(
  storedPageStyle,
  (style) => {
    draftPageStyle.value = normalizePageStyle(style)
  },
  {
    immediate: true,
  }
)

function setDraftPageStyle(style: PageStyle) {
  draftPageStyle.value = normalizePageStyle(style)
}

function resetDraftPageStyle() {
  draftPageStyle.value = normalizePageStyle(storedPageStyle.value)
}

async function saveTheme() {
  const id = normalizeString(kitchenId.value)
  if (!canWrite.value || saving.value) return

  if (!id) {
    toast.error('Select a kitchen before saving a theme.')
    return
  }

  saving.value = true

  try {
    await updateKitchen(id, {
      menu_style: normalizePageStyle(draftPageStyle.value),
    })
    toast.success('Menu theme saved')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to save menu theme: ${message}`)
  } finally {
    saving.value = false
  }
}
</script>
