<template>
  <div class="space-y-6 pb-24">
    <KitchenDetailOfferingTimes
      :offerings="offerings"
      compact
      :show-names="false"
    />
    <nav class="flex flex-wrap gap-2" aria-label="Collection sections">
      <UButton
        v-for="(section, index) in sections"
        :key="section.key"
        :to="`#service-section-${index}`"
        :label="section.label"
        color="neutral"
        variant="soft"
        size="sm"
      />
    </nav>
    <MenuSelectionCatalogue
      :sections="sections"
      :money="money"
      @select="select"
    />
    <div v-if="basket.count.value" class="collection-basket-bar">
      <UButton
        :label="`View basket · ${basket.count.value} · ${money(basket.totalMinor.value / 100)}`"
        icon="i-lucide-shopping-bag"
        size="lg"
        block
        @click="basketOpen = true"
      />
    </div>
    <UModal
      v-model:open="itemOpen"
      :title="selected?.item.name || 'Choose an item'"
      description="Choose your options and extras."
    >
      <template #body>
        <MenuSelectionItem
          v-if="selected"
          :key="serviceItemSignature(selected)"
          :offer="selected"
          :money="money"
          :error="error"
          @add="add"
        />
      </template>
    </UModal>
    <UModal
      v-model:open="basketOpen"
      title="Your Collection basket"
      description="Review your food and drinks."
    >
      <template #body>
        <MenuSelectionBasket
          :lines="basket.lines.value"
          :stale-keys="basket.staleKeys.value"
          :total-minor="basket.totalMinor.value"
          :money="money"
          @adjust="basket.adjust"
          @remove="basket.remove"
          @close="basketOpen = false"
        />
      </template>
    </UModal>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import type {
  MenuServiceOffer,
  MenuServiceSection,
} from '../../utils/service-sections'
import {
  serviceItemSignature,
  type ServiceItemChoices,
} from '../../utils/service-basket'
import { useServiceBasket } from '../../composables/useServiceBasket'
import { formatCurrencyAmount } from '../../../utils/currency-display'
const props = defineProps<{
  sections: MenuServiceSection[]
  currencyCode: string
}>()
const offers = computed(() =>
  props.sections.flatMap((section) =>
    section.items.flatMap((row) => [row, ...row.alternatives])
  )
)
const offerings = computed(() => [
  ...new Map(
    offers.value
      .flatMap((offer) => offer.offerings)
      .map((offering) => [offering.id, offering])
  ).values(),
])
const basket = useServiceBasket(offers)
const selected = ref<MenuServiceOffer | null>(null)
const itemOpen = ref(false)
const basketOpen = ref(false)
const error = ref('')
const money = (value: number) =>
  value === 0
    ? '0'
    : formatCurrencyAmount(value, {
        currencyCode: props.currencyCode,
        showCurrency: false,
      })
function select(offer: MenuServiceOffer) {
  selected.value = offer
  error.value = ''
  itemOpen.value = true
}
function add(choices: ServiceItemChoices) {
  if (!selected.value) return
  try {
    basket.add(selected.value, choices)
    itemOpen.value = false
    error.value = ''
  } catch (cause) {
    error.value =
      cause instanceof Error ? cause.message : 'Please choose this item again.'
  }
}
</script>
<style scoped>
.collection-basket-bar {
  position: fixed;
  bottom: max(1rem, env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  width: min(32rem, calc(100% - 2rem));
  z-index: 30;
  box-shadow: 0 0.25rem 1.5rem rgb(0 0 0 / 0.15);
}
</style>
