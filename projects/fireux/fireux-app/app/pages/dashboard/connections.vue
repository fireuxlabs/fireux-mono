<template>
  <UDashboardPanel
    ><template #header
      ><UDashboardNavbar title="Connected ecosystems" /></template
    ><template #body
      ><ClientOnly
        ><Connections :resume="resume" /><template #fallback
          ><p role="status">Checking connections…</p></template
        ></ClientOnly
      ></template
    ></UDashboardPanel
  >
</template>
<script setup lang="ts">
import { resolveConnectionResume } from 'fireux-fireux/runtime/user/utils/connection-resume'
import Connections from 'fireux-fireux/runtime/user/components/Connections/Index.vue'
const route = useRoute()
const resume = computed(() => resolveConnectionResume(route.query.resume))
definePageMeta({
  layout: 'dashboard',
  requiresAuth: true,
  nav: {
    key: 'account-connections',
    label: 'Connected ecosystems',
    icon: 'i-lucide-link',
    position: 'bottom',
    order: 990,
    desktop: true,
    layouts: ['dashboard'],
  },
})
useHead({
  title: 'Connected ecosystems',
  meta: [{ name: 'robots', content: 'noindex,nofollow' }],
})
</script>
