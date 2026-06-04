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

      <UCard>
        <ConsoleKitchenIdentityMenuPreview
          :kitchen-name="kitchenName"
          :page-style="pageStyle"
          :place-currency-code="placeCurrencyCode"
          :menu-currency-format="menuCurrencyFormat"
          :menu-show-currency="menuShowCurrency"
        />
      </UCard>
    </div>

    <MoleculesStateCard v-else entity="kitchen theme" kind="document" loading />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CurrencyDisplayFormat } from 'fireux-core/runtime/models/core/money.model'
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'
import { useKitchenConsoleIdentity } from '../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleIdentity'

const { selectedKitchen } = useKitchenConsoleIdentity()

const kitchen = computed(() => selectedKitchen.value as Record<string, unknown> | null)
const normalizeString = (value: unknown) => String(value ?? '').trim()
const kitchenName = computed(() =>
  normalizeString(kitchen.value?.display_name || kitchen.value?.name) || 'Kitchen'
)
const pageStyle = computed(() => (kitchen.value?.menu_style ?? {}) as Partial<PageStyle>)
const placeCurrencyCode = computed(() =>
  normalizeString(kitchen.value?.default_currency_code) || 'CHF'
)
const menuCurrencyFormat = computed(
  () =>
    (normalizeString(kitchen.value?.menu_currency_format) || 'dash') as CurrencyDisplayFormat
)
const menuShowCurrency = computed(() => kitchen.value?.menu_show_currency !== false)
</script>
