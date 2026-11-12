<template>
  <div>
    <UFormField label="Food and drinks">
      <USelectMenu
        v-model="selected"
        aria-label="Choose promotional dishes"
        multiple
        value-key="value"
        :items="itemOptions"
        placeholder="Choose dishes"
        :disabled="disabled"
      />
    </UFormField>
    <div v-if="rows.length">
      <UFormField :label="`Set all prices (${currency})`"
        ><!-- @vue-generic {string | number, {}} -->
        <UInput
          v-model="allPrice"
          type="number"
          min="0"
          step="0.01"
          :disabled="disabled"
      /></UFormField>
      <UButton
        type="button"
        label="Apply to all"
        color="neutral"
        variant="soft"
        :disabled="disabled || allPrice === ''"
        @click="rows.forEach((row) => (row.price = allPrice))"
      />
    </div>
    <div v-for="row in rows" :key="row.dishId" class="promotion-dish-price">
      <label :for="`promotion-price-${row.dishId}`">{{
        itemOptions.find((dish) => dish.value === row.dishId)?.label ||
        'Unavailable dish'
      }}</label>
      <!-- @vue-generic {string | number, {}} -->
      <UInput
        :id="`promotion-price-${row.dishId}`"
        v-model="row.price"
        type="number"
        min="0"
        step="0.01"
        :disabled="disabled"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import type {
  PromotionItemDraft,
  PromotionItemOption,
} from '../../../models/promotion-draft.model'
defineProps<{
  itemOptions: PromotionItemOption[]
  currency: string
  disabled: boolean
}>()
const rows = defineModel<PromotionItemDraft[]>({ required: true })
const allPrice = ref<string | number>('')
const selected = computed({
  get: () => rows.value.map((row) => row.dishId),
  set: (ids: string[]) => {
    rows.value = ids.map(
      (dishId) =>
        rows.value.find((row) => row.dishId === dishId) || { dishId, price: '' }
    )
  },
})
</script>

<style scoped>
.promotion-dish-price {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 7rem;
  align-items: center;
  gap: 0.75rem;
}
</style>
