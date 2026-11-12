<template>
  <UPageCard :title="name" :description="summary" variant="outline">
    <template #header
      ><img :src="image" :alt="alt" width="1600" height="900" loading="lazy"
    /></template>
    <UBadge :label="difficulty" variant="subtle" />
    <p>
      {{ duration }}<template v-if="distance"> · {{ distance }}</template
      ><template v-if="elevation"> · {{ elevation }} climbing</template>
    </p>
    <p>
      {{
        price === undefined
          ? 'Price on request'
          : `From CHF ${price} per person`
      }}
    </p>
    <UFormField v-if="tourSlug" label="People in your group">
      <UInputNumber v-model="groupSize" :min="1" :max="50" />
    </UFormField>
    <UButton
      v-if="tourSlug"
      :to="{ path: '/book', query: { tour: tourSlug, people: groupSize } }"
      trailing-icon="i-lucide-arrow-right"
      >Book now</UButton
    >
    <UButton :to="to" variant="link" color="neutral">{{ action }}</UButton>
  </UPageCard>
</template>
<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
defineProps<{
  tourSlug?: string
  name: string
  label: string
  summary: string
  difficulty: string
  image: string
  alt: string
  duration: string
  distance?: string
  elevation?: string
  price?: number
  to: RouteLocationRaw
  action: string
}>()
const groupSize = ref(2)
</script>
