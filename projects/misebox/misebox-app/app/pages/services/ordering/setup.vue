<template>
  <OrderingSetupIndex />
</template>
<script setup lang="ts">
import OrderingSetupIndex from '../../../components/OrderingSetup/Index.vue'
import { useSeoMeta } from '#imports'
definePageMeta({
  layout: 'landing',
  requiresAuth: true,
  requiresSelection: false,
  nav: { hidden: true },
})
useSeoMeta({ title: 'Choose a Kitchen | Misebox', robots: 'noindex, nofollow' })
</script>
