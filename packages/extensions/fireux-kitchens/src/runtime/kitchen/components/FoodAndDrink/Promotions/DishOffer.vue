<template>
  <div class="space-y-4">
    <UFormField label="Food and drinks">
      <USelectMenu
        v-model="selected"
        aria-label="Choose promotional dishes"
        multiple
        value-key="value"
        :items="dishOptions"
        class="w-full"
        placeholder="Choose dishes"
        :disabled="disabled"
      />
    </UFormField>
    <div v-if="rows.length" class="flex flex-wrap items-end gap-2">
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
      <label :for="`promotion-price-${row.dishId}`" class="text-sm">{{
        dishOptions.find((dish) => dish.value === row.dishId)?.label ||
        'Unavailable dish'
      }}</label>
      <!-- @vue-generic {string | number, {}} -->
      <UInput
        :id="`promotion-price-${row.dishId}`"
        class="w-full"
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
  PromotionDishDraft,
  PromotionDishOption,
} from '../../../models/promotion-draft.model'
defineProps<{
  dishOptions: PromotionDishOption[]
  currency: string
  disabled: boolean
}>()
const rows = defineModel<PromotionDishDraft[]>({ required: true })
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
