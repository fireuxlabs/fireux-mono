<template>
  <UContainer
    ><UBreadcrumb
      :items="[
        { label: 'Packages', to: '/packages' },
        { label: 'fireux-kitchens', to: '/packages/fireux-kitchens' },
        { label: 'Ordering Ticket' },
      ]" /><OrderExamples
  /></UContainer>
</template>
<script setup lang="ts">
import OrderExamples from '../../../../components/Docs/OrderingTicket/Index.vue'
definePageMeta({ layout: 'default', nav: { hidden: true } })
useSeoMeta({
  title: 'Ordering Ticket · fireux-kitchens',
  robots: 'noindex, nofollow',
})
</script>
