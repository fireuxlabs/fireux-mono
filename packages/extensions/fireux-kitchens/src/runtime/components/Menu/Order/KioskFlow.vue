<!-- Concurrent edit — 2026-07-19 17:33 CEST — Kiosk pass: keep terminal mode selection outside the fixed order lifecycle. -->
<template>
  <section v-if="!selectedType" data-menu-kiosk-stage="mode">
    <header>
      <p>Kiosk</p>
      <h2>Where will you eat?</h2>
    </header>

    <div>
      <UButton
        v-for="option in options"
        :key="option.type"
        :disabled="option.paused"
        :icon="option.icon"
        size="xl"
        variant="soft"
        @click="selectedType = option.type"
      >
        {{ option.label }}
        <span v-if="option.paused"> · Unavailable</span>
      </UButton>
    </div>

    <UAlert
      v-if="!options.length"
      color="warning"
      icon="i-lucide-triangle-alert"
      title="Kiosk ordering unavailable"
      description="This Menu has no Eat here or Take away configuration."
    />
  </section>

  <template v-else>
    <UButton
      icon="i-lucide-arrow-left-right"
      variant="ghost"
      @click="selectedType = null"
    >
      Change · {{ selectedLabel }}
    </UButton>

    <MenuOrderKioskOrderFlow
      :key="selectedType"
      :config="selectedConfig"
      :currency-code="currencyCode"
      :kitchen-id="kitchenId"
      :kitchen-slug="kitchenSlug"
      :menu-id="menuId"
      :order-type="selectedType"
      :scope-key="`${scopeKey}:${selectedType}`"
      :sections="sections"
      :source-menu-id="sourceMenuId"
    />
  </template>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MenuOrderTypeConfig } from '../../../models/kitchen/menu/menu.model'
import type { MenuManifestSection } from '../../../models/kitchen/menu/menu-detail.model'
import type { MenuKioskOrderType } from '../../../composables/fireux/menu/order/useMenuKioskOrder'

const props = defineProps<{
  configs: MenuOrderTypeConfig[]
  currencyCode: string
  kitchenId: string
  kitchenSlug?: string
  menuId: string
  scopeKey: string
  sections: MenuManifestSection[]
  sourceMenuId: string
}>()

const selectedType = ref<MenuKioskOrderType | null>(null)
const options = computed(() => props.configs.flatMap((config) => {
  if (config.type !== 'eat_in' && config.type !== 'takeaway') return []

  return [{
    type: config.type,
    label: config.type === 'eat_in' ? 'Eat here' : 'Take away',
    icon: config.type === 'eat_in' ? 'i-lucide-utensils' : 'i-lucide-shopping-bag',
    paused: config.availability?.paused === true,
  }]
}))
const selectedConfig = computed(() => props.configs.find(
  config => config.type === selectedType.value
) || null)
const selectedLabel = computed(() =>
  selectedType.value === 'eat_in' ? 'Eat here' : 'Take away'
)
</script>
