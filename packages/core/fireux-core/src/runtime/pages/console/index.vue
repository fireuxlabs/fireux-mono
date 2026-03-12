<!-- packages/core/fireux-core/src/runtime/pages/console/index.vue -->
<template>
  <UDashboardPanel id="console-home">
    <template #header>
      <LayoutsConsoleNavbar title="Console" />
    </template>

    <template #body>
      <UAlert
        v-if="hubCount === 0"
        color="neutral"
        variant="soft"
        title="No console hubs available"
        description="This app does not expose any console families."
      />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { discoverConsoleChildren } from '../../composables/fireux/app/routing/consoleRoutes'

definePageMeta({
  layout: 'console',
  requiresAuth: true,
})

const router = useRouter()
const consoleChildren = computed(() => discoverConsoleChildren(router.getRoutes()))
const hubCount = computed(() => consoleChildren.value.length)

watchEffect(() => {
  if (hubCount.value < 1) return
  if (router.currentRoute.value.path !== '/console') return

  const target = consoleChildren.value[0]?.path || ''
  if (target) router.replace(target)
})
</script>
