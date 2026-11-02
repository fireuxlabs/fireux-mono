<template>
  <div class="menu-selection">
    <UButton
      v-if="checkout.kiosk && !checkout.locked"
      label="Start again"
      color="neutral"
      variant="soft"
      @click="checkout.reset"
    />
    <template v-if="catalogueReady">
      <KitchenDetailOfferingTimes
        :offerings="offerings"
        compact
        :show-names="false"
      />
      <nav
        :aria-label="`${checkout.label} sections`"
        class="menu-selection__sections"
      >
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
        :disabled="checkout.locked"
        :sections="sections"
        :money="money"
        @select="itemEditor.select"
      />
      <p v-if="!sections.length" class="menu-selection__empty">
        No food or drinks are available for {{ checkout.label.toLowerCase() }}.
      </p>
    </template>
    <div v-if="basket.count.value" class="menu-selection__basket-bar">
      <UButton
        :label="
          checkout.submission
            ? `View order #${checkout.submission.order.number}`
            : `View basket · ${basket.count.value} · ${money(basket.totalMinor.value / 100)}`
        "
        icon="i-lucide-shopping-bag"
        size="lg"
        block
        @click="basketOpen = true"
      />
    </div>
    <UModal
      :open="itemEditor.open && catalogueReady"
      @update:open="!$event && itemEditor.close()"
      :title="itemEditor.selection?.offer.item.name || 'Choose an item'"
      description="Choose your options and extras."
    >
      <template #body>
        <MenuSelectionItem
          v-if="itemEditor.selection"
          :key="
            itemEditor.selection.key ||
            serviceItemSignature(itemEditor.selection.offer)
          "
          :offer="itemEditor.selection.offer"
          :initial-choices="itemEditor.selection.choices"
          :money="money"
          :error="itemEditor.error"
          @add="itemEditor.save"
        />
      </template>
    </UModal>
    <UModal
      v-model:open="basketOpen"
      :title="checkout.submission ? 'Your order' : 'Your basket'"
      :description="
        checkout.submission
          ? 'Order confirmation and details.'
          : 'Review your food and drinks.'
      "
    >
      <template #body>
        <MenuSelectionBasket
          v-if="!checkout.submission"
          :disabled="checkout.locked"
          :catalogue-ready="catalogueReady"
          :lines="basket.lines.value"
          :stale-keys="basket.staleKeys.value"
          :total-minor="basket.totalMinor.value"
          :money="money"
          @edit="edit"
          @adjust="basket.adjust"
          @remove="basket.remove"
          @close="basketOpen = false"
        />
        <MenuSelectionCheckout
          v-if="basket.count.value || checkout.submission"
          :flow="checkout"
          :venue="venue"
          class="menu-selection__checkout"
        />
      </template>
    </UModal>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, reactive, toRef, watch } from 'vue'
import { useServiceCheckout } from '../../composables/useServiceCheckout'
import type { MenuServiceSection } from '../../utils/service-sections'
import { serviceItemSignature } from '../../utils/service-basket'
import type { MenuCheckoutService } from '../../utils/service-checkout'
import { useServiceBasket } from '../../composables/useServiceBasket'
import { useServiceItemEditor } from '../../composables/useServiceItemEditor'
import type { KitchenDetailPresentation } from '../../../kitchen/models/kitchen-detail.response'
import { formatCurrencyAmount } from '../../../utils/currency-display'
const props = defineProps<{
  sections: MenuServiceSection[]
  venue?: KitchenDetailPresentation | null
  kitchenSlug: string
  entryId?: string
  currencyCode: string
  catalogueReady: boolean
  service?: MenuCheckoutService
}>()
const emit = defineEmits<{ reset: [] }>()
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
const basket = useServiceBasket(offers, () => props.catalogueReady)
const checkout = reactive(
  useServiceCheckout({
    basket,
    offers,
    ready: toRef(props, 'catalogueReady'),
    kitchenSlug: toRef(props, 'kitchenSlug'),
    entryId: toRef(() => props.entryId || ''),
    service: props.service,
  })
)
watch(
  () => checkout.resets,
  () => emit('reset')
)
const basketOpen = ref(false)
const itemEditor = reactive(
  useServiceItemEditor({
    basket,
    offers,
    locked: () => checkout.locked,
    onClose: (editing) => {
      if (editing) basketOpen.value = true
    },
  })
)
function edit(key: string) {
  if (itemEditor.edit(key)) basketOpen.value = false
}
watch(
  () => checkout.locked,
  (locked) => {
    if (locked) {
      itemEditor.close()
      basketOpen.value = true
    }
  }
)
const money = (value: number) =>
  value === 0
    ? '0'
    : formatCurrencyAmount(value, {
        currencyCode:
          props.currencyCode || basket.lines.value[0]?.currency || '',
        showCurrency: false,
      })
</script>
<style scoped>
.menu-selection {
  display: grid;
  gap: 1.5rem;
  padding-bottom: 6rem;
}
.menu-selection__sections {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.menu-selection__empty {
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  padding: 1.25rem;
  color: var(--ui-text-muted);
}
.menu-selection__checkout {
  margin-top: 1.5rem;
}
.menu-selection__basket-bar {
  position: fixed;
  bottom: max(1rem, env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  width: min(32rem, calc(100% - 2rem));
  z-index: 30;
  box-shadow: 0 0.25rem 1.5rem rgb(0 0 0 / 0.15);
}
</style>
