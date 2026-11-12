<template>
  <UPageCard title="Your private tour" variant="subtle" icon="i-lucide-bike">
    <UFormField label="Private tour">
      <USelect
        v-model="tourSlug"
        :items="tours.map((tour) => ({ label: tour.name, value: tour.slug }))"
      />
    </UFormField>
    <UFormField label="Tour date">
      <UInput v-model="date" type="date" :min="minimumDate" />
    </UFormField>
    <UFormField label="People">
      <UInputNumber v-model="groupSize" :min="1" :max="50" />
    </UFormField>
    <p>CHF {{ unitPrice }} per person · {{ duration }}</p>
    <strong>CHF {{ total }} total</strong>
    <p>No payment is collected here.</p>
  </UPageCard>
</template>
<script setup lang="ts">
import { tours } from '~/content/tours'
const tourSlug = defineModel<(typeof tours)[number]['slug']>('tourSlug', {
  required: true,
})
const date = defineModel<string>('date', { required: true })
const groupSize = defineModel<number>('groupSize', { required: true })
defineProps<{
  minimumDate: string
  unitPrice: number
  total: number
  duration: string
}>()
</script>
