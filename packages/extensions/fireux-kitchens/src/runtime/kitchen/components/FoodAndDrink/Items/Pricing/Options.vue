<template>
  <fieldset class="space-y-3">
    <legend class="mb-2 font-medium">Options</legend>
    <div
      v-for="(option, index) in options"
      :key="index"
      class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_8rem_auto]"
    >
      <UInput
        v-model="option.label"
        :aria-label="`Option ${index + 1} name`"
        placeholder="For example: Large"
        :disabled="disabled"
      />
      <!-- @vue-generic {string | number, {}} -->
      <UInput
        v-model="option.price"
        :aria-label="`Option ${index + 1} full price`"
        type="number"
        min="0.01"
        step="0.01"
        :disabled="disabled"
      />
      <UButton
        type="button"
        icon="i-lucide-x"
        :aria-label="`Remove option ${index + 1}`"
        color="neutral"
        variant="ghost"
        :disabled="disabled"
        @click="options.splice(index, 1)"
      />
    </div>
    <UButton
      type="button"
      label="Add option"
      color="neutral"
      variant="soft"
      :disabled="disabled"
      @click="options.push({ label: '', quantity: 0, unit: '', price: '' })"
    />
  </fieldset>
</template>
<script setup lang="ts">
import type { DishPriceOption } from '../../../../models/dish.model'
const options = defineModel<
  Array<Omit<DishPriceOption, 'price'> & { price: string | number }>
>({ required: true })
defineProps<{ disabled: boolean }>()
</script>
