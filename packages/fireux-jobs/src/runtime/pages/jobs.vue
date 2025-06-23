<template>
  <div>
    <h1>Hello Jobs</h1>
    <p>This is the jobs listing page.</p>
  </div>
</template>

<script setup>
import { getRouteMetaForPath } from 'fireux-core/composables/utils/useRoutes'

const route = useRoute()
const { label, icon } = getRouteMetaForPath(route.path)

definePageMeta({
  layout: 'dashboard',
})

useHead({
  title: label || 'Jobs',
  meta: [{ name: 'icon', content: icon || 'i-lucide-briefcase' }],
})
</script>
