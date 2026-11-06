<template>
  <UPageCard :title="name" :description="summary" :to="to" variant="outline">
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
  </UPageCard>
</template>
<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
defineProps<{
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
</script>
