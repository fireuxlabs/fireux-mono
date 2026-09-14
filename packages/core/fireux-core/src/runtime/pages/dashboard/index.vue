<template><DashboardHome /></template>

<script setup lang="ts">
import { definePageMeta, useHead } from '#imports'
import DashboardHome from '../../components/Dashboard/Home.vue'

definePageMeta({
  nav: {
    key: 'dashboard-home',
    label: 'Overview',
    icon: 'i-lucide-layout-dashboard',
    position: 'top',
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
  layout: 'dashboard',
})

useHead({ title: 'Overview' })
</script>
