<template>
  <div class="space-y-5">
    <UFormField :label="`Set price (${currency})`">
      <UInput
        v-model="price"
        type="number"
        min="0"
        step="0.01"
        :disabled="disabled"
      />
    </UFormField>
    <p class="text-sm text-muted">
      The set price includes the choices below. Add a supplement only when a
      choice costs more.
    </p>
    <fieldset
      v-for="(group, index) in groups"
      :key="group.id"
      class="min-w-0 space-y-4 rounded-xl border border-default p-4"
    >
      <legend class="px-1 font-medium">Choice group {{ index + 1 }}</legend>
      <div class="flex flex-wrap items-end gap-3">
        <UFormField label="Group name" class="min-w-0 flex-1"
          ><UInput
            v-model="group.name"
            placeholder="For example: Pizza"
            class="w-full"
            :disabled="disabled"
        /></UFormField>
        <UFormField label="Number to choose"
          ><UInput
            v-model="group.choose"
            type="number"
            min="1"
            step="1"
            class="w-24"
            :disabled="disabled"
        /></UFormField>
        <UButton
          type="button"
          icon="i-lucide-trash-2"
          :aria-label="`Remove choice group ${index + 1}`"
          color="neutral"
          variant="ghost"
          :disabled="disabled"
          @click="groups.splice(index, 1)"
        />
      </div>
      <UFormField label="Food and drinks">
        <USelectMenu
          :model-value="group.dishes.map((dish) => dish.dishId)"
          @update:model-value="(ids) => selectDishes(group, ids)"
          :aria-label="`Choose dishes for group ${index + 1}`"
          multiple
          value-key="value"
          :items="dishOptions"
          class="w-full"
          placeholder="Choose dishes"
          :disabled="disabled"
        />
      </UFormField>
      <div
        v-for="dish in group.dishes"
        :key="dish.dishId"
        class="promotion-choice"
      >
        <label :for="`supplement-${group.id}-${dish.dishId}`" class="text-sm">{{
          dishOptions.find((option) => option.value === dish.dishId)?.label ||
          'Unavailable dish'
        }}</label>
        <UFormField :label="`Supplement (${currency})`">
          <UInput
            :id="`supplement-${group.id}-${dish.dishId}`"
            class="w-full"
            v-model="dish.supplement"
            type="number"
            min="0"
            step="0.01"
            :disabled="disabled"
          />
        </UFormField>
      </div>
      <p v-if="group.dishes.length" class="text-sm text-muted">
        A supplement of 0 means included.
      </p>
    </fieldset>
    <UButton
      type="button"
      label="Add choice group"
      icon="i-lucide-plus"
      color="neutral"
      variant="soft"
      :disabled="disabled || groups.length >= 10"
      @click="addGroup"
    />
  </div>
</template>
<script setup lang="ts">
import type {
  MealDealGroupDraft,
  PromotionDishOption,
} from '../../../models/promotion-draft.model'
defineProps<{
  currency: string
  dishOptions: PromotionDishOption[]
  disabled: boolean
}>()
const price = defineModel<string | number>('price', { required: true })
const groups = defineModel<MealDealGroupDraft[]>('groups', { required: true })
function addGroup() {
  groups.value.push({
    id: crypto.randomUUID(),
    name: '',
    choose: 1,
    dishes: [],
  })
}
function selectDishes(group: MealDealGroupDraft, ids: string[]) {
  group.dishes = ids.map(
    (dishId) =>
      group.dishes.find((dish) => dish.dishId === dishId) || {
        dishId,
        supplement: 0,
      }
  )
}
</script>

<style scoped>
.promotion-choice {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 7rem;
  align-items: center;
  gap: 0.75rem;
}
</style>
