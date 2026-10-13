<template>
  <UContainer class="py-10"><UBreadcrumb :items="[{ label: 'Packages', to: '/packages' }, { label: 'fireux-kitchens', to: '/packages/fireux-kitchens' }, { label: 'Ordering Ticket' }]" /><OrderingLibrary /></UContainer>
</template>
<script setup lang="ts">
import OrderingLibrary from 'fireux-kitchens/runtime/kitchen/components/dev/Orders.vue'
definePageMeta({ layout: 'default', nav: { hidden: true } })
useSeoMeta({ title: 'Ordering Ticket · fireux-kitchens', robots: 'noindex, nofollow' })
</script>
