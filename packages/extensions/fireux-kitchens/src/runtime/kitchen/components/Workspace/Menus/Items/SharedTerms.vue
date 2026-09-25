<template>
  <div class="w-full grid gap-3">
    <p v-if="outcome === 'pending'" role="status" class="text-sm text-muted">
      Loading shared prices…
    </p>
    <MoleculesStateCard
      v-else-if="outcome === 'error'"
      state="error"
      title="Shared prices unavailable"
      description="Prices could not be loaded. Try again shortly."
    />
    <UAlert
      v-else-if="!record"
      title="Shared prices unavailable"
      description="Sign in with Kitchen editing access to view these terms."
      color="neutral"
    />
    <template v-else>
      <p class="text-sm text-muted">
        Prices and extras are shared with every menu using this item.
      </p>
      <UAlert
        v-if="record.status !== 'active'"
        title="Shared item archived"
        color="neutral"
      />
      <div v-if="implicit" class="max-w-sm">
        <MoleculesFormsEditableSimpleField
          :key="`${kitchenId}:${sellableId}:${record.revision}`"
          :label="`Price (${record.terms.currency})`"
          type="number"
          :value="record.terms.prices[implicit.id]"
          :disabled="!canEdit"
          disabled-message="Shared prices cannot be edited right now."
          :validation-function="validatePrice"
          :update="saveImplicitPrice"
        />
      </div>
      <div v-else class="flex flex-wrap gap-2" aria-label="Shared prices">
        <UBadge
          v-for="variant in record.variants"
          :key="variant.id"
          color="neutral"
          variant="soft"
        >
          {{ variant.label }} ·
          {{ formatPrice(record.terms.prices[variant.id]) }}
        </UBadge>
      </div>
      <MoleculesDisclosurePanel title="Prices & extras" size="sm">
        <Options
          :key="`${kitchenId}:${sellableId}:${record.revision}`"
          :row="sharedRow"
          :can-write="canEdit"
          shared
          :update-price-options="savePrices"
          :update-add-ons="saveAddOns"
        />
      </MoleculesDisclosurePanel>
      <MoleculesCopyError v-if="saveError" :message="saveError" />
    </template>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { MenuSectionItemRow } from '../../../../composables/workspace/menus/useKitchenWorkspaceMenuSection'
import { useKitchenSellableTerms } from '../../../../composables/workspace/menus/useKitchenSellableTerms'
import Options from './Options.vue'
const props = defineProps<{
  row: MenuSectionItemRow
  kitchenId: string
  sellableId: string
  canWrite: boolean
}>()
const { record, outcome, canEdit, saveError, update } = useKitchenSellableTerms(
  {
    kitchenId: () => props.kitchenId,
    sellableId: () => props.sellableId,
    canWrite: () => props.canWrite,
  }
)
const implicit = computed(() =>
  record.value?.variants.length === 1 && record.value.variants[0]?.implicit
    ? record.value.variants[0]
    : null
)
const sharedRow = computed<MenuSectionItemRow>(() => ({
  ...props.row,
  price:
    implicit.value && record.value
      ? record.value.terms.prices[implicit.value.id]
      : 0,
  priceOptions: implicit.value
    ? []
    : (record.value?.variants ?? []).map((variant) => ({
        label: variant.label,
        quantity: variant.quantity,
        unit: variant.unit,
        price: record.value!.terms.prices[variant.id],
      })),
  addOns: record.value?.terms.add_ons ?? [],
}))
const validatePrice = (value: string) => ({
  isValid:
    value.trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= 0,
  message: 'Enter a price of zero or more.',
})
const formatPrice = (value: number) =>
  new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: record.value!.terms.currency,
  }).format(value)
async function saveImplicitPrice(value: string) {
  if (!record.value || !implicit.value) return
  await update({
    ...record.value.terms,
    prices: {
      ...record.value.terms.prices,
      [implicit.value.id]: Number(value),
    },
  })
}
async function savePrices(options: MenuSectionItemRow['priceOptions']) {
  if (!record.value) return
  await update({
    ...record.value.terms,
    prices: Object.fromEntries(
      record.value.variants.map((variant, index) => [
        variant.id,
        options[index].price,
      ])
    ),
  })
}
async function saveAddOns(addOns: MenuSectionItemRow['addOns']) {
  if (!record.value) return
  await update({ ...record.value.terms, add_ons: addOns })
}
</script>
