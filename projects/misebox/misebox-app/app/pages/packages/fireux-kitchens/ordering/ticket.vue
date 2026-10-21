<template>
  <UContainer class="py-10"><UBreadcrumb :items="[{ label: 'Packages', to: '/packages' }, { label: 'fireux-kitchens', to: '/packages/fireux-kitchens' }, { label: 'Ordering Ticket' }]" /><OrderExamples /></UContainer>
</template>
<script setup lang="ts">
import OrderExamples from 'fireux-kitchens/runtime/kitchen/components/Orders/Examples/Index.vue'
definePageMeta({ layout: 'default', nav: { hidden: true } })
useSeoMeta({ title: 'Ordering Ticket · fireux-kitchens', robots: 'noindex, nofollow' })
</script>
