<template>
  <div class="space-y-6 pb-24">
    <template v-if="catalogueReady">
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
        :disabled="checkout.locked"
        :sections="sections"
        :money="money"
        @select="itemEditor.select"
      />
      <p
        v-if="!sections.length"
        class="rounded-xl border border-default p-5 text-muted"
      >
        No food or drinks are available for collection.
      </p>
    </template>
    <div v-if="basket.count.value" class="collection-basket-bar">
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
      :title="
        checkout.submission ? 'Your Collection order' : 'Your Collection basket'
      "
      :description="
        checkout.submission
          ? 'Order confirmation and collection details.'
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
          class="mt-6"
        />
      </template>
    </UModal>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, reactive, toRef, watch } from 'vue'
import { useCollectionCheckout } from '../../composables/useCollectionCheckout'
import type { MenuServiceSection } from '../../utils/service-sections'
import { serviceItemSignature } from '../../utils/service-basket'
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
const basket = useServiceBasket(offers, () => props.catalogueReady)
const checkout = reactive(
  useCollectionCheckout({
    basket,
    offers,
    ready: toRef(props, 'catalogueReady'),
    kitchenSlug: toRef(props, 'kitchenSlug'),
    entryId: toRef(() => props.entryId || ''),
  })
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
