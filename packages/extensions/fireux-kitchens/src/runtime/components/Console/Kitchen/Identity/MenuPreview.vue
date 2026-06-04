<template>
  <div class="space-y-3">
    <div class="flex items-start gap-3">
      <UIcon name="i-lucide-braces" class="mt-1 size-5 shrink-0 text-muted" />
      <div>
        <p class="text-sm font-medium text-highlighted">
          Theme snapshot
        </p>
        <p class="text-xs text-dimmed">
          Stored menu display values for this kitchen.
        </p>
      </div>
    </div>

    <pre class="overflow-auto rounded-lg border border-default bg-muted p-3 text-xs text-highlighted">{{ snapshotJson }}</pre>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CurrencyDisplayFormat } from 'fireux-core/runtime/models/core/money.model'
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'

const props = defineProps<{
  kitchenName: string
  pageStyle: Partial<PageStyle>
  placeCurrencyCode: string
  menuCurrencyFormat: CurrencyDisplayFormat
  menuShowCurrency: boolean
}>()

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
