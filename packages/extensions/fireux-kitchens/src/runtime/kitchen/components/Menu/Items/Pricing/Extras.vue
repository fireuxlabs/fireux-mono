<template>
  <fieldset>
    <legend>Extras</legend>
    <div v-for="(extra, index) in extras" :key="index">
      <UInput
        v-model="extra.label"
        :aria-label="`Extra ${index + 1} name`"
        :disabled="disabled"
      />
      <!-- @vue-generic {string | number, {}} -->
      <UInput
        v-model="extra.price"
        :aria-label="`Extra ${index + 1} additional price`"
        type="number"
        min="0"
        step="0.01"
        :disabled="disabled"
      />
      <UButton
        type="button"
        icon="i-lucide-x"
        :aria-label="`Remove extra ${index + 1}`"
        color="neutral"
        variant="ghost"
        :disabled="disabled"
        @click="extras.splice(index, 1)"
      />
    </div>
    <UButton
      type="button"
      label="Add extra"
      color="neutral"
      variant="soft"
      :disabled="disabled"
      @click="extras.push({ id: '', label: '', price: '' })"
    />
  </fieldset>
</template>
<script setup lang="ts">
import type { ItemAddOnOption } from '../../../../models/item.model'
const extras = defineModel<
  Array<Omit<ItemAddOnOption, 'price'> & { price: string | number }>
>({ required: true })
defineProps<{ disabled: boolean }>()
</script>
