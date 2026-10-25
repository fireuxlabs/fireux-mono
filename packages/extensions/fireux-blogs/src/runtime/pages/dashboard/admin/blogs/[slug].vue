<template>
  <UDashboardPanel id="dashboard-admin-blog-edit">
    <template #header><FireLayoutsDashboardNavbar title="Admin · Edit blog post" /></template>
    <template #body><UPage><UPageBody class="pagebody"><BlogEdit :key="slug" :slug="slug" /></UPageBody></UPage></template>
  </UDashboardPanel>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'
definePageMeta({ layout: 'dashboard', requiresAuth: true, roles: ['admin'], adminSurface: 'blogs' })
const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))
</script>
